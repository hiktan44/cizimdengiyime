
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
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './components/Dashboard';
import { checkAndDeductCredits, saveGeneration, uploadBase64ToStorage } from './lib/database';
import { CREDIT_COSTS } from './lib/supabase';
import { BuyCreditsModal } from './components/BuyCreditsModal';
import { uploadHeroVideo, uploadShowcaseImage, getPublicHeroVideos, getPublicShowcaseImages } from './lib/adminService';
import { PixshopPage } from './pages/PixshopPage';
import { FotomatikPage } from './pages/FotomatikPage';
import { WhatsAppPanel } from './components/WhatsAppPanel';

interface PageHeaderProps {
    isLoggedIn: boolean;
    userRole: 'admin' | 'user' | null;
    userName?: string | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onAdminClick?: () => void;
    onBuyCreditsClick?: () => void;
}

const ToolPage: React.FC<{
    onNavigateHome: () => void;
    profile: any;
    onRefreshProfile: () => void;
} & PageHeaderProps> = ({
    onNavigateHome,
    isLoggedIn,
    userName,
    onLoginClick,
    onLogoutClick,
    userRole,
    onAdminClick,
    onBuyCreditsClick,
    profile,
    onRefreshProfile
}) => {
        const [activeToolTab, setActiveToolTab] = useState<'design' | 'technical' | 'pixshop' | 'fotomatik'>('design');

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
        const [loadingText, setLoadingText] = useState('Yapay zeka düşünüyor...');
        const [progress, setProgress] = useState(0);

        // Step 3: Result (Model & Video)
        const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
        const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

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

        // Pattern State
        const [patternFile, setPatternFile] = useState<File | null>(null);
        const [patternPreview, setPatternPreview] = useState<string | null>(null);

        // Aspect Ratio
        const [aspectRatio, setAspectRatio] = useStickyState<'9:16' | '3:4' | '4:5' | '1:1' | '16:9'>('3:4', 'fasheone_aspectRatio');

        // Custom Background
        const [customBackgroundFile, setCustomBackgroundFile] = useState<File | undefined>(undefined);

        const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
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
            setLoadingText('Çizim ürüne dönüştürülüyor...');
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
            } catch (error) {
                alert(`Ürün oluşturma hatası: ${error}`);
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
            setLoadingText('Üst giyim ürüne dönüştürülüyor...');
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
                alert(`Üst giyim oluşturma hatası: ${error}`);
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
            setLoadingText('Alt giyim ürüne dönüştürülüyor...');
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
                alert(`Alt giyim oluşturma hatası: ${error}`);
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
                        alert("Üst giyim görseli işlenirken hata oluştu.");
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
                        alert("Alt giyim görseli işlenirken hata oluştu.");
                        return;
                    }
                }

                if (!sourceFile || !secondSourceFile) {
                    alert('Kombin modu için hem üst hem alt giyim görseli gereklidir. Lütfen her iki parçayı da yükleyin veya çizimden oluşturun.');
                    return;
                }
            } else {
                // SINGLE ITEM MODE: Use standard product image
                sourceFile = uploadedProductFile;

                if (!sourceFile && generatedProductUrl) {
                    try {
                        sourceFile = await base64ToFile(generatedProductUrl, 'generated_product.png');
                    } catch (e) {
                        alert("Görsel işlenirken hata oluştu.");
                        return;
                    }
                }

                if (!sourceFile) {
                    alert('Lütfen önce bir ürün görseli yükleyin veya çizimden oluşturun.');
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
            setLoadingText(isKombinMode ? 'Kombin ile canlı model oluşturuluyor...' : 'Canlı model oluşturuluyor...');

            setLoadingText(isKombinMode ? 'Kombin ile canlı model oluşturuluyor...' : 'Canlı model oluşturuluyor...');

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

            try {
                const imageUrl = await generateImage(
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
                    activeSeed // Pass seed
                );
                finishProgress();
                setTimeout(() => {
                    setGeneratedImageUrl(imageUrl);
                    setIsModelLoading(false);
                }, 600);

                // Save to database
                await saveGeneration(
                    profile.id,
                    'product_to_model',
                    CREDIT_COSTS.PRODUCT_TO_MODEL,
                    null,
                    imageUrl,
                    null,
                    {
                        clothingType, colorSuggestion, secondaryColor, modelEthnicity,
                        artisticStyle, location, bodyType, pose, hairColor, hairStyle,
                        customPrompt, lighting, cameraAngle, cameraZoom, aspectRatio,
                        fabricType, fabricFinish, shoeType, shoeColor, accessories,
                        ageRange, gender,
                        isKombinMode, hasPattern: !!patternFile
                    }
                );

                // Refresh profile to update credits
                onRefreshProfile();
            } catch (error) {
                console.error('Görsel oluşturma hatası:', error);
                alert(`Görsel oluşturulurken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
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
            setLoadingText('Teknik çizim hazırlanıyor...');
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
            } catch (error) {
                console.error('Teknik çizim hatası:', error);
                alert(`Hata: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                setIsTechLoading(false);
            }
        };


        // 3. Video Generation
        const handleVideoGeneration = async (settings: VideoGenerationSettings) => {
            if (!generatedImageUrl) return;

            // Check credits
            const creditCheck = await checkAndDeductCredits(profile.id, 'video');
            if (!creditCheck.success) {
                alert(creditCheck.message);
                return;
            }

            setIsVideoModalOpen(false);
            setIsModelLoading(true);

            // Update loading text based on quality
            if (settings.quality === 'high') {
                setLoadingText('Yüksek kalite video işleniyor (Veo 3.1). Bu işlem 2-5 dakika sürebilir, lütfen bekleyin...');
                // Slower progress simulation for high quality
                startProgressSimulation(95, 3000);
            } else {
                setLoadingText('Video oluşturuluyor (Hızlı Mod)...');
                startProgressSimulation(92, 1000);
            }

            try {
                const videoUrl = await generateVideoFromImage(
                    generatedImageUrl,
                    settings
                );
                finishProgress();
                setTimeout(() => {
                    setGeneratedVideoUrl(videoUrl);
                    setIsModelLoading(false);
                }, 600);

                // Save to database
                await saveGeneration(
                    profile.id,
                    'video',
                    CREDIT_COSTS.VIDEO,
                    null,
                    null,
                    videoUrl,
                    { settings }
                );

                // Refresh profile to update credits
                onRefreshProfile();
            } catch (error) {
                console.error('Video oluşturma hatası:', error);
                alert(`Video oluşturulurken hata: ${error instanceof Error ? error.message : String(error)}`);
                setIsModelLoading(false);
            }
        };

        // Improved Download Handler using fetch -> blob to force download behavior
        const handleDownload = async (url: string | null, filename: string) => {
            if (!url) return;

            try {
                // Attempt to fetch the blob first (Stable download method)
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Blob download failed, falling back to direct link", error);
                // Fallback for simple links if fetch fails (e.g. CORS on external demo assets)
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.target = "_blank"; // Safer for external links
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        const handleShare = async (url: string | null) => {
            if (url && isShareSupported) {
                try {
                    const blob = await (await fetch(url)).blob();
                    const file = new File([blob], 'generated-content.png', { type: blob.type });
                    await navigator.share({
                        title: 'Çizimden Gerçeğe AI',
                        text: 'Yapay zeka ile oluşturduğum tasarıma göz at!',
                        files: [file],
                    });
                } catch (error) {
                    console.log('Paylaşım iptal edildi veya hata oluştu', error);
                }
            }
        };

        return (
            <div className="min-h-screen flex flex-col bg-slate-900">
                <WhatsAppPanel
                    phoneNumber={import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined}
                    message="Merhaba, Canli Model ve Teknik Cizim konusunda destek almak istiyorum."
                    title="WhatsApp"
                    subtitle="Hemen yazin"
                />
                <Header
                    isLoggedIn={isLoggedIn}
                    userRole={userRole}
                    userName={profile.full_name}
                    onLoginClick={onLoginClick}
                    onLogoutClick={onLogoutClick}
                    onHomeClick={onNavigateHome}
                    onAdminClick={onAdminClick}
                    onBuyCreditsClick={onBuyCreditsClick}
                    credits={profile.credits}
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
                                <span className="hidden sm:inline">Canlı Model & Video</span>
                                <span className="sm:hidden">Model</span>
                            </div>
                            <span className={`text-xs ${activeToolTab === 'design' ? 'text-cyan-200' : 'text-slate-500'}`}>
                                Model: 1₺ • Video: 3₺
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
                                <span className="hidden sm:inline">Teknik Çizim (Tech Pack)</span>
                                <span className="sm:hidden">Tech Pack</span>
                            </div>
                            <span className={`text-xs ${activeToolTab === 'technical' ? 'text-purple-200' : 'text-slate-500'}`}>
                                1 kredi/işlem
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
                                1 kredi/işlem
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
                                1 kredi/işlem
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
                                                <h3 className="text-lg font-bold text-white">Kombin Modu Aktif</h3>
                                                <p className="text-sm text-slate-400">Üst ve alt giyim için ayrı görseller yükleyin</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* TOP GARMENT ROW */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* TOP: Sketch */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col">
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                                Üst Giyim - Çizim
                                            </h2>
                                            <div className="flex-grow min-h-[200px]">
                                                <ImageUploader onImageUpload={handleTopSketchUpload} imagePreviewUrl={topSketchPreviewUrl} />
                                            </div>
                                            <div className="mt-2 text-xs text-center text-slate-400">
                                                Bu işlem <span className="text-cyan-400 font-bold">1 kredi</span> harcar
                                            </div>
                                            <button
                                                onClick={handleGenerateTopProduct}
                                                disabled={!topSketchFile || isTopProductLoading}
                                                className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!topSketchFile || isTopProductLoading
                                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                    : 'bg-cyan-600 text-white hover:bg-cyan-500'
                                                    }`}
                                            >
                                                {isTopProductLoading ? 'İşleniyor...' : 'Ürüne Dönüştür →'}
                                            </button>
                                        </div>

                                        {/* TOP: Product */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col relative">
                                            <div className="hidden md:block absolute top-1/2 -left-5 transform -translate-y-1/2 text-cyan-500 z-10">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                                Üst Giyim - Ürün
                                            </h2>
                                            <div className="flex-grow min-h-[200px] relative">
                                                <ImageUploader onImageUpload={handleTopProductUpload} imagePreviewUrl={topProductPreviewUrl} />
                                                {topProductPreviewUrl && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Hazır</div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 text-center">
                                                {generatedTopProductUrl ? "Çizimden üretildi" : "Çizimden üret veya doğrudan yükle"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BOTTOM GARMENT ROW */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* BOTTOM: Sketch */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-purple-500/30 shadow-xl flex flex-col">
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                                                Alt Giyim - Çizim
                                            </h2>
                                            <div className="flex-grow min-h-[200px]">
                                                <ImageUploader onImageUpload={handleBottomSketchUpload} imagePreviewUrl={bottomSketchPreviewUrl} />
                                            </div>
                                            <div className="mt-2 text-xs text-center text-slate-400">
                                                Bu işlem <span className="text-cyan-400 font-bold">1 kredi</span> harcar
                                            </div>
                                            <button
                                                onClick={handleGenerateBottomProduct}
                                                disabled={!bottomSketchFile || isBottomProductLoading}
                                                className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!bottomSketchFile || isBottomProductLoading
                                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                    : 'bg-purple-600 text-white hover:bg-purple-500'
                                                    }`}
                                            >
                                                {isBottomProductLoading ? 'İşleniyor...' : 'Ürüne Dönüştür →'}
                                            </button>
                                        </div>

                                        {/* BOTTOM: Product */}
                                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-purple-500/30 shadow-xl flex flex-col relative">
                                            <div className="hidden md:block absolute top-1/2 -left-5 transform -translate-y-1/2 text-purple-500 z-10">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                                                Alt Giyim - Ürün
                                            </h2>
                                            <div className="flex-grow min-h-[200px] relative">
                                                <ImageUploader onImageUpload={handleBottomProductUpload} imagePreviewUrl={bottomProductPreviewUrl} />
                                                {bottomProductPreviewUrl && (
                                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Hazır</div>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 text-center">
                                                {generatedBottomProductUrl ? "Çizimden üretildi" : "Çizimden üret veya doğrudan yükle"}
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
                                                    <span className="text-green-400 font-medium">Her iki parça da hazır! Canlı model oluşturabilirsiniz.</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                    <span className="text-orange-400 font-medium">
                                                        {!topProductPreviewUrl && !bottomProductPreviewUrl
                                                            ? 'Üst ve alt giyim görselleri gerekli'
                                                            : !topProductPreviewUrl
                                                                ? 'Üst giyim görseli gerekli'
                                                                : 'Alt giyim görseli gerekli'}
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
                                            Çizim (Opsiyonel)
                                        </h2>
                                        <div className="flex-grow">
                                            <ImageUploader onImageUpload={handleSketchUpload} imagePreviewUrl={sketchPreviewUrl} />
                                        </div>

                                        {/* Color picker for product */}
                                        {uploadedSketchFile && (
                                            <div className="mt-4">
                                                <ColorPicker
                                                    label="Ürün Rengi (Opsiyonel)"
                                                    selectedColor={productColor}
                                                    onColorChange={setProductColor}
                                                />
                                            </div>
                                        )}

                                        <div className="mt-2 text-xs text-center text-slate-400">
                                            Bu işlem <span className="text-cyan-400 font-bold">1 kredi</span> harcar
                                        </div>
                                        <button
                                            onClick={handleGenerateProductClick}
                                            disabled={!uploadedSketchFile || isProductLoading}
                                            className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!uploadedSketchFile || isProductLoading
                                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-500'
                                                }`}
                                        >
                                            {isProductLoading ? 'İşleniyor...' : 'Ürüne Dönüştür →'}
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
                                            Ürün Görseli
                                        </h2>
                                        <div className="flex-grow relative">
                                            <ImageUploader onImageUpload={handleProductUpload} imagePreviewUrl={productPreviewUrl} />
                                            {/* Download button for product image */}
                                            {(generatedProductUrl || productPreviewUrl) && (
                                                <button
                                                    onClick={() => handleDownload(generatedProductUrl || productPreviewUrl, 'urun-gorseli.png')}
                                                    className="absolute bottom-4 right-4 bg-cyan-600/90 text-white p-3 rounded-full hover:bg-cyan-500 transition-all shadow-lg backdrop-blur-sm z-10"
                                                    title="Ürün Görselini İndir"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 text-center">
                                            {generatedProductUrl ? "Çizimden üretilen görsel kullanılıyor." : "Çizim yoksa, doğrudan ürün fotoğrafı yükleyin."}
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
                                            Model Ayarları
                                        </h2>

                                        {/* CLOTHING TYPE SELECTION */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">Kıyafet Türü</label>
                                            <select
                                                value={clothingType}
                                                onChange={(e) => setClothingType(e.target.value)}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition"
                                            >
                                                <option value="Genel">Genel (Otomatik Algıla)</option>
                                                <option value="Üst Giyim">Sadece Üst (Gömlek, Tişört, Ceket)</option>
                                                <option value="Alt Giyim">Sadece Alt (Pantolon, Etek)</option>
                                                <option value="Elbise">Elbise</option>
                                                <option value="Takım Elbise">Takım Elbise / Döpiyes</option>
                                                <option value="Alt & Üst">Alt & Üst (Kombin)</option>
                                            </select>
                                        </div>

                                        {/* COLOR PICKERS */}
                                        <div className="space-y-4">
                                            <ColorPicker
                                                label={clothingType === 'Alt & Üst' ? 'Üst Parça Rengi' : (clothingType === 'Alt Giyim' ? 'Alt Giyim Rengi' : 'Ana Renk')}
                                                selectedColor={colorSuggestion}
                                                onColorChange={setColorSuggestion}
                                            />

                                            {/* Pattern Upload */}
                                            <div className="bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-600">
                                                <label className="block text-xs font-medium text-slate-400 mb-2">
                                                    Desen / Baskı Ekle (İsteğe Bağlı)
                                                </label>

                                                {patternPreview ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={patternPreview}
                                                            alt="Desen"
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
                                                            <span>Desen görseli seçin...</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-slate-500 mt-1 pl-1">
                                                    Eklenen desen kıyafete uygulanır.
                                                </p>
                                            </div>

                                            {(clothingType === 'Alt & Üst' || clothingType === 'Takım Elbise') && (
                                                <div className="pt-2 border-t border-slate-700/50">
                                                    <ColorPicker
                                                        label={clothingType === 'Takım Elbise' ? 'Gömlek/İç Rengi' : 'Alt Parça Rengi'}
                                                        selectedColor={secondaryColor}
                                                        onColorChange={setSecondaryColor}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* CUSTOM PROMPT / CHAT INPUT */}
                                        <div>
                                            <label className="font-medium text-cyan-400 block mb-2 text-sm flex items-center gap-2">
                                                <SparklesIcon /> Yapay Zeka ile Sohbet / Detaylı İstek
                                            </label>
                                            <textarea
                                                value={customPrompt}
                                                onChange={(e) => setCustomPrompt(e.target.value)}
                                                placeholder="Örn: Parkta bankta oturan, elinde kahve tutan, güneş gözlüklü bir model olsun. Arka planda sonbahar yaprakları..."
                                                rows={3}
                                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Etnik Köken</label>
                                                <select value={modelEthnicity} onChange={(e) => setModelEthnicity(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Farklı">Farklı (Karışık)</option>
                                                    <option value="Türk">Türk</option>
                                                    <option value="Avrupalı">Avrupalı</option>
                                                    <option value="Kuzey Avrupalı">İskandinav</option>
                                                    <option value="Güney Avrupalı">Akdeniz</option>
                                                    <option value="Asyalı">Doğu Asyalı</option>
                                                    <option value="Afrikalı">Afrikalı</option>
                                                    <option value="Latin">Latin</option>
                                                    <option value="Orta Doğulu">Orta Doğulu</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Sanatsal Stil</label>
                                                <select value={artisticStyle} onChange={(e) => setArtisticStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Gerçekçi">Fotogerçekçi</option>
                                                    <option value="Sinematik">Sinematik</option>
                                                    <option value="Çizgi Film">İllüstrasyon</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Işıklandırma</label>
                                                <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Doğal">Doğal Işık</option>
                                                    <option value="Stüdyo">Stüdyo Softbox</option>
                                                    <option value="Gün Batımı">Gün Batımı (Golden Hour)</option>
                                                    <option value="Dramatik">Dramatik / Kontrastlı</option>
                                                    <option value="Neon">Neon / Gece</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Kamera Açısı</label>
                                                <select value={cameraAngle} onChange={(e) => setCameraAngle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Normal">Göz Hizası</option>
                                                    <option value="Alt Açı">Alt Açı (Low Angle)</option>
                                                    <option value="Üst Açı">Üst Açı (High Angle)</option>
                                                    <option value="Geniş Açı">Geniş Açı</option>
                                                    <option value="Portre">Yakın Çekim (Portre)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Camera Zoom (Shot Distance) */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">Çekim Mesafesi (Zoom)</label>
                                            <select value={cameraZoom} onChange={(e) => setCameraZoom(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="Uzak">Uzak Çekim (Wide Shot) - Tüm vücut + mekan</option>
                                                <option value="Normal">Normal Çekim (Medium Shot) - Bel üstü</option>
                                                <option value="Yakın">Yakın Çekim (Close-Up) - Yüz ve detaylar</option>
                                            </select>
                                        </div>

                                        {/* Model Consistency (Lock) */}
                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-600 flex items-center justify-between">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300">Model Sürekliliği</label>
                                                <p className="text-[10px] text-slate-500">
                                                    Beğendiğiniz modeli sonraki üretimlerde koruyun.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (!modelSeed && !isModelLocked) {
                                                        alert("Henüz bir model oluşturulmadı. Önce bir kez görsel oluşturun, sonra kilitleyebilirsiniz.");
                                                        return;
                                                    }
                                                    setIsModelLocked(!isModelLocked);
                                                }}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isModelLocked
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                                    : 'bg-slate-700 text-slate-400 border border-slate-600 hover:bg-slate-600 hover:text-white'
                                                    }`}
                                            >
                                                {isModelLocked ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                        Model Kilitli
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                                        Modeli Kilitle
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Age and Gender Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Yaş Grubu</label>
                                                <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Child">Çocuk (Child)</option>
                                                    <option value="Teen">Genç (Teen)</option>
                                                    <option value="Adult">Yetişkin (Adult)</option>
                                                    <option value="Elderly">Yaşlı (Elderly)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Cinsiyet</label>
                                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Female">Kadın</option>
                                                    <option value="Male">Erkek</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Vücut Tipi</label>
                                                <select value={bodyType} onChange={(e) => setBodyType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Standart">Standart</option>
                                                    <option value="İnce">İnce (Slim)</option>
                                                    <option value="Kıvrımlı">Kıvrımlı (Curvy)</option>
                                                    <option value="Atletik">Atletik</option>
                                                    <option value="Büyük Beden">Büyük Beden</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Poz</label>
                                                <select value={pose} onChange={(e) => setPose(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Rastgele">Rastgele</option>
                                                    <option value="Ayakta">Ayakta (Düz)</option>
                                                    <option value="Yürürken">Yürürken</option>
                                                    <option value="Eller Belde">Eller Belde</option>
                                                    <option value="Otururken">Otururken</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Hair Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Saç Rengi</label>
                                                <select value={hairColor} onChange={(e) => setHairColor(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Doğal">Doğal / Otomatik</option>
                                                    <option value="Sarı">Sarı (Blonde)</option>
                                                    <option value="Kumral">Kumral (Brown)</option>
                                                    <option value="Siyah">Siyah</option>
                                                    <option value="Kızıl">Kızıl (Red)</option>
                                                    <option value="Gri">Gri / Gümüş</option>
                                                    <option value="Pastel Pembe">Pastel Pembe</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Saç Stili</label>
                                                <select value={hairStyle} onChange={(e) => setHairStyle(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="Doğal">Doğal / Otomatik</option>
                                                    <option value="Uzun Düz">Uzun Düz</option>
                                                    <option value="Uzun Dalgalı">Uzun Dalgalı</option>
                                                    <option value="Kısa Küt">Kısa Küt (Bob)</option>
                                                    <option value="Kısa Pixie">Kısa Pixie</option>
                                                    <option value="Topuz">Topuz</option>
                                                    <option value="At Kuyruğu">At Kuyruğu</option>
                                                    <option value="Kıvırcık">Kıvırcık</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Fabric Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Kumaş Cinsi</label>
                                                <select value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">Seçiniz</option>
                                                    <option value="Dokuma">Dokuma</option>
                                                    <option value="Örme">Örme</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Kumaş Yüzey Detayı</label>
                                                <select value={fabricFinish} onChange={(e) => setFabricFinish(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">Seçiniz</option>
                                                    <option value="Soft">Soft (Yumuşak)</option>
                                                    <option value="Parlak">Parlak (Glossy)</option>
                                                    <option value="Mat">Mat (Matte)</option>
                                                    <option value="Pastel">Pastel</option>
                                                    <option value="Saten">Saten (Satin)</option>
                                                    <option value="İpek">İpek (Silk)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Shoe Settings */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Ayakkabı Tipi</label>
                                                <select value={shoeType} onChange={(e) => setShoeType(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">Otomatik / Yok</option>
                                                    <option value="Spor Ayakkabı">Spor Ayakkabı (Sneakers)</option>
                                                    <option value="Topuklu">Topuklu (High Heels)</option>
                                                    <option value="Bot">Bot (Boots)</option>
                                                    <option value="Sandalet">Sandalet</option>
                                                    <option value="Loafer">Loafer / Mokosen</option>
                                                    <option value="Oxford">Oxford / Klasik</option>
                                                    <option value="Çizme">Çizme</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="font-medium text-slate-300 block mb-2 text-sm">Ayakkabı Rengi</label>
                                                <select value={shoeColor} onChange={(e) => setShoeColor(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                    <option value="">Otomatik</option>
                                                    <option value="Siyah">Siyah</option>
                                                    <option value="Beyaz">Beyaz</option>
                                                    <option value="Kahverengi">Kahverengi</option>
                                                    <option value="Lacivert">Lacivert</option>
                                                    <option value="Kırmızı">Kırmızı</option>
                                                    <option value="Bej">Bej / Ten Rengi</option>
                                                    <option value="Gri">Gri</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Accessories Settings */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">Aksesuar</label>
                                            <select value={accessories} onChange={(e) => setAccessories(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2.5 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="">Yok / Otomatik</option>
                                                <option value="Güneş Gözlüğü">Güneş Gözlüğü</option>
                                                <option value="Şapka">Şapka</option>
                                                <option value="Bere">Bere</option>
                                                <option value="Şarf / Atkı">Şarf / Atkı</option>
                                                <option value="Çanta (El)">Çanta (El Çantası)</option>
                                                <option value="Çanta (Omuz)">Çanta (Omuz / Sirt)</option>
                                                <option value="Kol Saati">Kol Saati</option>
                                                <option value="Eldiven">Eldiven</option>
                                                <option value="Kemer">Kemer (Vurgulu)</option>
                                                <option value="Kolye / Küpe">Kolye / Küpe</option>
                                            </select>
                                        </div>

                                        {/* Aspect Ratio Selection */}
                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">En/Boy Oranı</label>
                                            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as any)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="3:4">3:4 (Dikey - Varsayılan)</option>
                                                <option value="9:16">9:16 (Hikaye / Reels)</option>
                                                <option value="4:5">4:5 (Instagram Gönderi)</option>
                                                <option value="1:1">1:1 (Kare)</option>
                                                <option value="16:9">16:9 (Yatay / YouTube)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-medium text-slate-300 block mb-2 text-sm">Mekan</label>
                                            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="Podyum">Moda Podyumu</option>
                                                <option value="Stüdyo">Minimalist Stüdyo</option>
                                                <option value="Sokak">Şehir Sokağı</option>
                                                <option value="Doğal Mekan">Doğa / Sahil</option>
                                                <option value="Lüks Mağaza">Lüks Mağaza İçi</option>
                                                <option value="Özel Arka Plan">Özel Arka Plan Yükle</option>
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
                                                    {customBackgroundFile && <p className="text-xs text-green-400 mt-1">✓ Yüklendi: {customBackgroundFile.name}</p>}
                                                </div>
                                            )}
                                            {/* Custom Background Prompt */}
                                            <div className="mt-2">
                                                <textarea
                                                    value={customBackgroundPrompt}
                                                    onChange={(e) => setCustomBackgroundPrompt(e.target.value)}
                                                    placeholder="Örn: Güneş batarken sahilde, kumda yürüyor... (isteğe bağlı)"
                                                    rows={2}
                                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white text-xs placeholder-slate-500 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">İsteğe bağlı: Arka plan hakkında özel detaylar ekleyin</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
                                        <span className="text-sm text-slate-300">
                                            Canlı Model: <span className="text-cyan-400 font-bold text-lg">1 kredi</span>
                                        </span>
                                        <span className="text-xs text-slate-400 block mt-1">
                                            Mevcut krediniz: <span className="text-cyan-400 font-semibold">{profile.credits}</span>
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
                                                Canlı Model Oluştur
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Right Column: Result */}
                                <div className="lg:col-span-8">
                                    <div className="h-full min-h-[600px] bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative">
                                        <div className="absolute top-4 right-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs text-cyan-400 border border-cyan-500/30">
                                            3. Sonuç (Model & Video)
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
                                        Ürün Yükle
                                    </h2>
                                    <p className="text-sm text-slate-400 mb-4">
                                        Teknik çizimini (flat sketch) oluşturmak istediğiniz kıyafetin fotoğrafını yükleyin.
                                    </p>
                                    <div className="flex-grow min-h-[400px]">
                                        <ImageUploader onImageUpload={handleTechUpload} imagePreviewUrl={techInputPreview} />
                                    </div>

                                    {/* Style Selector */}
                                    {techInputFile && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                                                Çizim Stili
                                            </label>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setTechSketchStyle('blackwhite')}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${techSketchStyle === 'blackwhite'
                                                        ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border-2 border-purple-400 shadow-lg'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
                                                        }`}
                                                >
                                                    🖤 Karakalem
                                                </button>
                                                <button
                                                    onClick={() => setTechSketchStyle('colored')}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${techSketchStyle === 'colored'
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400 shadow-lg'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
                                                        }`}
                                                >
                                                    🎨 Renkli
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                                        <span className="text-sm text-slate-300">
                                            Bu işlem <span className="text-purple-400 font-bold text-lg">1 kredi</span> harcar
                                        </span>
                                        <span className="text-xs text-slate-400 block mt-1">
                                            Mevcut krediniz: <span className="text-purple-400 font-semibold">{profile.credits}</span>
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
                                                Çizim Hazırlanıyor...
                                            </>
                                        ) : (
                                            <>
                                                <PencilIcon />
                                                Teknik Çizim Oluştur
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* RESULT */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden relative h-full min-h-[500px] flex flex-col">
                                    <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs text-white border border-white/20">
                                        Sonuç (Tech Pack)
                                    </div>

                                    <div className="flex-grow flex items-center justify-center bg-white p-4">
                                        {isTechLoading ? (
                                            <div className="text-center">
                                                <div className="w-16 h-16 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                                                <p className="text-slate-800 font-medium">Yapay zeka analiz ediyor...</p>
                                            </div>
                                        ) : generatedTechSketchUrl ? (
                                            <div className="relative w-full h-full flex flex-col">
                                                <img src={generatedTechSketchUrl} alt="Technical Sketch" className="w-full h-full object-contain" />
                                                <div className="absolute bottom-4 right-4 flex gap-2">
                                                    <button
                                                        onClick={() => handleDownload(generatedTechSketchUrl, 'teknik-cizim.png')}
                                                        className="bg-slate-900 text-white p-3 rounded-full hover:bg-slate-800 shadow-lg"
                                                        title="İndir"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400">
                                                <PencilIcon />
                                                <p className="mt-2 text-sm">Oluşturulan teknik çizim burada görünecek.</p>
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
                    ) : (
                        /* --- FOTOMATIK MODE (Transform & Describe) --- */
                        <FotomatikPage
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
    const { user, profile, loading, authError, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshProfile, retryAuth } = useAuth();
    const [currentPage, setCurrentPage] = useState<'landing' | 'tool' | 'dashboard' | 'admin'>('landing');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);

    // Close auth modal when user is logged in
    React.useEffect(() => {
        if (user && profile) {
            console.log('✅ User logged in, closing auth modal');
            setShowAuthModal(false);
            // If on landing page, redirect to tool
            if (currentPage === 'landing') {
                setCurrentPage('tool');
            }
        }
    }, [user, profile]);

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
                    }
                });
                console.log('✅ Showcase görseller Supabase\'den yüklendi:', showcaseImages.length);
            } catch (error) {
                console.error('❌ Supabase içerik yükleme hatası:', error);
            }
        };

        loadContentFromSupabase();
    }, []);

    const handleFileUpload = async (file: File, type: 'sketch' | 'product' | 'model' | 'video' | 'heroVideo' | 'heroVideo1' | 'heroVideo2' | 'heroVideo3') => {
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
                    alert(`✅ Hero Video ${orderIndex + 1} başarıyla yüklendi!\n\nAna sayfada görünecektir.`);

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
                    alert(`❌ Hero video yükleme başarısız: ${result.error}\n\nLütfen Supabase storage bucket'larının oluşturulduğundan emin olun.`);
                }
            } else if (type === 'sketch' || type === 'product' || type === 'model') {
                // Upload showcase image to Supabase
                const imageType = type as 'sketch' | 'product' | 'model';
                const result = await uploadShowcaseImage(file, imageType, 0);

                if (result.success && result.imageUrl) {
                    console.log(`✅ ${imageType} görseli Supabase'e yüklendi:`, result.imageUrl);
                    const typeNames = { sketch: 'Çizim', product: 'Ürün', model: 'Model' };
                    alert(`✅ ${typeNames[imageType]} görseli başarıyla yüklendi!\n\nAna sayfada showcase bölümünde görünecektir.`);

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
                    alert(`❌ ${imageType} görseli yükleme başarısız: ${result.error}\n\nLütfen Supabase storage bucket'larının oluşturulduğundan emin olun.`);
                }
            } else if (type === 'video') {
                // Upload showcase video to Supabase
                const result = await uploadShowcaseImage(file, 'video', 0);

                if (result.success && result.imageUrl) {
                    console.log('✅ Showcase video Supabase\'e yüklendi:', result.imageUrl);
                    alert('✅ Showcase video başarıyla yüklendi!\n\nAna sayfada showcase bölümünde görünecektir.');
                    setVideoUrl(result.imageUrl);
                    localStorage.setItem('videoUrl', result.imageUrl);
                } else {
                    console.error('❌ Showcase video Supabase yüklemesi başarısız:', result.error);
                    alert(`❌ Showcase video yükleme başarısız: ${result.error}\n\nLütfen Supabase storage bucket'larının oluşturulduğundan emin olun.`);
                }
            }
        } catch (error) {
            console.error('❌ Dosya yükleme hatası:', error);
            alert('Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleGetStarted = () => {
        if (!user) {
            setShowAuthModal(true);
        } else if (!profile) {
            // User exists but profile is still loading or creating
            alert('Hesap bilgileriniz hazırlanıyor. Lütfen birkaç saniye bekleyin ve tekrar deneyin.');
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
        if (email === 'hikmet' && password === 'Malatya4462!') {
            setIsAdminLoggedIn(true);
            setShowAdminLogin(false);
            setCurrentPage('admin');
        } else {
            alert('Yanlış kullanıcı adı veya şifre!');
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
                    <p className="text-slate-400">Yükleniyor...</p>
                    <p className="text-slate-500 text-sm mt-2">
                        {authError ? authError : 'Kullanıcı bilgileri alınıyor...'}
                    </p>
                    {authError && (
                        <button
                            onClick={retryAuth}
                            className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition text-sm"
                        >
                            Tekrar Dene
                        </button>
                    )}
                    <p className="text-slate-600 text-xs mt-4">
                        Bağlantı yavaşsa otomatik olarak yeniden denenecek
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
                    <h2 className="text-white text-xl font-bold mb-2">Profil oluşturuluyor...</h2>
                    <p className="text-slate-400 mb-4">
                        {authError ? authError : 'İlk girişiniz için hesap bilgileriniz hazırlanıyor. Bu birkaç saniye sürebilir.'}
                    </p>
                    <p className="text-slate-500 text-sm mb-4">Otomatik olarak yeniden deneniyor...</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={retryAuth}
                            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition"
                        >
                            Tekrar Dene
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                        >
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {currentPage === 'landing' && (
                <LandingPage
                    onGetStarted={handleGetStarted}
                    onSignIn={handleSignIn}
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
                    sketchUrl={sketchUrl}
                    productUrl={productUrl}
                    modelUrl={modelUrl}
                    videoUrl={videoUrl}
                    heroVideoUrl={heroVideoUrl}
                    heroVideo1Url={heroVideo1Url}
                    heroVideo2Url={heroVideo2Url}
                    heroVideo3Url={heroVideo3Url}
                />
            )}
            {currentPage === 'tool' && user && profile && (
                <ToolPage
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
                    credits={profile.credits}
                />
            )}

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onGoogleSignIn={signInWithGoogle}
                onEmailSignIn={signInWithEmail}
                onEmailSignUp={signUpWithEmail}
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
                    userName={profile.full_name || 'Kullanıcı'}
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
