/**
 * CollagePage - Çoklu Görsel Kompozisyon Aracı
 * Kullanıcılar 2-6 arası görsel yükleyip, bunları yan yana birleştiren yeni görseller oluşturabilir
 */

import React, { useState, useCallback } from 'react';
import { useTranslation, TranslationRecord } from '../lib/i18n';
import { Profile, CREDIT_COSTS } from '../lib/supabase';
import { checkAndDeductCredits, saveGeneration } from '../lib/database';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import { Layout } from '../components/Layout';
import { VideoSettingsModal } from '../components/VideoSettingsModal';
import { VideoGenerationSettings, generateVideoFromImage, generateProductCollage } from '../services/geminiService';
import { ProductItem } from '../services/geminiService';
import { ProductItemEditor } from '../components/ProductItemEditor';
import { fileToGenerativePart, blobToBase64, base64ToFile, cropImageFromFile, fileToBase64 } from '../utils/fileUtils';
import html2canvas from 'html2canvas';

interface CollagePageProps {
    profile: Profile | null;
    onRefreshProfile: () => void;
    onShowBuyCredits?: () => void;
}

interface UploadedImage {
    id: string;
    file: File;
    preview: string;
}



const trCollage = {
    title: '🎨 Kolaj Stüdyosu',
    subtitle: 'Birden fazla görseli yan yana birleştirerek yeni kompozisyonlar oluşturun',
    uploadTitle: 'Görselleri Yükleyin',
    uploadDesc: '2-6 arası görsel yükleyebilirsiniz',
    uploadButton: 'Görsel Ekle',
    promptLabel: 'Kompozisyon Talimatı',
    promptPlaceholder: 'Örn: Bu görselleri yan yana koy, arka planı beyaz yap, profesyonel bir katalog görünümü ver...',
    generateButton: 'Kolaj Oluştur',
    generating: 'Kolaj oluşturuluyor...',
    downloadButton: 'İndir',
    clearButton: 'Temizle',
    removeImage: 'Kaldır',
    imageCount: 'görsel',
    minImages: 'En az 2 görsel yüklemelisiniz',
    maxImages: 'En fazla 6 görsel yükleyebilirsiniz',
    loginRequired: 'İşlem yapmak için giriş yapmalısınız',
    insufficientCredits: 'Yetersiz kredi',
    creditCost: 'Kredi',
    // Tabs
    tabStandard: 'Standart Kolaj',
    tabProduct: 'Ürün Kolajı',
    // Product management
    productsTitle: 'Ürünler',
    productsDesc: 'Kolajda görünecek ürünleri ekleyin (Max 6)',
    addProduct: '+ Ürün Ekle',
    noProducts: 'Henüz ürün eklenmedi',
    // Background
    bgTitle: 'Arka Plan Stili',
    bgCorkboard: 'Mantar Pano',
    bgWhite: 'Beyaz Çerçeve',
    bgBlack: 'Siyah Çerçeve',
    bgCustom: 'Özel Renk',
    bgColorPick: 'Renk Seç:',
    // Prompt
    styleNotesLabel: 'Stil ve Kompozisyon Notları (Opsiyonel)',
    styleNotesPlaceholder: 'Örn: Tüm ürünleri Polaroid tarzında kutulara koy, ürün isimlerini altına yaz...',
    // Buttons
    generatingText: 'Oluşturuluyor...',
    productCollageButton: 'Ürün Kolajı Üret',
    // Prompt requirement
    promptRequired: 'Lütfen kompozisyon talimatı girin',
    addProductMin: 'Lütfen en az 1 ürün ekleyin',
    uploadOutfitRequired: 'Lütfen bir kombin görseli yükleyin',
    // Error
    errorOccurred: 'Bir hata oluştu: ',
    imageUploadError: 'Resim yüklenirken hata: ',
    magazineDownloadError: 'Dergi sayfası indirilirken bir hata oluştu.',
    downloadFailed: 'İndirme başarısız oldu. Lütfen tekrar deneyin.',
    createCollageFirst: 'Önce bir kolaj oluşturmalısınız!',
    videoError: 'Video oluşturulurken hata: ',
    analysisError: 'Ürünler ayrıştırılırken bir hata oluştu.',
    // Result
    resultTitle: 'Sonuç',
    resultEmpty: 'Sonuç burada görünecek',
    resultHint: 'Sol taraftan ayarlarınızı yapıp oluştur butona basın.',
    viewDetail: '🔍 Detaylı Görüntüle',
    // Magazine view
    magazineView: '📖 Dergi Sayfası',
    collageOnly: '📷 Sadece Kolaj',
    noImage: 'Resim Yok',
    unnamedProduct: 'İsimsiz Ürün',
    // Video
    createVideo: '🎬 Video Oluştur',
    generatedVideo: 'Oluşturulan Video',
    videoProcessing: 'Video Hazırlanıyor...',
    videoProcessingHint: 'Bu işlem birkaç dakika sürebilir.',
    // Magic edit panel
    editBoardProducts: 'PANODAKİ ÜRÜNLERİ DÜZENLE',
    productCount: 'Ürün',
    productNamePlaceholder: 'Ürün Adı',
    pricePlaceholder: 'Fiyat (Opsiyonel)',
    editHint: 'Değişikliklerin panoya yansıması için "Sihirli Kolaj Üret" butonuna tekrar basmalısınız.',
    // Magic analysis
    analyzingProducts: 'Ürünler Analiz Ediliyor...',
    detectedProducts: 'Tespit Edilen Ürünler',
    addManualProduct: '+ Manuel Ürün Ekle',
    newProduct: 'Yeni Ürün',
    tipLabel: 'İpucu:',
    tipText: 'Ürün açıklamalarına "Polaroid tarzında olsun", "Üzerinde fiyat yazsın" gibi notlar ekleyebilirsiniz. Fiyat alanını doldurursanız etiketin altında fiyat görünecektir.',
    uploadSingleOutfit: 'Kombin içeren tek bir fotoğraf yükleyin',
    magicPreparing: 'Kolaj Hazırlanıyor...',
    magicGenerate: 'Sihirli Kolajı Oluştur',
    // Close modal
    closeModal: 'Kapat',
    // Credit
    creditLabel: 'İşlem bedeli:',
};

