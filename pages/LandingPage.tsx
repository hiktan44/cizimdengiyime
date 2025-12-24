import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { CREDIT_PACKAGES } from '../lib/supabase';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { getPublicHeroVideos, getPublicShowcaseImages, getSiteSettings } from '../lib/adminService';
import { WhatsAppPanel } from '../components/WhatsAppPanel';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  isLoggedIn?: boolean;
  userName?: string | null;
  userRole?: 'admin' | 'user' | null;
  credits?: number;
  onLogout?: () => void;
  onAdminClick?: () => void;
  onBuyCreditsClick?: () => void;
  sketchUrl?: string;
  productUrl?: string;
  modelUrl?: string;
  videoUrl?: string;
  heroVideoUrl?: string;
  heroVideo1Url?: string;
  heroVideo2Url?: string;
  heroVideo3Url?: string;
}

type Language = 'tr' | 'en';
type Theme = 'light' | 'dark';

const translations = {
  tr: {
    header: {
      signIn: 'Giriş Yap',
      start: 'Başla',
      buyCredits: 'Kredi Al',
      signOut: 'Çıkış',
      continueUsing: 'Hemen Kullanmaya Devam Et',
    },
    howItWorks: {
      title: 'Nasıl Çalışır?',
      subtitle: '3 Adımda AI ile Profesyonel Görsel',
      step1Title: 'Görseli Yükle',
      step1Desc: 'Ürün çizimini veya fotoğrafını platforma yükle, AI otomatik analiz eder',
      step2Title: 'Detayları Seç',
      step2Desc: 'Hazır şablonlar ve seçeneklerle istediğin stili belirle, prompt kullanmana gerek yok',
      step3Title: 'Oluştur & İndir',
      step3Desc: 'Profesyonel sonuçları hemen indir, video oluştur, sosyal medyada paylaş',
    },
    hero: {
      title: 'Çizimden Gerçeğe,',
      subtitle: 'Saniyeler İçinde',
      description: 'Moda tasarımlarınızı AI ile profesyonel ürün fotoğraflarına ve canlı model görsellerine dönüştürün. Video oluşturun, markanızı büyütün.',
      cta: 'Ücretsiz Deneyin',
    },
    showcase: {
      title: 'Çizimden Gerçeğe Dönüşüm',
      subtitle: 'AI teknolojisiyle tasarımlarınız profesyonel görsellere dönüşüyor',
      before: 'ÖNCE',
      after: 'SONRA',
      step1: '1. Çizim → Ürün (Hayalet Manken)',
      step1Desc: 'Basit karakalem veya dijital teknik çizimlerinizi yükleyin. Yapay zeka, kumaş, dikiş ve detayları algılayarak çiziminizi birebir yansıtan gerçekçi bir ürün fotoğrafına dönüştürür.',
      step1Before: 'ÇİZİM',
      step1After: 'ÜRÜN',
      step2: '2. Ürün → Canlı Model',
      step2Desc: 'Oluşturulan veya yüklenen ürün fotoğrafını dilediğiniz manken üzerinde görün. Farklı ten rengi, saç stili ve poz tipleriyle sahip yapay zeka modelleriyle stüdyo çekimi kalitesinde sonuçlar alın.',
      step2Before: 'ÜRÜN',
      step2After: 'MODEL',
      step3: '3. Görsel → Video',
      step3Desc: 'Statik görsellerle sınırlı kalmayın. Modelinizi podyumda yürütmek, dönmek veya poz vermek için sinematik videolar oluşturun. Sosyal medya ve e-ticaret için mükemmel içerik.',
      professionalVideo: 'Profesyonel Video',
      tryNow: 'Şimdi Deneyin',
    },
    features: {
      title: 'Güçlü Özellikler',
      feature1Title: 'Çizimden Ürüne',
      feature1Desc: 'Moda çizimlerinizi ultra-gerçekçi hayalet manken ürün fotoğraflarına dönüştürün.',
      feature2Title: 'Canlı Model',
      feature2Desc: 'Ürünlerinizi gerçek modeller üzerinde görün. Etnik köken, poz, stil seçenekleriyle.',
      feature3Title: 'Video Oluşturma',
      feature3Desc: 'Görsellerinizi 5-10 saniyelik profesyonel videolara dönüştürün.',
      feature4Title: 'Teknik Çizim (Tech Pack)',
      feature4Desc: 'Ürün fotoğraflarınızı üretim için detaylı teknik çizimlere dönüştürün.',
      aiPromptTitle: 'AI Prompt ile Sınırsız Özelleştirme',
      customBg: 'Özel Arka Plan & Mekan',
      customBgDesc: 'Hazır lokasyonların yanı sıra, kendi arka plan görselinizi yükleyin veya AI\'a prompt verin.',
      brandPlacement: 'Marka Yerleştirme',
      brandPlacementDesc: 'Promptta belirterek markanızı arka plana yerleştirin.',
      sceneSetup: 'Detaylı Sahne Kurgusu',
      sceneSetupDesc: 'Ayrıntılı senaryolar yazın. AI tüm detayları anlayıp uygular.',
      styleControl: 'Stil & Atmosfer Kontrolü',
      styleControlDesc: '100+ hazır seçenek ile birlikte prompt ile daha da özelleştirin.',
    },
    pricing: {
      title: 'Fiyatlandırma',
      subtitle: 'İhtiyacınıza uygun planı seçin. Her ay krediniz otomatik yenilenir.',
      perMonth: '/ay',
      popular: 'Popüler',
      start: 'Başla',
      extraCreditsTitle: 'Ek Kredi Paketleri',
      extraCreditsSubtitle: 'Aboneliğiniz devam ederken krediniz biterse, ek kredi satın alabilirsiniz.',
      creditPackagesTitle: 'Kredi Paketleri',
      creditPackagesSubtitle: 'İhtiyacınıza uygun kredi paketini seçin. Abonelik yok, sadece kullandığınız kadar ödersiniz.',
      credits: 'Kredi',
      credit: 'Kredi',
      buyNow: 'Satın Al',
      creditUsage: '💡 Kredi Kullanımı',
      liveModelVideo: '🎨 Canlı Model & Video',
      sketchToProduct: 'Çizim → Ürün: 1 kredi',
      productToModel: 'Ürün → Model: 1 kredi',
      videoGeneration: 'Video Oluşturma: 3 kredi',
      otherModules: '⚡ Diğer Modüller',
      techDrawing: 'Teknik Çizim: 1 kredi',
      pixshopEdit: 'Pixshop (Düzenleme): 1 kredi',
      fotomatik: 'Fotomatik: 1 kredi',
      freeCredits: 'Yeni üyeler 10 ücretsiz kredi ile başlar',
      creditsNeverExpire: 'Krediler hiç bitmez, istediğiniz zaman kullanın',
    },
    testimonials: {
      title: 'Kullanıcı Yorumları',
      quote1: '"Bu platform sayesinde koleksiyonumu birkaç saat içinde görselleştirebildim. İnanılmaz hızlı ve kaliteli!"',
      name1: 'Ayşe Yılmaz',
      quote2: '"Müşterilerime ürünleri göstermek artık çok kolay. Video özelliği harika, sosyal medyada çok beğeniliyor!"',
      name2: 'Mehmet Kaya',
      quote3: '"Fotoğraf çekimi maliyetlerinden kurtuldum. AI görseller gerçekten profesyonel görünüyor!"',
      name3: 'Zeynep Demir',
    },
    comparison: {
      title: 'NEDEN FASHEONE?',
      subtitle: 'Fasheone ile farkı hisset',
      needPrompts: 'Prompt yazmana gerek var',
      readyOptions: 'Hazır seçimlerle içerik üretilir',
      multipleTools: 'Bir sürü farklı tool',
      onePlatform: 'Tek platformda katalogdan reklama her şey',
      expensive: 'Pahalı stüdyo çekimleri',
      lowCost: 'Dakikalar içinde düşük maliyet',
      incorrectPlacement: 'Ürünü hatalı giydirme ve aktarma',
      allDetails: 'Ürünü tüm detayları ile oluşturmak',
      faster: 'Geleneksel yöntemlerden 10x daha hızlı',
    },
    stats: {
      videosCreated: 'Oluşturulan Video',
      imagesCreated: 'Oluşturulan Görsel',
      satisfiedUsers: 'Memnun Kullanıcı',
      platformAccess: 'Platform Erişimi',
    },
    faq: {
      title: 'Sık Sorulan Sorular',
      q1: 'Fasheone ile neler yapabilirim?',
      a1: 'Moda çizimlerinizi profesyonel ürün fotoğraflarına, canlı model görsellerine ve videolara dönüştürebilirsiniz. Ayrıca AI ile özel arka planlar, renkler ve stiller seçebilirsiniz.',
      q2: 'Yüklediğim görseller güvende mi?',
      a2: 'Evet, tüm görselleriniz şifreli olarak saklanır ve sadece siz erişebilirsiniz. Verileriniz 3. şahıslarla paylaşılmaz.',
      q3: 'Kaç krediye ihtiyacım olur?',
      a3: 'Çizimden ürün 1 kredi, üründen model 1 kredi, video oluşturma 3 kredi harcar. Ortalama bir koleksiyon için Starter plan yeterlidir.',
      q4: 'Ürettiğim içeriklerin telif hakkı kime ait?',
      a4: 'Oluşturduğunuz tüm içerikler size aittir. Ticari amaçlarla kullanabilir, paylaşabilir ve satabilirsiniz.',
    },
    cta: {
      title: 'Hemen Başlayın',
      subtitle: 'İlk tasarımınızı ücretsiz deneyin. Kredi kartı gerekmez.',
      button: 'Ücretsiz Başla',
    },
    pixshop: {
      heroTitle: 'Fotoğraf Düzenlemenin Geleceğiyle Tanışın: Pixshop',
      heroSubtitle: 'Karmaşık araçlara veda edin. Yapay zeka ile sadece ne istediğinizi söyleyin, Pixshop saniyeler içinde gerçeğe dönüştürsün.',
      featuresTitle: 'Güçlü Özellikler',
      feature1Title: 'Akıllı Rötuş: Tıkla ve Değiştir',
      feature1Desc: 'Artık piksellerle uğraşmanıza gerek yok. Fotoğrafınızda düzenlemek istediğiniz noktaya tıklayın ve komutunuzu yazın. "Gömleğimin rengini mavi yap" veya "Arka plandaki nesneyi kaldır" demeniz yeterli.',
      feature2Title: 'Sınırsız Yaratıcı Filtreler',
      feature2Desc: 'Sadece hazır filtrelerle yetinmeyin, kendi tarzınızı yaratın. "80\'ler Synthwave estetiği" veya "Eskiz defteri çizimi" gibi hayalinizdeki atmosferi tarif edin.',
      feature3Title: 'Profesyonel Atmosfer Ayarları',
      feature3Desc: 'Işık, derinlik ve odak kontrolü parmaklarınızın ucunda. "Arka planı gerçekçi şekilde bulanıklaştır" veya "Stüdyo ışığı ekle" komutlarıyla profesyonel çekimler oluşturun.',
      feature4Title: 'Kristal Netliğinde Detaylar (Upscale)',
      feature4Desc: 'Düşük çözünürlüklü fotoğraflarınıza hayat verin. Yapay zeka destekli yükseltme teknolojimizle görsellerinizi 2K veya 4K kalitesine saniyeler içinde taşıyın.',
      feature5Title: 'Tasarımcı Dostu Çıktılar',
      feature5Desc: 'Arka plan kaldırma özelliği ile nesnelerinizi anında ayırın. Çalışmalarınızı şeffaf arka planlı yüksek kaliteli SVG formatında dışa aktarın.',
      whyTitle: 'Neden Pixshop?',
      why1: 'Zaman Kazanın: Saatler süren manuel düzenleme işlemlerini saniyelere indirin.',
      why2: 'Teknik Bilgi Gerektirmez: Photoshop bilmenize gerek yok, sadece yazmanız yeterli.',
      why3: 'Tam Kontrol: Geri al/İleri al özellikleri ve "Karşılaştır" moduyla düzenlemenin her aşamasını kontrol edin.',
      why4: 'Esnek Kırpma: Sosyal medya standartlarına (9:16, 1:1, 4:3) uygun akıllı kırpma ve döndürme araçlarını kullanın.',
      cta: 'Hemen Denemeye Başlayın!',
      ctaSubtitle: 'Yaratıcılığınızı serbest bırakın. İlk fotoğrafınızı yükleyin ve yapay zekanın gücünü keşfedin.',
      tryButton: 'Pixshop\'u Dene',
    },
    fotomatik: {
      heroTitle: 'Fotomatik Neleri Yapabilir? (Teknik Kapasite)',
      feature1Title: 'Bağlamsal Görsel Dönüşüm (AI Transform)',
      feature1Desc: 'Gemini 3 Pro Image Preview kullanarak, bir fotoğraftaki ana objeyi veya kişiyi (yüz hatlarını koruyarak) tamamen farklı bir senaryoya yerleştirebilir. Örneğin; evde çekilmiş bir fotoğrafı "Venedik sahilinde yürüyüş yapan" bir sahneye dönüştürebilir.',
      feature2Title: 'Derinlemesine Görsel Analiz ve Prompt Mühendisliği',
      feature2Desc: 'Yüklenen bir resmi sanatsal ve teknik açıdan analiz ederek Midjourney, Stable Diffusion ve Flux gibi platformlar için optimize edilmiş profesyonel istemler (promptlar) üretir.',
      feature3Title: 'Akıllı İyileştirme (AI Auto-Enhance)',
      feature3Desc: 'Resmin histogramını ve içeriğini analiz ederek parlaklık, kontrast, doygunluk ve keskinlik gibi değerleri "sinematik", "canlı" veya "dengeli" modlarda otomatik olarak optimize eder.',
      feature4Title: 'Hassas Manuel Editör',
      feature4Desc: 'Profesyonel seviyede kırpma (aspect ratio), merkez odaklı ölçekleme, aynalama ve yeniden boyutlandırma araçları sunar.',
      cta: 'Fotomatik\'i Hemen Deneyin',
    },
    techpack: {
      heroTitle: 'Üretim İçin Teknik Çizim (Tech Pack)',
      heroSubtitle: 'Üretim sürecinizi hızlandırın. Fotoğraflarınızı saniyeler içinde detaylı teknik çizimlere dönüştürün.',
      feature1Title: 'Resimden Teknik Çizime',
      feature1Desc: 'Yüklediğiniz herhangi bir ürün fotoğrafını, dikiş detayları ve hatları korunmuş profesyonel teknik çizimlere dönüştürür.',
      feature2Title: 'Dikiş ve Kalıp Analizi',
      feature2Desc: 'Yapay zeka, ürün üzerindeki dikiş yollarını ve kalıp parçalarını otomatik olarak algılayarak net çizgilerle sunar.',
      feature3Title: 'Üretime Hazır Çıktılar',
      feature3Desc: 'Tedarikçileriniz ve atölyelerinizle paylaşabileceğiniz, karmaşadan uzak, saf teknik çizimler elde edin.',
      feature4Title: 'Sınırsız Varyasyon',
      feature4Desc: 'Aynı modelin farklı varyasyonları için hızlıca teknik taslaklar oluşturun ve arşivleyin.',
      cta: 'Teknik Çizim Oluştur',
    },
  },
  en: {
    header: {
      signIn: 'Sign In',
      start: 'Get Started',
      buyCredits: 'Buy Credits',
      signOut: 'Sign Out',
      continueUsing: 'Continue Using',
    },
    howItWorks: {
      title: 'How It Works?',
      subtitle: '3 Steps to Professional Visuals with AI',
      step1Title: 'Upload Image',
      step1Desc: 'Upload your product sketch or photo, AI analyzes automatically',
      step2Title: 'Select Details',
      step2Desc: 'Choose your style with ready templates and options, no prompts needed',
      step3Title: 'Generate & Download',
      step3Desc: 'Download professional results instantly, create videos, share on social media',
    },
    hero: {
      title: 'From Sketch to Reality,',
      subtitle: 'In Seconds',
      description: 'Transform your fashion designs into professional product photos and live model visuals with AI. Create videos, grow your brand.',
      cta: 'Try For Free',
    },
    showcase: {
      title: 'Sketch to Reality Transformation',
      subtitle: 'Your designs become professional visuals with AI technology',
      before: 'BEFORE',
      after: 'AFTER',
      step1: '1. Sketch → Product (Ghost Mannequin)',
      step1Desc: 'Upload simple pencil or digital technical drawings. AI analyzes fabric, stitching, and details to transform your sketch into a realistic product photo.',
      step1Before: 'SKETCH',
      step1After: 'PRODUCT',
      step2: '2. Product → Live Model',
      step2Desc: 'See your product photo on your desired model. Get studio-quality results with AI models featuring different skin tones, hairstyles, and poses.',
      step2Before: 'PRODUCT',
      step2After: 'MODEL',
      step3: '3. Image → Video',
      step3Desc: 'Don\'t limit yourself to static images. Create cinematic videos of your model walking, turning, or posing. Perfect content for social media and e-commerce.',
      professionalVideo: 'Professional Video',
      tryNow: 'Try Now',
    },
    features: {
      title: 'Powerful Features',
      feature1Title: 'Sketch to Product',
      feature1Desc: 'Transform your fashion sketches into ultra-realistic ghost mannequin product photos.',
      feature2Title: 'Live Model',
      feature2Desc: 'See your products on real models. With ethnicity, pose, and style options.',
      feature3Title: 'Video Generation',
      feature3Desc: 'Convert your visuals into professional 5-10 second videos.',
      feature4Title: 'Technical Drawing (Tech Pack)',
      feature4Desc: 'Transform your product photos into detailed technical drawings for production.',
      aiPromptTitle: 'Unlimited Customization with AI Prompt',
      customBg: 'Custom Background & Location',
      customBgDesc: 'In addition to ready-made locations, upload your own background image or give AI a prompt.',
      brandPlacement: 'Brand Placement',
      brandPlacementDesc: 'Place your brand in the background by specifying in the prompt.',
      sceneSetup: 'Detailed Scene Setup',
      sceneSetupDesc: 'Write detailed scenarios. AI understands and applies all details.',
      styleControl: 'Style & Atmosphere Control',
      styleControlDesc: 'Customize even more with prompts along with 100+ ready-made options.',
    },
    pricing: {
      title: 'Pricing',
      subtitle: 'Choose the plan that suits your needs. Your credits renew automatically every month.',
      perMonth: '/month',
      popular: 'Popular',
      start: 'Get Started',
      extraCreditsTitle: 'Extra Credit Packages',
      extraCreditsSubtitle: 'If your credits run out while your subscription continues, you can purchase additional credits.',
      creditPackagesTitle: 'Credit Packages',
      creditPackagesSubtitle: 'Choose the credit package that suits your needs. No subscription, pay only for what you use.',
      credits: 'Credits',
      credit: 'Credit',
      buyNow: 'Buy Now',
      creditUsage: '💡 Credit Usage',
      liveModelVideo: '🎨 Live Model & Video',
      sketchToProduct: 'Sketch → Product: 1 credit',
      productToModel: 'Product → Model: 1 credit',
      videoGeneration: 'Video Generation: 3 credits',
      otherModules: '⚡ Other Modules',
      techDrawing: 'Tech Drawing: 1 credit',
      pixshopEdit: 'Pixshop (Edit): 1 credit',
      fotomatik: 'Fotomatik: 1 credit',
      freeCredits: 'New members start with 10 free credits',
      creditsNeverExpire: 'Credits never expire, use them anytime',
    },
    testimonials: {
      title: 'Testimonials',
      quote1: '"I was able to visualize my collection in just a few hours thanks to this platform. Incredibly fast and high quality!"',
      name1: 'Sarah Johnson',
      quote2: '"Showing products to my customers is now so easy. The video feature is amazing, very popular on social media!"',
      name2: 'Michael Smith',
      quote3: '"I got rid of photo shoot costs. AI images really look professional!"',
      name3: 'Emma Wilson',
    },
    comparison: {
      title: 'WHY FASHEONE?',
      subtitle: 'Feel the difference with Fasheone',
      needPrompts: 'Need to write prompts',
      readyOptions: 'Create content with ready options',
      multipleTools: 'Multiple different tools',
      onePlatform: 'Everything from catalog to ads in one platform',
      expensive: 'Expensive studio shoots',
      lowCost: 'Low cost in minutes',
      incorrectPlacement: 'Incorrect product placement',
      allDetails: 'Create product with all details',
      faster: '10x faster than traditional methods',
    },
    stats: {
      videosCreated: 'Videos Created',
      imagesCreated: 'Images Created',
      satisfiedUsers: 'Satisfied Users',
      platformAccess: 'Platform Access',
    },
    faq: {
      title: 'Frequently Asked Questions',
      q1: 'What can I do with Fasheone?',
      a1: 'You can transform your fashion sketches into professional product photos, live model visuals, and videos. You can also choose custom backgrounds, colors, and styles with AI.',
      q2: 'Are my uploaded images safe?',
      a2: 'Yes, all your images are stored encrypted and only you can access them. Your data is not shared with third parties.',
      q3: 'How many credits do I need?',
      a3: 'Sketch to product costs 1 credit, product to model costs 1 credit, video creation costs 3 credits. The Starter plan is sufficient for an average collection.',
      q4: 'Who owns the copyright of the content I create?',
      a4: 'All content you create belongs to you. You can use, share, and sell it for commercial purposes.',
    },
    cta: {
      title: 'Get Started Now',
      subtitle: 'Try your first design for free. No credit card required.',
      button: 'Start for Free',
    },
    pixshop: {
      heroTitle: 'Meet the Future of Photo Editing: Pixshop',
      heroSubtitle: 'Say goodbye to complex tools. Just tell AI what you want, and Pixshop transforms it into reality in seconds.',
      featuresTitle: 'Powerful Features',
      feature1Title: 'Smart Retouch: Click and Change',
      feature1Desc: 'No need to deal with pixels anymore. Click on the point you want to edit in your photo and write your command. Just say "Make my shirt blue" or "Remove the object in the background".',
      feature2Title: 'Unlimited Creative Filters',
      feature2Desc: 'Don\'t settle for ready-made filters, create your own style. Describe the atmosphere of your dreams like "80s Synthwave aesthetic" or "Sketchbook drawing".',
      feature3Title: 'Professional Atmosphere Settings',
      feature3Desc: 'Light, depth and focus control at your fingertips. Create professional shots with commands like "Blur the background realistically" or "Add studio lighting".',
      feature4Title: 'Crystal Clear Details (Upscale)',
      feature4Desc: 'Bring your low-resolution photos to life. Transform your images to 2K or 4K quality in seconds with our AI-powered upscaling technology.',
      feature5Title: 'Designer-Friendly Outputs',
      feature5Desc: 'Instantly separate your objects with background removal feature. Export your work in high-quality SVG format with transparent backgrounds.',
      whyTitle: 'Why Pixshop?',
      why1: 'Save Time: Reduce hours of manual editing to seconds.',
      why2: 'No Technical Knowledge Required: You don\'t need to know Photoshop, just write.',
      why3: 'Full Control: Control every stage of editing with undo/redo features and "Compare" mode.',
      why4: 'Flexible Cropping: Use smart cropping and rotation tools suitable for social media standards (9:16, 1:1, 4:3).',
      cta: 'Start Trying Now!',
      ctaSubtitle: 'Unleash your creativity. Upload your first photo and discover the power of AI.',
      tryButton: 'Try Pixshop',
    },
    fotomatik: {
      heroTitle: 'What Can Fotomatik Do? (Technical Capacity)',
      feature1Title: 'Contextual Image Transformation (AI Transform)',
      feature1Desc: 'Using Gemini 3 Pro Image Preview, it can place the main object or person from a photo into a completely different scenario while preserving facial features. For example, it can transform a photo taken at home into a scene "walking on the Venice beach".',
      feature2Title: 'Deep Visual Analysis and Prompt Engineering',
      feature2Desc: 'Analyzes an uploaded image artistically and technically to produce professional optimized prompts for platforms like Midjourney, Stable Diffusion, and Flux.',
      feature3Title: 'Smart Enhancement (AI Auto-Enhance)',
      feature3Desc: 'Analyzes the image histogram and content to automatically optimize values like brightness, contrast, saturation, and sharpness in "cinematic", "vivid", or "balanced" modes.',
      feature4Title: 'Precise Manual Editor',
      feature4Desc: 'Offers professional-level tools for cropping (aspect ratio), center-focused scaling, mirroring, and resizing.',
      cta: 'Try Fotomatik Now',
    },
    techpack: {
      heroTitle: 'Technical Drawing for Production (Tech Pack)',
      heroSubtitle: 'Accelerate your production process. Transform your photos into detailed technical drawings in seconds.',
      feature1Title: 'Image to Tech Pack',
      feature1Desc: 'Transforms any product photo you upload into professional technical drawings with preserved stitch details and contours.',
      feature2Title: 'Stitch and Pattern Analysis',
      feature2Desc: 'AI automatically detects stitch paths and pattern pieces on the product, presenting them with clear lines.',
      feature3Title: 'Production-Ready Outputs',
      feature3Desc: 'Get clear, clutter-free technical drawings that you can share with your suppliers and workshops.',
      feature4Title: 'Unlimited Variations',
      feature4Desc: 'Quickly create and archive technical drafts for different variations of the same model.',
      cta: 'Create Technical Drawing',
    },
  },
};

