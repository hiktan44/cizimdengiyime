
import React, { useState, useEffect, useRef } from 'react';

// Hook for persistent state
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (error) {
            console.warn(`Error parsing localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, value]);

    return [value, setValue];
}
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ColorPicker } from './components/ColorPicker';
import { generateImage, generateVideoFromImage, generateProductFromSketch, generateSketchFromProduct, VideoGenerationSettings } from './services/geminiService';
import { base64ToFile } from './utils/fileUtils';
import { CheckCircleIcon } from './components/icons/CheckCircleIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { AdjustmentsIcon } from './components/icons/AdjustmentsIcon';
import { VideoIcon } from './components/icons/VideoIcon';
import { PencilIcon } from './components/icons/PencilIcon';
import { VideoSettingsModal } from './components/VideoSettingsModal';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';

import LandingPage from './pages/LandingPage';
import { Dashboard } from './components/Dashboard';
import { checkAndDeductCredits, saveGeneration, uploadBase64ToStorage, refundCredits } from './lib/database';
import { CREDIT_COSTS } from './lib/supabase';
import { BuyCreditsModal } from './components/BuyCreditsModal';
import { HistoryPanel } from './components/HistoryPanel';
import { uploadHeroVideo, uploadShowcaseImage, getPublicHeroVideos, getPublicShowcaseImages } from './lib/adminService';
import { PixshopPage } from './pages/PixshopPage';
import { FotomatikPage } from './pages/FotomatikPage';
import { AdgeniusPage } from './pages/AdgeniusPage';
import { CollagePage } from './pages/CollagePage';
import TechPackPage from './pages/TechPackPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { trackEvent, ANALYTICS_EVENTS } from './utils/analytics';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { KVKKPage } from './pages/KVKKPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { AIUsageNoticePage } from './pages/AIUsageNoticePage';
import { useTranslation } from './lib/i18n';
import { appTranslations } from './lib/i18n/appTranslations';
import AffiliateProgramPage from './pages/AffiliateProgramPage';
import AffiliatePortal from './components/affiliate/AffiliatePortal';
import { trackReferralClick } from './lib/affiliateService';
import { FeaturesPage } from './pages/FeaturesPage';
import { BlogPage } from './pages/BlogPage';
import { getFriendlyErrorMessage } from './utils/errorMessages';

// Dil bilgisini al
const getLang = (): 'tr' | 'en' => (localStorage.getItem('fasheone_language') as 'tr' | 'en') || 'tr';

interface PageHeaderProps {
    isLoggedIn: boolean;
    userRole: 'admin' | 'user' | null;
    userName?: string | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onAdminClick?: () => void;
    onAffiliateClick?: () => void;
    onBuyCreditsClick?: () => void;
}

const ToolPage: React.FC<{
    onNavigateHome: () => void;
    profile: any;
    onRefreshProfile: () => void;
    initialTab?: 'design' | 'technical' | 'pixshop' | 'fotomatik' | 'adgenius' | 'collage' | 'techpack';
} & PageHeaderProps> = ({
    onNavigateHome,
    isLoggedIn,
    userName,
    onLoginClick,
    onLogoutClick,
    userRole,
    onAdminClick,
    onAffiliateClick,
    onBuyCreditsClick,
    profile,
    onRefreshProfile,
    initialTab
}) => {
        const t = useTranslation(appTranslations);
        const [activeToolTab, setActiveToolTab] = useState<'design' | 'technical' | 'pixshop' | 'fotomatik' | 'adgenius' | 'collage' | 'techpack'>(initialTab || 'design');

        // --- STATE MANAGEMENT ---
        // Step 1: Sketch (for single item mode)
        const [uploadedSketchFile, setUploadedSketchFile] = useState<File | null>(null);
        const [sketchPreviewUrl, setSketchPreviewUrl] = useState<string | undefined>(undefined);
        const [isProductLoading, setIsProductLoading] = useState(false);

        // Step 2: Product (Ghost Mannequin) - for single item mode
        const [uploadedProductFile, setUploadedProductFile] = useState<File | null>(null); // If user uploads directly
        const [generatedProductUrl, setGeneratedProductUrl] = useState<string | null>(null); // If AI generates from sketch
        const [productPreviewUrl, setProductPreviewUrl] = useState<string | undefined>(undefined); // Current visual for Step 2

        // --- KOMBIN MODE (Alt & Üst) STATE ---
        // Top garment (Üst Giyim)
        const [topSketchFile, setTopSketchFile] = useState<File | null>(null);
        const [topSketchPreviewUrl, setTopSketchPreviewUrl] = useState<string | undefined>(undefined);
        const [topProductFile, setTopProductFile] = useState<File | null>(null);
        const [generatedTopProductUrl, setGeneratedTopProductUrl] = useState<string | null>(null);
        const [topProductPreviewUrl, setTopProductPreviewUrl] = useState<string | undefined>(undefined);
        const [isTopProductLoading, setIsTopProductLoading] = useState(false);

        // Bottom garment (Alt Giyim)
        const [bottomSketchFile, setBottomSketchFile] = useState<File | null>(null);
        const [bottomSketchPreviewUrl, setBottomSketchPreviewUrl] = useState<string | undefined>(undefined);
        const [bottomProductFile, setBottomProductFile] = useState<File | null>(null);
        const [generatedBottomProductUrl, setGeneratedBottomProductUrl] = useState<string | null>(null);
        const [bottomProductPreviewUrl, setBottomProductPreviewUrl] = useState<string | undefined>(undefined);
        const [isBottomProductLoading, setIsBottomProductLoading] = useState(false);

        const [isModelLoading, setIsModelLoading] = useState(false);
        const [loadingText, setLoadingText] = useState(t.loading.aiThinking);
        const [progress, setProgress] = useState(0);

        // Step 3: Result (Model & Video) - Persisted
        const [generatedImageUrl, setGeneratedImageUrl] = useStickyState<string | null>(null, 'fasheone_generatedImageUrl');
        const [generatedVideoUrl, setGeneratedVideoUrl] = useStickyState<string | null>(null, 'fasheone_generatedVideoUrl');

        // -- Technical Drawing State --
        const [techInputFile, setTechInputFile] = useState<File | null>(null);
        const [techInputPreview, setTechInputPreview] = useState<string | undefined>(undefined);
        const [generatedTechSketchUrl, setGeneratedTechSketchUrl] = useState<string | null>(null);
        const [isTechLoading, setIsTechLoading] = useState(false);
        const [techSketchStyle, setTechSketchStyle] = useStickyState<'colored' | 'blackwhite'>('blackwhite', 'fasheone_techSketchStyle'); // New: Renkli veya Karakalem

        // Product color for sketch-to-product
        const [productColor, setProductColor] = useStickyState('', 'fasheone_productColor');

        // Options
        const [clothingType, setClothingType] = useStickyState('Genel', 'fasheone_clothingType'); // New
        const [colorSuggestion, setColorSuggestion] = useStickyState('', 'fasheone_colorSuggestion');
        const [secondaryColor, setSecondaryColor] = useStickyState('', 'fasheone_secondaryColor'); // New for dual color

        const [modelEthnicity, setModelEthnicity] = useStickyState('Farklı', 'fasheone_modelEthnicity');
        const [bodyType, setBodyType] = useStickyState('Standart', 'fasheone_bodyType');
        const [pose, setPose] = useStickyState('Rastgele', 'fasheone_pose');
        const [artisticStyle, setArtisticStyle] = useStickyState('Gerçekçi', 'fasheone_artisticStyle');
        const [location, setLocation] = useStickyState('Podyum', 'fasheone_location');

        // New Options
        const [ageRange, setAgeRange] = useStickyState('Adult', 'fasheone_ageRange'); // New: Child, Teen, Adult, Elderly
        const [gender, setGender] = useStickyState('Female', 'fasheone_gender'); // New: Male, Female
        const [hairColor, setHairColor] = useStickyState('Doğal', 'fasheone_hairColor');
        const [hairStyle, setHairStyle] = useStickyState('Doğal', 'fasheone_hairStyle');
        const [customPrompt, setCustomPrompt] = useStickyState('', 'fasheone_customPrompt');
        const [customBackgroundPrompt, setCustomBackgroundPrompt] = useStickyState('', 'fasheone_customBackgroundPrompt'); // New: Custom background description
        const [fabricType, setFabricType] = useStickyState('', 'fasheone_fabricType'); // New: Dokuma/Örme
        const [fabricFinish, setFabricFinish] = useStickyState('', 'fasheone_fabricFinish'); // New: Soft/Parlak/Mat/Pastel
        const [shoeType, setShoeType] = useStickyState('', 'fasheone_shoeType'); // New: Ayakkabı tipi
        const [shoeColor, setShoeColor] = useStickyState('', 'fasheone_shoeColor'); // New: Ayakkabı rengi
        const [accessories, setAccessories] = useStickyState('', 'fasheone_accessories'); // New: Aksesuar
        const [lighting, setLighting] = useStickyState('Doğal', 'fasheone_lighting');
        const [cameraAngle, setCameraAngle] = useStickyState('Normal', 'fasheone_cameraAngle');
        const [cameraZoom, setCameraZoom] = useStickyState('Uzak', 'fasheone_cameraZoom'); // Yeni: Çekim mesafesi - Default: Uzak

        // Model Consistency (Seed)
        const [modelSeed, setModelSeed] = useStickyState<number | null>(null, 'fasheone_modelSeed');
        const [isModelLocked, setIsModelLocked] = useStickyState<boolean>(false, 'fasheone_isModelLocked');
        const [lockedModelReference, setLockedModelReference] = useStickyState<string | null>(null, 'fasheone_lockedModelReference');

        // Pattern State
        const [patternFile, setPatternFile] = useState<File | null>(null);
        const [patternPreview, setPatternPreview] = useState<string | null>(null);

        // Aspect Ratio
        const [aspectRatio, setAspectRatio] = useStickyState<'9:16' | '3:4' | '4:5' | '1:1' | '16:9'>('3:4', 'fasheone_aspectRatio');

        // Custom Background
        const [customBackgroundFile, setCustomBackgroundFile] = useState<File | undefined>(undefined);

        const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
        const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
        const [isShareSupported, setIsShareSupported] = useState(false);
        const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

        useEffect(() => {
            if (navigator.share) {
                setIsShareSupported(true);
            }
            return () => {
                if (progressInterval.current) clearInterval(progressInterval.current);
            };
        }, []);

        // --- HANDLERS ---

        const startProgressSimulation = (maxPercent: number = 90, speedMs: number = 200) => {
            setProgress(0);
            if (progressInterval.current) clearInterval(progressInterval.current);

            progressInterval.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= maxPercent) return prev;
                    const increment = Math.random() * 5 + 1;
                    return Math.min(maxPercent, prev + increment);
                });
            }, speedMs);
        };

        const finishProgress = () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
            setProgress(100);
        };

        // 1. Sketch Upload
        const handleSketchUpload = (file: File) => {
            setUploadedSketchFile(file);
            setSketchPreviewUrl(URL.createObjectURL(file));
        };

        // 1b. Generate Product from Sketch
        const handleGenerateProductClick = async () => {
            if (!uploadedSketchFile) return;

            // Check credits
            const creditCheck = await checkAndDeductCredits(profile.id, 'sketch_to_product');
            if (!creditCheck.success) {
                alert(creditCheck.message);
                return;
            }

            setIsProductLoading(true);
            setLoadingText(t.loading.sketchConverting);
            startProgressSimulation(80, 200);

            try {
                const productUrl = await generateProductFromSketch(uploadedSketchFile, productColor || undefined);
                finishProgress();

                setGeneratedProductUrl(productUrl);
                // Automatically set this as the preview for step 2
                setProductPreviewUrl(productUrl);
                // Reset manual upload if any
                setUploadedProductFile(null);

                // Transfer product color to model color if selected
                if (productColor && !colorSuggestion) {
                    setColorSuggestion(productColor);
                    console.log('Ürün rengi canlı model rengine aktarıldı:', productColor);
                }

                // Save to database
                await saveGeneration(
                    profile.id,
                    'sketch_to_product',
                    CREDIT_COSTS.SKETCH_TO_PRODUCT,
                    null,
                    productUrl,
                    null,
                    { productColor }
                );

                // Refresh profile to update credits
                onRefreshProfile();

                // Track analytics
                trackEvent(ANALYTICS_EVENTS.GENERATE_PRODUCT, {
                    color: productColor,
                    userId: profile.id
                });
            } catch (error) {
                await refundCredits(profile.id, 'sketch_to_product');
                onRefreshProfile();
                alert(getFriendlyErrorMessage(error, getLang()));
            } finally {
                setIsProductLoading(false);
            }
        };

        // 2. Product Upload (Manual Override)
        const handleProductUpload = (file: File) => {
            setUploadedProductFile(file);
            const url = URL.createObjectURL(file);
            setProductPreviewUrl(url);
            // Reset generated one if user uploads manually to avoid confusion
            setGeneratedProductUrl(null);
            setGeneratedImageUrl(null);
            setGeneratedVideoUrl(null);
        };

        // --- KOMBIN MODE HANDLERS ---
        // Top Garment Handlers
        const handleTopSketchUpload = (file: File) => {
            setTopSketchFile(file);
            setTopSketchPreviewUrl(URL.createObjectURL(file));
        };

        const handleTopProductUpload = (file: File) => {
            setTopProductFile(file);
            const url = URL.createObjectURL(file);
            setTopProductPreviewUrl(url);
            setGeneratedTopProductUrl(null);
        };

        const handleGenerateTopProduct = async () => {
            if (!topSketchFile) return;

            const creditCheck = await checkAndDeductCredits(profile.id, 'sketch_to_product');
            if (!creditCheck.success) {
                alert(creditCheck.message);
                return;
            }

            setIsTopProductLoading(true);
            setLoadingText(t.loading.topGarmentConverting);
            startProgressSimulation(80, 200);

            try {
                const productUrl = await generateProductFromSketch(topSketchFile, colorSuggestion || undefined);
                finishProgress();

                setGeneratedTopProductUrl(productUrl);
                setTopProductPreviewUrl(productUrl);
                setTopProductFile(null);

                await saveGeneration(
                    profile.id,
                    'sketch_to_product',
                    CREDIT_COSTS.SKETCH_TO_PRODUCT,
                    null,
                    productUrl,
                    null,
                    { type: 'top_garment', productColor: colorSuggestion }
                );

                onRefreshProfile();
            } catch (error) {
                await refundCredits(profile.id, 'sketch_to_product');
                onRefreshProfile();
                alert(getFriendlyErrorMessage(error, getLang()));
            } finally {
                setIsTopProductLoading(false);
            }
        };

        // Bottom Garment Handlers
        const handleBottomSketchUpload = (file: File) => {
            setBottomSketchFile(file);
            setBottomSketchPreviewUrl(URL.createObjectURL(file));
        };

        const handleBottomProductUpload = (file: File) => {
            setBottomProductFile(file);
            const url = URL.createObjectURL(file);
            setBottomProductPreviewUrl(url);
            setGeneratedBottomProductUrl(null);
        };

        const handleGenerateBottomProduct = async () => {
            if (!bottomSketchFile) return;

            const creditCheck = await checkAndDeductCredits(profile.id, 'sketch_to_product');
            if (!creditCheck.success) {
                alert(creditCheck.message);
                return;
            }

            setIsBottomProductLoading(true);
            setLoadingText(t.loading.bottomGarmentConverting);
            startProgressSimulation(80, 200);

            try {
                const productUrl = await generateProductFromSketch(bottomSketchFile, secondaryColor || undefined);
                finishProgress();

                setGeneratedBottomProductUrl(productUrl);
                setBottomProductPreviewUrl(productUrl);
                setBottomProductFile(null);

                await saveGeneration(
                    profile.id,
                    'sketch_to_product',
                    CREDIT_COSTS.SKETCH_TO_PRODUCT,
                    null,
                    productUrl,
                    null,
                    { type: 'bottom_garment', productColor: secondaryColor }
                );

                onRefreshProfile();
            } catch (error) {
                await refundCredits(profile.id, 'sketch_to_product');
                onRefreshProfile();
                alert(getFriendlyErrorMessage(error, getLang()));
            } finally {
                setIsBottomProductLoading(false);
            }
        };

        // Custom Background Upload
        const handleBackgroundUpload = (file: File) => {
            setCustomBackgroundFile(file);
            setLocation('Özel Arka Plan');
        };

        // 2b. Generate Model from Product (The main generation)
        const handleGenerateModelClick = async () => {
            const isKombinMode = clothingType === 'Alt & Üst';

            let sourceFile: File | null = null;
            let secondSourceFile: File | null = null;

            if (isKombinMode) {
                // KOMBIN MODE: Need both top and bottom garments
                // Get top garment
                if (topProductFile) {
                    sourceFile = topProductFile;
                } else if (generatedTopProductUrl) {
                    try {
                        sourceFile = await base64ToFile(generatedTopProductUrl, 'top_product.png');
                    } catch (e) {
                        alert(t.alerts.topGarmentProcessingError);
                        return;
                    }
                }

                // Get bottom garment
                if (bottomProductFile) {
                    secondSourceFile = bottomProductFile;
                } else if (generatedBottomProductUrl) {
                    try {
                        secondSourceFile = await base64ToFile(generatedBottomProductUrl, 'bottom_product.png');
                    } catch (e) {
                        alert(t.alerts.bottomGarmentProcessingError);
                        return;
                    }
                }

                if (!sourceFile || !secondSourceFile) {
                    alert(t.alerts.outfitModeBothRequired);
                    return;
                }
            } else {
                // SINGLE ITEM MODE: Use standard product image
                sourceFile = uploadedProductFile;

                if (!sourceFile && generatedProductUrl) {
                    try {
                        sourceFile = await base64ToFile(generatedProductUrl, 'generated_product.png');
                    } catch (e) {
                        alert(t.alerts.imageProcessingError);
                        return;
                    }
                }

                if (!sourceFile) {
                    alert(t.alerts.pleaseUploadProduct);
                    return;
                }
            }

            // Check credits
            const creditCheck = await checkAndDeductCredits(profile.id, 'product_to_model');
            if (!creditCheck.success) {
                alert(creditCheck.message);
                return;
            }

            setIsModelLoading(true);
            setGeneratedImageUrl(null);
            setGeneratedVideoUrl(null);
            setLoadingText(isKombinMode ? t.loading.outfitModelCreating : t.loading.modelCreating);

            startProgressSimulation(85, 300);

            // Seed Logic
            let activeSeed: number;
            if (isModelLocked && modelSeed) {
                // Use existing frozen seed
                activeSeed = modelSeed;
                console.log('🔒 Using LOCKED seed:', activeSeed);
            } else {
                // Generate new seed
                activeSeed = Math.floor(Math.random() * 1000000000);
                // Only update state if not locked (so user can lock this new one later if they like it)
                setModelSeed(activeSeed);
                console.log('🎲 Using NEW seed:', activeSeed);
            }

            // Model Identity Logic (for Locking)
            let modelIdentityFile: File | undefined = undefined;

            // LOGIC: If locked, prefer the PERMANENT reference. If not available, fallback to current image.
            const identitySourceUrl = isModelLocked ? (lockedModelReference || generatedImageUrl) : null;

            if (identitySourceUrl) {
                try {
                    // Convert the stored URL (base64 or remote) to a File
                    modelIdentityFile = await base64ToFile(identitySourceUrl, "identity_ref.jpg");
                    console.log('🔒 Locked Model Identity image prepared from:', isModelLocked && lockedModelReference ? 'SAVED REFERENCE' : 'CURRENT IMAGE');

                    // Auto-fix: If locked but no reference saved yet, save it now
                    if (isModelLocked && !lockedModelReference) {
                        setLockedModelReference(identitySourceUrl);
                    }
                } catch (e) {
                    console.error('Failed to prepare locked model image:', e);
                }
            }

            try {
                const imageResults = await generateImage(
                    sourceFile,
                    clothingType,
                    colorSuggestion,
                    secondaryColor,
                    modelEthnicity,
                    artisticStyle,
                    location,
                    bodyType,
                    pose,
                    hairColor,
                    hairStyle,
                    customPrompt,
                    lighting,
                    cameraAngle,
                    cameraZoom,
                    aspectRatio,
                    customBackgroundFile,
                    customBackgroundPrompt,
                    fabricType,
                    fabricFinish,
                    shoeType,
                    shoeColor,
                    accessories,
                    ageRange,
                    gender,
                    secondSourceFile || undefined, // Pass second image for Kombin mode
                    patternFile || undefined, // Pass pattern file
                    activeSeed, // Pass seed
                    modelIdentityFile // Pass identity file
                );
                finishProgress();

                // imageResults: string[] (genelde 1 sonuç)
                const primaryImage = imageResults[0];

                console.log(`🎨 Sonuç alındı (gemini-3.1-flash-image-preview)`);

                setTimeout(() => {
                    setGeneratedImageUrl(primaryImage);
                    setIsModelLoading(false);
                }, 600);

                // Save to database
                await saveGeneration(
                    profile.id,
                    'product_to_model',
                    CREDIT_COSTS.PRODUCT_TO_MODEL,
                    null,
                    primaryImage,
                    null,
                    {
                        clothingType, colorSuggestion, secondaryColor, modelEthnicity,
                        artisticStyle, location, bodyType, pose, hairColor, hairStyle,
                        customPrompt, lighting, cameraAngle, cameraZoom, aspectRatio,
                        fabricType, fabricFinish, shoeType, shoeColor, accessories,
                        ageRange, gender,
                        isKombinMode, hasPattern: !!patternFile,
                        model: 'gemini-3.1-flash-image-preview'
                    }
                );

                // Refresh profile to update credits
                onRefreshProfile();

                // Track analytics
                trackEvent(ANALYTICS_EVENTS.GENERATE_MODEL, {
                    clothingType,
                    modelEthnicity,
                    artisticStyle,
                    location,
                    isKombinMode,
                    model: 'gemini-3.1-flash-image-preview',
                    userId: profile.id
                });
            } catch (error) {
                console.error('Görsel oluşturma hatası:', error);
                await refundCredits(profile.id, 'product_to_model');
                onRefreshProfile();
                alert(getFriendlyErrorMessage(error, getLang()));
                setIsModelLoading(false);
            }
        };

        // Tech Sketch Handlers
        const handleTechUpload = (file: File) => {
            setTechInputFile(file);
            setTechInputPreview(URL.createObjectURL(file));
            setGeneratedTechSketchUrl(null);
        };

        const handleGenerateTechSketch = async () => {
            if (!techInputFile) return;

            // Check credits
            const creditCheck = await checkAndDeductCredits(profile.id, 'tech_sketch');
            if (!creditCheck.success) {
                alert(creditCheck.message);
                return;
            }

            setIsTechLoading(true);
            setLoadingText(t.loading.techDrawingPreparing);
            startProgressSimulation(90, 200);

            try {
                const sketchUrl = await generateSketchFromProduct(techInputFile, techSketchStyle);
                finishProgress();

                setGeneratedTechSketchUrl(sketchUrl);

                // Save to database
                await saveGeneration(
                    profile.id,
                    'tech_sketch',
                    CREDIT_COSTS.TECH_SKETCH,
                    null,
                    sketchUrl,
                    null,
                    { techSketchStyle }
                );

                // Refresh profile to update credits
                onRefreshProfile();

                // Track analytics
                trackEvent(ANALYTICS_EVENTS.GENERATE_TECH_PACK, {
                    style: techSketchStyle,
                    userId: profile.id
                });
            } catch (error) {
                console.error('Teknik çizim hatası:', error);
                await refundCredits(profile.id, 'tech_sketch');
                onRefreshProfile();
                alert(getFriendlyErrorMessage(error, getLang()));
            } finally {
                setIsTechLoading(false);
            }
        };


        // 3. Video Generation
        const handleVideoGeneration = async (settings: VideoGenerationSettings) => {
            if (!generatedImageUrl) return;

            // Check credits based on quality
            const videoOpType = settings.quality === 'high' ? 'video_high' : 'video_fast';
            const creditCheck = await checkAndDeductCredits(profile.id, videoOpType);
            if (!creditCheck.success) {
                alert(creditCheck.message);
                return;
            }

            setIsVideoModalOpen(false);
            setIsModelLoading(true);

            // Update loading text based on quality
            if (settings.quality === 'high') {
                setLoadingText(t.loading.videoCreatingHigh);
                // Slower progress simulation for high quality
                startProgressSimulation(95, 3000);
            } else {
                setLoadingText(t.loading.videoCreatingFast);
                startProgressSimulation(92, 1000);
            }

            try {
                let videoUrl = await generateVideoFromImage(
                    generatedImageUrl,
                    settings
                );
                finishProgress();

                // Upload to Supabase Storage
                try {
                    // Video URL from generateVideoFromImage is usually a Blob URL or Base64
                    // If it's a blob url, we need to fetch it to get the blob/buffer for upload
                    // uploadBase64ToStorage handles data: urls. For blob: urls we might need extra handling or convert to base64.

                    if (videoUrl.startsWith('blob:')) {
                        const blob = await fetch(videoUrl).then(r => r.blob());
                        // Convert blob to base64 for our helper, or use uploadImageToStorage if I modify it to accept Blob
                        // Actually I can just create a File object from Blob and use uploadImageToStorage
                        const videoFile = new File([blob], 'generated_video.mp4', { type: 'video/mp4' });
                        const { uploadImageToStorage } = await import('./lib/database');
                        const storageUrl = await uploadImageToStorage(videoFile, profile.id, 'output');
                        if (storageUrl) videoUrl = storageUrl;
                    } else if (videoUrl.startsWith('data:')) {
                        const storageUrl = await uploadBase64ToStorage(videoUrl, profile.id, 'video');
                        if (storageUrl) videoUrl = storageUrl;
                    }
                } catch (e) {
                    console.warn('Video storage upload failed:', e);
                }

                setTimeout(() => {
                    setGeneratedVideoUrl(videoUrl);
                    setIsModelLoading(false);
                }, 600);

                // Save to database
                const videoCreditCost = settings.quality === 'high' ? CREDIT_COSTS.VIDEO_HIGH : CREDIT_COSTS.VIDEO_FAST;
                await saveGeneration(
                    profile.id,
                    videoOpType,
                    videoCreditCost,
                    null,
                    null,
                    videoUrl,
                    { settings }
                );

                // Refresh profile to update credits
                onRefreshProfile();

                // Track analytics
                trackEvent(ANALYTICS_EVENTS.GENERATE_VIDEO, {
                    quality: settings.quality,
                    userId: profile.id
                });
            } catch (error) {
                console.error('Video oluşturma hatası:', error);
                await refundCredits(profile.id, videoOpType as 'video_high' | 'video_fast');
                onRefreshProfile();
                alert(getFriendlyErrorMessage(error, getLang()));
                setIsModelLoading(false);
            }
        };

        // Improved Download Handler using unified utility
        const handleDownload = async (url: string | null, suggestedFilename: string) => {
            if (!url) return;

            const { downloadFile } = await import('./utils/downloadHelper');
            const success = await downloadFile(url, suggestedFilename);

            if (success) {
                // Track analytics
                trackEvent(ANALYTICS_EVENTS.DOWNLOAD_CONTENT, {
                    filename: suggestedFilename,
                    userId: profile.id
                });
            } else {
                alert(t.alerts.downloadFailed);
            }
        };


        const handleShare = async (url: string | null) => {
            if (url && isShareSupported) {
                try {
                    const blob = await (await fetch(url)).blob();
                    const file = new File([blob], 'generated-content.png', { type: blob.type });
                    await navigator.share({
                        title: 'Fasheone AI',
                        text: 'Check out my AI-generated design!',
                        files: [file],
                    });

                    // Track analytics
                    trackEvent(ANALYTICS_EVENTS.SHARE_CONTENT, {
                        userId: profile.id
                    });
                } catch (error) {
                    console.log('Paylaşım iptal edildi veya hata oluştu', error);
                }
            }
        };

        return (
            <div className="min-h-screen flex flex-col bg-slate-900">
                <FloatingWhatsApp
                    phoneNumber={import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined}
                    message={t.whatsappMessage}
                />
                <Header
                    isLoggedIn={isLoggedIn}
                    userRole={userRole}
                    userName={profile.full_name}
                    onLoginClick={onLoginClick}
                    onLogoutClick={onLogoutClick}
                    onHomeClick={onNavigateHome}
                    onAdminClick={onAdminClick}
                    onAffiliateClick={onAffiliateClick}
                    onBuyCreditsClick={onBuyCreditsClick}
                    onHistoryClick={() => setIsHistoryPanelOpen(true)}
                    credits={profile.credits}
                    activeToolTab={activeToolTab}
                    onToolTabClick={setActiveToolTab}
                />

                <HistoryPanel
                    isOpen={isHistoryPanelOpen}
                    onClose={() => setIsHistoryPanelOpen(false)}
                    userId={profile?.id}
                />

                <main className="flex-grow container mx-auto p-4 md:p-8">

                    {/* TOOL TABS */}
                    <div className="flex flex-wrap justify-center mb-8 gap-3">
                        <button
                            onClick={() => setActiveToolTab('design')}
                            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeToolTab === 'design'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <SparklesIcon />
                                <span className="hidden sm:inline">{t.toolTabs.design.label}</span>
                                <span className="sm:hidden">{t.toolTabs.design.shortLabel}</span>
                            </div>
                            <span className={`text-xs ${activeToolTab === 'design' ? 'text-cyan-200' : 'text-slate-500'}`}>
                                {t.toolTabs.design.credits}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveToolTab('technical')}
                            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeToolTab === 'technical'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <PencilIcon />
                                <span className="hidden sm:inline">{t.toolTabs.technical.label}</span>
                                <span className="sm:hidden">{t.toolTabs.technical.shortLabel}</span>
                            </div>
                            <span className={`text-xs ${activeToolTab === 'technical' ? 'text-purple-200' : 'text-slate-500'}`}>
                                {t.toolTabs.technical.credits}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveToolTab('pixshop')}
                            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeToolTab === 'pixshop'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Pixshop
                            </div>
                            <span className={`text-xs ${activeToolTab === 'pixshop' ? 'text-blue-200' : 'text-slate-500'}`}>
                                {t.toolTabs.pixshop.credits}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveToolTab('fotomatik')}
                            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeToolTab === 'fotomatik'
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                                Fotomatik
                            </div>
                            <span className={`text-xs ${activeToolTab === 'fotomatik' ? 'text-teal-200' : 'text-slate-500'}`}>
                                {t.toolTabs.fotomatik.credits}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveToolTab('adgenius')}
                            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeToolTab === 'adgenius'
                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M18 13a3 3 0 110-6m0 6v6m0-6V7m0 6H9m4-3H9m4 3H9" />
                                </svg>
                                AdGenius
                            </div>
                            <span className={`text-xs ${activeToolTab === 'adgenius' ? 'text-orange-200' : 'text-slate-500'}`}>
                                {t.toolTabs.adgenius.credits}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveToolTab('collage')}
                            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeToolTab === 'collage'
                                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                                </svg>
                                <span className="hidden sm:inline">{t.toolTabs.collage.label}</span>
                                <span className="sm:hidden">{t.toolTabs.collage.shortLabel}</span>
                            </div>
                            <span className={`text-xs ${activeToolTab === 'collage' ? 'text-pink-200' : 'text-slate-500'}`}>
                                {t.toolTabs.collage.credits}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveToolTab('techpack')}
                            className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeToolTab === 'techpack'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="hidden sm:inline">{t.toolTabs.techpack.label}</span>
                                <span className="sm:hidden">{t.toolTabs.techpack.shortLabel}</span>
                            </div>
                            <span className={`text-xs ${activeToolTab === 'techpack' ? 'text-indigo-200' : 'text-slate-500'}`}>
                                {t.toolTabs.techpack.credits}
                            </span>
                        </button>
                    </div>

                    {activeToolTab === 'design' ? (
                        /* --- DESIGN MODE (SKETCH -> MODEL) --- */
                        <div className="animate-fade-in">
                            {/* TOP ROW: INPUTS - Changes based on clothing type */}

                            {clothingType === 'Alt & Üst' ? (
                                /* --- KOMBIN MODE: 4 BOXES (2 for top, 2 for bottom) --- */
                                <div className="space-y-6 mb-8">
                                    {/* Kombin Mode Header */}
                                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{t.kombiniMode.title}</h3>
                                                <p className="text-sm text-slate-400">{t.kombiniMode.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TOP GARMENT ROW */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* TOP: Sketch */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col">
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                                {t.kombiniMode.topSketchTitle}
                                            </h2>
                                            <div className="flex-grow min-h-[200px]">
                                                <ImageUploader onImageUpload={handleTopSketchUpload} imagePreviewUrl={topSketchPreviewUrl} />
                                            </div>
                                            <div className="mt-2 text-xs text-center text-slate-400" dangerouslySetInnerHTML={{ __html: t.kombiniMode.creditInfo }} />
                                            <button
                                                onClick={handleGenerateTopProduct}
                                                disabled={!topSketchFile || isTopProductLoading}
                                                className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!topSketchFile || isTopProductLoading
                                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                    : 'bg-cyan-600 text-white hover:bg-cyan-500'
                                                    }`}
                                            >
                                                {isTopProductLoading ? t.kombiniMode.processing : t.kombiniMode.convertToProduct}
                                            </button>
                                        </div>

                                        {/* TOP: Product */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col relative">
                                            <div className="hidden md:block absolute top-1/2 -left-5 transform -translate-y-1/2 text-cyan-500 z-10">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                                {t.kombiniMode.topProductTitle}
                                            </h2>
                                            <div className="flex-grow min-h-[200px] relative">
                                                <ImageUploader onImageUpload={handleTopProductUpload} imagePreviewUrl={topProductPreviewUrl} />
                                                {topProductPreviewUrl && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">{t.kombiniMode.ready}</div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 text-center">
                                                {generatedTopProductUrl ? t.kombiniMode.generatedFromSketch : t.kombiniMode.uploadOrGenerate}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BOTTOM GARMENT ROW */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* BOTTOM: Sketch */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-purple-500/30 shadow-xl flex flex-col">
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                                {t.kombiniMode.bottomSketchTitle}
                                            </h2>
                                            <div className="flex-grow min-h-[200px]">
                                                <ImageUploader onImageUpload={handleBottomSketchUpload} imagePreviewUrl={bottomSketchPreviewUrl} />
                                            </div>
                                            <div className="mt-2 text-xs text-center text-slate-400" dangerouslySetInnerHTML={{ __html: t.kombiniMode.creditInfo }} />
                                            <button
                                                onClick={handleGenerateBottomProduct}
                                                disabled={!bottomSketchFile || isBottomProductLoading}
                                                className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!bottomSketchFile || isBottomProductLoading
                                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                    : 'bg-purple-600 text-white hover:bg-purple-500'
                                                    }`}
                                            >
                                                {isBottomProductLoading ? t.kombiniMode.processing : t.kombiniMode.convertToProduct}
                                            </button>
                                        </div>

                                        {/* BOTTOM: Product */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-purple-500/30 shadow-xl flex flex-col relative">
                                            <div className="hidden md:block absolute top-1/2 -left-5 transform -translate-y-1/2 text-purple-500 z-10">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                                                {t.kombiniMode.bottomProductTitle}
                                            </h2>
                                            <div className="flex-grow min-h-[200px] relative">
                                                <ImageUploader onImageUpload={handleBottomProductUpload} imagePreviewUrl={bottomProductPreviewUrl} />
                                                {bottomProductPreviewUrl && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">{t.kombiniMode.ready}</div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 text-center">
                                                {generatedBottomProductUrl ? t.kombiniMode.generatedFromSketch : t.kombiniMode.uploadOrGenerate}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Kombin Status */}
                                    <div className={`p-4 rounded-xl border ${topProductPreviewUrl && bottomProductPreviewUrl
                                        ? 'bg-green-900/20 border-green-500/30'
                                        : 'bg-orange-900/20 border-orange-500/30'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            {topProductPreviewUrl && bottomProductPreviewUrl ? (
                                                <>
                                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-green-400 font-medium">{t.kombiniMode.bothReady}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <span className="text-orange-400 font-medium">
                                                        {!topProductPreviewUrl && !bottomProductPreviewUrl
                                                            ? t.kombiniMode.bothNeeded
                                                            : !topProductPreviewUrl
                                                                ? t.kombiniMode.topNeeded
                                                                : t.kombiniMode.bottomNeeded}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* --- STANDARD MODE: 2 BOXES (sketch + product) --- */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                                    {/* BOX 1: SKETCH INPUT */}
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
                                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <span className="bg-slate-700 text-cyan-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                            {t.standardMode.sketchTitle}
                                        </h2>
                                        <div className="flex-grow">
                                            <ImageUploader onImageUpload={handleSketchUpload} imagePreviewUrl={sketchPreviewUrl} />
                                        </div>

                                        {/* Color picker for product */}
                                        {uploadedSketchFile && (
                                            <div className="mt-4">
                                                <ColorPicker
                                                    label={t.standardMode.productColorLabel}
                                                    selectedColor={productColor}
                                                    onColorChange={setProductColor}
                                                />
                                            </div>
                                        )}

                                        <div className="mt-2 text-xs text-center text-slate-400" dangerouslySetInnerHTML={{ __html: t.standardMode.creditInfo }} />
                                        <button
                                            onClick={handleGenerateProductClick}
                                            disabled={!uploadedSketchFile || isProductLoading}
                                            className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!uploadedSketchFile || isProductLoading
                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-500'
                                                }`}
                                        >
                                            {isProductLoading ? t.standardMode.processing : t.standardMode.convertToProduct}
                                        </button>
                                    </div>

                                    {/* BOX 2: PRODUCT INPUT */}
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col relative">
                                        {/* Arrow for visual flow on desktop */}
                                        <div className="hidden md:block absolute top-1/2 -left-5 transform -translate-y-1/2 text-slate-600 z-10">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>

                                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <span className="bg-slate-700 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                            {t.standardMode.productImageTitle}
                                        </h2>
                                        <div className="flex-grow relative">
                                            <ImageUploader onImageUpload={handleProductUpload} imagePreviewUrl={productPreviewUrl} />
                                            {/* Download button for product image */}
                                            {(generatedProductUrl || productPreviewUrl) && (
                                                <button
                                                    onClick={() => handleDownload(generatedProductUrl || productPreviewUrl, 'urun-gorseli.png')}
                                                    className="absolute bottom-4 right-4 bg-cyan-600/90 text-white p-3 rounded-full hover:bg-cyan-500 transition-all shadow-lg backdrop-blur-sm z-10"
                                                    title={t.standardMode.downloadProduct}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 text-center">
                                            {generatedProductUrl ? t.standardMode.usingGeneratedImage : t.standardMode.uploadDirectPhoto}
                                        </p>
                                    </div>

                                </div>
                            )}

                            {/* BOTTOM ROW: CONTROLS & RESULT */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

                                {/* Left Column: Controls */}
                                <div className="lg:col-span-4 flex flex-col gap-6">
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <AdjustmentsIcon />
                                            {t.modelSettings.title}
                                        </h2>

                                        {/* CLOTHING TYPE SELECTION */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.clothingType.label}</label>
                                            <select
                                                value={clothingType}
                                                onChange={(e) => setClothingType(e.target.value)}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition"
                                            >
                                                <option value="Genel">{t.modelSettings.clothingType.auto}</option>
                                                <option value="Üst Giyim">{t.modelSettings.clothingType.topOnly}</option>
                                                <option value="Alt Giyim">{t.modelSettings.clothingType.bottomOnly}</option>
                                                <option value="Elbise">{t.modelSettings.clothingType.dress}</option>
                                                <option value="Takım Elbise">{t.modelSettings.clothingType.suit}</option>
                                                <option value="Alt & Üst">{t.modelSettings.clothingType.topAndBottom}</option>
                                            </select>
                                        </div>

                                        {/* COLOR PICKERS */}
                                        <div className="space-y-4">
                                            <ColorPicker
                                                label={clothingType === 'Alt & Üst' ? t.modelSettings.topColor : (clothingType === 'Alt Giyim' ? t.modelSettings.bottomColor : t.modelSettings.topColor)}
                                                selectedColor={colorSuggestion}
                                                onColorChange={setColorSuggestion}
                                            />

                                            {/* Pattern Upload */}
                                            <div className="bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-600">
                                                <label className="block text-xs font-medium text-slate-400 mb-2">
                                                    {t.modelSettings.pattern.label}
                                                </label>

                                                {patternPreview ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={patternPreview}
                                                            alt={t.modelSettings.pattern.patternLabel}
                                                            className="w-full h-20 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                setPatternFile(null);
                                                                setPatternPreview(null);
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setPatternFile(file);
                                                                    setPatternPreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors border border-slate-600">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>{t.modelSettings.pattern.selectImage}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                                                    {t.modelSettings.pattern.description}
                                                </p>
                                            </div>

                                            {(clothingType === 'Alt & Üst' || clothingType === 'Takım Elbise') && (
                                                <div className="pt-2 border-t border-slate-700/50">
                                                    <ColorPicker
                                                        label={clothingType === 'Takım Elbise' ? t.modelSettings.shirtColor : t.modelSettings.bottomColor}
                                                        selectedColor={secondaryColor}
                                                        onColorChange={setSecondaryColor}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* CUSTOM PROMPT / CHAT INPUT */}
                                        <div>
                                            <label className="font-medium text-cyan-400 block mb-2 text-sm flex items-center gap-2">
                                                <SparklesIcon /> {t.modelSettings.chatLabel}
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    value={customPrompt}
                                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                                    placeholder={t.modelSettings.chatPlaceholder}
                                                    rows={3}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 transition resize-y min-h-[100px]"
                                                />
                                                <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none opacity-50">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.ethnicity.label}</label>
                                                <select value={modelEthnicity} onChange={(e) => setModelEthnicity(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Farklı">{t.modelSettings.ethnicity.diverse}</option>
                                                    <option value="Türk">{t.modelSettings.ethnicity.turkish}</option>
                                                    <option value="Avrupalı">{t.modelSettings.ethnicity.european}</option>
                                                    <option value="Kuzey Avrupalı">{t.modelSettings.ethnicity.scandinavian}</option>
                                                    <option value="Güney Avrupalı">{t.modelSettings.ethnicity.mediterranean}</option>
                                                    <option value="Asyalı">{t.modelSettings.ethnicity.eastAsian}</option>
                                                    <option value="Afrikalı">{t.modelSettings.ethnicity.african}</option>
                                                    <option value="Latin">{t.modelSettings.ethnicity.latin}</option>
                                                    <option value="Orta Doğulu">{t.modelSettings.ethnicity.middleEastern}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.artisticStyle.label}</label>
                                                <select value={artisticStyle} onChange={(e) => setArtisticStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Gerçekçi">{t.modelSettings.artisticStyle.photorealistic}</option>
                                                    <option value="Sinematik">{t.modelSettings.artisticStyle.cinematic}</option>
                                                    <option value="Çizgi Film">{t.modelSettings.artisticStyle.illustration}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.lighting.label}</label>
                                                <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Doğal">{t.modelSettings.lighting.natural}</option>
                                                    <option value="Stüdyo">{t.modelSettings.lighting.studio}</option>
                                                    <option value="Gün Batımı">{t.modelSettings.lighting.goldenHour}</option>
                                                    <option value="Dramatik">{t.modelSettings.lighting.dramatic}</option>
                                                    <option value="Neon">{t.modelSettings.lighting.neon}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.cameraAngle.label}</label>
                                                <select value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Normal">{t.modelSettings.cameraAngle.eyeLevel}</option>
                                                    <option value="Alt Açı">{t.modelSettings.cameraAngle.lowAngle}</option>
                                                    <option value="Üst Açı">{t.modelSettings.cameraAngle.highAngle}</option>
                                                    <option value="Geniş Açı">{t.modelSettings.cameraAngle.wideAngle}</option>
                                                    <option value="Portre">{t.modelSettings.cameraAngle.closeUp}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Camera Zoom (Shot Distance) */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.cameraZoom.label}</label>
                                            <select value={cameraZoom} onChange={(e) => setCameraZoom(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="Uzak">{t.modelSettings.cameraZoom.wide}</option>
                                                <option value="Normal">{t.modelSettings.cameraZoom.medium}</option>
                                                <option value="Yakın">{t.modelSettings.cameraZoom.closeUp}</option>
                                            </select>
                                        </div>

                                        {/* Model Consistency (Lock) */}
                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-600 flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300">{t.modelSettings.modelConsistency.label}</label>
                                                <p className="text-[10px] text-slate-500">
                                                    {t.modelSettings.modelConsistency.description}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (!modelSeed && !isModelLocked) {
                                                        alert(t.alerts.noModelCreatedYet);
                                                        return;
                                                    }

                                                    // State Update Logic
                                                    if (!isModelLocked) {
                                                        // Locking ON: Save current image as permanent reference
                                                        if (generatedImageUrl) {
                                                            setLockedModelReference(generatedImageUrl);
                                                            console.log("🔒 Model Identity LOCKED: Saved reference image.");
                                                        } else if (modelSeed) {
                                                            // Fallback: If no image URL but we have a seed (rare), just lock the seed
                                                            console.log("🔒 Model Seed LOCKED (No visual ref yet).");
                                                        }
                                                        setIsModelLocked(true);
                                                    } else {
                                                        // Locking OFF: Clear reference
                                                        setLockedModelReference(null);
                                                        console.log("🔓 Model Identity UNLOCKED: Cleared reference image.");
                                                        setIsModelLocked(false);
                                                        // Optional: Generate new seed immediately for next run or let it be random
                                                    }
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isModelLocked
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                    : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600 hover:text-white'
                                                    }`}
                                            >
                                                {isModelLocked ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                        {t.modelSettings.modelConsistency.locked}
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                                        {t.modelSettings.modelConsistency.lock}
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Age and Gender Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.ageGroup.label}</label>
                                                <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Child">{t.modelSettings.ageGroup.child}</option>
                                                    <option value="Teen">{t.modelSettings.ageGroup.teen}</option>
                                                    <option value="Adult">{t.modelSettings.ageGroup.adult}</option>
                                                    <option value="Elderly">{t.modelSettings.ageGroup.elderly}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.gender.label}</label>
                                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Female">{t.modelSettings.gender.female}</option>
                                                    <option value="Male">{t.modelSettings.gender.male}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.bodyType.label}</label>
                                                <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Standart">{t.modelSettings.bodyType.standard}</option>
                                                    <option value="İnce">{t.modelSettings.bodyType.slim}</option>
                                                    <option value="Kıvrımlı">{t.modelSettings.bodyType.curvy}</option>
                                                    <option value="Atletik">{t.modelSettings.bodyType.athletic}</option>
                                                    <option value="Büyük Beden">{t.modelSettings.bodyType.plusSize}</option>
                                                    <option value="Battal Beden">{t.modelSettings.bodyType.xxl}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.pose.label}</label>
                                                <select value={pose} onChange={(e) => setPose(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Rastgele">{t.modelSettings.pose.random}</option>
                                                    <option value="Ayakta">{t.modelSettings.pose.standing}</option>
                                                    <option value="Yürürken">{t.modelSettings.pose.walking}</option>
                                                    <option value="Eller Belde">{t.modelSettings.pose.handsOnHips}</option>
                                                    <option value="Otururken">{t.modelSettings.pose.sitting}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Hair Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.hairColor.label}</label>
                                                <select value={hairColor} onChange={(e) => setHairColor(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Doğal">{t.modelSettings.hairColor.natural}</option>
                                                    <option value="Sarı">{t.modelSettings.hairColor.blonde}</option>
                                                    <option value="Kumral">{t.modelSettings.hairColor.brown}</option>
                                                    <option value="Siyah">{t.modelSettings.hairColor.black}</option>
                                                    <option value="Kızıl">{t.modelSettings.hairColor.red}</option>
                                                    <option value="Gri">{t.modelSettings.hairColor.gray}</option>
                                                    <option value="Pastel Pembe">{t.modelSettings.hairColor.pastelPink}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.hairStyle.label}</label>
                                                <select value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Doğal">{t.modelSettings.hairStyle.natural}</option>
                                                    <option value="Uzun Düz">{t.modelSettings.hairStyle.longStraight}</option>
                                                    <option value="Uzun Dalgalı">{t.modelSettings.hairStyle.longWavy}</option>
                                                    <option value="Kısa Küt">{t.modelSettings.hairStyle.shortBob}</option>
                                                    <option value="Kısa Pixie">{t.modelSettings.hairStyle.shortPixie}</option>
                                                    <option value="Topuz">{t.modelSettings.hairStyle.bun}</option>
                                                    <option value="At Kuyruğu">{t.modelSettings.hairStyle.ponytail}</option>
                                                    <option value="Kıvırcık">{t.modelSettings.hairStyle.curly}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Fabric Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.fabricType.label}</label>
                                                <select value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">{t.modelSettings.fabricType.select}</option>
                                                    <option value="Dokuma">{t.modelSettings.fabricType.woven}</option>
                                                    <option value="Örme">{t.modelSettings.fabricType.knit}</option>
                                                    <option value="Deri">{t.modelSettings.fabricType.leather}</option>
                                                    <option value="Triko">{t.modelSettings.fabricType.knitwear}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.fabricFinish.label}</label>
                                                <select value={fabricFinish} onChange={(e) => setFabricFinish(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">{t.modelSettings.fabricFinish.select}</option>
                                                    <option value="Soft">{t.modelSettings.fabricFinish.soft}</option>
                                                    <option value="Parlak">{t.modelSettings.fabricFinish.glossy}</option>
                                                    <option value="Mat">{t.modelSettings.fabricFinish.matte}</option>
                                                    <option value="Pastel">{t.modelSettings.fabricFinish.pastel}</option>
                                                    <option value="Saten">{t.modelSettings.fabricFinish.satin}</option>
                                                    <option value="İpek">{t.modelSettings.fabricFinish.silk}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Shoe Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.shoeType.label}</label>
                                                <select value={shoeType} onChange={(e) => setShoeType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">{t.modelSettings.shoeType.auto}</option>
                                                    <option value="Spor Ayakkabı">{t.modelSettings.shoeType.sneakers}</option>
                                                    <option value="Topuklu">{t.modelSettings.shoeType.highHeels}</option>
                                                    <option value="Bot">{t.modelSettings.shoeType.boots}</option>
                                                    <option value="Sandalet">{t.modelSettings.shoeType.sandals}</option>
                                                    <option value="Loafer">{t.modelSettings.shoeType.loafer}</option>
                                                    <option value="Oxford">{t.modelSettings.shoeType.oxford}</option>
                                                    <option value="Çizme">{t.modelSettings.shoeType.tallBoots}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.shoeColor.label}</label>
                                                <select value={shoeColor} onChange={(e) => setShoeColor(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">{t.modelSettings.shoeColor.auto}</option>
                                                    <option value="Siyah">{t.modelSettings.shoeColor.black}</option>
                                                    <option value="Beyaz">{t.modelSettings.shoeColor.white}</option>
                                                    <option value="Kahverengi">{t.modelSettings.shoeColor.brown}</option>
                                                    <option value="Lacivert">{t.modelSettings.shoeColor.navy}</option>
                                                    <option value="Kırmızı">{t.modelSettings.shoeColor.red}</option>
                                                    <option value="Bej">{t.modelSettings.shoeColor.beige}</option>
                                                    <option value="Gri">{t.modelSettings.shoeColor.gray}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Accessories Settings */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.accessories.label}</label>
                                            <select value={accessories} onChange={(e) => setAccessories(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="">{t.modelSettings.accessories.none}</option>
                                                <option value="Güneş Gözlüğü">{t.modelSettings.accessories.sunglasses}</option>
                                                <option value="Şapka">{t.modelSettings.accessories.hat}</option>
                                                <option value="Bere">{t.modelSettings.accessories.beanie}</option>
                                                <option value="Şarf / Atkı">{t.modelSettings.accessories.scarf}</option>
                                                <option value="Çanta (El)">{t.modelSettings.accessories.handBag}</option>
                                                <option value="Çanta (Omuz)">{t.modelSettings.accessories.shoulderBag}</option>
                                                <option value="Kol Saati">{t.modelSettings.accessories.watch}</option>
                                                <option value="Eldiven">{t.modelSettings.accessories.gloves}</option>
                                                <option value="Kemer">{t.modelSettings.accessories.belt}</option>
                                                <option value="Kolye / Küpe">{t.modelSettings.accessories.necklaceEarring}</option>
                                            </select>
                                        </div>

                                        {/* Aspect Ratio Selection */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.aspectRatio.label}</label>
                                            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="3:4">{t.modelSettings.aspectRatio.portrait}</option>
                                                <option value="9:16">{t.modelSettings.aspectRatio.story}</option>
                                                <option value="4:5">{t.modelSettings.aspectRatio.instagram}</option>
                                                <option value="1:1">{t.modelSettings.aspectRatio.square}</option>
                                                <option value="16:9">{t.modelSettings.aspectRatio.landscape}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">{t.modelSettings.location.label}</label>
                                            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="Podyum">{t.modelSettings.location.runway}</option>
                                                <option value="Stüdyo">{t.modelSettings.location.studio}</option>
                                                <option value="Sokak">{t.modelSettings.location.street}</option>
                                                <option value="Doğal Mekan">{t.modelSettings.location.nature}</option>
                                                <option value="Lüks Mağaza">{t.modelSettings.location.luxuryStore}</option>
                                                <option value="Özel Arka Plan">{t.modelSettings.location.customBg}</option>
                                            </select>
                                            {/* Custom Background Upload */}
                                            {location === 'Özel Arka Plan' && (
                                                <div className="mt-2 space-y-2">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => e.target.files && handleBackgroundUpload(e.target.files[0])}
                                                        accept="image/*"
                                                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-cyan-400 hover:file:bg-slate-600"
                                                    />
                                                    {customBackgroundFile && <p className="text-xs text-green-400 mt-1">✓ {t.modelSettings.location.uploaded}: {customBackgroundFile.name}</p>}
                                                </div>
                                            )}
                                            {/* Custom Background Prompt */}
                                            <div className="mt-2 relative">
                                                <textarea
                                                    value={customBackgroundPrompt}
                                                    onChange={(e) => setCustomBackgroundPrompt(e.target.value)}
                                                    placeholder={t.modelSettings.location.bgPromptPlaceholder}
                                                    rows={2}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-xs placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 transition resize-y min-h-[80px]"
                                                />
                                                <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none opacity-50">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                                                    </svg>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">{t.modelSettings.location.bgPromptHint}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
                                        <span className="text-sm text-slate-300">
                                            {t.modelSettings.creditInfo.liveModel} <span className="text-cyan-400 font-bold text-lg">1 kredi</span>
                                        </span>
                                        <span className="text-xs text-slate-400 block mt-1">
                                            {t.modelSettings.creditInfo.currentCredits} <span className="text-cyan-400 font-semibold">{profile.credits}</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleGenerateModelClick}
                                        disabled={
                                            clothingType === 'Alt & Üst'
                                                ? (!topProductPreviewUrl || !bottomProductPreviewUrl) || isModelLoading
                                                : (!uploadedProductFile && !generatedProductUrl) || isModelLoading
                                        }
                                        className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${(clothingType === 'Alt & Üst'
                                            ? (!topProductPreviewUrl || !bottomProductPreviewUrl) || isModelLoading
                                            : (!uploadedProductFile && !generatedProductUrl) || isModelLoading)
                                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                                            }`}
                                    >
                                        {isModelLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {loadingText}
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon />
                                                {t.modelSettings.generateButton}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Right Column: Result */}
                                <div className="lg:col-span-8">
                                    <div className="h-full min-h-[600px] bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative">
                                        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs text-cyan-400 border border-cyan-500/30">
                                            {t.resultLabel}
                                        </div>
                                        <ResultDisplay
                                            isLoading={isModelLoading}
                                            loadingText={loadingText}
                                            progress={progress}
                                            generatedImageUrl={generatedImageUrl}
                                            beforeImageUrl={productPreviewUrl}
                                            sketchImageUrl={sketchPreviewUrl}
                                            generatedVideoUrl={generatedVideoUrl}
                                            onDownload={() => handleDownload(generatedVideoUrl || generatedImageUrl, generatedVideoUrl ? 'canli-manken-video.mp4' : 'canli-manken.png')}
                                            onConvertToVideo={() => setIsVideoModalOpen(true)}
                                            onShare={() => handleShare(generatedVideoUrl || generatedImageUrl)}
                                            isShareSupported={isShareSupported}
                                            onGenerateVariant={() => {
                                                // Mevcut sonucu Varyant A olarak sakla, yeni seed ile tekrar üret
                                                const currentImage = generatedImageUrl;
                                                if (currentImage) {
                                                    // Mevcut görseli variant olarak event gönder
                                                    window.dispatchEvent(new CustomEvent('model-variants-ready', {
                                                        detail: { variant1: currentImage, variant2: null, count: 1 }
                                                    }));
                                                }
                                                // Yeni seed ile tekrar üret (lock'u geçici kapat)
                                                setModelSeed(null);
                                                setIsModelLocked(false);
                                                handleGenerateModelClick();
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeToolTab === 'technical' ? (
                        /* --- TECHNICAL DRAWING MODE (PRODUCT -> SKETCH) --- */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in max-w-6xl mx-auto">

                            {/* INPUT */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col h-full">
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="bg-slate-700 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center text-sm">A</span>
                                        {t.technicalDrawing.uploadTitle}
                                    </h2>
                                    <p className="text-sm text-slate-400 mb-4">
                                        {t.technicalDrawing.uploadDescription}
                                    </p>
                                    <div className="flex-grow min-h-[400px]">
                                        <ImageUploader onImageUpload={handleTechUpload} imagePreviewUrl={techInputPreview} />
                                    </div>

                                    {/* Style Selector */}
                                    {techInputFile && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                {t.technicalDrawing.styleLabel}
                                            </label>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setTechSketchStyle('blackwhite')}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${techSketchStyle === 'blackwhite'
                                                        ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border-2 border-purple-400 shadow-lg'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
                                                        }`}
                                                >
                                                    {t.technicalDrawing.blackAndWhite}
                                                </button>
                                                <button
                                                    onClick={() => setTechSketchStyle('colored')}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${techSketchStyle === 'colored'
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400 shadow-lg'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
                                                        }`}
                                                >
                                                    {t.technicalDrawing.colored}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                                        <span className="text-sm text-slate-300">
                                            <span dangerouslySetInnerHTML={{ __html: t.technicalDrawing.creditInfo.replace('<span>', '<span class="text-purple-400 font-bold text-lg">').replace('</span>', '</span>') }} />
                                        </span>
                                        <span className="text-xs text-slate-400 block mt-1">
                                            {t.technicalDrawing.currentCredits} <span className="text-purple-400 font-semibold">{profile.credits}</span>
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleGenerateTechSketch}
                                        disabled={!techInputFile || isTechLoading}
                                        className={`w-full mt-2 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${!techInputFile || isTechLoading
                                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                            }`}
                                    >
                                        {isTechLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {t.technicalDrawing.preparing}
                                            </>
                                        ) : (
                                            <>
                                                <PencilIcon />
                                                {t.technicalDrawing.generateButton}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* RESULT */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative h-full min-h-[500px] flex flex-col">
                                    <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs text-white border border-white/20">
                                        {t.technicalDrawing.resultLabel}
                                    </div>

                                    <div className="flex-grow flex items-center justify-center bg-white p-4">
                                        {isTechLoading ? (
                                            <div className="text-center">
                                                <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-slate-800 font-medium">{t.technicalDrawing.aiAnalyzing}</p>
                                            </div>
                                        ) : generatedTechSketchUrl ? (
                                            <div className="relative w-full h-full flex flex-col">
                                                <img src={generatedTechSketchUrl} alt="Technical Sketch" className="w-full h-full object-contain" />
                                                <div className="absolute bottom-4 right-4 flex gap-2">
                                                    <button
                                                        onClick={() => handleDownload(generatedTechSketchUrl, 'teknik-cizim.png')}
                                                        className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 shadow-lg"
                                                        title={t.technicalDrawing.downloadTitle}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <PencilIcon />
                                                <p className="mt-2 text-sm">{t.technicalDrawing.resultPlaceholder}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : activeToolTab === 'pixshop' ? (
                        /* --- PIXSHOP MODE (Photo Editing) --- */
                        <PixshopPage
                            profile={profile}
                            onRefreshProfile={onRefreshProfile}
                            onShowBuyCredits={onBuyCreditsClick}
                        />
                    ) : activeToolTab === 'fotomatik' ? (
                        /* --- FOTOMATIK MODE (Transform & Describe) --- */
                        <FotomatikPage
                            profile={profile}
                            onRefreshProfile={onRefreshProfile}
                            onShowBuyCredits={onBuyCreditsClick}
                        />
                    ) : activeToolTab === 'collage' ? (
                        /* --- COLLAGE MODE (Multi-Image Composition) --- */
                        <CollagePage
                            profile={profile}
                            onRefreshProfile={onRefreshProfile}
                            onShowBuyCredits={onBuyCreditsClick}
                        />
                    ) : activeToolTab === 'techpack' ? (
                        /* --- TECH PACK MODE (Technical Drawings) --- */
                        <TechPackPage
                            profile={profile}
                            onRefreshProfile={onRefreshProfile}
                            onShowBuyCredits={onBuyCreditsClick}
                        />
                    ) : (
                        /* --- ADGENIUS MODE (E-commerce & Ads) --- */
                        <AdgeniusPage
                            profile={profile}
                            onRefreshProfile={onRefreshProfile}
                            onShowBuyCredits={onBuyCreditsClick}
                        />
                    )}
                </main>

                <VideoSettingsModal
                    isOpen={isVideoModalOpen}
                    isGenerating={isModelLoading}
                    onClose={() => setIsVideoModalOpen(false)}
                    onGenerate={handleVideoGeneration}
                />
            </div>
        );
    };

const App: React.FC = () => {
    const { user, profile, loading, authError, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordResetEmail, updatePassword, signOut, refreshProfile, retryAuth } = useAuth();
    const t = useTranslation(appTranslations);
    const [currentPage, setCurrentPage] = useState<'landing' | 'features' | 'blog' | 'tool' | 'dashboard' | 'admin' | 'privacy-policy' | 'kvkk' | 'terms-of-service' | 'cookie-policy' | 'refund-policy' | 'ai-usage-notice' | 'affiliate-portal' | 'affiliate-info'>('landing');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
    const [initialToolTab, setInitialToolTab] = useState<'design' | 'technical' | 'pixshop' | 'fotomatik' | 'adgenius' | 'collage' | 'techpack'>('design');

    // Close auth modal when user is logged in
    React.useEffect(() => {

        if (user && profile && showAuthModal) {
            console.log('✅ User logged in, closing auth modal');
            setShowAuthModal(false);
            // If on landing page, redirect to tool
            if (currentPage === 'landing') {
                setCurrentPage('tool');
            }
        }
    }, [user, profile, currentPage, showAuthModal]);

    // Referral link yakalama: ?ref=XXXX parametresini URL'den al
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            localStorage.setItem('fasheone_ref_code', refCode);
            localStorage.setItem('fasheone_ref_time', new Date().toISOString());
            trackReferralClick(refCode).catch(() => { });
            // URL'den ref parametresini temizle
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }
    }, []);

    // Admin check - use is_admin field from profile
    const isAdmin = profile?.is_admin === true;

    // Admin editable content state (keep for backward compatibility)
    const [sketchUrl, setSketchUrl] = useState(() => {
        const saved = localStorage.getItem('sketchUrl');
        return saved && saved.startsWith('data:') ? saved : 'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=600';
    });
    const [productUrl, setProductUrl] = useState(() => {
        const saved = localStorage.getItem('productUrl');
        return saved && saved.startsWith('data:') ? saved : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600';
    });
    const [modelUrl, setModelUrl] = useState(() => {
        const saved = localStorage.getItem('modelUrl');
        return saved && saved.startsWith('data:') ? saved : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600';
    });
    const [videoUrl, setVideoUrl] = useState(() => {
        const saved = localStorage.getItem('videoUrl');
        return saved && saved.startsWith('data:') ? saved : '';
    });
    const [heroVideoUrl, setHeroVideoUrl] = useState(() => {
        const saved = localStorage.getItem('heroVideoUrl');
        return saved && saved.startsWith('data:') ? saved : 'https://cdn.pixabay.com/video/2024/01/09/196454-904303173_large.mp4';
    });
    const [heroVideo1Url, setHeroVideo1Url] = useState(() => {
        const saved = localStorage.getItem('heroVideo1Url');
        return saved && saved.startsWith('data:') ? saved : '';
    });
    const [heroVideo2Url, setHeroVideo2Url] = useState(() => {
        const saved = localStorage.getItem('heroVideo2Url');
        return saved && saved.startsWith('data:') ? saved : '';
    });
    const [heroVideo3Url, setHeroVideo3Url] = useState(() => {
        const saved = localStorage.getItem('heroVideo3Url');
        return saved && saved.startsWith('data:') ? saved : '';
    });

    // Logo Media State
    const [logoMediaUrl, setLogoMediaUrl] = useState(() => {
        const saved = localStorage.getItem('logoMediaUrl');
        return saved && saved.startsWith('data:') ? saved : '';
    });

    // AdGenius States
    const [adGeniusMainUrl, setAdGeniusMainUrl] = useState(() => { const saved = localStorage.getItem('adGeniusMainUrl'); return saved && saved.startsWith('data:') ? saved : ''; });
    const [adGeniusCollageUrl, setAdGeniusCollageUrl] = useState(() => { const saved = localStorage.getItem('adGeniusCollageUrl'); return saved && saved.startsWith('data:') ? saved : ''; });

    // Pixshop & AdGenius Showcase Box States
    const [pixshopRetushUrl, setPixshopRetushUrl] = useState(() => { const s = localStorage.getItem('pixshopRetushUrl'); return s && s.startsWith('data:') ? s : ''; });
    const [pixshopProductPlacementUrl, setPixshopProductPlacementUrl] = useState(() => { const s = localStorage.getItem('pixshopProductPlacementUrl'); return s && s.startsWith('data:') ? s : ''; });
    const [adGeniusModelUrl, setAdGeniusModelUrl] = useState(() => { const s = localStorage.getItem('adGeniusModelUrl'); return s && s.startsWith('data:') ? s : ''; });
    const [adGeniusCampaignUrl, setAdGeniusCampaignUrl] = useState(() => { const s = localStorage.getItem('adGeniusCampaignUrl'); return s && s.startsWith('data:') ? s : ''; });
    const [adGeniusVideoUrl, setAdGeniusVideoUrl] = useState(() => { const s = localStorage.getItem('adGeniusVideoUrl'); return s && s.startsWith('data:') ? s : ''; });
    const [adGeniusProductPlacementUrl, setAdGeniusProductPlacementUrl] = useState(() => { const s = localStorage.getItem('adGeniusProductPlacementUrl'); return s && s.startsWith('data:') ? s : ''; });

    // Load content from Supabase on mount
    React.useEffect(() => {
        const loadContentFromSupabase = async () => {
            try {
                // Fetch hero videos
                const heroVideos = await getPublicHeroVideos();
                if (heroVideos.length > 0) {
                    heroVideos.forEach((video, index) => {
                        if (index === 0) {
                            setHeroVideoUrl(video.video_url);
                            localStorage.setItem('heroVideoUrl', video.video_url);
                        } else if (index === 1) {
                            setHeroVideo1Url(video.video_url);
                            localStorage.setItem('heroVideo1Url', video.video_url);
                        } else if (index === 2) {
                            setHeroVideo2Url(video.video_url);
                            localStorage.setItem('heroVideo2Url', video.video_url);
                        } else if (index === 3) {
                            setHeroVideo3Url(video.video_url);
                            localStorage.setItem('heroVideo3Url', video.video_url);
                        }
                    });
                    console.log('✅ Hero videolar Supabase\'den yüklendi:', heroVideos.length);
                }

                // Fetch showcase images
                const showcaseImages = await getPublicShowcaseImages();
                showcaseImages.forEach((image) => {
                    if (image.type === 'sketch') {
                        setSketchUrl(image.image_url);
                        localStorage.setItem('sketchUrl', image.image_url);
                    } else if (image.type === 'product') {
                        setProductUrl(image.image_url);
                        localStorage.setItem('productUrl', image.image_url);
                    } else if (image.type === 'model') {
                        setModelUrl(image.image_url);
                        localStorage.setItem('modelUrl', image.image_url);
                    } else if (image.type === 'video') {
                        setVideoUrl(image.image_url);
                        localStorage.setItem('videoUrl', image.image_url);
                    } else if (image.type === 'adgenius_main') {
                        setAdGeniusMainUrl(image.image_url);
                        localStorage.setItem('adGeniusMainUrl', image.image_url);
                    } else if (image.type === 'adgenius_collage') {
                        setAdGeniusCollageUrl(image.image_url);
                        localStorage.setItem('adGeniusCollageUrl', image.image_url);
                    } else if (image.type === 'logo_media') {
                        setLogoMediaUrl(image.image_url);
                        localStorage.setItem('logoMediaUrl', image.image_url);
                    } else if (image.type === 'pixshop_retush') {
                        setPixshopRetushUrl(image.image_url);
                        localStorage.setItem('pixshopRetushUrl', image.image_url);
                    } else if (image.type === 'pixshop_product_placement') {
                        setPixshopProductPlacementUrl(image.image_url);
                        localStorage.setItem('pixshopProductPlacementUrl', image.image_url);
                    } else if (image.type === 'adgenius_model') {
                        setAdGeniusModelUrl(image.image_url);
                        localStorage.setItem('adGeniusModelUrl', image.image_url);
                    } else if (image.type === 'adgenius_campaign') {
                        setAdGeniusCampaignUrl(image.image_url);
                        localStorage.setItem('adGeniusCampaignUrl', image.image_url);
                    } else if (image.type === 'adgenius_video') {
                        setAdGeniusVideoUrl(image.image_url);
                        localStorage.setItem('adGeniusVideoUrl', image.image_url);
                    } else if (image.type === 'adgenius_product_placement') {
                        setAdGeniusProductPlacementUrl(image.image_url);
                        localStorage.setItem('adGeniusProductPlacementUrl', image.image_url);
                    }
                });
                console.log('✅ Showcase görseller Supabase\'den yüklendi:', showcaseImages.length);
            } catch (error) {
                console.error('❌ Supabase içerik yükleme hatası:', error);
            }
        };

        loadContentFromSupabase();
    }, []);

    const handleFileUpload = async (file: File, type: 'sketch' | 'product' | 'model' | 'video' | 'heroVideo' | 'heroVideo1' | 'heroVideo2' | 'heroVideo3' | 'adgenius_main' | 'adgenius_collage' | 'logo_media' | 'pixshop_retush' | 'pixshop_product_placement' | 'adgenius_model' | 'adgenius_campaign' | 'adgenius_video' | 'adgenius_product_placement') => {
        try {
            // Convert file to base64 for immediate display
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;

                // Update local state immediately for instant feedback
                if (type === 'sketch') {
                    setSketchUrl(base64String);
                    localStorage.setItem('sketchUrl', base64String);
                } else if (type === 'product') {
                    setProductUrl(base64String);
                    localStorage.setItem('productUrl', base64String);
                } else if (type === 'model') {
                    setModelUrl(base64String);
                    localStorage.setItem('modelUrl', base64String);
                } else if (type === 'video') {
                    setVideoUrl(base64String);
                    localStorage.setItem('videoUrl', base64String);
                } else if (type === 'heroVideo') {
                    setHeroVideoUrl(base64String);
                    localStorage.setItem('heroVideoUrl', base64String);
                } else if (type === 'heroVideo1') {
                    setHeroVideo1Url(base64String);
                    localStorage.setItem('heroVideo1Url', base64String);
                } else if (type === 'heroVideo2') {
                    setHeroVideo2Url(base64String);
                    localStorage.setItem('heroVideo2Url', base64String);
                } else if (type === 'heroVideo3') {
                    setHeroVideo3Url(base64String);
                    localStorage.setItem('heroVideo3Url', base64String);
                } else if (type === 'adgenius_main') {
                    setAdGeniusMainUrl(base64String);
                    localStorage.setItem('adGeniusMainUrl', base64String);
                } else if (type === 'adgenius_collage') {
                    setAdGeniusCollageUrl(base64String);
                    localStorage.setItem('adGeniusCollageUrl', base64String);
                } else if (type === 'logo_media') {
                    setLogoMediaUrl(base64String);
                    localStorage.setItem('logoMediaUrl', base64String);
                } else if (type === 'pixshop_retush') {
                    setPixshopRetushUrl(base64String);
                    localStorage.setItem('pixshopRetushUrl', base64String);
                } else if (type === 'pixshop_product_placement') {
                    setPixshopProductPlacementUrl(base64String);
                    localStorage.setItem('pixshopProductPlacementUrl', base64String);
                } else if (type === 'adgenius_model') {
                    setAdGeniusModelUrl(base64String);
                    localStorage.setItem('adGeniusModelUrl', base64String);
                } else if (type === 'adgenius_campaign') {
                    setAdGeniusCampaignUrl(base64String);
                    localStorage.setItem('adGeniusCampaignUrl', base64String);
                } else if (type === 'adgenius_video') {
                    setAdGeniusVideoUrl(base64String);
                    localStorage.setItem('adGeniusVideoUrl', base64String);
                } else if (type === 'adgenius_product_placement') {
                    setAdGeniusProductPlacementUrl(base64String);
                    localStorage.setItem('adGeniusProductPlacementUrl', base64String);
                }
            };
            reader.readAsDataURL(file);

            // Upload to Supabase in the background
            if (type === 'heroVideo' || type === 'heroVideo1' || type === 'heroVideo2' || type === 'heroVideo3') {
                // Upload hero video to Supabase
                const orderIndex = type === 'heroVideo' ? 0 : type === 'heroVideo1' ? 1 : type === 'heroVideo2' ? 2 : 3;
                const result = await uploadHeroVideo(file, orderIndex);

                if (result.success && result.videoUrl) {
                    console.log(`✅ Hero video ${orderIndex + 1} Supabase'e yüklendi:`, result.videoUrl);
                    alert(`✅ ${t.alerts.heroVideoUploaded.replace('{index}', String(orderIndex + 1))}`);

                    // Update state with Supabase URL
                    if (type === 'heroVideo') {
                        setHeroVideoUrl(result.videoUrl);
                        localStorage.setItem('heroVideoUrl', result.videoUrl);
                    } else if (type === 'heroVideo1') {
                        setHeroVideo1Url(result.videoUrl);
                        localStorage.setItem('heroVideo1Url', result.videoUrl);
                    } else if (type === 'heroVideo2') {
                        setHeroVideo2Url(result.videoUrl);
                        localStorage.setItem('heroVideo2Url', result.videoUrl);
                    } else if (type === 'heroVideo3') {
                        setHeroVideo3Url(result.videoUrl);
                        localStorage.setItem('heroVideo3Url', result.videoUrl);
                    }
                } else {
                    console.error('❌ Hero video Supabase yüklemesi başarısız:', result.error);
                    alert(`${t.alerts.heroVideoFailed.replace('{error}', result.error || '')}${t.alerts.supabaseBucketHint}`);
                }
            } else if (type === 'sketch' || type === 'product' || type === 'model') {
                // Upload showcase image to Supabase
                const imageType = type as 'sketch' | 'product' | 'model';
                const result = await uploadShowcaseImage(file, imageType, 0);

                if (result.success && result.imageUrl) {
                    console.log(`✅ ${imageType} görseli Supabase'e yüklendi:`, result.imageUrl);
                    const typeNames = { sketch: t.typeNames.sketch, product: t.typeNames.product, model: t.typeNames.model };
                    alert(`${t.alerts.showcaseImageUploaded.replace('{type}', typeNames[imageType])}`);

                    // Update state with Supabase URL
                    if (type === 'sketch') {
                        setSketchUrl(result.imageUrl);
                        localStorage.setItem('sketchUrl', result.imageUrl);
                    } else if (type === 'product') {
                        setProductUrl(result.imageUrl);
                        localStorage.setItem('productUrl', result.imageUrl);
                    } else if (type === 'model') {
                        setModelUrl(result.imageUrl);
                        localStorage.setItem('modelUrl', result.imageUrl);
                    }
                } else {
                    console.error(`❌ ${imageType} görseli Supabase yüklemesi başarısız:`, result.error);
                    alert(`${t.alerts.showcaseImageFailed.replace('{type}', imageType).replace('{error}', result.error || '')}${t.alerts.supabaseBucketHint}`);
                }
            } else if (type === 'video') {
                // Upload showcase video to Supabase
                const result = await uploadShowcaseImage(file, 'video', 0);

                if (result.success && result.imageUrl) {
                    console.log('✅ Showcase video Supabase\'e yüklendi:', result.imageUrl);
                    alert(t.alerts.showcaseVideoUploaded);
                    setVideoUrl(result.imageUrl);
                    localStorage.setItem('videoUrl', result.imageUrl);
                } else {
                    console.error('❌ Showcase video Supabase yüklemesi başarısız:', result.error);
                    alert(`${t.alerts.showcaseVideoFailed.replace('{error}', result.error || '')}${t.alerts.supabaseBucketHint}`);
                }
            } else if (type === 'adgenius_main' || type === 'adgenius_collage') {
                // Upload AdGenius image
                const adGeniusType = type as any;
                const result = await uploadShowcaseImage(file, adGeniusType, 0);

                if (result.success && result.imageUrl) {
                    console.log(`✅ AdGenius ${type} görseli yüklendi:`, result.imageUrl);
                    alert(t.alerts.adgeniusUploaded);

                    if (type === 'adgenius_main') {
                        setAdGeniusMainUrl(result.imageUrl);
                        localStorage.setItem('adGeniusMainUrl', result.imageUrl);
                    } else if (type === 'adgenius_collage') {
                        setAdGeniusCollageUrl(result.imageUrl);
                        localStorage.setItem('adGeniusCollageUrl', result.imageUrl);
                    }
                } else {
                    alert(`${t.alerts.uploadFailed.replace('{error}', result.error || '')}`);
                }
            } else if (type === 'logo_media') {
                // Attempt to upload to Supabase
                const result = await uploadShowcaseImage(file, 'logo_media', 0);

                if (result.success && result.imageUrl) {
                    console.log('✅ Logo media Supabase\'e yüklendi:', result.imageUrl);
                    alert(t.alerts.logoUploaded);

                    setLogoMediaUrl(result.imageUrl);
                    localStorage.setItem('logoMediaUrl', result.imageUrl);
                } else {
                    console.error('❌ Logo media Supabase yüklemesi başarısız:', result.error);

                    // Fallback to localStorage if DB upload fails (e.g. Constraint violation)
                    console.log('⚠️ Supabase yüklemesi başarısız oldu, yerel depolama kullanılıyor.');

                    let errorMessage = `${t.alerts.logoDbFailed} ${result.error}`;

                    if (result.error && result.error.includes('showcase_images_type_check')) {
                        errorMessage += t.alerts.logoConstraintError;
                    }

                    alert(`${errorMessage}${t.alerts.logoFallbackNote}`);

                    // Fallback: We already have base64String from reader above, but scope is tricky. 
                    // Actually reader logic runs before this if/else block for upload
                    // The reader.onloadend event sets the state to base64String immediately.
                    // So key state is already updated visually. We just need to persist to localStorage as fallback.
                    // Note: setLogoMediaUrl(base64String) was already called in reader.onloadend
                    // We just accept the current state as fallback.
                }
            } else if (['pixshop_retush', 'pixshop_product_placement', 'adgenius_model', 'adgenius_campaign', 'adgenius_video', 'adgenius_product_placement'].includes(type)) {
                // Upload Pixshop/AdGenius showcase box images
                const result = await uploadShowcaseImage(file, type as any, 0);

                if (result.success && result.imageUrl) {
                    console.log(`✅ ${type} görseli Supabase'e yüklendi:`, result.imageUrl);
                    alert(`✅ Görsel başarıyla yüklendi!`);

                    const stateSetters: Record<string, (url: string) => void> = {
                        pixshop_retush: setPixshopRetushUrl,
                        pixshop_product_placement: setPixshopProductPlacementUrl,
                        adgenius_model: setAdGeniusModelUrl,
                        adgenius_campaign: setAdGeniusCampaignUrl,
                        adgenius_video: setAdGeniusVideoUrl,
                        adgenius_product_placement: setAdGeniusProductPlacementUrl,
                    };
                    const storageKeys: Record<string, string> = {
                        pixshop_retush: 'pixshopRetushUrl',
                        pixshop_product_placement: 'pixshopProductPlacementUrl',
                        adgenius_model: 'adGeniusModelUrl',
                        adgenius_campaign: 'adGeniusCampaignUrl',
                        adgenius_video: 'adGeniusVideoUrl',
                        adgenius_product_placement: 'adGeniusProductPlacementUrl',
                    };

                    stateSetters[type]?.(result.imageUrl);
                    localStorage.setItem(storageKeys[type], result.imageUrl);
                } else {
                    alert(`❌ Yükleme başarısız: ${result.error || 'Bilinmeyen hata'}`);
                }
            }
        } catch (error) {
            console.error('❌ Dosya yükleme hatası:', error);
            alert(t.alerts.fileUploadError);
        }
    };

    const handleGetStarted = () => {
        if (!user) {
            setShowAuthModal(true);
        } else if (!profile) {
            // User exists but profile is still loading or creating
            alert(t.alerts.accountPreparing);
            setTimeout(() => {
                refreshProfile();
            }, 2000);
        } else {
            setCurrentPage('tool');
        }
    };

    const handleSignIn = () => {
        setShowAuthModal(true);
    };

    const handleAdminLogin = (email: string, password: string) => {
        // SECURITY NOTE: This is a client-side check and is not secure for production.
        // TODO: Implement proper server-side authentication with Supabase Auth or backend verification.
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            setIsAdminLoggedIn(true);
            setShowAdminLogin(false);
            setCurrentPage('admin');
            // Also update profile if user is logged in
            if (user && profile) {
                // Ideally this should trigger a backend update or be handled by RLS
            }
        } else {
            alert(t.alerts.invalidAdmin);
        }
    };

    const handleAdminClick = () => {
        if (isAdminLoggedIn) {
            setCurrentPage('admin');
        } else {
            setShowAdminLogin(true);
        }
    };

    // Debug logging
    React.useEffect(() => {
        if (user) {
            // Check if this is a first-time login (sign up)
            const lastLogin = localStorage.getItem('fasheone_last_login');
            if (!lastLogin) {
                trackEvent('sign_up', { method: 'auto', userId: user.id });
                localStorage.setItem('fasheone_last_login', new Date().toISOString());
            } else {
                trackEvent('login', { userId: user.id });
            }
        }
        console.log('Auth State:', {
            user: !!user,
            profile: !!profile,
            loading,
            userEmail: user?.email,
            profileId: profile?.id,
            credits: profile?.credits
        });
    }, [user, profile, loading]);

    // Auto-retry effect when user exists but profile is missing
    // IMPORTANT: This hook must be defined BEFORE any conditional returns
    React.useEffect(() => {
        if (user && !profile && !loading) {
            const timer = setTimeout(() => {
                console.log('🔄 Profile otomatik retry...');
                retryAuth();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [user, profile, loading, retryAuth]);

    // Loading state - show spinner
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center max-w-sm px-4">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-500 mb-4"></div>
                    <p className="text-slate-400">{t.loading.text}</p>
                    <p className="text-slate-500 text-sm mt-2">
                        {authError ? authError : t.loading.gettingUserInfo}
                    </p>
                    {authError && (
                        <button
                            onClick={retryAuth}
                            className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition text-sm"
                        >
                            {t.loading.retryButton}
                        </button>
                    )}
                    <p className="text-slate-600 text-xs mt-4">
                        {t.loading.autoRetryHint}
                    </p>
                </div>
            </div>
        );
    }

    // If user is logged in but profile is not loaded, show specific message with auto-retry
    if (user && !profile && !loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center max-w-md p-8">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-500 mb-4"></div>
                    <h2 className="text-white text-xl font-bold mb-2">{t.profileCreating.title}</h2>
                    <p className="text-slate-400 mb-4">
                        {authError ? authError : t.profileCreating.description}
                    </p>
                    <p className="text-slate-500 text-sm mb-4">{t.profileCreating.autoRetrying}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={retryAuth}
                            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition"
                        >
                            {t.profileCreating.retryButton}
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                        >
                            {t.profileCreating.refreshPage}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <FloatingWhatsApp
                phoneNumber={import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined}
                message={t.whatsappMessage}
            />
            {currentPage === 'landing' && (
                <LandingPage
                    onGetStarted={handleGetStarted}
                    onSignIn={handleSignIn}
                    onNavigate={(page: any, tab?: string) => {
                        if (tab) setInitialToolTab(tab as any);
                        setCurrentPage(page);
                    }}
                    isLoggedIn={!!user}
                    userName={profile?.full_name}
                    userRole={isAdmin ? 'admin' : (user ? 'user' : null)}
                    credits={profile?.credits}
                    onLogout={() => {
                        signOut();
                        setCurrentPage('landing');
                    }}
                    onAdminClick={isAdmin ? () => setCurrentPage('admin') : undefined}
                    onBuyCreditsClick={user ? () => setShowBuyCreditsModal(true) : undefined}
                />
            )}
            {currentPage === 'features' && (
                <FeaturesPage
                    onNavigateHome={() => setCurrentPage('landing')}
                    onGetStarted={handleGetStarted}
                    isLoggedIn={!!user}
                />
            )}
            {currentPage === 'blog' && (
                <BlogPage
                    onNavigateHome={() => setCurrentPage('landing')}
                    onNavigateFeatures={() => setCurrentPage('features')}
                    onGetStarted={handleGetStarted}
                    isLoggedIn={!!user}
                />
            )}
            {currentPage === 'tool' && user && profile && (
                <ToolPage
                    initialTab={initialToolTab}
                    onNavigateHome={() => setCurrentPage('landing')}
                    isLoggedIn={!!user}
                    userRole={isAdmin ? 'admin' : 'user'}
                    userName={profile.full_name}
                    onLoginClick={handleSignIn}
                    onLogoutClick={() => {
                        signOut();
                        setCurrentPage('landing');
                    }}
                    onAdminClick={isAdmin ? () => setCurrentPage('admin') : undefined}
                    onAffiliateClick={() => setCurrentPage('affiliate-portal')}
                    onBuyCreditsClick={() => setShowBuyCreditsModal(true)}
                    profile={profile}
                    onRefreshProfile={refreshProfile}
                />
            )}
            {currentPage === 'dashboard' && user && profile && (
                <Dashboard
                    profile={profile}
                    onRefresh={refreshProfile}
                />
            )}
            {currentPage === 'admin' && isAdmin && user && profile && (
                <AdminDashboard
                    onNavigateHome={() => setCurrentPage('landing')}
                    isLoggedIn={!!user}
                    userRole="admin"
                    userName={profile.full_name}
                    onLoginClick={handleSignIn}
                    onLogoutClick={() => {
                        signOut();
                        setCurrentPage('landing');
                    }}
                    sketchUrl={sketchUrl}
                    productUrl={productUrl}
                    modelUrl={modelUrl}
                    videoUrl={videoUrl}
                    heroVideoUrl={heroVideoUrl}
                    heroVideo1Url={heroVideo1Url}
                    heroVideo2Url={heroVideo2Url}
                    heroVideo3Url={heroVideo3Url}
                    onSketchUpload={(f) => handleFileUpload(f, 'sketch')}
                    onProductUpload={(f) => handleFileUpload(f, 'product')}
                    onModelUpload={(f) => handleFileUpload(f, 'model')}
                    onVideoUpload={(f) => handleFileUpload(f, 'video')}
                    onHeroVideoUpload={(f) => handleFileUpload(f, 'heroVideo')}
                    onHeroVideo1Upload={(f) => handleFileUpload(f, 'heroVideo1')}
                    onHeroVideo2Upload={(f) => handleFileUpload(f, 'heroVideo2')}
                    onHeroVideo3Upload={(f) => handleFileUpload(f, 'heroVideo3')}
                    adGeniusMainUrl={adGeniusMainUrl}
                    adGeniusCollageUrl={adGeniusCollageUrl}
                    onAdGeniusMainUpload={(f) => handleFileUpload(f, 'adgenius_main')}
                    onAdGeniusCollageUpload={(f) => handleFileUpload(f, 'adgenius_collage')}
                    credits={profile.credits}
                    currentUserId={profile.id}
                    onRefreshProfile={refreshProfile}
                    logoMediaUrl={logoMediaUrl}
                    onLogoMediaUpload={(f) => handleFileUpload(f, 'logo_media')}
                    pixshopRetushUrl={pixshopRetushUrl}
                    onPixshopRetushUpload={(f) => handleFileUpload(f, 'pixshop_retush')}
                    pixshopProductPlacementUrl={pixshopProductPlacementUrl}
                    onPixshopProductPlacementUpload={(f) => handleFileUpload(f, 'pixshop_product_placement')}
                    adGeniusModelUrl={adGeniusModelUrl}
                    onAdGeniusModelUpload={(f) => handleFileUpload(f, 'adgenius_model')}
                    adGeniusCampaignUrl={adGeniusCampaignUrl}
                    onAdGeniusCampaignUpload={(f) => handleFileUpload(f, 'adgenius_campaign')}
                    adGeniusVideoUrl={adGeniusVideoUrl}
                    onAdGeniusVideoUpload={(f) => handleFileUpload(f, 'adgenius_video')}
                    adGeniusProductPlacementUrl={adGeniusProductPlacementUrl}
                    onAdGeniusProductPlacementUpload={(f) => handleFileUpload(f, 'adgenius_product_placement')}
                />
            )}

            {/* Legal Pages */}
            {currentPage === 'privacy-policy' && (
                <PrivacyPolicyPage
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}
            {currentPage === 'kvkk' && (
                <KVKKPage
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}
            {currentPage === 'terms-of-service' && (
                <TermsOfServicePage
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}
            {currentPage === 'cookie-policy' && (
                <CookiePolicyPage
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}
            {currentPage === 'refund-policy' && (
                <RefundPolicyPage
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}
            {currentPage === 'ai-usage-notice' && (
                <AIUsageNoticePage
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}

            {/* Affiliate Pages */}
            {currentPage === 'affiliate-info' && (
                <AffiliateProgramPage
                    language={(localStorage.getItem('fasheone_language') as 'tr' | 'en') || 'tr'}
                    onApply={() => {
                        if (user) {
                            setCurrentPage('affiliate-portal');
                        } else {
                            setShowAuthModal(true);
                        }
                    }}
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}
            {currentPage === 'affiliate-portal' && user && profile && (
                <AffiliatePortal
                    profile={profile}
                    language={(localStorage.getItem('fasheone_language') as 'tr' | 'en') || 'tr'}
                    onNavigateHome={() => setCurrentPage('landing')}
                />
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onGoogleSignIn={signInWithGoogle}
                onEmailSignIn={signInWithEmail}
                onEmailSignUp={signUpWithEmail}
                onForgotPassword={sendPasswordResetEmail}
            />

            <LoginModal
                isOpen={showAdminLogin}
                onClose={() => setShowAdminLogin(false)}
                onLogin={handleAdminLogin}
                onSwitchToRegister={() => { }}
            />

            {/* Buy Credits Modal - Available from Header */}
            {user && profile && (
                <BuyCreditsModal
                    isOpen={showBuyCreditsModal}
                    onClose={() => setShowBuyCreditsModal(false)}
                    userId={profile.id}
                    userEmail={profile.email}
                    userName={profile.full_name || t.userName}
                    onSuccess={() => {
                        refreshProfile();
                        setShowBuyCreditsModal(false);
                    }}
                />
            )}


        </>
    );
};

export default App;