const translations: TranslationRecord<typeof trCollage> = {
    tr: trCollage,
    en: {
        title: '🎨 Collage Studio',
        subtitle: 'Create new compositions by combining multiple images side by side',
        uploadTitle: 'Upload Images',
        uploadDesc: 'You can upload 2-6 images',
        uploadButton: 'Add Image',
        promptLabel: 'Composition Instructions',
        promptPlaceholder: 'E.g: Place these images side by side, white background, professional catalog look...',
        generateButton: 'Create Collage',
        generating: 'Creating collage...',
        downloadButton: 'Download',
        clearButton: 'Clear',
        removeImage: 'Remove',
        imageCount: 'images',
        minImages: 'Please upload at least 2 images',
        maxImages: 'You can upload maximum 6 images',
        loginRequired: 'Please login to continue',
        insufficientCredits: 'Insufficient credits',
        creditCost: 'Credits',
        tabStandard: 'Standard Collage',
        tabProduct: 'Product Collage',
        productsTitle: 'Products',
        productsDesc: 'Add products to appear in the collage (Max 6)',
        addProduct: '+ Add Product',
        noProducts: 'No products added yet',
        bgTitle: 'Background Style',
        bgCorkboard: 'Corkboard',
        bgWhite: 'White Frame',
        bgBlack: 'Black Frame',
        bgCustom: 'Custom Color',
        bgColorPick: 'Pick Color:',
        styleNotesLabel: 'Style & Composition Notes (Optional)',
        styleNotesPlaceholder: 'E.g: Put all products in Polaroid-style boxes, write product names below...',
        generatingText: 'Generating...',
        productCollageButton: 'Generate Product Collage',
        promptRequired: 'Please enter composition instructions',
        addProductMin: 'Please add at least 1 product',
        uploadOutfitRequired: 'Please upload an outfit image',
        errorOccurred: 'An error occurred: ',
        imageUploadError: 'Error uploading image: ',
        magazineDownloadError: 'An error occurred while downloading the magazine page.',
        downloadFailed: 'Download failed. Please try again.',
        createCollageFirst: 'You must create a collage first!',
        videoError: 'Error creating video: ',
        analysisError: 'An error occurred while separating products.',
        resultTitle: 'Result',
        resultEmpty: 'Result will appear here',
        resultHint: 'Set up your preferences on the left and click create.',
        viewDetail: '🔍 View Detail',
        magazineView: '📖 Magazine Page',
        collageOnly: '📷 Collage Only',
        noImage: 'No Image',
        unnamedProduct: 'Unnamed Product',
        createVideo: '🎬 Create Video',
        generatedVideo: 'Generated Video',
        videoProcessing: 'Preparing Video...',
        videoProcessingHint: 'This may take a few minutes.',
        editBoardProducts: 'EDIT BOARD PRODUCTS',
        productCount: 'Products',
        productNamePlaceholder: 'Product Name',
        pricePlaceholder: 'Price (Optional)',
        editHint: 'You need to click "Create Magic Collage" again for changes to take effect.',
        analyzingProducts: 'Analyzing Products...',
        detectedProducts: 'Detected Products',
        addManualProduct: '+ Add Manual Product',
        newProduct: 'New Product',
        tipLabel: 'Tip:',
        tipText: 'You can add notes like "Polaroid style", "Write the price on it" to product descriptions. If you fill in the price field, it will appear below the label.',
        uploadSingleOutfit: 'Upload a single outfit photo',
        magicPreparing: 'Preparing Collage...',
        magicGenerate: 'Create Magic Collage',
        closeModal: 'Close',
        creditLabel: 'Processing cost:',
    },
};