// Detect user's country based on timezone (simple approach)
const detectDefaultLanguage = (): Language => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Turkey timezones
  if (timezone.includes('Istanbul') || timezone.includes('Turkey')) {
    return 'tr';
  }
  // Default to English for other countries
  return 'en';
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  isLoggedIn = false,
  userName,
  userRole,
  credits,
  onLogout,
  onAdminClick,
  onBuyCreditsClick,
  sketchUrl,
  productUrl,
  modelUrl,
  videoUrl,
  heroVideoUrl,
  heroVideo1Url,
  heroVideo2Url,
  heroVideo3Url
}) => {
  // State for DB content
  const [heroVideos, setHeroVideos] = useState<string[]>([]);
  const [showcaseImages, setShowcaseImages] = useState<{
    sketch?: string;
    product?: string;
    model?: string;
    video?: string;
  }>({});
  const [creditPackages, setCreditPackages] = useState({
    small: { credits: 50, price: 250 },
    medium: { credits: 100, price: 500 },
    large: { credits: 200, price: 1000 },
  });

  // Fetch content from DB on mount and periodically
  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('🔄 Ana sayfa içeriği Supabase\'den çekiliyor...');

        // Fetch hero videos
        const videos = await getPublicHeroVideos();
        const videoUrls = videos.map(v => v.video_url);
        setHeroVideos(videoUrls);
        console.log('✅ Hero videolar yüklendi:', videoUrls.length, 'video');

        // Fetch showcase images
        const images = await getPublicShowcaseImages();
        const imagesByType: any = {};
        images.forEach(img => {
          imagesByType[img.type] = img.image_url;
        });
        setShowcaseImages(imagesByType);
        console.log('✅ Showcase görseller yüklendi:', images.length, 'görsel');

        // Fetch credit packages from settings
        const settings = await getSiteSettings();
        if (settings) {
          setCreditPackages({
            small: {
              credits: settings.credit_package_small_credits || 50,
              price: settings.credit_package_small_price || 250,
            },
            medium: {
              credits: settings.credit_package_medium_credits || 100,
              price: settings.credit_package_medium_price || 500,
            },
            large: {
              credits: settings.credit_package_large_credits || 200,
              price: settings.credit_package_large_price || 1000,
            },
          });
        }
      } catch (error) {
        console.error('❌ İçerik yükleme hatası:', error);
      }
    };

    // Initial fetch
    fetchContent();

    // Refresh content every 30 seconds (optional - for real-time updates)
    const interval = setInterval(fetchContent, 30000);

    return () => clearInterval(interval);
  }, []);

  // Demo images - use DB content if available, fallback to props or defaults
  const demoSketch = showcaseImages.sketch || sketchUrl || 'https://images.unsplash.com/photo-1610824352934-c10d87b700cc?w=600';
  const demoProduct = showcaseImages.product || productUrl || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600';
  const demoModel = showcaseImages.model || modelUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600';
  const demoVideo = showcaseImages.video || videoUrl;

  // Use DB hero videos or fallback
  const demoHeroVideo = heroVideos[0] || heroVideoUrl || 'https://cdn.pixabay.com/video/2024/01/09/196454-904303173_large.mp4';
  const demoHeroVideo1 = heroVideos[1] || heroVideo1Url || '';
  const demoHeroVideo2 = heroVideos[2] || heroVideo2Url || '';
  const demoHeroVideo3 = heroVideos[3] || heroVideo3Url || '';

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || detectDefaultLanguage();
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const t = translations[language];

  const bgClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900'
    : 'bg-gradient-to-br from-blue-100 via-white via-purple-50 to-orange-100';

  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const secondaryTextClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-700';
  const descriptionTextClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-800';
  const cardBg = theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
  const whatsappMessage = language === 'tr'
    ? 'Merhaba, Fasheone hakkinda bilgi almak istiyorum.'
    : 'Hi, I would like more information about Fasheone.';
  const whatsappSubtitle = language === 'tr' ? 'Hemen yazin' : 'Message now';

  return (
    <div className={`min-h-screen ${bgClass} relative overflow-hidden`}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-green-500/5 via-blue-500/5 to-indigo-500/5 animate-pulse pointer-events-none z-0"></div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] w-full ${theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-md border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'} shadow-xl transition-all duration-300`}>
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <Logo className="h-10 md:h-[80px]" theme={theme} />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-3 md:gap-4">
            {/* Language Toggle */}
            <div className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-200'} rounded-full p-1`}>
              <button
                onClick={() => setLanguage('tr')}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${language === 'tr' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' : `${secondaryTextClass} hover:text-white`}`}
              >
                TR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${language === 'en' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : `${secondaryTextClass} hover:text-white`}`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'} transition`}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* User Info - If Logged In */}
            {isLoggedIn && userName && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5">
                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-white">{userName}</span>
              </div>
            )}

            {/* Credits Badge - If Logged In */}
            {isLoggedIn && credits !== undefined && (
              <>
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-white">{credits}</span>
                  <span className="text-xs text-slate-400 hidden sm:inline">Kredi</span>
                </div>
                {onBuyCreditsClick && (
                  <button
                    onClick={onBuyCreditsClick}
                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-lg"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t.header.buyCredits}
                  </button>
                )}
              </>
            )}

            {/* Admin Panel Button */}
            {userRole === 'admin' && onAdminClick && (
              <button
                onClick={onAdminClick}
                className="text-xs md:text-sm font-medium px-3 py-1.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20 transition-all"
              >
                ⚙️ Admin Panel
              </button>
            )}

            {/* Auth Buttons */}
            {isLoggedIn ? (
              <button
                onClick={onLogout}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                {t.header.signOut}
              </button>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className={`${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'} transition px-4 py-2`}
                >
                  {t.header.signIn}
                </button>
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-orange-500 via-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  {t.header.start}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {/* Mobile Credits */}
            {isLoggedIn && credits !== undefined && (
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 rounded-full px-3 py-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold text-white">{credits}</span>
              </div>
            )}

            <button
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                menu?.classList.toggle('hidden');
              }}
              className="p-2 text-slate-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div id="mobile-menu" className="hidden md:hidden bg-slate-900 border-t border-slate-800 p-4 absolute w-full left-0 animate-fadeIn">
          <div className="flex flex-col space-y-4">
            {/* User Info */}
            {isLoggedIn && userName && (
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <div className="font-medium text-white">{userName}</div>
                  {credits !== undefined && <div className="text-xs text-slate-400">{credits} Krediniz var</div>}
                </div>
              </div>
            )}

            {/* Mobile Actions */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Dil / Language</span>
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button onClick={() => setLanguage('tr')} className={`px-3 py-1 rounded text-xs ${language === 'tr' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>TR</button>
                <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded text-xs ${language === 'en' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>EN</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Tema / Theme</span>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 bg-slate-800 rounded-lg">
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>

            {userRole === 'admin' && onAdminClick && (
              <button onClick={onAdminClick} className="w-full py-3 bg-purple-900/30 text-purple-300 rounded-lg border border-purple-500/20 text-center text-sm">
                Admin Paneli
              </button>
            )}

            {isLoggedIn ? (
              <>
                {onBuyCreditsClick && (
                  <button onClick={onBuyCreditsClick} className="w-full py-3 bg-green-600/20 text-green-400 rounded-lg border border-green-500/20 text-center text-sm font-medium">
                    {t.header.buyCredits}
                  </button>
                )}
                <button onClick={onLogout} className="w-full py-3 bg-red-900/20 text-red-400 rounded-lg border border-red-500/20 text-center text-sm">
                  {t.header.signOut}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={onSignIn} className="py-3 bg-slate-800 text-slate-300 rounded-lg text-sm text-center">
                  {t.header.signIn}
                </button>
                <button onClick={onGetStarted} className="py-3 bg-cyan-600 text-white rounded-lg text-sm font-bold text-center">
                  {t.header.start}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Genişletilmiş */}
      <section className="relative pt-64 pb-32 px-6 z-10 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Arka Plan Videoları - 4 adet sırayla dönen */}
        {/* Hero Arka Plan Videoları - Güvenilir Oynatma */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          {/* Tek bir ana video kullanıyoruz mobil için, complexity'i düşürmek ve autoplay'i garanti etmek için */}
          {(demoHeroVideo || demoHeroVideo1) && (
            <video
              key={demoHeroVideo}
              src={demoHeroVideo}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              autoPlay
              loop
              muted
              playsInline={true}
              webkit-playsinline="true"
              poster="https://images.unsplash.com/photo-1558769132-cb1f16413c80?q=80&w=2574&auto=format&fit=crop"
            >
              <source src={demoHeroVideo} type="video/mp4" />
              Tarayıcınız video oynatmayı desteklemiyor.
            </video>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-30 w-full mt-24">
          <h1 className={`text-5xl md:text-7xl font-black ${textClass} mb-6 leading-tight drop-shadow-2xl`}>
            {t.hero.title}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-green-500 via-blue-500 to-indigo-600 drop-shadow-2xl">
              {t.hero.subtitle}
            </span>
          </h1>
          <p className={`text-xl ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-12 max-w-3xl mx-auto drop-shadow-lg`}>
            {t.hero.description}
          </p>

          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-orange-500 via-green-500 to-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 relative z-40"
          >
            {isLoggedIn ? t.header.continueUsing : t.hero.cta}
          </button>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className={`relative py-20 px-6 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-blue-50/40'} z-10`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className={`text-4xl font-bold ${textClass} text-center mb-4`}>
            {t.howItWorks.title}
          </h2>
          <p className={`${secondaryTextClass} text-center mb-16`}>
            {t.howItWorks.subtitle}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className={`${cardBg} rounded-2xl p-8 text-center hover:border-cyan-500 transition`}>
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-black text-white">01</span>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.howItWorks.step1Title}
              </h3>
              <p className={secondaryTextClass}>
                {t.howItWorks.step1Desc}
              </p>
            </div>

            {/* Step 2 */}
            <div className={`${cardBg} rounded-2xl p-8 text-center hover:border-purple-500 transition`}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-black text-white">02</span>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.howItWorks.step2Title}
              </h3>
              <p className={secondaryTextClass}>
                {t.howItWorks.step2Desc}
              </p>
            </div>

            {/* Step 3 */}
            <div className={`${cardBg} rounded-2xl p-8 text-center hover:border-orange-500 transition`}>
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-black text-white">03</span>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.howItWorks.step3Title}
              </h3>
              <p className={secondaryTextClass}>
                {t.howItWorks.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Showcase */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className={`text-4xl font-bold ${textClass} text-center mb-4`}>
            {t.showcase.title}
          </h2>
          <p className={`${secondaryTextClass} text-center mb-16`}>
            {t.showcase.subtitle}
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1: Çizimden Ürüne */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-cyan-500 transition`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold ${textClass}`}>{t.showcase.step1}</h3>
              </div>
              <p className={`${secondaryTextClass} mb-6`}>
                {t.showcase.step1Desc}
              </p>
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <BeforeAfterSlider
                  beforeImage={demoSketch}
                  afterImage={demoProduct}
                  beforeLabel={t.showcase.step1Before}
                  afterLabel={t.showcase.step1After}
                />
              </div>
            </div>

            {/* Step 2: Üründen Modele */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-purple-500 transition`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold ${textClass}`}>{t.showcase.step2}</h3>
              </div>
              <p className={`${secondaryTextClass} mb-6`}>
                {t.showcase.step2Desc}
              </p>
              <div className="aspect-[3/4] rounded-xl overflow-hidden">
                <BeforeAfterSlider
                  beforeImage={demoProduct}
                  afterImage={demoModel}
                  beforeLabel={t.showcase.step2Before}
                  afterLabel={t.showcase.step2After}
                />
              </div>
            </div>

            {/* Step 3: Modelden Videoya */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-orange-500 transition`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-2xl font-bold ${textClass}`}>{t.showcase.step3}</h3>
              </div>
              <p className={`${secondaryTextClass} mb-6`}>
                {t.showcase.step3Desc}
              </p>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-orange-900/30 to-red-900/30 border-2 border-orange-500/50 flex items-center justify-center">
                {demoVideo ? (
                  <video src={demoVideo} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                  <div className="text-center p-6">
                    <svg className="w-20 h-20 text-orange-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-orange-400 text-sm font-semibold">
                      {t.showcase.professionalVideo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition shadow-xl"
            >
              {t.showcase.tryNow}
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`py-20 px-6 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-slate-50'} z-10 relative`}>
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold ${textClass} text-center mb-16`}>
            {t.features.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={`${cardBg} rounded-2xl p-8 hover:border-cyan-500 transition`}>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold ${textClass} mb-3`}>{t.features.feature1Title}</h3>
              <p className={secondaryTextClass}>
                {t.features.feature1Desc}
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 hover:border-purple-500 transition`}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold ${textClass} mb-3`}>{t.features.feature2Title}</h3>
              <p className={secondaryTextClass}>
                {t.features.feature2Desc}
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 hover:border-orange-500 transition`}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold ${textClass} mb-3`}>{t.features.feature3Title}</h3>
              <p className={secondaryTextClass}>
                {t.features.feature3Desc}
              </p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 hover:border-green-500 transition`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold ${textClass} mb-3`}>{t.features.feature4Title}</h3>
              <p className={secondaryTextClass}>
                {t.features.feature4Desc}
              </p>
            </div>
          </div>

          {/* AI Prompt Feature Highlight */}
          <div className={`mt-16 bg-gradient-to-r ${theme === 'dark' ? 'from-cyan-900/30 to-purple-900/30 border-cyan-500/30' : 'from-cyan-50 to-purple-50 border-cyan-200'} border rounded-2xl p-8`}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className={`text-2xl font-bold ${textClass} mb-4`}>{t.features.aiPromptTitle}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">📍 {t.features.customBg}</h4>
                    <p className={`${descriptionTextClass} text-sm`}>
                      {t.features.customBgDesc}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">🏷️ {t.features.brandPlacement}</h4>
                    <p className={`${descriptionTextClass} text-sm`}>
                      {t.features.brandPlacementDesc}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-cyan-400 mb-2">✨ {t.features.sceneSetup}</h4>
                    <p className={`${descriptionTextClass} text-sm`}>
                      {t.features.sceneSetupDesc}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-purple-400 mb-2">🎨 {t.features.styleControl}</h4>
                    <p className={`${descriptionTextClass} text-sm`}>
                      {t.features.styleControlDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pixshop Section */}
      <section className="relative py-20 px-6 z-10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.pixshop.heroTitle}
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {t.pixshop.heroSubtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              {t.pixshop.featuresTitle}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1: Smart Retouch */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-cyan-500 transition">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{t.pixshop.feature1Title}</h4>
                <p className="text-slate-300 text-sm">{t.pixshop.feature1Desc}</p>
              </div>

              {/* Feature 2: Creative Filters */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-purple-500 transition">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{t.pixshop.feature2Title}</h4>
                <p className="text-slate-300 text-sm">{t.pixshop.feature2Desc}</p>
              </div>

              {/* Feature 3: Professional Atmosphere */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-orange-500 transition">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{t.pixshop.feature3Title}</h4>
                <p className="text-slate-300 text-sm">{t.pixshop.feature3Desc}</p>
              </div>

              {/* Feature 4: Upscale */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-green-500 transition">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{t.pixshop.feature4Title}</h4>
                <p className="text-slate-300 text-sm">{t.pixshop.feature4Desc}</p>
              </div>

              {/* Feature 5: Designer Outputs */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500 transition">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{t.pixshop.feature5Title}</h4>
                <p className="text-slate-300 text-sm">{t.pixshop.feature5Desc}</p>
              </div>
            </div>
          </div>

          {/* Why Pixshop */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-12 text-white">
            <h3 className="text-3xl font-bold text-white text-center mb-8">
              {t.pixshop.whyTitle}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-200">{t.pixshop.why1}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-200">{t.pixshop.why2}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-200">{t.pixshop.why3}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-slate-200">{t.pixshop.why4}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              {t.pixshop.cta}
            </h3>
            <p className="text-lg text-slate-300 mb-8">
              {t.pixshop.ctaSubtitle}
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition"
            >
              {t.pixshop.tryButton}
            </button>
          </div>
        </div>
      </section>

      {/* Fotomatik Section */}
      <section className="relative py-20 px-6 z-10 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.fotomatik.heroTitle}
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1: AI Transform */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-indigo-500 transition border border-slate-700 bg-slate-900/50`}>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.fotomatik.feature1Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.fotomatik.feature1Desc}</p>
            </div>

            {/* Feature 2: Visual Analysis */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-blue-500 transition border border-slate-700 bg-slate-900/50`}>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.fotomatik.feature2Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.fotomatik.feature2Desc}</p>
            </div>

            {/* Feature 3: Auto-Enhance */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-cyan-500 transition border border-slate-700 bg-slate-900/50`}>
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-cyan-500/20">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.fotomatik.feature3Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.fotomatik.feature3Desc}</p>
            </div>

            {/* Feature 4: Precise Editor */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-rose-500 transition border border-slate-700 bg-slate-900/50`}>
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-rose-500/20">
                04
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.fotomatik.feature4Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.fotomatik.feature4Desc}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition transform hover:scale-105"
            >
              {t.fotomatik.cta}
            </button>
          </div>
        </div>
      </section>

      {/* Tech Pack Section */}
      <section className={`relative py-20 px-6 z-10 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}>
              {t.techpack.heroTitle}
            </h2>
            <p className={`${descriptionTextClass} text-xl max-w-3xl mx-auto`}>
              {t.techpack.heroSubtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className={`${cardBg} rounded-2xl p-8 hover:border-purple-500 transition shadow-xl`}>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature1Title}</h4>
              <p className={`${secondaryTextClass} text-sm leading-relaxed`}>{t.techpack.feature1Desc}</p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 hover:border-blue-500 transition shadow-xl`}>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature2Title}</h4>
              <p className={`${secondaryTextClass} text-sm leading-relaxed`}>{t.techpack.feature2Desc}</p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 hover:border-green-500 transition shadow-xl`}>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature3Title}</h4>
              <p className={`${secondaryTextClass} text-sm leading-relaxed`}>{t.techpack.feature3Desc}</p>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 hover:border-orange-500 transition shadow-xl`}>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature4Title}</h4>
              <p className={`${secondaryTextClass} text-sm leading-relaxed`}>{t.techpack.feature4Desc}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105"
            >
              {t.techpack.cta}
            </button>
          </div>
        </div>
      </section>

      {/* Tech Pack Section */}
      <section className="relative py-20 px-6 z-10 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.techpack.heroTitle}
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              {t.techpack.heroSubtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-emerald-500 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
                01
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.techpack.feature1Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.techpack.feature1Desc}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-teal-500 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-teal-500/20">
                02
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.techpack.feature2Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.techpack.feature2Desc}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-lime-500 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-lime-500/20">
                03
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.techpack.feature3Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.techpack.feature3Desc}</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 hover:border-green-400 transition">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-green-400/20">
                04
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{t.techpack.feature4Title}</h4>
              <p className="text-slate-300 leading-relaxed">{t.techpack.feature4Desc}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition transform hover:scale-105"
            >
              {t.techpack.cta}
            </button>
          </div>
        </div>
      </section>

      {/* Pricing - Credit Packages Only */}
      <section className={`py-20 px-6 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-cyan-50/40'} z-10 relative`} id="pricing">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold ${textClass} text-center mb-4`}>
            {t.pricing.creditPackagesTitle}
          </h2>
          <p className={`${secondaryTextClass} text-center mb-12`}>
            {t.pricing.creditPackagesSubtitle}
          </p>

          {/* Credit Packages */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className={`${cardBg} rounded-2xl p-8 text-center hover:border-cyan-500 transition`}>
              <div className={`text-4xl font-bold ${textClass} mb-3`}>{creditPackages.small.credits}</div>
              <div className={`text-sm ${secondaryTextClass} mb-4`}>{t.pricing.credits}</div>
              <div className="text-3xl font-bold text-cyan-400 mb-4">{creditPackages.small.price}₺</div>
              <div className={`text-sm ${secondaryTextClass} mb-6`}>
                1 {t.pricing.credit} = {(creditPackages.small.price / creditPackages.small.credits).toFixed(2)}₺
              </div>
              <button
                onClick={onGetStarted}
                className={`w-full ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} px-6 py-3 rounded-lg font-semibold transition`}
              >
                {t.pricing.buyNow}
              </button>
            </div>

            <div className={`bg-gradient-to-b ${theme === 'dark' ? 'from-cyan-900/50 to-slate-900/50' : 'from-cyan-100 to-white'} border-2 border-cyan-500 rounded-2xl p-8 text-center relative`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {t.pricing.popular}
              </div>
              <div className={`text-4xl font-bold ${textClass} mb-3`}>{creditPackages.medium.credits}</div>
              <div className={`text-sm ${secondaryTextClass} mb-4`}>{t.pricing.credits}</div>
              <div className="text-3xl font-bold text-cyan-400 mb-4">{creditPackages.medium.price}₺</div>
              <div className={`text-sm ${secondaryTextClass} mb-6`}>
                1 {t.pricing.credit} = {(creditPackages.medium.price / creditPackages.medium.credits).toFixed(2)}₺
              </div>
              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                {t.pricing.buyNow}
              </button>
            </div>

            <div className={`${cardBg} rounded-2xl p-8 text-center hover:border-purple-500 transition`}>
              <div className={`text-4xl font-bold ${textClass} mb-3`}>{creditPackages.large.credits}</div>
              <div className={`text-sm ${secondaryTextClass} mb-4`}>{t.pricing.credits}</div>
              <div className="text-3xl font-bold text-cyan-400 mb-4">{creditPackages.large.price}₺</div>
              <div className={`text-sm ${secondaryTextClass} mb-6`}>
                1 {t.pricing.credit} = {(creditPackages.large.price / creditPackages.large.credits).toFixed(2)}₺
              </div>
              <button
                onClick={onGetStarted}
                className={`w-full ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} px-6 py-3 rounded-lg font-semibold transition`}
              >
                {t.pricing.buyNow}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className={`mt-12 ${theme === 'dark' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200'} border rounded-2xl p-6 max-w-4xl mx-auto`}>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className={`text-lg font-semibold ${textClass} mb-3`}>
                  {t.pricing.creditUsage}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-cyan-400 font-semibold text-sm mb-2">
                      {t.pricing.liveModelVideo}
                    </h5>
                    <ul className={`space-y-1 ${descriptionTextClass} text-sm`}>
                      <li>• {t.pricing.sketchToProduct}</li>
                      <li>• {t.pricing.productToModel}</li>
                      <li>• {t.pricing.videoGeneration}</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-cyan-400 font-semibold text-sm mb-2">
                      {t.pricing.otherModules}
                    </h5>
                    <ul className={`space-y-1 ${descriptionTextClass} text-sm`}>
                      <li>• {t.pricing.techDrawing}</li>
                      <li>• {t.pricing.pixshopEdit}</li>
                      <li>• {t.pricing.fotomatik}</li>
                    </ul>
                  </div>
                </div>
                <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-cyan-500/20' : 'border-cyan-200'}`}>
                  <ul className={`space-y-1 ${descriptionTextClass} text-sm`}>
                    <li>✨ {t.pricing.freeCredits}</li>
                    <li>♾️ {t.pricing.creditsNeverExpire}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold ${textClass} text-center mb-16`}>
            {t.testimonials.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`${cardBg} rounded-2xl p-8`}>
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className={`${descriptionTextClass} mb-6`}>
                {t.testimonials.quote1}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full"></div>
                <div>
                  <div className={`font-semibold ${textClass}`}>{t.testimonials.name1}</div>
                  <div className={`text-sm ${secondaryTextClass}`}>Fashion Designer</div>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-2xl p-8`}>
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className={`${descriptionTextClass} mb-6`}>
                {t.testimonials.quote2}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full"></div>
                <div>
                  <div className={`font-semibold ${textClass}`}>{t.testimonials.name2}</div>
                  <div className={`text-sm ${secondaryTextClass}`}>Brand Owner</div>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-2xl p-8`}>
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className={`${descriptionTextClass} mb-6`}>
                {t.testimonials.quote3}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-full"></div>
                <div>
                  <div className={`font-semibold ${textClass}`}>{t.testimonials.name3}</div>
                  <div className={`text-sm ${secondaryTextClass}`}>E-commerce Manager</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Best Fashion - Comparison */}
      <section className={`py-20 px-6 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-purple-50/40'} z-10 relative`}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-4xl font-bold ${textClass} text-center mb-4`}>
            {t.comparison.title}
          </h2>
          <p className={`${secondaryTextClass} text-center mb-16`}>
            {t.comparison.subtitle}
          </p>

          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
                <div className="text-red-400 mb-2">❌</div>
                <p className={descriptionTextClass}>{t.comparison.needPrompts}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-xl p-6 text-center`}>
                <div className="text-green-400 mb-2">✅</div>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-semibold`}>{t.comparison.readyOptions}</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
                <div className="text-red-400 mb-2">❌</div>
                <p className={descriptionTextClass}>{t.comparison.multipleTools}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-xl p-6 text-center`}>
                <div className="text-green-400 mb-2">✅</div>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-semibold`}>{t.comparison.onePlatform}</p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
                <div className="text-red-400 mb-2">❌</div>
                <p className={descriptionTextClass}>{t.comparison.expensive}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-xl p-6 text-center`}>
                <div className="text-green-400 mb-2">✅</div>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-semibold`}>{t.comparison.lowCost}</p>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`${theme === 'dark' ? 'bg-red-900/20 border-red-500/30' : 'bg-red-50 border-red-200'} border rounded-xl p-6 text-center`}>
                <div className="text-red-400 mb-2">❌</div>
                <p className={descriptionTextClass}>{t.comparison.incorrectPlacement}</p>
              </div>
              <div className={`${theme === 'dark' ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-200'} border rounded-xl p-6 text-center`}>
                <div className="text-green-400 mb-2">✅</div>
                <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-semibold`}>{t.comparison.allDetails}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold text-lg">
              <span>🚀</span>
              <span>{t.comparison.faster}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-20 px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className={`${cardBg} rounded-2xl p-8`}>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">10K+</div>
              <div className={secondaryTextClass}>{t.stats.videosCreated}</div>
            </div>
            <div className={`${cardBg} rounded-2xl p-8`}>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">50K+</div>
              <div className={secondaryTextClass}>{t.stats.imagesCreated}</div>
            </div>
            <div className={`${cardBg} rounded-2xl p-8`}>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-2">98%</div>
              <div className={secondaryTextClass}>{t.stats.satisfiedUsers}</div>
            </div>
            <div className={`${cardBg} rounded-2xl p-8`}>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">24/7</div>
              <div className={secondaryTextClass}>{t.stats.platformAccess}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-20 px-6 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-rose-50/40'} z-10 relative`}>
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-4xl font-bold ${textClass} text-center mb-16`}>
            {t.faq.title}
          </h2>
          <div className="space-y-4">
            <details className={`${cardBg} rounded-xl p-6 group`}>
              <summary className={`text-xl font-semibold ${textClass} cursor-pointer list-none flex items-center justify-between`}>
                <span>{t.faq.q1}</span>
                <svg className={`w-5 h-5 ${secondaryTextClass} group-open:rotate-180 transition`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className={`mt-4 ${secondaryTextClass}`}>
                {t.faq.a1}
              </p>
            </details>

            <details className={`${cardBg} rounded-xl p-6 group`}>
              <summary className={`text-xl font-semibold ${textClass} cursor-pointer list-none flex items-center justify-between`}>
                <span>{t.faq.q2}</span>
                <svg className={`w-5 h-5 ${secondaryTextClass} group-open:rotate-180 transition`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className={`mt-4 ${secondaryTextClass}`}>
                {t.faq.a2}
              </p>
            </details>

            <details className={`${cardBg} rounded-xl p-6 group`}>
              <summary className={`text-xl font-semibold ${textClass} cursor-pointer list-none flex items-center justify-between`}>
                <span>{t.faq.q3}</span>
                <svg className={`w-5 h-5 ${secondaryTextClass} group-open:rotate-180 transition`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className={`mt-4 ${secondaryTextClass}`}>
                {t.faq.a3}
              </p>
            </details>

            <details className={`${cardBg} rounded-xl p-6 group`}>
              <summary className={`text-xl font-semibold ${textClass} cursor-pointer list-none flex items-center justify-between`}>
                <span>{t.faq.q4}</span>
                <svg className={`w-5 h-5 ${secondaryTextClass} group-open:rotate-180 transition`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className={`mt-4 ${secondaryTextClass}`}>
                {t.faq.a4}
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-20 px-6 ${theme === 'dark' ? 'bg-gradient-to-r from-cyan-900/80 to-blue-900/80' : 'bg-gradient-to-r from-cyan-100 to-blue-100'} z-10 relative`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
            {t.cta.title}
          </h2>
          <p className={`text-xl ${descriptionTextClass} mb-8`}>
            {t.cta.subtitle}
          </p>
          <button
            onClick={onGetStarted}
            className={`${theme === 'dark' ? 'bg-white text-slate-900' : 'bg-cyan-600 text-white'} px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition`}
          >
            {t.cta.button}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-900/80' : 'border-slate-200 bg-white'} z-10 relative`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            {/* Logo */}
            <Logo className="h-16 md:h-[120px]" theme={theme} />

            {/* Copyright */}
            <p className={`${secondaryTextClass} text-center`}>&copy; 2024 Fasheone. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
      <WhatsAppPanel
        phoneNumber={whatsappNumber}
        message={whatsappMessage}
        title="WhatsApp"
        subtitle={whatsappSubtitle}
      />
    </div>
  );
};
