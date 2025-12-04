
import React, { useState, useEffect, useRef } from 'react';
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

interface PageHeaderProps {
    isLoggedIn: boolean;
    userRole: 'admin' | 'user' | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onAdminClick?: () => void;
}

const ToolPage: React.FC<{ 
    onNavigateHome: () => void;
    profile: any;
    onRefreshProfile: () => void;
} & PageHeaderProps> = ({ 
    onNavigateHome, 
    isLoggedIn, 
    onLoginClick, 
    onLogoutClick, 
    userRole, 
    onAdminClick,
    profile,
    onRefreshProfile
}) => {
    const [activeToolTab, setActiveToolTab] = useState<'design' | 'technical'>('design');

    // --- STATE MANAGEMENT ---
    // Step 1: Sketch
    const [uploadedSketchFile, setUploadedSketchFile] = useState<File | null>(null);
    const [sketchPreviewUrl, setSketchPreviewUrl] = useState<string | undefined>(undefined);
    const [isProductLoading, setIsProductLoading] = useState(false);

    // Step 2: Product (Ghost Mannequin)
    const [uploadedProductFile, setUploadedProductFile] = useState<File | null>(null); // If user uploads directly
    const [generatedProductUrl, setGeneratedProductUrl] = useState<string | null>(null); // If AI generates from sketch
    const [productPreviewUrl, setProductPreviewUrl] = useState<string | undefined>(undefined); // Current visual for Step 2
    
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Yapay zeka düşünüyor...');
    const [progress, setProgress] = useState(0);
    
    // Step 3: Result (Model & Video)
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

    // -- Technical Drawing State --
    const [techInputFile, setTechInputFile] = useState<File|null>(null);
    const [techInputPreview, setTechInputPreview] = useState<string|undefined>(undefined);
    const [generatedTechSketchUrl, setGeneratedTechSketchUrl] = useState<string|null>(null);
    const [isTechLoading, setIsTechLoading] = useState(false);
    const [techSketchStyle, setTechSketchStyle] = useState<'colored' | 'blackwhite'>('blackwhite'); // New: Renkli veya Karakalem
    
    // Product color for sketch-to-product
    const [productColor, setProductColor] = useState('');

    // Options
    const [clothingType, setClothingType] = useState('Genel'); // New
    const [colorSuggestion, setColorSuggestion] = useState('');
    const [secondaryColor, setSecondaryColor] = useState(''); // New for dual color
    
    const [modelEthnicity, setModelEthnicity] = useState('Farklı');
    const [bodyType, setBodyType] = useState('Standart');
    const [pose, setPose] = useState('Rastgele');
    const [artisticStyle, setArtisticStyle] = useState('Gerçekçi');
    const [location, setLocation] = useState('Podyum');
    
    // New Options
    const [hairColor, setHairColor] = useState('Doğal');
    const [hairStyle, setHairStyle] = useState('Doğal');
    const [customPrompt, setCustomPrompt] = useState('');
    const [customBackgroundPrompt, setCustomBackgroundPrompt] = useState(''); // New: Custom background description
    const [fabricType, setFabricType] = useState(''); // New: Dokuma/Örme
    const [fabricFinish, setFabricFinish] = useState(''); // New: Soft/Parlak/Mat/Pastel
    const [shoeType, setShoeType] = useState(''); // New: Ayakkabı tipi
    const [shoeColor, setShoeColor] = useState(''); // New: Ayakkabı rengi
    const [accessories, setAccessories] = useState(''); // New: Aksesuar
    const [lighting, setLighting] = useState('Doğal');
    const [cameraAngle, setCameraAngle] = useState('Normal');
    const [cameraZoom, setCameraZoom] = useState('Normal'); // Yeni: Çekim mesafesi

    // Aspect Ratio
    const [aspectRatio, setAspectRatio] = useState<'9:16' | '3:4' | '4:5' | '1:1' | '16:9'>('3:4');
    
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
    
    // Custom Background Upload
    const handleBackgroundUpload = (file: File) => {
        setCustomBackgroundFile(file);
        setLocation('Özel Arka Plan');
    };

    // 2b. Generate Model from Product (The main generation)
    const handleGenerateModelClick = async () => {
        // Determine source: Manual Upload OR AI Generated
        let sourceFile: File | null = uploadedProductFile;

        if (!sourceFile && generatedProductUrl) {
             // Convert base64 url to file
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

        // Check credits
        const creditCheck = await checkAndDeductCredits(profile.id, 'product_to_model');
        if (!creditCheck.success) {
            alert(creditCheck.message);
            return;
        }

        setIsModelLoading(true);
        setGeneratedImageUrl(null);
        setGeneratedVideoUrl(null);
        setLoadingText('Canlı model oluşturuluyor...');
        
        startProgressSimulation(85, 300);

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
                accessories
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
                    fabricType, fabricFinish, shoeType, shoeColor, accessories
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
        
        setIsTechLoading(true);
        setLoadingText('Teknik çizim hazırlanıyor...');
        startProgressSimulation(90, 200);

        try {
            const sketchUrl = await generateSketchFromProduct(techInputFile, techSketchStyle);
            finishProgress();
            setGeneratedTechSketchUrl(sketchUrl);
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
            <Header 
                isLoggedIn={isLoggedIn} 
                userRole={userRole} 
                onLoginClick={onLoginClick} 
                onLogoutClick={onLogoutClick} 
                onHomeClick={onNavigateHome} 
                onAdminClick={onAdminClick}
                credits={profile.credits}
            />

            <main className="flex-grow container mx-auto p-4 md:p-8">
                
                {/* TOOL TABS */}
                <div className="flex justify-center mb-8 gap-4">
                    <button
                        onClick={() => setActiveToolTab('design')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                            activeToolTab === 'design'
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                    >
                        <SparklesIcon />
                        Canlı Model & Video
                    </button>
                    <button
                        onClick={() => setActiveToolTab('technical')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                            activeToolTab === 'technical'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                    >
                        <PencilIcon />
                        Teknik Çizim (Tech Pack)
                    </button>
                </div>

                {activeToolTab === 'design' ? (
                    /* --- DESIGN MODE (SKETCH -> MODEL) --- */
                    <div className="animate-fade-in">
                        {/* TOP ROW: INPUTS */}
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
                                
                                <button
                                    onClick={handleGenerateProductClick}
                                    disabled={!uploadedSketchFile || isProductLoading}
                                    className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                                        !uploadedSketchFile || isProductLoading
                                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-500'
                                    }`}
                                >
                                    {isProductLoading ? 'İşleniyor...' : 'Ürüne Dönüştür ->'}
                                </button>
                            </div>

                            {/* BOX 2: PRODUCT INPUT */}
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col relative">
                                {/* Arrow for visual flow on desktop */}
                                <div className="hidden md:block absolute top-1/2 -left-5 transform -translate-y-1/2 text-slate-600 z-10">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

                                <button
                                    onClick={handleGenerateModelClick}
                                    disabled={(!uploadedProductFile && !generatedProductUrl) || isModelLoading}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${
                                        (!uploadedProductFile && !generatedProductUrl) || isModelLoading
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
                                    <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-xs text-cyan-400 border border-cyan-500/30">
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
                ) : (
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
                                                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                                                    techSketchStyle === 'blackwhite'
                                                        ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-white border-2 border-purple-400 shadow-lg'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
                                                }`}
                                            >
                                                🖤 Karakalem
                                            </button>
                                            <button
                                                onClick={() => setTechSketchStyle('colored')}
                                                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                                                    techSketchStyle === 'colored'
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-purple-400 shadow-lg'
                                                        : 'bg-slate-800 text-slate-400 border border-slate-600 hover:border-slate-500'
                                                }`}
                                            >
                                                🎨 Renkli
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    onClick={handleGenerateTechSketch}
                                    disabled={!techInputFile || isTechLoading}
                                    className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${
                                        !techInputFile || isTechLoading
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
    const { user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshProfile } = useAuth();
    const [currentPage, setCurrentPage] = useState<'landing' | 'tool' | 'dashboard' | 'admin'>('landing');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    
    // Admin check - check email contains hikmet or texmart, or subscription tier, or manual admin login
    const isAdmin = 
        isAdminLoggedIn || 
        user?.email?.toLowerCase().includes('hikmet') || 
        user?.email?.toLowerCase().includes('texmart') || 
        profile?.subscription_tier === 'admin' || 
        profile?.subscription_tier === 'premium';
    
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

    const handleFileUpload = (file: File, type: 'sketch' | 'product' | 'model' | 'video' | 'heroVideo' | 'heroVideo1' | 'heroVideo2' | 'heroVideo3') => {
        // Convert file to base64 for persistent storage
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            
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
    };

    const handleGetStarted = () => {
        if (!user) {
            setShowAuthModal(true);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-500 mb-4"></div>
                    <p className="text-slate-400">Yükleniyor...</p>
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
                    onLoginClick={handleSignIn}
                    onLogoutClick={() => {
                        signOut();
                        setCurrentPage('landing');
                    }}
                    onAdminClick={handleAdminClick}
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
            {currentPage === 'admin' && isAdmin && (
                <AdminDashboard
                    onNavigateHome={() => setCurrentPage('landing')}
                    isLoggedIn={isAdminLoggedIn || !!user}
                    userRole="admin"
                    onLoginClick={handleSignIn}
                    onLogoutClick={() => {
                        setIsAdminLoggedIn(false);
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
                onSwitchToRegister={() => {}}
            />
        </>
    );
};

export default App;
