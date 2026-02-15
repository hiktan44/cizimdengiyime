import React, { useState, useEffect } from 'react';
import { useI18n, TranslationRecord } from '../lib/i18n';
import { Logo } from '../components/Logo';
import { CREDIT_PACKAGES } from '../lib/supabase';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { getPublicHeroVideos, getPublicShowcaseImages, getSiteSettings } from '../lib/adminService';
import { trackEvent, ANALYTICS_EVENTS } from '../utils/analytics';
import { HeroVideoCarousel } from '../components/HeroVideoCarousel';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onNavigate?: (page: string, tab?: string) => void;
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
  adGeniusMainUrl?: string;
  adGeniusCollageUrl?: string;
  logoMediaUrl?: string;
}

type Theme = 'light' | 'dark';
const trLanding = {
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
    useCases: {
      title: 'Güçlü Özellikler',
      subtitle: 'Her İhtiyaca Özel Çözümler',
      feature1: {
        title: 'Çizimden Ürüne',
        desc: 'Moda çizimlerinizi ultra-gerçekçi hayalet manken ürün fotoğraflarına dönüştürün. Basit karakalem veya dijital teknik çizimlerinizi yükleyin, yapay zeka kumaş, dikiş ve detayları algılayarak profesyonel ürün görselleri oluşturur.',
        features: [
          'Otomatik kumaş doku ve renk analizi',
          'Dikiş ve detay korumalı dönüşüm',
          'Stüdyo kalitesinde ışıklandırma',
          'E-ticaret için optimize edilmiş çıktılar'
        ]
      },
      feature2: {
        title: 'Canlı Model',
        desc: 'Ürünlerinizi gerçek modeller üzerinde görün. Farklı ten rengi, saç stili ve poz tipleriyle sahip yapay zeka modelleriyle stüdyo çekimi kalitesinde sonuçlar alın. Fiziksel model maliyetlerinden kurtulun.',
        features: [
          'Çeşitli etnik köken ve vücut tipi seçenekleri',
          '12+ farklı profesyonel poz',
          'Özelleştirilebilir arka plan ve mekan',
          'Tutarlı model kullanımı ile marka kimliği'
        ]
      },
      feature3: {
        title: 'Video Oluşturma',
        desc: 'Görsellerinizi 5-10 saniyelik profesyonel videolara dönüştürün. Modelinizi doğal şekilde döndürün, poz verdirin ve sinematik videolar oluşturun. Sosyal medya ve e-ticaret için mükemmel içerik.',
        features: [
          'Sinematik kamera hareketleri',
          'Yavaş çekim (slow-motion) efektleri',
          'Sosyal medya formatları (Reels, TikTok, Shorts)',
          'Yüksek çözünürlük 2K/4K çıktı'
        ]
      },
      feature4: {
        title: 'Teknik Çizim (Tech Pack)',
        desc: 'Ürün fotoğraflarınızı üretim için detaylı teknik çizimlere dönüştürün. Yapay zeka, ürün üzerindeki dikiş yollarını ve kalıp parçalarını otomatik olarak algılayarak net çizgilerle sunar.',
        features: [
          'Otomatik dikiş ve kalıp analizi',
          'Üretime hazır teknik çizimler',
          'Ölçü ve detay korumalı dönüşüm',
          'Tedarikçi paylaşımı için ideal format'
        ]
      },
      feature5: {
        title: 'Pixshop - Fotoğraf Düzenleme',
        desc: 'AI destekli profesyonel rötuş, filtre, ayarlama ve 4K upscaling. Yüz değiştirme ve logo ekleme özellikleriyle fotoğraflarınızı saniyeler içinde mükemmelleştirin. Photoshop bilgisi gerektirmez.',
        features: [
          'Akıllı rötuş ve renk düzeltme',
          'Profesyonel filtre ve atmosfer ayarları',
          '2K/4K upscaling teknolojisi',
          'Yüz değiştirme ve logo/aksesuar ekleme'
        ]
      },
      feature6: {
        title: 'Fotomatik - Toplu İşleme',
        desc: 'Birden fazla görseli aynı anda işleyin. Arka plan kaldırma, toplu düzenleme ve hızlı katalog hazırlama. Saatler süren manuel işlemleri dakikalara indirin.',
        features: [
          'Toplu arka plan kaldırma',
          'Otomatik görsel iyileştirme',
          'Hızlı katalog hazırlama',
          'Prompt mühendisliği ve analiz'
        ]
      },
      collage: {
        title: 'Kolaj Oluşturma',
        desc: 'Tek bir üründen birden fazla varyasyon oluşturun. Farklı renkler, pozlar ve arka planlarla zengin kataloglar hazırlayın. 4-16 görseli tek bir kolajda birleştirerek e-ticaret ve sosyal medya için etkileyici içerikler üretin.',
        features: [
          'Otomatik grid düzeni ve profesyonel tasarım',
          'Farklı renk ve stil varyasyonları',
          'E-ticaret katalogları için ideal format',
          'Sosyal medya paylaşımları için optimize edilmiş boyutlar'
        ]
      },
      adMedia: {
        title: 'Reklam Medyası',
        desc: 'Profesyonel reklam kampanyaları için stüdyo kalitesinde görseller ve videolar üretin. Farklı mekanlar, modeller ve senaryolarla markanızı öne çıkarın. AI ile saniyeler içinde billboard, dergi ve dijital reklam içerikleri oluşturun.',
        features: [
          'Stüdyo çekimi kalitesinde model görselleri',
          'Özelleştirilebilir arka plan ve mekan seçenekleri',
          '5-10 saniyelik sinematik video içerikler',
          'Marka kimliğine uygun stil ve atmosfer kontrolü'
        ]
      },
      ecommerce: {
        title: 'E-ticaret Çözümleri',
        desc: 'Online mağazanız için eksiksiz görsel içerik paketi hazırlayın. Ürün fotoğrafları, model görselleri, teknik çizimler ve tanıtım videoları tek platformda. Katalog hazırlama sürenizi %90 azaltın, maliyetleri minimize edin.',
        features: [
          'Hayalet manken ve model görselleri',
          'Farklı açılardan ürün fotoğrafları',
          'Teknik çizim ve ölçü tabloları',
          'Toplu işleme ile hızlı katalog hazırlama'
        ]
      }
    }
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
    step3Desc: 'Statik görsellerle sınırlı kalmayın. Modelinizi doğal şekilde döndürün, poz verdirin ve sinematik videolar oluşturun. Sosyal medya ve e-ticaret için mükemmel içerik.',
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
    feature5Title: 'Pixshop - Fotoğraf Düzenleme',
    feature5Desc: 'AI destekli profesyonel rötuş, filtre, ayarlama ve 4K upscaling. Yüz değiştirme ve logo ekleme.',
    feature6Title: 'Fotomatik - Toplu İşleme',
    feature6Desc: 'Birden fazla görseli aynı anda işleyin. Arka plan kaldırma, toplu düzenleme ve hızlı katalog hazırlama.',
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
  collage: {
    title: '🎨 Kolaj Stüdyosu: Çoklu Görsel Kompozisyon Aracı',
    description: 'Birden fazla görseli saniyeler içinde profesyonel kolajlara dönüştürün. AI destekli kompozisyon motoru, görsellerinizi otomatik olarak analiz eder ve mükemmel düzenleme önerileri sunar.',
    featuresTitle: '💎 Kolaj Seçenekleri',
    features: [
      { title: '1. Standart Kolaj', items: ['Geleneksel Düzen: 2-6 arası görseli yan yana veya alt alta saniyeler içinde birleştirir.', 'Hızlı Katalog: Ürün varyasyonlarını ve detaylarını topluca sergilemek için idealdir.', 'Önizleme Kolaylığı: Müşterilerinize ürün gruplarını tek bakışta sunmanızı sağlar.'] },
      { title: '2. Sihirli Kolaj (AI)', items: ['Profesyonel Flat Lay: Tek bir kombin fotoğrafını analiz ederek lüks dergi çekimi estetiğinde bir flat-lay kompozisyon oluşturur.', 'Otomatik Ayrıştırma: Kombindeki parçaları (üret, alt, çanta vb.) yapay zeka ile tanır ve tek tek resmeder.', 'Dergi Modu: İndirilebilir, fiyat etiketli profesyonel bir katalog sayfası üretir.'] },
      { title: '3. Ürün Kolajı', items: ['Estetik Kompozisyon: Farklı zamanlarda çekilmiş ürünleri tek bir sanatsal düzende birleştirir.', 'Marka Kimliği: Tüm ürünleriniz için tutarlı arka plan ve ışık ayarları sunar.', 'Sınırsız Varyasyon: Farklı renk ve model seçeneklerini şık bir pano üzerinde sergiler.'] },
      { title: '4. Video Dönüşümü', items: ['Dinamik İçerik: Oluşturduğunuz kolajları tek tıkla 2K sinematik videolara dönüştürün.', 'Sosyal Medya Hazır: Instagram Reels, TikTok ve Shorts için optimize edilmiş boyutlar.', 'Müzikli Geçişler: Ürünlerinizi daha etkileyici kılan profesyonel kamera hareketleri.'] }
    ],
    benefitsTitle: '🎯 Kullanım Alanları',
    benefits: [
      { title: '✅ E-Ticaret Katalogları', desc: 'Ürün varyasyonlarını tek bir görselde sergileyin. Farklı renk ve model seçeneklerini müşterilerinize etkili şekilde sunun.' },
      { title: '✅ Sosyal Medya İçeriği', desc: 'Instagram grid postları, Pinterest panoları ve Facebook katalogları için profesyonel kolajlar oluşturun.' },
      { title: '✅ Lookbook Hazırlama', desc: 'Koleksiyon lansmanları için etkileyici lookbook sayfaları hazırlayın. Tüm parçaları bir arada gösterin.' },
      { title: '✅ Hızlı Karşılaştırma', desc: 'Önce/Sonra karşılaştırmaları veya farklı stil seçeneklerini yan yana gösterin.' }
    ],
    creditInfo: 'Kolaj oluşturma: 2 kredi | Video dönüşümü: +3 kredi'
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
    enterprise: 'Kurumsal',
    enterpriseTitle: 'Kurumsal Çözümler',
    enterpriseSubtitle: 'Büyük ekipler ve şirketler için özel çözümler',
    contactUs: 'İletişime Geç',
    customCredits: 'Özel Kredi Paketi',
    unlimitedUsers: 'Sınırsız Kullanıcı',
    prioritySupport: 'Öncelikli Destek',
    dedicatedAccount: 'Özel Hesap Yöneticisi',
    customIntegration: 'Özel Entegrasyon',
    apiAccess: 'API Erişimi',
    customTraining: 'Özel Eğitim',
    sla: 'SLA Garantisi',
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
    feature6Title: 'Yüz Değiştirme (Face Swap)',
    feature6Desc: 'Profesyonel yüz değiştirme teknolojisi ile fotoğraflardaki yüzleri doğal ve gerçekçi şekilde değiştirin. Model çekimlerinde, kataloglarda veya sosyal medya içeriklerinde kullanın.',
    feature7Title: 'Logo ve Aksesuar Ekleme',
    feature7Desc: 'Fotoğraflarınıza logo, marka etiketleri veya aksesuar ekleyin. AI, eklediğiniz öğeleri doğal perspektif ve ışıklandırma ile görüntüye entegre eder.',
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
    feature1Desc: 'Yapay zeka teknolojisini kullanarak, bir fotoğraftaki ana objeyi veya kişiyi (yüz hatlarını koruyarak) tamamen farklı bir senaryoya yerleştirebilir. Örneğin; evde çekilmiş bir fotoğrafı "Venedik sahilinde yürüyüş yapan" bir sahneye dönüştürebilir.',
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
  adgenius: {
    title: '🚀 AdGenius AI: Yapay Zeka Destekli Akıllı Reklam ve Prodüksiyon Merkezi',
    description: 'AdGenius AI, sıradan bir ürün fotoğrafını saniyeler içinde profesyonel bir pazarlama varlığına dönüştüren, uçtan uca bir prodüksiyon çözümüdür. Fiziksel stüdyo maliyetlerini, manken kiralama süreçlerini ve uzun süren grafik tasarım işlerini ortadan kaldırarak ürününüzü doğrudan satışa hazır hale getirir.',
    featuresTitle: '💎 Temel Özellikler ve Yetenekler',
    features: [
      {
        title: '1. Akıllı Ürün Analizi ve İçerik Yazımı',
        items: [
          'SEO Uyumlu Başlıklar: Pazaryeri algoritmalarına uygun, tıklanma oranı yüksek başlıklar üretir.',
          'İkna Edici Açıklamalar: Ürünün hikayesini anlatan ve satın alma motivasyonunu tetikleyen profesyonel pazarlama metinleri yazar.',
          'Bullet Point Özellik Listesi: Amazon, Trendyol ve Hepsiburada gibi platformlar için hazır teknik özellik maddeleri oluşturur.'
        ]
      },
      {
        title: '2. Profesyonel Mankenli Çekimler',
        items: [
          '12 Farklı Poz: Önden, arkadan, profilden, yürüyüş anından ve sanatsal açılardan oluşan tam bir katalog seti sunar.',
          'Model Tutarlılığı: Tüm çekimlerde aynı yüz ve vücut tipine sahip manken kullanarak marka bütünlüğünü korur.'
        ]
      },
      {
        title: '3. Sınırsız Kampanya Konseptleri',
        items: [
          'Stil Seçenekleri: Lüks Mağaza, Minimalist Stüdyo, Cyberpunk, Doğal Gün Işığı, Vintage ve daha fazlası.',
          'Mekan Özgürlüğü: Ürünü bir şehir sokağında, lüks bir otel lobisinde veya egzotik bir plajda sergileyin.'
        ]
      },
      {
        title: '4. Gelişmiş Doku ve Renk Manipülasyonu',
        items: [
          'Renk Değişimi: Ürünün kalıbını bozmadan istediğiniz herhangi bir renge dönüştürür.',
          'Doku Eşleştirme: Yüklediğiniz bir desen örneğini, kıyafetin kıvrımlarına uyumlu şekilde giydirir.'
        ]
      },
      {
        title: '5. Sinematik Reklam Videoları',
        items: [
          'Akıcı Hareketler: Kumaş dokusunu ve modelin duruşunu vurgulayan yavaş çekim videolar.',
          'Yüksek Çözünürlük: Sosyal medya (Reels, TikTok, Shorts) için optimize edilmiş çıktılar.'
        ]
      },
      {
        title: '6. Marka ve Metin Entegrasyonu',
        items: [
          'Logo/Metin Yerleştirme: Görselin üzerine marka isminizi veya kampanya sloganınızı estetik bir şekilde işler.'
        ]
      }
    ],
    showcase: {
      title1: '📍 Profesyonel Model Çekimi',
      title2: '✨ Akıllı Reklam Varyasyonları',
      hover1: 'Üst düzey prodüksiyon kalitesi, sıfır maliyet.',
      hover2: 'Tek bir üründen onlarca kampanya konsepti.'
    },
    benefitsTitle: '🎯 E-Ticaret İşletmeleri İçin Sağladığı Faydalar',
    benefits: [
      {
        title: '✅ "Hemen Yükle, Hemen Sat" Kolaylığı',
        desc: 'Geleneksel yöntemde haftalar süren süreç; AdGenius ile ürünün fotoğrafını yüklediğiniz anda görsel + video + başlık + açıklama setine sahip olursunuz.'
      },
      {
        title: '✅ %90\'a Varan Maliyet Tasarrufu',
        desc: 'Işık, camera ekipmanı, manken, makyaj artisti, stüdyo kirası ve metin yazarı maliyetlerini ortadan kaldırır.'
      },
      {
        title: '✅ Global Standartlarda Kalite',
        desc: 'En yeni yapay zeka modellerini kullanarak, dünyanın en ünlü moda markalarının kullandığı estetik standartlarda görseller üretir.'
      },
      {
        title: '✅ Kişiselleştirilmiş Prodüksiyon',
        desc: 'Özel İstekler bölümü sayesinde yapay zekaya spesifik komutlar vererek tam hayalinizdeki sahneyi kurgulayabilirsiniz.'
      }
    ]
  },
  footer: {
    quickLinks: 'Hızlı Linkler',
    features: 'Özellikler',
    howItWorks: 'Nasıl Çalışır?',
    pricing: 'Fiyatlandırma',
    examples: 'Örnekler',
    faq: 'Sıkça Sorulan Sorular',
    legal: 'Hukuki',
    privacyPolicy: 'Gizlilik Politikası',
    kvkk: 'KVKK Aydınlatma Metni',
    termsOfService: 'Fasheone Hizmet Sözleşmesi',
    cookiePolicy: 'Çerez Politikası',
    refundPolicy: 'İade ve İptal Koşulları',
    aiUsage: 'AI Kullanım Bildirimi',
    contact: 'İletişim',
    support: '7/24 Destek',
    allRights: '© 2024 Fasheone. Tüm hakları saklıdır.',
  },
};

const landingTranslations: TranslationRecord<typeof trLanding> = {
  tr: trLanding,
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
      useCases: {
        title: 'Powerful Features',
        subtitle: 'Solutions for Every Need',
        feature1: {
          title: 'Sketch to Product',
          desc: 'Transform your fashion sketches into ultra-realistic ghost mannequin product photos. Upload your simple charcoal or digital technical drawings, AI detects fabric, stitching and details to create professional product images.',
          features: [
            'Automatic fabric texture and color analysis',
            'Stitch and detail preservation',
            'Studio quality lighting',
            'Optimized outputs for E-commerce'
          ]
        },
        feature2: {
          title: 'Live Model',
          desc: 'See your products on real models. Get studio-quality results with AI models featuring different skin tones, hairstyles, and poses. Eliminate physical model costs.',
          features: [
            'Various ethnicity and body type options',
            '12+ different professional poses',
            'Customizable background and setting',
            'Brand identity with consistent model usage'
          ]
        },
        feature3: {
          title: 'Video Generation',
          desc: 'Transform your visuals into 5-10 second professional videos. Create cinematic videos for your model walking, turning, or posing. Perfect content for social media and e-commerce.',
          features: [
            'Cinematic camera movements',
            'Slow-motion effects',
            'Social media formats (Reels, TikTok, Shorts)',
            'High resolution 2K/4K output'
          ]
        },
        feature4: {
          title: 'Technical Drawing (Tech Pack)',
          desc: 'Transform your product photos into detailed technical drawings for production. AI automatically detects stitch paths and pattern pieces on the product providing clear lines.',
          features: [
            'Automatic stitch and pattern analysis',
            'Production-ready technical drawings',
            'Measurement and detail preservation',
            'Ideal format for supplier sharing'
          ]
        },
        feature5: {
          title: 'Pixshop - Photo Editing',
          desc: 'AI-powered professional retouching, filters, adjustments, and 4K upscaling. Perfect your photos in seconds with face swap and logo addition features. No Photoshop knowledge required.',
          features: [
            'Smart retouching and color correction',
            'Professional filter and atmosphere settings',
            '2K/4K upscaling technology',
            'Face swap and logo/accessory addition'
          ]
        },
        feature6: {
          title: 'Fotomatik - Batch Processing',
          desc: 'Process multiple images simultaneously. Background removal, batch editing, and quick catalog preparation. Reduce manual tasks from hours to minutes.',
          features: [
            'Batch background removal',
            'Automatic image enhancement',
            'Quick catalog preparation',
            'Prompt engineering and analysis'
          ]
        },
        collage: {
          title: 'Collage Creation',
          desc: 'Create multiple variations from a single product. Prepare rich catalogs with different colors, poses, and backgrounds. Produce impressive content for e-commerce and social media by combining 4-16 images in a single collage.',
          features: [
            'Automatic grid layout and professional design',
            'Different color and style variations',
            'Ideal format for e-commerce catalogs',
            'Optimized sizes for social media posts'
          ]
        },
        adMedia: {
          title: 'Ad Media',
          desc: 'Produce studio-quality visuals and videos for professional ad campaigns. Highlight your brand with different settings, models, and scenarios. Create billboard, magazine, and digital ad content in seconds with AI.',
          features: [
            'Studio-quality model visuals',
            'Customizable background and setting options',
            '5-10 second cinematic video content',
            'Style and atmosphere control suitable for brand identity'
          ]
        },
        ecommerce: {
          title: 'E-commerce Solutions',
          desc: 'Prepare a complete visual content package for your online store. Product photos, model visuals, technical drawings, and promotional videos in one platform. Reduce your catalog preparation time by 90% and minimize costs.',
          features: [
            'Ghost mannequin and model visuals',
            'Product photos from different angles',
            'Technical drawing and size charts',
            'Quick catalog preparation with batch processing'
          ]
        }
      }
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
      feature5Title: 'Pixshop - Photo Editing',
      feature5Desc: 'AI-powered professional retouching, filters, adjustments, and 4K upscaling. Face swap and logo addition.',
      feature6Title: 'Fotomatik - Batch Processing',
      feature6Desc: 'Process multiple images simultaneously. Background removal, batch editing, and quick catalog preparation.',
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
      enterprise: 'Enterprise',
      enterpriseTitle: 'Enterprise Solutions',
      enterpriseSubtitle: 'Custom solutions for large teams and companies',
      contactUs: 'Contact Us',
      customCredits: 'Custom Credit Package',
      unlimitedUsers: 'Unlimited Users',
      prioritySupport: 'Priority Support',
      dedicatedAccount: 'Dedicated Account Manager',
      customIntegration: 'Custom Integration',
      apiAccess: 'API Access',
      customTraining: 'Custom Training',
      sla: 'SLA Guarantee',
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
      feature6Title: 'Face Swap',
      feature6Desc: 'Professional face swap technology to change faces in photos naturally and realistically. Use in model shoots, catalogs, or social media content.',
      feature7Title: 'Logo & Accessory Addition',
      feature7Desc: 'Add logos, brand labels, or accessories to your photos. AI integrates added elements with natural perspective and lighting into the image.',
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
      feature1Desc: 'Using advanced AI technology, it can place the main object or person from a photo into a completely different scenario while preserving facial features. For example, it can transform a photo taken at home into a scene "walking on the Venice beach".',
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
    adgenius: {
      title: '🚀 AdGenius AI: AI-Powered Smart Advertising & Production Hub',
      description: 'AdGenius AI is an end-to-end production solution that transforms an ordinary product photo into a professional marketing asset in seconds. It eliminates physical studio costs, model hiring processes, and long graphic design tasks, making your product ready for sale instantly.',
      featuresTitle: '💎 Key Features & Capabilities',
      features: [
        {
          title: '1. Smart Product Analysis & Copywriting',
          items: [
            'SEO-Friendly Titles: Generates high-click-rate titles optimized for marketplace algorithms.',
            'Persuasive Descriptions: Writes professional marketing copy that tells the product story and triggers motivation.',
            'Bullet Point Feature Lists: Ready-to-use lists for platforms like Amazon, eBay, and Etsy.'
          ]
        },
        {
          title: '2. Professional Model Shoots',
          items: [
            '12 Different Poses: Full catalog set from front, back, profile, walking, and artistic angles.',
            'Model Consistency: Maintains brand integrity by using models with the same facial and body types.'
          ]
        },
        {
          title: '3. Unlimited Campaign Concepts',
          items: [
            'Style Options: Luxury Store, Minimalist Studio, Cyberpunk, Natural Daylight, Vintage, and more.',
            'Location Freedom: Showcase products in a city street, luxury hotel lobby, or an exotic beach.'
          ]
        },
        {
          title: '4. Advanced Texture & Color Manipulation',
          items: [
            'Color Swapping: Transform product colors without losing silhouette or texture.',
            'Pattern Mapping: Realistically apply pattern samples to garment folds and lighting.'
          ]
        },
        {
          title: '5. Cinematic Ad Videos',
          items: [
            'Fluid Motion: Slow-motion videos highlighting fabric texture and model presence.',
            'High Resolution: Optimized outputs for social media (Reels, TikTok, Shorts).'
          ]
        },
        {
          title: '6. Brand & Text Integration',
          items: [
            'Logo/Text Placement: Esthetically embeds brand names or campaign slogans onto visuals.'
          ]
        }
      ],
      showcase: {
        title1: '📍 Professional Model Shoot',
        title2: '✨ Smart Ad Variations',
        hover1: 'High-end production quality, zero cost.',
        hover2: 'Dozens of campaign concepts from a single product.'
      },
      benefitsTitle: '🎯 Benefits for E-Commerce Businesses',
      benefits: [
        {
          title: '✅ "Upload Now, Sell Now" Ease',
          desc: 'Get full visual + video + title + description sets instantly, reducing weeks of work to seconds.'
        },
        {
          title: '✅ Up to 90% Cost Savings',
          desc: 'Eliminates costs for lighting, cameras, models, makeup artists, studios, and copywriters.'
        },
        {
          title: '✅ Global Quality Standards',
          desc: 'Uses latest AI models to produce aesthetics matching world-renowned fashion brands.'
        },
        {
          title: '✅ Personalized Production',
          desc: 'Give specific AI commands like "Model looking right" or "City lights in background" for custom scenes.'
        }
      ]
    },
    collage: {
      title: '🎨 Collage Studio: Multi-Image Composition Tool',
      description: 'Transform multiple images into professional collages in seconds. AI-powered composition engine automatically analyzes your visuals and provides perfect layout suggestions.',
      featuresTitle: '💎 Collage Options',
      features: [
        { title: '1. Standard Collage', items: ['Traditional Layout: Combines 2-6 images side-by-side or stacked in seconds.', 'Quick Catalog: Ideal for showcasing product variations and details collectively.', 'Easy Preview: Present product groups to your customers at a single glance.'] },
        { title: '2. Magic Collage (AI)', items: ['Professional Flat Lay: Analyzes a single outfit photo to create a flat-lay composition in luxury magazine aesthetics.', 'Auto Decomposition: AI recognizes outfit pieces (top, bottom, bag, etc.) and paints them individually.', 'Magazine Mode: Produces a downloadable, price-tagged professional catalog page.'] },
        { title: '3. Product Collage', items: ['Aesthetic Composition: Merges different product photos taken at different times into a single artistic layout.', 'Brand Identity: Provides consistent background and lighting settings for all your products.', 'Unlimited Variations: Showcases different color and model options on a stylish board.'] },
        { title: '4. Video Conversion', items: ['Dynamic Content: Transform your collages into 2K cinematic videos with one click.', 'Social Media Ready: Optimized sizes for Instagram Reels, TikTok, and Shorts.', 'Musical Transitions: Professional camera movements that make your products more impressive.'] }
      ],
      benefitsTitle: '🎯 Use Cases',
      benefits: [
        { title: '✅ E-Commerce Catalogs', desc: 'Showcase product variations in a single image. Effectively present different color and model options to your customers.' },
        { title: '✅ Social Media Content', desc: 'Create professional collages for Instagram grid posts, Pinterest boards, and Facebook catalogs.' },
        { title: '✅ Lookbook Preparation', desc: 'Prepare impressive lookbook pages for collection launches. Show all pieces together.' },
        { title: '✅ Quick Comparison', desc: 'Display before/after comparisons or different style options side by side.' }
      ],
      creditInfo: 'Collage creation: 2 credits | Video conversion: +3 credits'
    },
    footer: {
      quickLinks: 'Quick Links',
      features: 'Features',
      howItWorks: 'How It Works',
      pricing: 'Pricing',
      examples: 'Examples',
      faq: 'FAQ',
      legal: 'Legal',
      privacyPolicy: 'Privacy Policy',
      kvkk: 'KVKK Disclosure',
      termsOfService: 'Terms of Service',
      cookiePolicy: 'Cookie Policy',
      refundPolicy: 'Refund & Cancellation Policy',
      aiUsage: 'AI Usage Notice',
      contact: 'Contact',
      support: '24/7 Support',
      allRights: '© 2024 Fasheone. All rights reserved.',
    },
  },
};