const trMagic = {
    tabTitle: '✨ Sihirli Kolaj',
    uploadTitle: 'Kombin Görselini Yükle',
    uploadDesc: 'Yüklediğiniz fotoğraftaki ürünler otomatik olarak ayrıştırılıp bir mantar panoya yerleştirilecektir.',
    magicButton: 'Ürünleri Ayrıştır ve Kolajla',
    singleImageRequired: 'Lütfen bir adet kombin fotoğrafı yükleyin',
};

const magicTranslations: TranslationRecord<typeof trMagic> = {
    tr: trMagic,
    en: {
        tabTitle: '✨ Magic Collage',
        uploadTitle: 'Upload Outfit Image',
        uploadDesc: 'The items in your uploaded photo will be automatically separated and placed on a corkboard.',
        magicButton: 'Extract Products & Collage',
        singleImageRequired: 'Please upload one outfit photo',
    }
};


export const CollagePage: React.FC<CollagePageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
    const t = useTranslation(translations);
    const mt = useTranslation(magicTranslations);

    const [activeTab, setActiveTab] = useState<'standard' | 'product' | 'magic'>('magic');
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Ürün Kolajı States
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [collageBackground, setCollageBackground] = useState<string>('corkboard');
    const [isMagazineView, setIsMagazineView] = useState(false);

    // Video generation states
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const magazineRef = React.useRef<HTMLDivElement>(null);

    // Magic analysis states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [magicStep, setMagicStep] = useState<'upload' | 'result'>('upload');
    const [selectedProductPreview, setSelectedProductPreview] = useState<string | null>(null);
    const [magicZoom, setMagicZoom] = useState(1);

    const getProductPreview = (p: ProductItem) => {
        if (p.preview) return p.preview;
        if (typeof p.file === 'string') return p.file;
        return null;
    };


    // Convert image to PNG if it's in an unsupported format (like AVIF)
    const convertImageToPNG = async (file: File): Promise<File> => {
        // Supported formats by Gemini API
        const supportedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

        if (supportedFormats.includes(file.type)) {
            return file; // Already supported, return as is
        }

        console.log(`Converting ${file.type} to PNG...`);

        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to convert image'));
                        return;
                    }

                    const convertedFile = new File(
                        [blob],
                        file.name.replace(/\.[^/.]+$/, '.png'),
                        { type: 'image/png' }
                    );

                    console.log(`✅ Converted ${file.type} to PNG`);
                    resolve(convertedFile);
                }, 'image/png', 0.95);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for conversion'));
            };

            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages: UploadedImage[] = [];

        for (const file of Array.from(files)) {
            if (activeTab === 'magic' && (uploadedImages.length + newImages.length >= 1)) break;
            if (uploadedImages.length + newImages.length >= 6) break;

            try {
                // Convert to PNG if needed
                const convertedFile = await convertImageToPNG(file);

                const id = Math.random().toString(36).substring(7);
                const preview = URL.createObjectURL(convertedFile);
                newImages.push({ id, file: convertedFile, preview });
            } catch (error) {
                console.error('Error converting image:', error);
                alert(`${t.imageUploadError}${file.name}`);
            }
        }

        setUploadedImages((prev) => [...prev, ...newImages]);
    }, [uploadedImages.length, activeTab]);

    const handleRemoveImage = useCallback((id: string) => {
        setUploadedImages((prev) => {
            const image = prev.find((img) => img.id === id);
            if (image) URL.revokeObjectURL(image.preview);
            return prev.filter((img) => img.id !== id);
        });
    }, []);

    const handleClear = useCallback(() => {
        uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setUploadedImages([]);
        setProducts([]);
        setPrompt('');
        setGeneratedImageUrl(null);
        setMagicStep('upload');
    }, [uploadedImages]);

    const handleDownloadMagazine = async () => {
        if (!magazineRef.current) return;

        try {
            const canvas = await html2canvas(magazineRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff'
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `fasheone-magazine-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Magazine download error:', error);
            alert(t.magazineDownloadError);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!profile) {
            alert(t.loginRequired);
            return;
        }

        if (activeTab === 'standard') {
            if (uploadedImages.length < 2) {
                alert(t.minImages);
                return;
            }

            if (!prompt.trim()) {
                alert(t.promptRequired);
                return;
            }
        } else if (activeTab === 'product') {
            if (products.length < 1) {
                alert(t.addProductMin);
                return;
            }
        } else if (activeTab === 'magic') {
            if (uploadedImages.length < 1) {
                alert(t.uploadOutfitRequired);
                return;
            }
        }

        // Check credits
        const creditKey = activeTab === 'standard' ? 'collage' : 'collage'; // Both use same credit currently
        const result = await checkAndDeductCredits(profile.id, creditKey);
        if (!result.success) {
            alert(t.insufficientCredits);
            if (onShowBuyCredits) onShowBuyCredits();
            return;
        }

        setIsGenerating(true);

        try {
            let resultUrl = '';

            if (activeTab === 'standard') {
                const { generateCollage } = await import('../services/geminiService');
                resultUrl = await generateCollage(
                    uploadedImages.map(img => img.file),
                    prompt,
                    '16:9'
                );
            } else if (activeTab === 'product') {
                resultUrl = await generateProductCollage(
                    products,
                    collageBackground,
                    '16:9',
                    prompt
                );
            } else if (activeTab === 'magic') {
                const { analyzeOutfitItems, generateAutoProductCollage: genAuto } = await import('../services/geminiService');

                // 1. Önce yüksek kaliteli profesyonel kolajı oluştur (Görseller burada AI tarafından re-paint ediliyor)
                const collageUrl = await genAuto(uploadedImages[0].file, '16:9');
                resultUrl = collageUrl;

                // 2. Ardından bu TEMİZ kolaj üzerinden ürün analizini yap (Kesitler yerine temiz ürünleri alalım)
                const detectedProducts = await analyzeOutfitItems(collageUrl);

                setProducts(detectedProducts);
                setMagicStep('result');
            }

            setGeneratedImageUrl(resultUrl);

            // Save to database
            await saveGeneration(
                profile.id,
                'sketch_to_product', // Fallback to widely supported type
                CREDIT_COSTS.COLLAGE,
                activeTab === 'product'
                    ? (typeof products[0].file === 'string' ? products[0].file : URL.createObjectURL(products[0].file))
                    : uploadedImages[0].preview,
                resultUrl,
                null,
                {
                    tab: activeTab,
                    prompt: activeTab === 'magic' ? 'Auto Outfit Breakdown' : prompt,
                    itemCount: activeTab === 'standard' ? uploadedImages.length : (activeTab === 'product' ? products.length : 1),
                    background: activeTab === 'magic' ? 'corkboard' : collageBackground
                }
            );

            onRefreshProfile();
            trackEvent(ANALYTICS_EVENTS.GENERATE_COLLAGE, {
                tab: activeTab,
                itemCount: activeTab === 'standard' ? uploadedImages.length : products.length,
                userId: profile.id,
            });
        } catch (error) {
            console.error('Generation error:', error);
            alert(t.errorOccurred + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsGenerating(false);
        }
    }, [profile, uploadedImages, prompt, activeTab, products, collageBackground, onRefreshProfile, onShowBuyCredits, t]);

    const handleMagicAnalyze = useCallback(async () => {
        if (uploadedImages.length === 0) return;

        setIsAnalyzing(true);
        try {
            const { analyzeOutfitItems } = await import('../services/geminiService');
            const detected = await analyzeOutfitItems(uploadedImages[0].file);
            setProducts(detected);
            setMagicStep('edit');
        } catch (error) {
            console.error('Analysis error:', error);
            alert(t.analysisError);
        } finally {
            setIsAnalyzing(false);
        }
    }, [uploadedImages]);

    const handleAddProduct = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const { fileToBase64 } = await import('../utils/fileUtils');
            const newProducts = await Promise.all(files.map(async (file) => ({
                id: Math.random().toString(36).substring(7),
                file,
                name: file.name.split('.')[0], // Default name from file name
                preview: await fileToBase64(file)
            })));
            setProducts(prev => [...prev, ...newProducts].slice(0, 6)); // Limit to 6 products
        }
    }, []);

    const handleUpdateProduct = useCallback((id: string, updated: ProductItem) => {
        setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }, []);

    const handleRemoveProduct = useCallback((id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    }, []);


    const handleDownload = useCallback(async (url: string) => {
        const { downloadFile, generateFilename, getFileExtension } = await import('../utils/downloadHelper');
        const extension = getFileExtension(url);
        const filename = generateFilename('kolaj', extension);
        const success = await downloadFile(url, filename);

        if (success) {
            // Track analytics
            trackEvent(ANALYTICS_EVENTS.DOWNLOAD_CONTENT, {
                filename,
                type: 'collage',
                userId: profile?.id
            });
        } else {
            alert(t.downloadFailed);
        }
    }, [profile]);

    const handleVideoGeneration = useCallback(async (settings: VideoGenerationSettings) => {
        if (!profile) {
            alert(t.loginRequired);
            return;
        }

        if (!generatedImageUrl) {
            alert(t.createCollageFirst);
            return;
        }

        // Check credits based on quality
        const videoOpType = settings.quality === 'high' ? 'video_high' : 'video_fast';
        const result = await checkAndDeductCredits(profile.id, videoOpType);
        if (!result.success) {
            alert(t.insufficientCredits);
            if (onShowBuyCredits) onShowBuyCredits();
            return;
        }

        setIsVideoModalOpen(false);
        setIsVideoGenerating(true);

        try {
            const videoUrl = await generateVideoFromImage(generatedImageUrl, settings);
            setGeneratedVideoUrl(videoUrl);

            // Save to database
            const videoCreditCost = settings.quality === 'high' ? CREDIT_COSTS.VIDEO_HIGH : CREDIT_COSTS.VIDEO_FAST;
            await saveGeneration(
                profile.id,
                videoOpType,
                videoCreditCost,
                null,
                null,
                videoUrl,
                { settings, source: 'collage' }
            );

            // Refresh profile
            onRefreshProfile();

            // Track analytics
            trackEvent(ANALYTICS_EVENTS.GENERATE_VIDEO, {
                quality: settings.quality,
                source: 'collage',
                userId: profile.id
            });
        } catch (error) {
            console.error('Video generation error:', error);
            alert(t.videoError + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsVideoGenerating(false);
        }
    }, [profile, generatedImageUrl, onRefreshProfile, onShowBuyCredits, t]);


    return (
        <>
            {/* Tab Selection */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex">
                    <button
                        onClick={() => setActiveTab('standard')}
                        className={`px-6 py-2.5 rounded-lg font-bold transition-all text-sm ${activeTab === 'standard'
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {t.tabStandard}
                    </button>
                    <button
                        onClick={() => setActiveTab('magic')}
                        className={`px-6 py-2.5 rounded-lg font-bold transition-all text-sm ${activeTab === 'magic'
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {mt.tabTitle}
                    </button>
                    <button
                        onClick={() => setActiveTab('product')}
                        className={`px-6 py-2.5 rounded-lg font-bold transition-all text-sm ${activeTab === 'product'
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {t.tabProduct}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Upload & Settings */}
                <div className="space-y-6">
                    {activeTab === 'standard' ? (
                        <>
                            {/* Upload Area (Standard) */}
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <h3 className="text-xl font-bold mb-2">{t.uploadTitle}</h3>
                                <p className="text-slate-400 text-sm mb-4">{t.uploadDesc}</p>

                                {/* Image Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {uploadedImages.map((img) => (
                                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleRemoveImage(img.id)}
                                                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Upload Button */}
                                {uploadedImages.length < 6 && (
                                    <label className="block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-colors">
                                            <svg className="w-12 h-12 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <p className="text-slate-400">{t.uploadButton}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {uploadedImages.length}/6 {t.imageCount}
                                            </p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </>
                    ) : activeTab === 'magic' ? (
                        <>
                            {/* Magic Workflow Container */}
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                                    {mt.tabTitle}
                                </h3>

                                {magicStep === 'upload' ? (
                                    <>
                                        <p className="text-slate-400 text-sm mb-6">{mt.uploadDesc}</p>

                                        {uploadedImages.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="relative aspect-video rounded-xl overflow-hidden group border-2 border-purple-500/20 bg-slate-900">
                                                    <img
                                                        src={uploadedImages[0].preview}
                                                        alt=""
                                                        className="w-full h-full object-contain transition-transform duration-300"
                                                        style={{ transform: `scale(${magicZoom})` }}
                                                    />

                                                    {/* Zoom Controls */}
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setMagicZoom(prev => Math.max(0.5, prev - 0.2))}
                                                            className="p-1 hover:bg-white/10 rounded-full text-white"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                                                        </button>
                                                        <span className="text-xs font-bold text-white min-w-[3rem] text-center">% {Math.round(magicZoom * 100)}</span>
                                                        <button
                                                            onClick={() => setMagicZoom(prev => Math.min(3, prev + 0.2))}
                                                            className="p-1 hover:bg-white/10 rounded-full text-white"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveImage(uploadedImages[0].id)}
                                                        className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleGenerate()}
                                                    disabled={isGenerating}
                                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                                >
                                                    {isGenerating ? (
                                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                    )}
                                                    {isGenerating ? t.magicPreparing : t.magicGenerate}
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="block">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                                <div className="border-2 border-dashed border-purple-500/30 bg-purple-500/5 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-all group">
                                                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-300 font-bold">{mt.uploadTitle}</p>
                                                    <p className="text-xs text-slate-500 mt-2">{t.uploadSingleOutfit}</p>
                                                </div>
                                            </label>
                                        )}
                                    </>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-slate-300">
                                                {isAnalyzing ? t.analyzingProducts : t.detectedProducts}
                                            </p>
                                            {isAnalyzing && (
                                                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                        </div>

                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {products.map(product => (
                                                <ProductItemEditor
                                                    key={product.id}
                                                    product={product}
                                                    onUpdate={(updated) => handleUpdateProduct(product.id, updated)}
                                                    onRemove={() => handleRemoveProduct(product.id)}
                                                    onEnlarge={() => setSelectedProductPreview(getProductPreview(product))}
                                                />
                                            ))}
                                            <button
                                                onClick={() => setProducts(prev => [...prev, { id: Math.random().toString(36).substring(7), file: '', name: t.newProduct }])}
                                                className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all text-sm font-medium"
                                            >
                                                {t.addManualProduct}
                                            </button>
                                        </div>

                                        <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                                <span className="text-purple-400 font-bold">{t.tipLabel}</span> {t.tipText}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Product Management Area */}
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{t.productsTitle}</h3>
                                        <p className="text-slate-400 text-sm">{t.productsDesc}</p>
                                    </div>
                                    <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                        {t.addProduct}
                                        <input type="file" multiple accept="image/*" onChange={handleAddProduct} className="hidden" />
                                    </label>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {products.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl text-slate-500">
                                            {t.noProducts}
                                        </div>
                                    ) : (
                                        products.map(product => (
                                            <ProductItemEditor
                                                key={product.id}
                                                product={product}
                                                onUpdate={(updated) => handleUpdateProduct(product.id, updated)}
                                                onRemove={() => handleRemoveProduct(product.id)}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Background Selection */}
                            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                                <h3 className="font-bold mb-4">{t.bgTitle}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { id: 'corkboard', label: t.bgCorkboard, icon: '📌' },
                                        { id: 'white', label: t.bgWhite, icon: '🖼️' },
                                        { id: 'black', label: t.bgBlack, icon: '🎞️' },
                                        { id: 'custom', label: t.bgCustom, icon: '🎨' }
                                    ].map(bg => (
                                        <button
                                            key={bg.id}
                                            onClick={() => setCollageBackground(bg.id === 'custom' ? '#f0f0f0' : bg.id)}
                                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${collageBackground === bg.id || (bg.id === 'custom' && collageBackground.startsWith('#'))
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                                                }`}
                                        >
                                            <span className="text-2xl">{bg.icon}</span>
                                            <span className="text-xs font-medium">{bg.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {collageBackground.startsWith('#') && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <span className="text-sm text-slate-400">{t.bgColorPick}</span>
                                        <input
                                            type="color"
                                            value={collageBackground}
                                            onChange={(e) => setCollageBackground(e.target.value)}
                                            className="w-full h-10 bg-transparent border-none cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Prompt Input */}
                    {activeTab !== 'magic' && (
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                            <label className="block text-sm font-medium mb-2">
                                {activeTab === 'standard' ? t.promptLabel : t.styleNotesLabel}
                            </label>
                            <div className="relative">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => {
                                        setPrompt(e.target.value);
                                    }}
                                    placeholder={activeTab === 'standard' ? t.promptPlaceholder : t.styleNotesPlaceholder}
                                    rows={3}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y min-h-[120px]"
                                />
                                <div className="absolute bottom-2 right-2 text-slate-600 pointer-events-none">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v6m0 0h-6m6 0L13 13" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || (activeTab === 'standard' ? uploadedImages.length < 2 : (activeTab === 'product' ? products.length < 1 : uploadedImages.length < 1))}
                            className="flex-1 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? t.generatingText : `✨ ${activeTab === 'standard' ? t.generateButton : (activeTab === 'product' ? t.productCollageButton : mt.magicButton)}`}
                        </button>
                        <button
                            onClick={handleClear}
                            className="px-6 py-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            {t.clearButton}
                        </button>
                    </div>

                    {/* Credit Info */}
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                        <span className="text-sm text-slate-300">
                            {t.creditLabel} <span className="text-purple-400 font-bold text-lg">{CREDIT_COSTS.COLLAGE} {t.creditCost}</span>
                        </span>
                    </div>
                </div>

                {/* Right Column - Result */}
                <div className="space-y-6">
                    {/* Main Result Box */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{t.resultTitle}</h3>
                            {(activeTab === 'product' || activeTab === 'magic') && generatedImageUrl && (
                                <button
                                    onClick={() => setIsMagazineView(!isMagazineView)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isMagazineView
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-slate-700 text-slate-300 hover:text-white'
                                        }`}
                                >
                                    {isMagazineView ? t.collageOnly : t.magazineView}
                                </button>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className={`bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden min-h-[400px] ${isMagazineView ? 'bg-transparent' : ''}`}>
                                {isGenerating ? (
                                    <div className="text-center p-20">
                                        <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Styling Editorial...</p>
                                    </div>
                                ) : generatedImageUrl ? (
                                    <div ref={magazineRef} className={`w-full flex flex-col ${isMagazineView ? 'bg-[#FAF9F6] p-12 border border-slate-200 shadow-2xl rounded-sm' : ''}`}>
                                        {/* Magazine Header */}
                                        {isMagazineView && (
                                            <div className="flex justify-between items-end mb-10 border-b-2 border-slate-900 pb-6 animate-fade-in">
                                                <div>
                                                    <h2 className="text-5xl font-serif italic text-slate-900 mb-1">Editor's Choice</h2>
                                                    <p className="text-[10px] tracking-[0.4em] font-black text-slate-400 uppercase">Premium Fashion Editorial • 2026</p>
                                                </div>
                                                <div className="text-right font-serif text-slate-400">
                                                    <p className="text-sm italic">Fasheone Fabric</p>
                                                    <p className="text-[10px] tracking-widest font-bold uppercase mt-1">Issue No. 04</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Main Image */}
                                        <div className="relative group overflow-hidden rounded-lg">
                                            <img
                                                src={generatedImageUrl}
                                                alt="Generated content"
                                                className={`w-full object-contain cursor-pointer transition-transform ${!isMagazineView ? 'hover:scale-105' : ''}`}
                                                onClick={() => !isMagazineView && setIsModalOpen(true)}
                                            />
                                            {!isMagazineView && (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600/90 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm">
                                                        {t.viewDetail}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Magazine Footer & Details (If enabled) */}
                                        {isMagazineView && (activeTab === 'product' || activeTab === 'magic') && (
                                            <div className="mt-12 pt-10 animate-fade-in text-slate-900">
                                                <div className="grid grid-cols-2 gap-x-12 gap-y-20 px-2">
                                                    {products.map((p, idx) => (
                                                        <div key={p.id} className="flex gap-6 items-start group">
                                                            <div
                                                                className="w-28 h-28 bg-white border border-slate-100 rounded-sm p-1 flex-shrink-0 shadow-lg overflow-hidden cursor-zoom-in transition-transform group-hover:-rotate-2"
                                                                onClick={() => setSelectedProductPreview(getProductPreview(p))}
                                                            >
                                                                {getProductPreview(p) ? (
                                                                    <img
                                                                        src={getProductPreview(p)!}
                                                                        className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all"
                                                                        alt={p.name}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                                        <span className="text-[10px] text-slate-300">{t.noImage}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-start py-1">
                                                                <div className="flex flex-col mb-2">
                                                                    <h4 className="font-serif font-black text-lg text-slate-900 uppercase leading-tight tracking-tight break-words mb-1">{p.name || t.unnamedProduct}</h4>
                                                                    {p.price && <span className="text-slate-900 font-serif font-bold text-sm border-b border-slate-900 w-fit">{p.price}</span>}
                                                                </div>
                                                                {p.description && <p className="text-[11px] text-slate-900 leading-relaxed font-semibold italic">{p.description}</p>}
                                                                <span className="mt-3 text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase">Ref. #FA-{idx + 100}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div data-html2canvas-ignore className="mt-16 pt-8 pb-4 border-t border-slate-900/10 flex justify-between items-center px-2 text-[10px] font-black text-slate-400 tracking-[0.3em]">
                                                    <span>© FASHEONE STUDIO 2026 • ALL RIGHTS RESERVED</span>
                                                    <span className="flex items-center gap-6">
                                                        <button
                                                            data-html2canvas-ignore
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadMagazine();
                                                            }}
                                                            className="text-slate-900 hover:opacity-70 flex items-center gap-2 border border-slate-900 px-4 py-1.5 rounded-sm transition-all bg-transparent"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                            DOWNLOAD EDITORIAL
                                                        </button>
                                                        <span className="text-slate-900">PAGE 01</span>
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div data-html2canvas-ignore className={`mt-4 flex gap-2 ${isMagazineView ? 'hidden' : ''}`}>
                                            <button
                                                onClick={() => setIsVideoModalOpen(true)}
                                                disabled={isVideoGenerating}
                                                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                {t.createVideo}
                                            </button>
                                            <button
                                                onClick={() => handleDownload(generatedImageUrl)}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg text-sm flex items-center gap-2"
                                            >
                                                📥 {t.downloadButton}
                                            </button>
                                        </div>

                                        {/* Edit detected items (Quick access) */}
                                        {activeTab === 'magic' && products.length > 0 && (
                                            <div data-html2canvas-ignore className="mt-6 pt-6 border-t border-slate-700/50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.editBoardProducts}</h4>
                                                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{products.length} {t.productCount}</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {products.map((p, idx) => (
                                                        <div key={p.id} className="bg-slate-900/30 rounded-xl p-3 border border-slate-700/30 flex items-center gap-4 group">
                                                            <div
                                                                className="relative w-12 h-12 flex-shrink-0 group focus-within:ring-2 focus-within:ring-purple-500 rounded-lg transition-all cursor-zoom-in"
                                                                onClick={() => setSelectedProductPreview(getProductPreview(p))}
                                                            >
                                                                {getProductPreview(p) ? (
                                                                    <img
                                                                        src={getProductPreview(p)!}
                                                                        className="w-full h-full object-cover rounded-lg border border-slate-700/50"
                                                                        alt=""
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-slate-900 rounded-lg border border-slate-700/50 flex items-center justify-center">
                                                                        <span className="text-[8px] text-slate-600">{t.noImage}</span>
                                                                    </div>
                                                                )}
                                                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer rounded-lg transition-opacity">
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                                    </svg>
                                                                    <input type="file" className="hidden" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            const { fileToBase64 } = await import('../utils/fileUtils');
                                                                            const preview = await fileToBase64(file);
                                                                            handleUpdateProduct(p.id, { ...p, file, preview });
                                                                        }
                                                                    }} />
                                                                </label>
                                                            </div>
                                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={p.name}
                                                                    placeholder={t.productNamePlaceholder}
                                                                    onChange={(e) => handleUpdateProduct(p.id, { ...p, name: e.target.value })}
                                                                    className="bg-transparent border-b border-slate-700 text-xs text-white focus:border-purple-500 outline-none py-1"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={p.price || ''}
                                                                    placeholder={t.pricePlaceholder}
                                                                    onChange={(e) => handleUpdateProduct(p.id, { ...p, price: e.target.value })}
                                                                    className="bg-transparent border-b border-slate-700 text-xs text-purple-400 focus:border-purple-500 outline-none py-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="mt-4 text-[10px] text-slate-500 text-center italic">
                                                    {t.editHint}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 p-12">
                                        <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="font-medium">{t.resultEmpty}</p>
                                        <p className="text-xs text-slate-600 mt-2 max-w-[200px] mx-auto">{t.resultHint}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Video Result Box (Now on the right side) */}
                    {(generatedVideoUrl || isVideoGenerating) && (
                        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    🎬 <span>{t.generatedVideo}</span>
                                </h3>
                                {generatedVideoUrl && (
                                    <button
                                        onClick={async () => {
                                            const { downloadFile, generateFilename } = await import('../utils/downloadHelper');

                                            // Detect real mime type from blob
                                            let extension = 'mp4';
                                            try {
                                                const response = await fetch(generatedVideoUrl);
                                                const blob = await response.blob();
                                                if (blob.type.includes('webm')) extension = 'webm';
                                                else if (blob.type.includes('mp4')) extension = 'mp4';
                                                else if (blob.type.includes('quicktime')) extension = 'mov';
                                            } catch (e) {
                                                console.warn("Could not detect video mime type, defaulting to mp4");
                                            }

                                            const filename = generateFilename('kolaj-video', extension);
                                            await downloadFile(generatedVideoUrl, filename);
                                        }}
                                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                                    >
                                        📥 {t.downloadButton}
                                    </button>
                                )}
                            </div>

                            <div className="aspect-video bg-black rounded-xl overflow-hidden relative group">
                                {isVideoGenerating ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
                                        <div className="w-12 h-12 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                                        <p className="text-cyan-500 font-bold text-sm">{t.videoProcessing}</p>
                                        <p className="text-slate-500 text-xs mt-2">{t.videoProcessingHint}</p>
                                    </div>
                                ) : generatedVideoUrl ? (
                                    <video
                                        src={generatedVideoUrl}
                                        controls
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>
            </div >

            {/* Premium Image Modal */}
            {
                isModalOpen && generatedImageUrl && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div
                            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 z-10 bg-slate-800/90 hover:bg-slate-700 text-white p-3 rounded-full transition-all shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <button
                                onClick={() => handleDownload(generatedImageUrl)}
                                className="absolute top-4 left-4 z-10 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {t.downloadButton}
                            </button>

                            <div className="relative w-full h-full flex items-center justify-center">
                                <img
                                    src={generatedImageUrl}
                                    alt="Full view"
                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform hover:scale-105 cursor-zoom-in"
                                />
                            </div>
                        </div>
                    </div>
                )
            }


            <VideoSettingsModal
                isOpen={isVideoModalOpen}
                isGenerating={isVideoGenerating}
                onClose={() => setIsVideoModalOpen(false)}
                onGenerate={handleVideoGeneration}
            />


            {/* Product Image Enlarge Modal */}
            {
                selectedProductPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedProductPreview(null)}>
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedProductPreview(null)}
                                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 font-bold"
                            >
                                <span>{t.closeModal}</span>
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <img
                                src={selectedProductPreview}
                                alt="Product Detail"
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10 p-2 bg-white"
                            />
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default CollagePage;
