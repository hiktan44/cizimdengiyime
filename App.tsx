
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
import { RegisterModal } from './components/RegisterModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';

interface PageHeaderProps {
    isLoggedIn: boolean;
    userRole: 'admin' | 'user' | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onAdminClick?: () => void;
}

interface LandingPageProps extends PageHeaderProps {
    onStartClick: () => void;
    sketchUrl: string;
    productUrl: string;
    modelUrl: string;
    videoUrl: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
    onStartClick, 
    sketchUrl, 
    productUrl, 
    modelUrl, 
    videoUrl, 
    ...headerProps 
}) => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500/30">
            <Header {...headerProps} />

            <main className="container mx-auto px-4 py-16">
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6 animate-fade-in-up">
                        <SparklesIcon />
                        <span className="font-semibold text-sm tracking-wide uppercase">Yapay Zeka Destekli Moda Tasarımı</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-tight">
                        Çizimden Gerçeğe <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                            Saniyeler İçinde
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Tasarımlarınızı yükleyin, yapay zeka onları ultra gerçekçi mankenler üzerinde canlandırsın.
                        Fotoğraf çekimi maliyetlerine son.
                    </p>
                    <button
                        onClick={onStartClick}
                        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-cyan-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 focus:ring-offset-gray-900 hover:bg-cyan-500 shadow-lg shadow-cyan-500/30"
                    >
                        Hemen Başla
                        <div className="absolute -inset-3 rounded-xl bg-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-lg" />
                    </button>
                </div>

                {/* 3-Column Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {/* Column 1: Sketch -> Product */}
                    <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all group flex flex-col">
                        <div className="flex flex-col gap-4 mb-6 flex-grow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                                    <UploadIcon />
                                </div>
                                <h3 className="text-xl font-bold text-white">1. Çizimden Ürüne</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Basit karakalem veya dijital teknik çizimlerinizi yükleyin. Yapay zeka, kumaş dokusunu, ışık ve gölge detaylarını algılayarak çiziminizi birebir yansıtan <strong>gerçekçi bir ürün fotoğrafına</strong> dönüştürsün.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
                             <BeforeAfterSlider beforeImageUrl={sketchUrl} afterImageUrl={productUrl} />
                        </div>
                    </div>

                    {/* Column 2: Product -> Model */}
                    <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group flex flex-col">
                        <div className="flex flex-col gap-4 mb-6 flex-grow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                    <AdjustmentsIcon />
                                </div>
                                <h3 className="text-xl font-bold text-white">2. Üründen Modele</h3>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Oluşturulan veya yüklenen ürün fotoğrafını dilediğiniz manken üzerinde görün. Farklı etnik köken ve vücut tiplerine sahip <strong>yapay zeka modelleriyle</strong> stüdyo çekimi kalitesinde sonuçlar alın.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
                             <BeforeAfterSlider beforeImageUrl={productUrl} afterImageUrl={modelUrl} />
                        </div>
                    </div>

                    {/* Column 3: Live Video */}
                    <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-pink-500/30 transition-all group flex flex-col">
                        <div className="flex flex-col gap-4 mb-6 flex-grow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                                    <VideoIcon />
                                </div>
                                <h3 className="text-xl font-bold text-white">3. Canlı Video</h3>
                            </div>
                             <p className="text-sm text-slate-400 leading-relaxed">
                                Statik görsellerle sınırlı kalmayın. Modelinizi podyumda yürütmek, dönmek veya poz vermek için <strong>sinematik videolar</strong> oluşturun. Sosyal medya ve e-ticaret için mükemmel içerik.
                            </p>
                        </div>
                        <div className="relative w-full aspect-[4/5] max-w-lg mx-auto rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl">
                            <video
                                src={videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {[
                        { 
                            icon: <CheckCircleIcon />, 
                            title: "Ultra Hızlı Sonuç", 
                            desc: "Geleneksel fotoğraf çekimleri günler sürerken, yapay zeka ile saniyeler içinde tasarımınızı canlı manken üzerinde görün. Pazara çıkış sürenizi kısaltın." 
                        },
                        { 
                            icon: <SparklesIcon />, 
                            title: "4K Stüdyo Kalitesi", 
                            desc: "Profesyonel stüdyo aydınlatması ve yüksek çözünürlüklü çıktılarla baskıya veya dijital kullanıma hazır görseller elde edin." 
                        },
                        { 
                            icon: <VideoIcon />, 
                            title: "Etkileyici Videolar", 
                            desc: "Tasarımınızın hareket halindeki duruşunu, kumaşın akışını gösteren videolarla müşterilerinizi etkileyin ve satışlarınızı artırın." 
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800 transition-colors flex flex-col items-center">
                            <div className="mb-4 text-cyan-400 scale-125 p-3 bg-cyan-500/10 rounded-full">{feature.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm md:text-base">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

const ToolPage: React.FC<{ onNavigateHome: () => void } & PageHeaderProps> = ({ 
    onNavigateHome, 
    isLoggedIn, 
    onLoginClick, 
    onLogoutClick, 
    userRole, 
    onAdminClick
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

        setIsProductLoading(true);
        setLoadingText('Çizim ürüne dönüştürülüyor...');
        startProgressSimulation(80, 200);

        try {
            const productUrl = await generateProductFromSketch(uploadedSketchFile);
            finishProgress();
            setGeneratedProductUrl(productUrl);
            // Automatically set this as the preview for step 2
            setProductPreviewUrl(productUrl);
            // Reset manual upload if any
            setUploadedProductFile(null); 
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
                customBackgroundFile
            );
            finishProgress();
            setTimeout(() => {
                setGeneratedImageUrl(imageUrl);
                setIsModelLoading(false);
            }, 600);
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
            const sketchUrl = await generateSketchFromProduct(techInputFile);
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
                                <div className="flex-grow">
                                    <ImageUploader onImageUpload={handleProductUpload} imagePreviewUrl={productPreviewUrl} />
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
                                            <div className="mt-2">
                                                <input
                                                    type="file"
                                                    onChange={(e) => e.target.files && handleBackgroundUpload(e.target.files[0])}
                                                    accept="image/*"
                                                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-700 file:text-cyan-400 hover:file:bg-slate-600"
                                                />
                                                {customBackgroundFile && <p className="text-xs text-green-400 mt-1">✓ Yüklendi: {customBackgroundFile.name}</p>}
                                            </div>
                                        )}
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
    const [currentPage, setCurrentPage] = useState<'landing' | 'tool' | 'admin'>('landing');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    
    // Admin editable content state
    const [sketchUrl, setSketchUrl] = useState(localStorage.getItem('sketchUrl') || 'https://storage.googleapis.com/aistudio-cms-assets/assets/fashion_sketch_1.jpg');
    const [productUrl, setProductUrl] = useState(localStorage.getItem('productUrl') || 'https://storage.googleapis.com/aistudio-cms-assets/assets/fashion_product_1.jpg');
    const [modelUrl, setModelUrl] = useState(localStorage.getItem('modelUrl') || 'https://storage.googleapis.com/aistudio-cms-assets/assets/fashion_model_1.jpg');
    const [videoUrl, setVideoUrl] = useState(localStorage.getItem('videoUrl') || 'https://storage.googleapis.com/aistudio-cms-assets/assets/fashion_video_1.mp4');

    const handleLogin = (email: string, pass: string) => {
        if (email === 'admin@demo.com' && pass === 'admin') {
            setIsLoggedIn(true);
            setUserRole('admin');
            setShowLogin(false);
        } else if (email && pass) {
            setIsLoggedIn(true);
            setUserRole('user');
            setShowLogin(false);
        } else {
            alert("Giriş başarısız.");
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserRole(null);
        setCurrentPage('landing');
    };

    const handleFileUpload = (file: File, type: 'sketch' | 'product' | 'model' | 'video') => {
        const url = URL.createObjectURL(file);
        if (type === 'sketch') {
            setSketchUrl(url);
            localStorage.setItem('sketchUrl', url);
        } else if (type === 'product') {
            setProductUrl(url);
            localStorage.setItem('productUrl', url);
        } else if (type === 'model') {
            setModelUrl(url);
            localStorage.setItem('modelUrl', url);
        } else {
            setVideoUrl(url);
            localStorage.setItem('videoUrl', url);
        }
    };

    return (
        <>
            {currentPage === 'landing' && (
                <LandingPage
                    onStartClick={() => setCurrentPage('tool')}
                    isLoggedIn={isLoggedIn}
                    userRole={userRole}
                    onLoginClick={() => setShowLogin(true)}
                    onLogoutClick={handleLogout}
                    onAdminClick={() => setCurrentPage('admin')}
                    sketchUrl={sketchUrl}
                    productUrl={productUrl}
                    modelUrl={modelUrl}
                    videoUrl={videoUrl}
                />
            )}
            {currentPage === 'tool' && (
                <ToolPage
                    onNavigateHome={() => setCurrentPage('landing')}
                    isLoggedIn={isLoggedIn}
                    userRole={userRole}
                    onLoginClick={() => setShowLogin(true)}
                    onLogoutClick={handleLogout}
                    onAdminClick={() => setCurrentPage('admin')}
                />
            )}
             {currentPage === 'admin' && (
                <AdminDashboard
                    onNavigateHome={() => setCurrentPage('landing')}
                    isLoggedIn={isLoggedIn}
                    userRole={userRole}
                    onLoginClick={() => setShowLogin(true)}
                    onLogoutClick={handleLogout}
                    sketchUrl={sketchUrl}
                    productUrl={productUrl}
                    modelUrl={modelUrl}
                    videoUrl={videoUrl}
                    onSketchUpload={(f) => handleFileUpload(f, 'sketch')}
                    onProductUpload={(f) => handleFileUpload(f, 'product')}
                    onModelUpload={(f) => handleFileUpload(f, 'model')}
                    onVideoUpload={(f) => handleFileUpload(f, 'video')}
                />
            )}

            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onLogin={handleLogin}
                onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
            />
            <RegisterModal
                isOpen={showRegister}
                onClose={() => setShowRegister(false)}
                onRegister={(e, p) => { handleLogin(e, p); setShowRegister(false); }}
                onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
            />
        </>
    );
};

export default App;