export const LandingPage: React.FC<LandingPageProps> = (props) => {
  const {
    onGetStarted,
    onSignIn,
    onNavigate,
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
    heroVideo3Url,
    adGeniusMainUrl,
    adGeniusCollageUrl,
  } = props;
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

  const handleGetStarted = () => {
    trackEvent('cta_click', { p_label: 'Get Started', source: 'landing_page' });
    const menu = document.getElementById('mobile-menu');
    menu?.classList.add('hidden');
    onGetStarted();
  };

  const handleSignIn = () => {
    trackEvent('cta_click', { p_label: 'Sign In', source: 'landing_page' });
    const menu = document.getElementById('mobile-menu');
    menu?.classList.add('hidden');
    onSignIn();
  };

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

  const demoAdGeniusMain = showcaseImages.adgenius_main || adGeniusMainUrl;
  const demoAdGeniusCollage = showcaseImages.adgenius_collage || adGeniusCollageUrl;

  // Use DB hero videos or fallback
  const demoHeroVideo = heroVideos[0] || heroVideoUrl || 'https://cdn.pixabay.com/video/2024/01/09/196454-904303173_large.mp4';
  const demoHeroVideo1 = heroVideos[1] || heroVideo1Url || '';
  const demoHeroVideo2 = heroVideos[2] || heroVideo2Url || '';
  const demoHeroVideo3 = heroVideos[3] || heroVideo3Url || '';

  const { language, setLanguage } = useI18n();
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = landingTranslations[language];

  const bgClass = theme === 'dark'
    ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900'
    : 'bg-gradient-to-br from-blue-100 via-white via-purple-50 to-orange-100';

  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const secondaryTextClass = 'text-black font-medium';
  const descriptionTextClass = 'text-black font-semibold';
  const cardBg = theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200';

  return (
    <div className="min-h-screen relative">
      {/* Fixed gradient background with smooth animation */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #3C3F4A 0%, #A67C52 25%, #2C3E50 50%, #9FA86A 75%, #C4B5B8 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite'
        }}
      ></div>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      {/* Subtle animated overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-800/10 via-amber-700/10 to-rose-300/10 animate-pulse pointer-events-none -z-5"></div>

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
                  onClick={handleSignIn}
                  className={`${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'} transition px-4 py-2`}
                >
                  {t.header.signIn}
                </button>
                <button
                  onClick={handleGetStarted}
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
                <button onClick={handleSignIn} className="py-3 bg-slate-800 text-slate-300 rounded-lg text-sm text-center">
                  {t.header.signIn}
                </button>
                <button onClick={handleGetStarted} className="py-3 bg-cyan-600 text-white rounded-lg text-sm font-bold text-center">
                  {t.header.start}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - Genişletilmiş */}
      <section className="relative pt-64 pb-32 px-6 z-10 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Video Carousel - 4 videos + logo with smooth transitions */}
        <HeroVideoCarousel
          videos={[demoHeroVideo, demoHeroVideo1, demoHeroVideo2, demoHeroVideo3].filter(Boolean)}
          logoVideo={props.logoMediaUrl}
          logoDisplayDuration={5000}
        />

        <div className="max-w-7xl mx-auto text-center relative z-30 w-full mt-96">
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
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-orange-500 via-green-500 to-blue-600 text-white px-6 py-3 md:px-10 md:py-5 rounded-xl font-bold text-base md:text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 relative z-40"
          >
            {isLoggedIn ? t.header.continueUsing : t.hero.cta}
          </button>
        </div>
      </section>

      {/* Use Cases - Güçlü Özellikler */}
      <section className="py-20 px-6 z-10 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}>
              {t.howItWorks.useCases.title}
            </h2>
            <p className={`text-xl ${descriptionTextClass} max-w-3xl mx-auto`}>
              {t.howItWorks.useCases.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Çizimden Ürüne */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-cyan-600 transition-colors">
                  {t.howItWorks.useCases.feature1.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.feature1.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.feature1.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Canlı Model */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {t.howItWorks.useCases.feature2.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.feature2.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.feature2.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Video Oluşturma */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {t.howItWorks.useCases.feature3.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.feature3.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.feature3.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Teknik Çizim */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-green-600 transition-colors">
                  {t.howItWorks.useCases.feature4.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.feature4.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.feature4.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>


            {/* 5. Pixshop */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-orange-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-400/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors">
                  {t.howItWorks.useCases.feature5.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.feature5.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.feature5.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>


            {/* 6. Fotomatik */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-teal-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-400/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-teal-600 transition-colors">
                  {t.howItWorks.useCases.feature6.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.feature6.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.feature6.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>


            {/* 7. Kolaj Oluşturma */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-cyan-600 transition-colors">
                  {t.howItWorks.useCases.collage.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.collage.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.collage.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>


            {/* 8. Reklam Medyası */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-pink-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-400/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-pink-600 transition-colors">
                  {t.howItWorks.useCases.adMedia.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.adMedia.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.adMedia.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>


            {/* 9. E-ticaret Çözümleri */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl hover:shadow-indigo-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {t.howItWorks.useCases.ecommerce.title}
                </h3>
                <p className="text-black font-semibold leading-relaxed mb-4">
                  {t.howItWorks.useCases.ecommerce.desc}
                </p>
                <ul className="text-black font-medium text-sm space-y-2">
                  {t.howItWorks.useCases.ecommerce.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Showcase */}
      < section id="showcase" className="relative py-20 px-6 z-10" >
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className={`text-2xl md:text-4xl font-bold ${textClass} text-center mb-4`}>
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
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition shadow-xl"
            >
              {t.showcase.tryNow}
            </button>
          </div>
        </div>
      </section >

      {/* How It Works - 3 Steps */}
      < section id="how-it-works" className={`relative py-20 px-6 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-blue-50/40'} z-10`}>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className={`text-2xl md:text-4xl font-bold ${textClass} text-center mb-4`}>
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
      </section >

      {/* Pixshop Detailed Features */}
      < section className="py-20 px-6 z-10 relative" >
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}>
              {t.pixshop.heroTitle}
            </h2>
            <p className={`text-xl ${descriptionTextClass} max-w-3xl mx-auto`}>
              {t.pixshop.heroSubtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1 - Akıllı Rötuş */}
            <div className={`${cardBg} rounded-2xl p-8 border ${theme === 'dark' ? 'border-slate-700 hover:border-cyan-500' : 'border-slate-200 hover:border-cyan-400'} transition-all duration-300 shadow-lg group`}>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.pixshop.feature1Title}
              </h3>
              <p className={`${descriptionTextClass} leading-relaxed`}>
                {t.pixshop.feature1Desc}
              </p>
            </div>

            {/* Feature 2 - Yaratıcı Filtreler */}
            <div className={`${cardBg} rounded-2xl p-8 border ${theme === 'dark' ? 'border-slate-700 hover:border-purple-500' : 'border-slate-200 hover:border-purple-400'} transition-all duration-300 shadow-lg group`}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.pixshop.feature2Title}
              </h3>
              <p className={`${descriptionTextClass} leading-relaxed`}>
                {t.pixshop.feature2Desc}
              </p>
            </div>

            {/* Feature 3 - Atmosfer Ayarları */}
            <div className={`${cardBg} rounded-2xl p-8 border ${theme === 'dark' ? 'border-slate-700 hover:border-orange-500' : 'border-slate-200 hover:border-orange-400'} transition-all duration-300 shadow-lg group`}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.pixshop.feature3Title}
              </h3>
              <p className={`${descriptionTextClass} leading-relaxed`}>
                {t.pixshop.feature3Desc}
              </p>
            </div>

            {/* Feature 4 - Upscale */}
            <div className={`${cardBg} rounded-2xl p-8 border ${theme === 'dark' ? 'border-slate-700 hover:border-green-500' : 'border-slate-200 hover:border-green-400'} transition-all duration-300 shadow-lg group`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.pixshop.feature4Title}
              </h3>
              <p className={`${descriptionTextClass} leading-relaxed`}>
                {t.pixshop.feature4Desc}
              </p>
            </div>

            {/* Feature 5 - Tasarımcı Çıktılar */}
            <div className={`${cardBg} rounded-2xl p-8 border ${theme === 'dark' ? 'border-slate-700 hover:border-blue-500' : 'border-slate-200 hover:border-blue-400'} transition-all duration-300 shadow-lg group`}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.pixshop.feature5Title}
              </h3>
              <p className={`${descriptionTextClass} leading-relaxed`}>
                {t.pixshop.feature5Desc}
              </p>
            </div>

            {/* Feature 6 - Face Swap */}
            <div className={`${cardBg} rounded-2xl p-8 border ${theme === 'dark' ? 'border-slate-700 hover:border-pink-500' : 'border-slate-200 hover:border-pink-400'} transition-all duration-300 shadow-lg group`}>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.pixshop.feature6Title}
              </h3>
              <p className={`${descriptionTextClass} leading-relaxed`}>
                {t.pixshop.feature6Desc}
              </p>
            </div>

            {/* Feature 7 - Logo/Aksesuar */}
            <div className={`${cardBg} rounded-2xl p-8 border ${theme === 'dark' ? 'border-slate-700 hover:border-yellow-500' : 'border-slate-200 hover:border-yellow-400'} transition-all duration-300 shadow-lg group md:col-span-2 lg:col-span-1`}>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold ${textClass} mb-4`}>
                {t.pixshop.feature7Title}
              </h3>
              <p className={`${descriptionTextClass} leading-relaxed`}>
                {t.pixshop.feature7Desc}
              </p>
            </div>
          </div>

          {/* Why Pixshop */}
          <div className={`bg-gradient-to-r ${theme === 'dark' ? 'from-purple-900/30 to-cyan-900/30 border-purple-500/30' : 'from-purple-50 to-cyan-50 border-purple-200'} border rounded-2xl p-8`}>
            <h3 className={`text-3xl font-bold ${textClass} mb-6 text-center`}>
              {t.pixshop.whyTitle}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl">⚡</span>
                <p className={descriptionTextClass}>{t.pixshop.why1}</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">🎯</span>
                <p className={descriptionTextClass}>{t.pixshop.why2}</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">🎨</span>
                <p className={descriptionTextClass}>{t.pixshop.why3}</p>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-3xl">📱</span>
                <p className={descriptionTextClass}>{t.pixshop.why4}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <h3 className={`text-3xl font-bold ${textClass} mb-4`}>
              {t.pixshop.cta}
            </h3>
            <p className={`${descriptionTextClass} mb-8 max-w-2xl mx-auto`}>
              {t.pixshop.ctaSubtitle}
            </p>
            <button
              onClick={() => onNavigate && onNavigate('tool', 'pixshop')}
              className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-bold text-base md:text-lg hover:from-purple-700 hover:to-cyan-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {t.pixshop.tryButton}
            </button>
          </div>
        </div>
      </section >

      {/* AdGenius Section */}
      < section className="py-20 px-6 z-10 relative" >
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
              {t.adgenius?.title || 'AdGenius AI'}
            </h2>
            <p className={`text-xl ${descriptionTextClass} max-w-4xl mx-auto`}>
              {t.adgenius?.description}
            </p>
          </div>

          {/* Visual Showcase (Main + Collage) */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Main Image */}
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${textClass} mb-4 text-center lg:text-left`}>{t.adgenius?.showcase?.title1 || '📍 Profesyonel Model Çekimi'}</h3>
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 relative group">
                  {demoAdGeniusMain ? (
                    <img
                      src={demoAdGeniusMain}
                      alt="AdGenius Main"
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      Ana Görsel Yüklenmedi
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <p className="text-white text-sm">{t.adgenius?.showcase?.hover1 || 'Üst düzey prodüksiyon kalitesi, sıfır maliyet.'}</p>
                  </div>
                </div>
              </div>

              {/* Right: Collage Image */}
              <div className="space-y-4">
                <h3 className={`text-2xl font-bold ${textClass} mb-4 text-center lg:text-left`}>{t.adgenius?.showcase?.title2 || '✨ Akıllı Reklam Varyasyonları'}</h3>
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 relative group">
                  {demoAdGeniusCollage ? (
                    <img
                      src={demoAdGeniusCollage}
                      alt="AdGenius Collage"
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                      Kolaj Görseli Yüklenmedi
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <p className="text-white text-sm">{t.adgenius?.showcase?.hover2 || 'Tek bir üründen onlarca kampanya konsepti.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features & Benefits Detail Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Features */}
            <div>
              <h3 className={`text-3xl font-bold ${textClass} mb-8 text-center md:text-left`}>{t.adgenius?.featuresTitle}</h3>
              <div className="space-y-4">
                {t.adgenius?.features?.map((feature: any, idx: number) => (
                  <div key={idx} className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700 hover:border-cyan-500/50' : 'bg-slate-50 border-slate-200 hover:border-cyan-400'} transition-all duration-300 shadow-lg group`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform text-lg">
                        {idx === 0 ? '🧠' : idx === 1 ? '📸' : idx === 2 ? '🌍' : idx === 3 ? '🎨' : idx === 4 ? '🎬' : '🏷️'}
                      </div>
                      <h4 className={`text-xl font-bold ${textClass}`}>{feature.title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {feature.items.map((item: string, i: number) => (
                        <li key={i} className={`${descriptionTextClass} text-sm flex items-start gap-3`}>
                          <span className="text-cyan-500 mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className={`text-3xl font-bold ${textClass} mb-8 text-center md:text-left`}>{t.adgenius?.benefitsTitle}</h3>
              <div className="space-y-4">
                {t.adgenius?.benefits?.map((benefit: any, idx: number) => (
                  <div key={idx} className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700 hover:border-green-500/50' : 'bg-slate-50 border-slate-200 hover:border-green-400'} transition-all duration-300 shadow-lg group`}>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform text-lg">
                        {idx === 0 ? '⚡' : idx === 1 ? '💰' : idx === 2 ? '💎' : '🎯'}
                      </div>
                      <h4 className={`text-lg font-bold ${textClass}`}>{benefit.title}</h4>
                    </div>
                    <p className={`${descriptionTextClass} text-sm leading-relaxed`}>{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Collage Section */}
      < section className="py-24 px-6 z-10 relative overflow-hidden" >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
            <h2 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-6 uppercase tracking-tighter">
              {t.collage.title}
            </h2>
            <p className={`text-xl ${descriptionTextClass} max-w-4xl mx-auto leading-relaxed`}>
              {t.collage.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {t.collage.features.map((feature: any, idx: number) => (
              <div key={idx} className={`${cardBg} p-8 rounded-[2rem] border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 group relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <span className="text-3xl">
                    {idx === 0 ? '🖼️' : idx === 1 ? '✨' : idx === 2 ? '🎨' : '🎬'}
                  </span>
                </div>
                <h3 className={`text-2xl font-black ${textClass} mb-5 tracking-tight uppercase`}>{feature.title}</h3>
                <ul className="space-y-4">
                  {feature.items.map((item: string, i: number) => (
                    <li key={i} className={`${descriptionTextClass} text-sm flex items-start gap-4 leading-relaxed group/item`}>
                      <span className="text-blue-500 mt-1 font-black group-hover/item:translate-x-1 transition-transform">▸</span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={`${cardBg} rounded-[2.5rem] p-12 border border-slate-700/50 relative overflow-hidden shadow-2xl`}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>
            <div className="relative z-10">
              <h3 className={`text-3xl font-black ${textClass} mb-12 text-center tracking-tight uppercase`}>
                {t.collage.benefitsTitle}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                {t.collage.benefits.map((benefit: any, idx: number) => (
                  <div key={idx} className="space-y-4 group">
                    <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-full group-hover:w-16 transition-all duration-500"></div>
                    <h4 className={`text-lg font-black text-blue-400 uppercase tracking-tight`}>
                      {benefit.title}
                    </h4>
                    <p className={`${descriptionTextClass} text-[13px] leading-relaxed font-medium opacity-80 uppercase tracking-tighter`}>
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-16 pt-8 border-t border-slate-700/20 text-center">
                <div className="inline-block px-10 py-3 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <p className="text-blue-400 font-black tracking-[0.3em] text-[10px] uppercase italic drop-shadow-sm">
                    ⚡ {t.collage.creditInfo}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Pixshop Section */}
      < section className="relative py-20 px-6 z-10" >
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}>
              {t.pixshop.heroTitle}
            </h2>
            <p className={`text-xl ${secondaryTextClass} max-w-3xl mx-auto`}>
              {t.pixshop.heroSubtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h3 className={`text-3xl font-bold ${textClass} text-center mb-12`}>
              {t.pixshop.featuresTitle}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1: Smart Retouch */}
              <div className={`${cardBg} rounded-2xl p-6 hover:border-cyan-500 transition`}>
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h4 className={`text-xl font-bold ${textClass} mb-3`}>{t.pixshop.feature1Title}</h4>
                <p className={`${secondaryTextClass} text-sm`}>{t.pixshop.feature1Desc}</p>
              </div>

              {/* Feature 2: Creative Filters */}
              <div className={`${cardBg} rounded-2xl p-6 hover:border-purple-500 transition`}>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h4 className={`text-xl font-bold ${textClass} mb-3`}>{t.pixshop.feature2Title}</h4>
                <p className={`${secondaryTextClass} text-sm`}>{t.pixshop.feature2Desc}</p>
              </div>

              {/* Feature 3: Professional Atmosphere */}
              <div className={`${cardBg} rounded-2xl p-6 hover:border-orange-500 transition`}>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className={`text-xl font-bold ${textClass} mb-3`}>{t.pixshop.feature3Title}</h4>
                <p className={`${secondaryTextClass} text-sm`}>{t.pixshop.feature3Desc}</p>
              </div>

              {/* Feature 4: Upscale */}
              <div className={`${cardBg} rounded-2xl p-6 hover:border-green-500 transition`}>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <h4 className={`text-xl font-bold ${textClass} mb-3`}>{t.pixshop.feature4Title}</h4>
                <p className={`${secondaryTextClass} text-sm`}>{t.pixshop.feature4Desc}</p>
              </div>

              {/* Feature 5: Designer Outputs */}
              <div className={`${cardBg} rounded-2xl p-6 hover:border-indigo-500 transition`}>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h4 className={`text-xl font-bold ${textClass} mb-3`}>{t.pixshop.feature5Title}</h4>
                <p className={`${secondaryTextClass} text-sm`}>{t.pixshop.feature5Desc}</p>
              </div>
            </div>
          </div>

          {/* Why Pixshop */}
          <div className={`${cardBg} rounded-2xl p-8 mb-12`}>
            <h3 className={`text-3xl font-bold ${textClass} text-center mb-8`}>
              {t.pixshop.whyTitle}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className={descriptionTextClass}>{t.pixshop.why1}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className={descriptionTextClass}>{t.pixshop.why2}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className={descriptionTextClass}>{t.pixshop.why3}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className={descriptionTextClass}>{t.pixshop.why4}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className={`text-3xl font-bold ${textClass} mb-4`}>
              {t.pixshop.cta}
            </h3>
            <p className={`text-lg ${secondaryTextClass} mb-8`}>
              {t.pixshop.ctaSubtitle}
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition"
            >
              {t.pixshop.tryButton}
            </button>
          </div>
        </div>
      </section >

      {/* Fotomatik Section */}
      < section className="relative py-20 px-6 z-10" >
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}>
              {t.fotomatik.heroTitle}
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1: AI Transform */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-indigo-500 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-indigo-500/20">
                01
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.fotomatik.feature1Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.fotomatik.feature1Desc}</p>
            </div>

            {/* Feature 2: Visual Analysis */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-blue-500 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
                02
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.fotomatik.feature2Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.fotomatik.feature2Desc}</p>
            </div>

            {/* Feature 3: Auto-Enhance */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-cyan-500 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-cyan-500/20">
                03
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.fotomatik.feature3Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.fotomatik.feature3Desc}</p>
            </div>

            {/* Feature 4: Precise Editor */}
            <div className={`${cardBg} rounded-2xl p-8 hover:border-rose-500 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-rose-500/20">
                04
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.fotomatik.feature4Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.fotomatik.feature4Desc}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 transition transform hover:scale-105"
            >
              {t.fotomatik.cta}
            </button>
          </div>
        </div>
      </section >



      {/* Tech Pack Section */}
      < section className="relative py-20 px-6 z-10" >
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Hero */}
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-4`}>
              {t.techpack.heroTitle}
            </h2>
            <p className={`text-xl ${secondaryTextClass} max-w-3xl mx-auto`}>
              {t.techpack.heroSubtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1 */}
            <div className={`${cardBg} border rounded-2xl p-8 hover:border-emerald-500 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-emerald-500/20">
                01
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature1Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.techpack.feature1Desc}</p>
            </div>

            {/* Feature 2 */}
            <div className={`${cardBg} border rounded-2xl p-8 hover:border-teal-500 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-teal-500/20">
                02
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature2Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.techpack.feature2Desc}</p>
            </div>

            {/* Feature 3 */}
            <div className={`${cardBg} border rounded-2xl p-8 hover:border-lime-500 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-lime-500 to-green-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-lime-500/20">
                03
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature3Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.techpack.feature3Desc}</p>
            </div>

            {/* Feature 4 */}
            <div className={`${cardBg} border rounded-2xl p-8 hover:border-green-400 transition`}>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-lg shadow-green-400/20">
                04
              </div>
              <h4 className={`text-xl font-bold ${textClass} mb-4`}>{t.techpack.feature4Title}</h4>
              <p className={`${secondaryTextClass} leading-relaxed`}>{t.techpack.feature4Desc}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition transform hover:scale-105"
            >
              {t.techpack.cta}
            </button>
          </div>
        </div>
      </section >

      {/* Pricing - Credit Packages Only */}
      < section className="py-20 px-6 z-10 relative" id="pricing" >
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-2xl md:text-4xl font-bold ${textClass} text-center mb-4`}>
            {t.pricing.creditPackagesTitle}
          </h2>
          <p className={`${secondaryTextClass} text-center mb-12`}>
            {t.pricing.creditPackagesSubtitle}
          </p>

          {/* Credit Packages */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <div className={`${cardBg} rounded-2xl p-8 text-center hover:border-cyan-500 transition`}>
              <div className={`text-4xl font-bold ${textClass} mb-3`}>{creditPackages.small.credits}</div>
              <div className={`text-sm ${secondaryTextClass} mb-4`}>{t.pricing.credits}</div>
              <div className="text-3xl font-bold text-cyan-400 mb-4">{creditPackages.small.price}₺</div>
              <div className={`text-sm ${secondaryTextClass} mb-6`}>
                1 {t.pricing.credit} = {(creditPackages.small.price / creditPackages.small.credits).toFixed(2)}₺
              </div>
              <button
                onClick={handleGetStarted}
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
                onClick={handleGetStarted}
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
                onClick={handleGetStarted}
                className={`w-full ${theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} px-6 py-3 rounded-lg font-semibold transition`}
              >
                {t.pricing.buyNow}
              </button>
            </div>

            {/* Enterprise Card */}
            <div className="group relative rounded-3xl p-8 backdrop-blur-xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border-2 border-purple-500/50 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {t.pricing.enterprise}
              </div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  {t.pricing.enterpriseTitle}
                </div>
                <div className="text-sm text-black font-semibold mb-6">
                  {t.pricing.enterpriseSubtitle}
                </div>
                <ul className="space-y-3 mb-6 text-left">
                  <li className="flex items-center gap-2 text-black font-medium text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.pricing.customCredits}
                  </li>
                  <li className="flex items-center gap-2 text-black font-medium text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.pricing.unlimitedUsers}
                  </li>
                  <li className="flex items-center gap-2 text-black font-medium text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.pricing.prioritySupport}
                  </li>
                  <li className="flex items-center gap-2 text-black font-medium text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.pricing.dedicatedAccount}
                  </li>
                  <li className="flex items-center gap-2 text-black font-medium text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.pricing.apiAccess}
                  </li>
                  <li className="flex items-center gap-2 text-black font-medium text-sm">
                    <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t.pricing.sla}
                  </li>
                </ul>
                <button
                  onClick={() => window.location.href = 'mailto:info@fasheone.com?subject=Enterprise%20Plan%20Inquiry'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
                >
                  {t.pricing.contactUs}
                </button>
              </div>
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
      </section >

      {/* Testimonials */}
      < section className="py-20 px-6 z-10 relative" >
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-2xl md:text-4xl font-bold ${textClass} text-center mb-16`}>
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
      </section >

      {/* Why Best Fashion - Comparison */}
      < section className="py-20 px-6 z-10 relative" >
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-2xl md:text-4xl font-bold ${textClass} text-center mb-4`}>
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
      </section >

      {/* Social Proof Stats */}
      < section className="py-20 px-6 z-10 relative" >
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
      </section >

      {/* FAQ Section */}
      < section id="faq" className={`py-20 px-6 ${theme === 'dark' ? 'bg-slate-800/80' : 'bg-rose-50/40'} z-10 relative`}>
        <div className="max-w-4xl mx-auto">
          <h2 className={`text-2xl md:text-4xl font-bold ${textClass} text-center mb-16`}>
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
      </section >

      {/* CTA */}
      < section className="py-20 px-6 z-10 relative" >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold ${textClass} mb-6`}>
            {t.cta.title}
          </h2>
          <p className={`text-xl ${descriptionTextClass} mb-8`}>
            {t.cta.subtitle}
          </p>
          <button
            onClick={handleGetStarted}
            className={`${theme === 'dark' ? 'bg-white text-slate-900' : 'bg-cyan-600 text-white'} px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition`}
          >
            {t.cta.button}
          </button>
        </div>
      </section >

      {/* Footer */}
      < footer className={`py-16 px-6 border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-900/95' : 'border-slate-200 bg-slate-50'} z-10 relative`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

            {/* Column 1: About */}
            <div className="space-y-4">
              <Logo className="h-12" theme={theme} />
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                Yapay zeka destekli görsel üretim platformu. Çizimlerinizi gerçek ürünlere, fotoğraflarınızı profesyonel görsellere dönüştürün.
              </p>
              {/* Social Media */}
              <div className="flex gap-4 pt-2">
                <a
                  href="https://twitter.com/fasheone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors`}
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/fasheone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors`}
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@fasheone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors`}
                  aria-label="YouTube"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61586671977870"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors`}
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/fasheone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors`}
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.footer.quickLinks}
              </h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById('features');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.features}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById('how-it-works');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.howItWorks}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById('pricing');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.pricing}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById('showcase');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.examples}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      const element = document.getElementById('faq');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.faq}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.footer.legal}
              </h3>


              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => {
                      console.log('🔍 Privacy Policy clicked, onNavigate:', onNavigate);
                      if (onNavigate) {
                        onNavigate('privacy-policy');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        console.error('❌ onNavigate is undefined!');
                      }
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.privacyPolicy}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('kvkk');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.kvkk}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('terms-of-service');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.termsOfService}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('cookie-policy');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.cookiePolicy}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('refund-policy');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer`}
                  >
                    {t.footer.refundPolicy}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate('ai-usage-notice');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm bg-transparent border-none p-0 cursor-pointer flex items-center gap-1`}
                  >
                    <span>🤖</span> {t.footer.aiUsage}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {t.footer.contact}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a
                    href="mailto:info@fasheone.com"
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm`}
                  >
                    info@fasheone.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a
                    href="tel:+905551234567"
                    className={`${theme === 'dark' ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'} transition-colors text-sm`}
                  >
                    +90 555 123 45 67
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
                    ZAFER MAH. KUMRULU SK. SARAY İŞ MERKEZİ NO:2 IÇ KAPI NO:18 BAHÇELİEVLER/İSTANBUL-TÜRKİYE
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
                    {t.footer.support}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`pt-8 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-center md:text-left`}>
                {t.footer.allRights}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                Made with ❤️ in Turkey
              </p>
            </div>
          </div>
        </div>
      </footer >

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-28 right-6 z-[130] w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 group ${showScrollTop
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-10 pointer-events-none'
          } ${theme === 'dark'
            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/30 hover:shadow-cyan-400/50'
            : 'bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 shadow-cyan-600/30 hover:shadow-cyan-500/50'
          }`}
        aria-label="Sayfanın başına dön"
      >
        <svg
          className="w-5 h-5 text-white group-hover:-translate-y-0.5 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>
    </div >
  );
};

export default LandingPage;
