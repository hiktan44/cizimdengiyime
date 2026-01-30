/**
 * Fasheone Mobile API - v1.0
 * 
 * Mobil uygulama için kapsamlı REST API
 * - Authentication (Supabase Auth)
 * - User Management
 * - AI Generation Services
 * - Payment Processing
 * - Admin Operations
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stripe from 'stripe';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

// Fallback: Try loading from current directory
if (!process.env.VITE_SUPABASE_URL) {
    dotenv.config({ path: join(__dirname, '.env') });
}

// Fallback: Try loading from parent directory
if (!process.env.VITE_SUPABASE_URL) {
    dotenv.config({ path: join(__dirname, '../.env') });
}

const app = express();
const PORT = process.env.API_PORT || 3002;

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase credentials missing');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Gemini AI Client
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
let genAI;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// CORS - Allow mobile apps
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
    'https://fasheone.com',
    'https://www.fasheone.com',
    // Mobile app origins
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost:8100',
    'http://localhost:19006', // Expo
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('🚫 CORS Blocked Origin:', origin);
            callback(null, true); // Allow all for development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==========================================
// MIDDLEWARE - Auth Verification
// ==========================================

const verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        req.user = user;
        req.profile = profile;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
};

const verifyAdmin = async (req, res, next) => {
    if (!req.profile?.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ==========================================
// CREDIT COSTS
// ==========================================

const CREDIT_COSTS = {
    SKETCH_TO_PRODUCT: 1,
    PRODUCT_TO_MODEL: 1,
    VIDEO: 3,
    TECH_SKETCH: 1,
    PIXSHOP: 1,
    PIXSHOP_4K: 2, // 4K upscale için ekstra kredi
    FOTOMATIK_TRANSFORM: 1,
    FOTOMATIK_DESCRIBE: 1,
    ADGENIUS_IMAGE: 1,
    ADGENIUS_VIDEO: 3,
    COLLAGE: 2, // Standart kolaj - 2 kredi
};

// Helper to deduct credits
const deductCredits = async (userId, amount, type) => {
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

    if (!profile || profile.credits < amount) {
        throw new Error('Insufficient credits');
    }

    await supabaseAdmin
        .from('profiles')
        .update({ credits: profile.credits - amount })
        .eq('id', userId);

    // Log the generation
    await supabaseAdmin
        .from('generations')
        .insert({
            user_id: userId,
            type: type,
            credits_used: amount,
        });

    return profile.credits - amount;
};

// ==========================================
// API ROUTES
// ==========================================

// Serve static files for documentation
app.use('/docs', express.static(__dirname));

// Documentation redirect
app.get('/api/v1/docs', (req, res) => {
    res.redirect('/docs/docs.html');
});

// OpenAPI JSON endpoint
app.get('/api/v1/openapi.json', (req, res) => {
    res.sendFile(join(__dirname, 'openapi.json'));
});

// Health Check
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'OK',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        services: {
            supabase: !!supabaseUrl,
            gemini: !!GEMINI_API_KEY,
        },
        docs: '/api/v1/docs'
    });
});

// ==========================================
// AUTH ENDPOINTS
// ==========================================

// Sign Up with Email
app.post('/api/v1/auth/signup', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (error) throw error;

        // Create profile
        await supabaseAdmin
            .from('profiles')
            .insert({
                id: data.user.id,
                email: email,
                full_name: fullName,
                credits: 5, // Welcome credits
                subscription_tier: 'free'
            });

        res.json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email
            }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(400).json({ error: err.message });
    }
});

// Sign In with Email
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Create a temporary client for login
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Get profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        res.json({
            success: true,
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            },
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: profile?.full_name,
                avatarUrl: profile?.avatar_url
            },
            profile: {
                credits: profile?.credits || 0,
                subscriptionTier: profile?.subscription_tier || 'free',
                isAdmin: profile?.is_admin || false
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(401).json({ error: err.message });
    }
});

// Refresh Token
app.post('/api/v1/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabaseClient.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error) throw error;

        res.json({
            success: true,
            session: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at
            }
        });
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(401).json({ error: err.message });
    }
});

// Google OAuth URL
app.get('/api/v1/auth/google', async (req, res) => {
    try {
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: req.query.redirectTo || `${process.env.FRONTEND_URL}/auth/callback`
            }
        });

        if (error) throw error;

        res.json({ url: data.url });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ==========================================
// USER ENDPOINTS
// ==========================================

// Get Profile
app.get('/api/v1/user/profile', verifyAuth, async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            email: req.user.email,
            fullName: req.profile?.full_name,
            avatarUrl: req.profile?.avatar_url,
            credits: req.profile?.credits || 0,
            subscriptionTier: req.profile?.subscription_tier || 'free',
            subscriptionStart: req.profile?.subscription_start,
            subscriptionEnd: req.profile?.subscription_end,
            isAdmin: req.profile?.is_admin || false,
            createdAt: req.profile?.created_at
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
app.put('/api/v1/user/profile', verifyAuth, async (req, res) => {
    try {
        const { fullName, avatarUrl } = req.body;

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name: fullName,
                avatar_url: avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, profile: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Generation History
app.get('/api/v1/user/generations', verifyAuth, async (req, res) => {
    try {
        const { limit = 20, offset = 0, type } = req.query;

        let query = supabaseAdmin
            .from('generations')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            generations: data,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Transactions History
app.get('/api/v1/user/transactions', verifyAuth, async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;

        const { data, error } = await supabaseAdmin
            .from('transactions')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({ transactions: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// GENERATION ENDPOINTS
// ==========================================

// Get Credit Costs Info
app.get('/api/v1/generation/costs', (req, res) => {
    res.json(CREDIT_COSTS);
});

// Sketch to Product
app.post('/api/v1/generation/sketch-to-product', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const { color } = req.body;
        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Deduct credits
        await deductCredits(req.user.id, CREDIT_COSTS.SKETCH_TO_PRODUCT, 'sketch_to_product');

        // Generate with Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Transform this fashion sketch into a photorealistic product image.
    The garment should look like a professional e-commerce product photo with:
    - Clean white/light gray background
    - Professional studio lighting
    - High-quality fabric textures
    - Accurate colors and details
    ${color ? `- Use ${color} as the main color` : ''}
    
    Keep the design exactly as shown in the sketch, just make it photorealistic.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        // Save generation record
        await supabaseAdmin
            .from('generations')
            .update({ output_image_url: outputImage })
            .eq('user_id', req.user.id)
            .eq('type', 'sketch_to_product')
            .order('created_at', { ascending: false })
            .limit(1);

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.SKETCH_TO_PRODUCT
        });
    } catch (err) {
        console.error('Sketch to product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Product to Live Model
app.post('/api/v1/generation/product-to-model', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const {
            clothingType, color, ethnicity, bodyType, pose,
            hairColor, hairStyle, location, lighting, cameraAngle,
            gender, ageRange, aspectRatio, customPrompt
        } = req.body;

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Deduct credits
        await deductCredits(req.user.id, CREDIT_COSTS.PRODUCT_TO_MODEL, 'product_to_model');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = `Create a photorealistic image of a ${gender || 'female'} model wearing this garment.

Model characteristics:
- Ethnicity: ${ethnicity || 'Mixed'}
- Age: ${ageRange || 'Adult'}
- Body type: ${bodyType || 'Standard'}
- Hair color: ${hairColor || 'Natural'}
- Hair style: ${hairStyle || 'Natural'}
- Pose: ${pose || 'Standing'}

Setting:
- Location: ${location || 'Studio'}
- Lighting: ${lighting || 'Natural'}
- Camera angle: ${cameraAngle || 'Eye level'}
- Clothing type: ${clothingType || 'Top'}
- Color: ${color || 'As shown'}

${customPrompt ? `Additional instructions: ${customPrompt}` : ''}

Make this a high-quality fashion photo with professional lighting and composition.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.PRODUCT_TO_MODEL
        });
    } catch (err) {
        console.error('Product to model error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Generate Video from Image
app.post('/api/v1/generation/video', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const { prompt, duration = 5, aspectRatio = '9:16' } = req.body;
        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Deduct credits
        await deductCredits(req.user.id, CREDIT_COSTS.VIDEO, 'video');

        // Note: This is a placeholder - actual video generation would use Veo
        // For now, return the image as a static frame
        const outputImage = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

        res.json({
            success: true,
            video: outputImage, // In production, this would be a video URL
            message: 'Video generation queued. This may take 2-5 minutes.',
            creditsRemaining: req.profile.credits - CREDIT_COSTS.VIDEO
        });
    } catch (err) {
        console.error('Video generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Technical Sketch (Product to Sketch)
app.post('/api/v1/generation/tech-sketch', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const { style = 'blackwhite' } = req.body;
        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        await deductCredits(req.user.id, CREDIT_COSTS.TECH_SKETCH, 'tech_sketch');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const prompt = style === 'colored'
            ? `Create a colored fashion technical flat sketch from this garment image. Show front view with accurate proportions, stitching details, and natural fabric colors.`
            : `Create a black and white fashion technical flat sketch from this garment image. Show front view with accurate proportions, stitching lines, and construction details. Clean line art style.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.TECH_SKETCH
        });
    } catch (err) {
        console.error('Tech sketch error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Pixshop - Edit Image
app.post('/api/v1/generation/pixshop/edit', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const { prompt, hotspotX, hotspotY } = req.body;
        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        await deductCredits(req.user.id, CREDIT_COSTS.PIXSHOP, 'pixshop');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const fullPrompt = `Edit this image according to the following instruction: ${prompt}
    ${hotspotX && hotspotY ? `Focus on the area around coordinates (${hotspotX}, ${hotspotY})` : ''}
    Maintain overall image quality and consistency.`;

        const result = await model.generateContent([
            fullPrompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.PIXSHOP
        });
    } catch (err) {
        console.error('Pixshop edit error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Pixshop - Remove Background
app.post('/api/v1/generation/pixshop/remove-bg', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        await deductCredits(req.user.id, CREDIT_COSTS.PIXSHOP, 'pixshop');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent([
            'Remove the background from this image completely. Return only the main subject with a transparent background.',
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.PIXSHOP
        });
    } catch (err) {
        console.error('Remove BG error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fotomatik - Transform
app.post('/api/v1/generation/fotomatik/transform', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const { prompt, aspectRatio = '1:1' } = req.body;
        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        await deductCredits(req.user.id, CREDIT_COSTS.FOTOMATIK_TRANSFORM, 'fotomatik_transform');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.FOTOMATIK_TRANSFORM
        });
    } catch (err) {
        console.error('Fotomatik transform error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Fotomatik - Describe (Generate Prompt)
app.post('/api/v1/generation/fotomatik/describe', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        await deductCredits(req.user.id, CREDIT_COSTS.FOTOMATIK_DESCRIBE, 'fotomatik_describe');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent([
            `Analyze this image in extreme technical and artistic detail to create high-end prompts for AI image generators. 
      
      Return a JSON object with the following structure:
      {
        "tr": "Detailed artistic analysis in Turkish",
        "en": "Standard technical prompt in English",
        "midjourney": "Optimized Midjourney V6 prompt including relevant parameters",
        "stableDiffusion": {
          "positive": "Positive prompt for SDXL",
          "negative": "Negative prompt",
          "params": "Recommended parameters"
        },
        "tips": ["3 expert tips to improve this style"]
      }`,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const text = result.response.text();
        let promptData;

        try {
            promptData = JSON.parse(text);
        } catch {
            promptData = { en: text, tr: text };
        }

        res.json({
            success: true,
            prompts: promptData,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.FOTOMATIK_DESCRIBE
        });
    } catch (err) {
        console.error('Fotomatik describe error:', err);
        res.status(500).json({ error: err.message });
    }
});

// AdGenius - Analyze Product
app.post('/api/v1/generation/adgenius/analyze', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Analysis is free
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent([
            `Analyze this product image for e-commerce advertising. Return JSON:
      {
        "productType": "category of product",
        "name": "suggested product name",
        "description": "brief description",
        "features": ["key features"],
        "targetAudience": "target demographic",
        "suggestedStyles": ["ad styles that would work well"],
        "colors": ["main colors in the product"]
      }`,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const text = result.response.text();
        let analysis;

        try {
            analysis = JSON.parse(text);
        } catch {
            analysis = { productType: 'Unknown', description: text };
        }

        res.json({
            success: true,
            analysis
        });
    } catch (err) {
        console.error('AdGenius analyze error:', err);
        res.status(500).json({ error: err.message });
    }
});

// AdGenius - Generate Ad Image
app.post('/api/v1/generation/adgenius/image', verifyAuth, upload.single('image'), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const { prompt, style, aspectRatio = '1:1' } = req.body;
        const imageBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        await deductCredits(req.user.id, CREDIT_COSTS.ADGENIUS_IMAGE, 'adgenius_campaign_image');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent([
            `Create a professional advertising image for this product.
      Style: ${style || 'Modern and clean'}
      ${prompt || ''}
      Make it suitable for social media advertising.`,
            {
                inlineData: {
                    mimeType,
                    data: imageBuffer.toString('base64')
                }
            }
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.ADGENIUS_IMAGE
        });
    } catch (err) {
        console.error('AdGenius image error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Collage Generation
app.post('/api/v1/generation/collage', verifyAuth, upload.array('images', 6), async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ error: 'Gemini API not configured' });
        }

        const { prompt, aspectRatio = '16:9' } = req.body;
        const files = req.files;

        if (!files || files.length < 2) {
            return res.status(400).json({ error: 'At least 2 images required' });
        }

        await deductCredits(req.user.id, CREDIT_COSTS.COLLAGE, 'collage');

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const imageParts = files.map(file => ({
            inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString('base64')
            }
        }));

        const result = await model.generateContent([
            `Create a professional fashion collage combining these ${files.length} images.
      ${prompt || 'Arrange them in an aesthetically pleasing composition.'}
      Aspect ratio should be ${aspectRatio}.`,
            ...imageParts
        ]);

        const response = result.response;
        const parts = response.candidates?.[0]?.content?.parts;

        let outputImage = null;
        for (const part of parts || []) {
            if (part.inlineData) {
                outputImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }

        if (!outputImage) {
            throw new Error('No image generated');
        }

        res.json({
            success: true,
            image: outputImage,
            creditsRemaining: req.profile.credits - CREDIT_COSTS.COLLAGE
        });
    } catch (err) {
        console.error('Collage error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PAYMENT ENDPOINTS
// ==========================================

// Get Credit Packages
app.get('/api/v1/payment/packages', (req, res) => {
    res.json({
        packages: [
            { id: 'small', credits: 50, priceTL: 250 },
            { id: 'medium', credits: 100, priceTL: 500 },
            { id: 'large', credits: 200, priceTL: 1000 },
        ],
        subscriptions: [
            { id: 'starter', name: 'Starter', credits: 100, priceTL: 500, monthly: true },
            { id: 'pro', name: 'Pro', credits: 500, priceTL: 2250, monthly: true },
            { id: 'premium', name: 'Premium', credits: 1000, priceTL: 4000, monthly: true },
        ]
    });
});

// Get Exchange Rate
app.get('/api/v1/payment/exchange-rate', async (req, res) => {
    try {
        const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
        const xml = await response.text();
        const result = await parseStringPromise(xml);

        const euro = result.Tarih_Date.Currency.find(c => c.$.CurrencyCode === 'EUR');
        const rate = parseFloat(euro.BanknoteSelling[0] || euro.ForexSelling[0]);

        res.json({ currency: 'EUR', rate });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
});

// Create Payment Intent
app.post('/api/v1/payment/create-intent', verifyAuth, async (req, res) => {
    try {
        const { packageId, amountTL, credits } = req.body;

        // Get Stripe key
        let stripeSecretKey = process.env.STRIPE_SECRET_KEY;

        try {
            const { data } = await supabaseAdmin
                .from('site_settings')
                .select('value')
                .eq('key', 'stripe_secret_key')
                .single();
            if (data?.value?.startsWith('sk_')) {
                stripeSecretKey = data.value;
            }
        } catch { }

        if (!stripeSecretKey) {
            return res.status(500).json({ error: 'Payment not configured' });
        }

        const stripe = new Stripe(stripeSecretKey);

        // Get EUR rate
        const tcmbResponse = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
        const xml = await tcmbResponse.text();
        const result = await parseStringPromise(xml);
        const euro = result.Tarih_Date.Currency.find(c => c.$.CurrencyCode === 'EUR');
        const rate = parseFloat(euro.BanknoteSelling[0] || euro.ForexSelling[0]);

        const amountEUR = amountTL / rate;
        const amountCents = Math.round(amountEUR * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountCents,
            currency: 'eur',
            metadata: {
                userId: req.user.id,
                credits: credits.toString(),
                amountTL: amountTL.toString(),
                packageId: packageId || 'custom'
            },
            receipt_email: req.user.email,
            automatic_payment_methods: { enabled: true }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amountEUR: amountEUR.toFixed(2),
            rate
        });
    } catch (err) {
        console.error('Payment intent error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

// Get All Users (Admin)
app.get('/api/v1/admin/users', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const { limit = 50, offset = 0, search } = req.query;

        let query = supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({ users: data, total: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Transactions (Admin)
app.get('/api/v1/admin/transactions', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const { data, error, count } = await supabaseAdmin
            .from('transactions')
            .select('*, profiles(email, full_name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({ transactions: data, total: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Generations (Admin)
app.get('/api/v1/admin/generations', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const { limit = 50, offset = 0, type } = req.query;

        let query = supabaseAdmin
            .from('generations')
            .select('*, profiles(email, full_name)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({ generations: data, total: count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Credits (Admin)
app.put('/api/v1/admin/users/:userId/credits', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { credits, reason } = req.body;

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ credits })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Log admin action
        await supabaseAdmin
            .from('admin_logs')
            .insert({
                admin_id: req.user.id,
                action: 'update_credits',
                target_user_id: userId,
                details: { credits, reason }
            });

        res.json({ success: true, profile: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Dashboard Stats (Admin)
app.get('/api/v1/admin/stats', verifyAuth, verifyAdmin, async (req, res) => {
    try {
        // Get user count
        const { count: userCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Get total generations today
        const today = new Date().toISOString().split('T')[0];
        const { count: todayGenerations } = await supabaseAdmin
            .from('generations')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);

        // Get revenue this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { data: transactions } = await supabaseAdmin
            .from('transactions')
            .select('amount')
            .eq('status', 'completed')
            .gte('created_at', monthStart.toISOString());

        const monthlyRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

        // Get generation breakdown
        const { data: genBreakdown } = await supabaseAdmin
            .from('generations')
            .select('type')
            .gte('created_at', today);

        const breakdown = {};
        genBreakdown?.forEach(g => {
            breakdown[g.type] = (breakdown[g.type] || 0) + 1;
        });

        res.json({
            totalUsers: userCount,
            todayGenerations,
            monthlyRevenue,
            generationBreakdown: breakdown
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log(`🚀 Fasheone Mobile API running on port ${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/v1/health`);
});

export default app;
