/**
 * App.tsx Translations
 * ToolPage ve App bileşenlerindeki tüm Türkçe metinlerin İngilizce çevirileri.
 */

import type { TranslationRecord } from './types';

export interface AppTranslationType {
    toolTabs: {
        design: {
            label: string;
            shortLabel: string;
            credits: string;
        };
        technical: {
            label: string;
            shortLabel: string;
            credits: string;
        };
        pixshop: {
            label: string;
            credits: string;
        };
        fotomatik: {
            label: string;
            credits: string;
        };
        adgenius: {
            label: string;
            credits: string;
        };
        collage: {
            label: string;
            shortLabel: string;
            credits: string;
        };
        techpack: {
            label: string;
            shortLabel: string;
            credits: string;
        };
    };
    kombiniMode: {
        title: string;
        description: string;
        topSketchTitle: string;
        topProductTitle: string;
        bottomSketchTitle: string;
        bottomProductTitle: string;
        creditInfo: string;
        processing: string;
        convertToProduct: string;
        ready: string;
        generatedFromSketch: string;
        uploadOrGenerate: string;
        bothReady: string;
        bothNeeded: string;
        topNeeded: string;
        bottomNeeded: string;
    };
    standardMode: {
        sketchTitle: string;
        productTitle: string;
        productColorLabel: string;
        productImageTitle: string;
        creditInfo: string;
        processing: string;
        convertToProduct: string;
        uploadDirectly: string;
        generatedFromSketch: string;
        uploadOrGenerate: string;
        downloadProduct: string;
        usingGeneratedImage: string;
        uploadDirectPhoto: string;
    };
    modelSettings: {
        title: string;
        clothingType: {
            label: string;
            auto: string;
            topOnly: string;
            bottomOnly: string;
            dress: string;
            suit: string;
            topAndBottom: string;
        };
        topColor: string;
        pattern: {
            label: string;
            patternLabel: string;
            selectImage: string;
            description: string;
        };
        shirtColor: string;
        bottomColor: string;
        chatLabel: string;
        chatPlaceholder: string;
        ethnicity: {
            label: string;
            diverse: string;
            turkish: string;
            european: string;
            scandinavian: string;
            mediterranean: string;
            eastAsian: string;
            african: string;
            latin: string;
            middleEastern: string;
        };
        artisticStyle: {
            label: string;
            photorealistic: string;
            cinematic: string;
            illustration: string;
        };
        lighting: {
            label: string;
            natural: string;
            studio: string;
            goldenHour: string;
            dramatic: string;
            neon: string;
        };
        cameraAngle: {
            label: string;
            eyeLevel: string;
            lowAngle: string;
            highAngle: string;
            wideAngle: string;
            closeUp: string;
        };
        cameraZoom: {
            label: string;
            wide: string;
            medium: string;
            closeUp: string;
        };
        modelConsistency: {
            label: string;
            description: string;
            noModelAlert: string;
            locked: string;
            lock: string;
        };
        ageGroup: {
            label: string;
            child: string;
            teen: string;
            adult: string;
            elderly: string;
        };
        gender: {
            label: string;
            female: string;
            male: string;
        };
        bodyType: {
            label: string;
            standard: string;
            slim: string;
            curvy: string;
            athletic: string;
            plusSize: string;
            xxl: string;
        };
        pose: {
            label: string;
            random: string;
            standing: string;
            walking: string;
            handsOnHips: string;
            sitting: string;
        };
        hairColor: {
            label: string;
            natural: string;
            blonde: string;
            brown: string;
            black: string;
            red: string;
            gray: string;
            pastelPink: string;
        };
        hairStyle: {
            label: string;
            natural: string;
            longStraight: string;
            longWavy: string;
            shortBob: string;
            shortPixie: string;
            bun: string;
            ponytail: string;
            curly: string;
        };
        fabricType: {
            label: string;
            select: string;
            woven: string;
            knit: string;
            leather: string;
            knitwear: string;
        };
        fabricFinish: {
            label: string;
            select: string;
            soft: string;
            glossy: string;
            matte: string;
            pastel: string;
            satin: string;
            silk: string;
        };
        shoeType: {
            label: string;
            auto: string;
            sneakers: string;
            highHeels: string;
            boots: string;
            sandals: string;
            loafer: string;
            oxford: string;
            tallBoots: string;
        };
        shoeColor: {
            label: string;
            auto: string;
            black: string;
            white: string;
            brown: string;
            navy: string;
            red: string;
            beige: string;
            gray: string;
        };
        accessories: {
            label: string;
            none: string;
            sunglasses: string;
            hat: string;
            beanie: string;
            scarf: string;
            handBag: string;
            shoulderBag: string;
            watch: string;
            gloves: string;
            belt: string;
            necklaceEarring: string;
        };
        aspectRatio: {
            label: string;
            portrait: string;
            story: string;
            instagram: string;
            square: string;
            landscape: string;
        };
        location: {
            label: string;
            runway: string;
            studio: string;
            street: string;
            nature: string;
            luxuryStore: string;
            customBg: string;
            uploaded: string;
            bgPromptPlaceholder: string;
            bgPromptHint: string;
        };
        creditInfo: {
            liveModel: string;
            currentCredits: string;
        };
        generateButton: string;
    };
    resultLabel: string;
    technicalDrawing: {
        uploadTitle: string;
        uploadDescription: string;
        styleLabel: string;
        blackAndWhite: string;
        colored: string;
        creditInfo: string;
        currentCredits: string;
        preparing: string;
        generateButton: string;
        resultLabel: string;
        aiAnalyzing: string;
        resultPlaceholder: string;
        downloadTitle: string;
    };
    loading: {
        text: string;
        gettingUserInfo: string;
        retryButton: string;
        autoRetryHint: string;
        outfitModelCreating: string;
        modelCreating: string;
        videoCreatingFast: string;
        videoCreatingHigh: string;
        sketchConverting: string;
        topGarmentConverting: string;
        bottomGarmentConverting: string;
        techDrawingPreparing: string;
        aiThinking: string;
    };
    profileCreating: {
        title: string;
        description: string;
        autoRetrying: string;
        retryButton: string;
        refreshPage: string;
    };
    whatsappMessage: string;
    userName: string;
    alerts: {
        accountPreparing: string;
        invalidAdmin: string;
        fileUploadError: string;
        heroVideoUploaded: string;
        heroVideoFailed: string;
        showcaseImageUploaded: string;
        showcaseImageFailed: string;
        showcaseVideoUploaded: string;
        showcaseVideoFailed: string;
        adgeniusUploaded: string;
        uploadFailed: string;
        logoUploaded: string;
        logoDbFailed: string;
        logoConstraintError: string;
        logoFallbackNote: string;
        productCreationError: string;
        topGarmentCreationError: string;
        bottomGarmentCreationError: string;
        topGarmentProcessingError: string;
        bottomGarmentProcessingError: string;
        outfitModeBothRequired: string;
        imageProcessingError: string;
        pleaseUploadProduct: string;
        imageGenerationError: string;
        genericError: string;
        videoCreationError: string;
        downloadFailed: string;
        noModelCreatedYet: string;
        supabaseBucketHint: string;
    };
    typeNames: {
        sketch: string;
        product: string;
        model: string;
    };
}

export const appTranslations: TranslationRecord<AppTranslationType> = {
    tr: {
        toolTabs: {
            design: { label: 'Canlı Model & Video', shortLabel: 'Model', credits: 'Model: 1₺ • Video: 3₺' },
            technical: { label: 'Teknik Çizim (Tech Pack)', shortLabel: 'Tech Pack', credits: '1 kredi/işlem' },
            pixshop: { label: 'Pixshop', credits: '1 kredi/işlem' },
            fotomatik: { label: 'Fotomatik', credits: '1 kredi/işlem' },
            adgenius: { label: 'AdGenius', credits: '1-3 kredi/işlem' },
            collage: { label: 'Kolaj Stüdyosu', shortLabel: 'Kolaj', credits: '2 kredi/işlem' },
            techpack: { label: 'Tech Pack', shortLabel: 'Tech', credits: '3 kredi/işlem' },
        },
        kombiniMode: {
            title: 'Kombin Modu Aktif',
            description: 'Üst ve alt giyim için ayrı görseller yükleyin',
            topSketchTitle: 'Üst Giyim - Çizim',
            topProductTitle: 'Üst Giyim - Ürün',
            bottomSketchTitle: 'Alt Giyim - Çizim',
            bottomProductTitle: 'Alt Giyim - Ürün',
            creditInfo: 'Bu işlem <span>1 kredi</span> harcar',
            processing: 'İşleniyor...',
            convertToProduct: 'Ürüne Dönüştür →',
            ready: '✓ Hazır',
            generatedFromSketch: 'Çizimden üretildi',
            uploadOrGenerate: 'Çizimden üret veya doğrudan yükle',
            bothReady: 'Her iki parça da hazır! Canlı model oluşturabilirsiniz.',
            bothNeeded: 'Üst ve alt giyim görselleri gerekli',
            topNeeded: 'Üst giyim görseli gerekli',
            bottomNeeded: 'Alt giyim görseli gerekli',
        },
        standardMode: {
            sketchTitle: 'Çizim (Opsiyonel)',
            productTitle: 'Ürün Görseli',
            productColorLabel: 'Ürün Rengi (Opsiyonel)',
            productImageTitle: 'Ürün Görseli',
            creditInfo: 'Bu işlem <span>1 kredi</span> harcar',
            processing: 'İşleniyor...',
            convertToProduct: 'Ürüne Dönüştür →',
            uploadDirectly: '✨ veya doğrudan ürün görseli yükleyin →',
            generatedFromSketch: 'AI tarafından üretildi',
            uploadOrGenerate: 'Çizimden üret veya doğrudan yükle',
            downloadProduct: 'Ürün Görselini İndir',
            usingGeneratedImage: 'Çizimden üretilen görsel kullanılıyor.',
            uploadDirectPhoto: 'Çizim yoksa, doğrudan ürün fotoğrafı yükleyin.',
        },
        modelSettings: {
            title: 'Model Ayarları',
            clothingType: {
                label: 'Kıyafet Türü',
                auto: 'Genel (Otomatik Algıla)',
                topOnly: 'Sadece Üst (Gömlek, Tişört, Ceket)',
                bottomOnly: 'Sadece Alt (Pantolon, Etek)',
                dress: 'Elbise',
                suit: 'Takım Elbise / Döpiyes',
                topAndBottom: 'Alt & Üst (Kombin)',
            },
            topColor: 'Üst Parça Rengi',
            pattern: {
                label: 'Desen / Baskı Ekle (İsteğe Bağlı)',
                patternLabel: 'Desen',
                selectImage: 'Desen görseli seçin...',
                description: 'Eklenen desen kıyafete uygulanır.',
            },
            shirtColor: 'Gömlek/İç Rengi',
            bottomColor: 'Alt Parça Rengi',
            chatLabel: 'Yapay Zeka ile Sohbet / Detaylı İstek',
            chatPlaceholder: 'Örn: Parkta bankta oturan, elinde kahve tutan, güneş gözlüklü bir model olsun. Arka planda sonbahar yaprakları...',
            ethnicity: {
                label: 'Etnik Köken',
                diverse: 'Farklı (Karışık)',
                turkish: 'Türk',
                european: 'Avrupalı',
                scandinavian: 'İskandinav',
                mediterranean: 'Akdeniz',
                eastAsian: 'Doğu Asyalı',
                african: 'Afrikalı',
                latin: 'Latin',
                middleEastern: 'Orta Doğulu',
            },
            artisticStyle: {
                label: 'Sanatsal Stil',
                photorealistic: 'Fotogerçekçi',
                cinematic: 'Sinematik',
                illustration: 'İllüstrasyon',
            },
            lighting: {
                label: 'Işıklandırma',
                natural: 'Doğal Işık',
                studio: 'Stüdyo Softbox',
                goldenHour: 'Gün Batımı (Golden Hour)',
                dramatic: 'Dramatik / Kontrastlı',
                neon: 'Neon / Gece',
            },
            cameraAngle: {
                label: 'Kamera Açısı',
                eyeLevel: 'Göz Hizası',
                lowAngle: 'Alt Açı (Low Angle)',
                highAngle: 'Üst Açı (High Angle)',
                wideAngle: 'Geniş Açı',
                closeUp: 'Yakın Çekim (Portre)',
            },
            cameraZoom: {
                label: 'Çekim Mesafesi (Zoom)',
                wide: 'Uzak Çekim (Wide Shot) - Tüm vücut + mekan',
                medium: 'Normal Çekim (Medium Shot) - Bel üstü',
                closeUp: 'Yakın Çekim (Close-Up) - Yüz ve detaylar',
            },
            modelConsistency: {
                label: 'Model Sürekliliği',
                description: 'Beğendiğiniz modeli sonraki üretimlerde koruyun.',
                noModelAlert: 'Henüz bir model oluşturulmadı. Önce bir kez görsel oluşturun, sonra kilitleyebilirsiniz.',
                locked: 'Model Kilitli',
                lock: 'Modeli Kilitle',
            },
            ageGroup: {
                label: 'Yaş Grubu',
                child: 'Çocuk (Child)',
                teen: 'Genç (Teen)',
                adult: 'Yetişkin (Adult)',
                elderly: 'Yaşlı (Elderly)',
            },
            gender: {
                label: 'Cinsiyet',
                female: 'Kadın',
                male: 'Erkek',
            },
            bodyType: {
                label: 'Vücut Tipi',
                standard: 'Standart',
                slim: 'İnce (Slim)',
                curvy: 'Kıvrımlı (Curvy)',
                athletic: 'Atletik',
                plusSize: 'Büyük Beden',
                xxl: 'Battal Beden (130kg+)',
            },
            pose: {
                label: 'Poz',
                random: 'Rastgele',
                standing: 'Ayakta (Düz)',
                walking: 'Yürürken',
                handsOnHips: 'Eller Belde',
                sitting: 'Otururken',
            },
            hairColor: {
                label: 'Saç Rengi',
                natural: 'Doğal / Otomatik',
                blonde: 'Sarı (Blonde)',
                brown: 'Kumral (Brown)',
                black: 'Siyah',
                red: 'Kızıl (Red)',
                gray: 'Gri / Gümüş',
                pastelPink: 'Pastel Pembe',
            },
            hairStyle: {
                label: 'Saç Stili',
                natural: 'Doğal / Otomatik',
                longStraight: 'Uzun Düz',
                longWavy: 'Uzun Dalgalı',
                shortBob: 'Kısa Küt (Bob)',
                shortPixie: 'Kısa Pixie',
                bun: 'Topuz',
                ponytail: 'At Kuyruğu',
                curly: 'Kıvırcık',
            },
            fabricType: {
                label: 'Kumaş Cinsi',
                select: 'Seçiniz',
                woven: 'Dokuma',
                knit: 'Örme',
                leather: 'Deri (Leather)',
                knitwear: 'Triko (Knitwear)',
            },
            fabricFinish: {
                label: 'Kumaş Yüzey Detayı',
                select: 'Seçiniz',
                soft: 'Soft (Yumuşak)',
                glossy: 'Parlak (Glossy)',
                matte: 'Mat (Matte)',
                pastel: 'Pastel',
                satin: 'Saten (Satin)',
                silk: 'İpek (Silk)',
            },
            shoeType: {
                label: 'Ayakkabı Tipi',
                auto: 'Otomatik / Yok',
                sneakers: 'Spor Ayakkabı (Sneakers)',
                highHeels: 'Topuklu (High Heels)',
                boots: 'Bot (Boots)',
                sandals: 'Sandalet',
                loafer: 'Loafer / Mokosen',
                oxford: 'Oxford / Klasik',
                tallBoots: 'Çizme',
            },
            shoeColor: {
                label: 'Ayakkabı Rengi',
                auto: 'Otomatik',
                black: 'Siyah',
                white: 'Beyaz',
                brown: 'Kahverengi',
                navy: 'Lacivert',
                red: 'Kırmızı',
                beige: 'Bej / Ten Rengi',
                gray: 'Gri',
            },
            accessories: {
                label: 'Aksesuar',
                none: 'Yok / Otomatik',
                sunglasses: 'Güneş Gözlüğü',
                hat: 'Şapka',
                beanie: 'Bere',
                scarf: 'Şarf / Atkı',
                handBag: 'Çanta (El Çantası)',
                shoulderBag: 'Çanta (Omuz / Sirt)',
                watch: 'Kol Saati',
                gloves: 'Eldiven',
                belt: 'Kemer (Vurgulu)',
                necklaceEarring: 'Kolye / Küpe',
            },
            aspectRatio: {
                label: 'En/Boy Oranı',
                portrait: '3:4 (Dikey - Varsayılan)',
                story: '9:16 (Hikaye / Reels)',
                instagram: '4:5 (Instagram Gönderi)',
                square: '1:1 (Kare)',
                landscape: '16:9 (Yatay / YouTube)',
            },
            location: {
                label: 'Mekan',
                runway: 'Moda Podyumu',
                studio: 'Minimalist Stüdyo',
                street: 'Şehir Sokağı',
                nature: 'Doğa / Sahil',
                luxuryStore: 'Lüks Mağaza İçi',
                customBg: 'Özel Arka Plan Yükle',
                uploaded: '✓ Yüklendi:',
                bgPromptPlaceholder: 'Örn: Güneş batarken sahilde, kumda yürüyor... (isteğe bağlı)',
                bgPromptHint: 'İsteğe bağlı: Arka plan hakkında özel detaylar ekleyin',
            },
            creditInfo: {
                liveModel: 'Canlı Model:',
                currentCredits: 'Mevcut krediniz:',
            },
            generateButton: 'Canlı Model Oluştur',
        },
        resultLabel: '3. Sonuç (Model & Video)',
        technicalDrawing: {
            uploadTitle: 'Ürün Yükle',
            uploadDescription: 'Teknik çizimini (flat sketch) oluşturmak istediğiniz kıyafetin fotoğrafını yükleyin.',
            styleLabel: 'Çizim Stili',
            blackAndWhite: '🖤 Karakalem',
            colored: '🎨 Renkli',
            creditInfo: 'Bu işlem <span>1 kredi</span> harcar',
            currentCredits: 'Mevcut krediniz:',
            preparing: 'Çizim Hazırlanıyor...',
            generateButton: 'Teknik Çizim Oluştur',
            resultLabel: 'Sonuç (Tech Pack)',
            aiAnalyzing: 'Yapay zeka analiz ediyor...',
            resultPlaceholder: 'Oluşturulan teknik çizim burada görünecek.',
            downloadTitle: 'İndir',
        },
        loading: {
            text: 'Yükleniyor...',
            gettingUserInfo: 'Kullanıcı bilgileri alınıyor...',
            retryButton: 'Tekrar Dene',
            autoRetryHint: 'Bağlantı yavaşsa otomatik olarak yeniden denenecek',
            outfitModelCreating: 'Kombin ile canlı model oluşturuluyor...',
            modelCreating: 'Canlı model oluşturuluyor...',
            videoCreatingFast: 'Video oluşturuluyor (Hızlı Mod)...',
            videoCreatingHigh: 'Yüksek kalite video işleniyor (Veo 3.1). Bu işlem 2-5 dakika sürebilir, lütfen bekleyin...',
            sketchConverting: 'Çizim ürüne dönüştürülüyor...',
            topGarmentConverting: 'Üst giyim ürüne dönüştürülüyor...',
            bottomGarmentConverting: 'Alt giyim ürüne dönüştürülüyor...',
            techDrawingPreparing: 'Teknik çizim hazırlanıyor...',
            aiThinking: 'Yapay zeka düşünüyor...',
        },
        profileCreating: {
            title: 'Profil oluşturuluyor...',
            description: 'İlk girişiniz için hesap bilgileriniz hazırlanıyor. Bu birkaç saniye sürebilir.',
            autoRetrying: 'Otomatik olarak yeniden deneniyor...',
            retryButton: 'Tekrar Dene',
            refreshPage: 'Sayfayı Yenile',
        },
        whatsappMessage: 'Merhaba, Fasheone hakkında bilgi almak istiyorum.',
        userName: 'Kullanıcı',
        alerts: {
            accountPreparing: 'Hesap bilgileriniz hazırlanıyor. Lütfen birkaç saniye bekleyin ve tekrar deneyin.',
            invalidAdmin: 'Geçersiz admin giriş bilgileri!',
            fileUploadError: 'Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
            heroVideoUploaded: 'Hero Video {index} başarıyla yüklendi!\n\nAna sayfada görünecektir.',
            heroVideoFailed: '❌ Hero video yükleme başarısız: {error}',
            showcaseImageUploaded: '✅ {type} görseli başarıyla yüklendi!\n\nAna sayfada showcase bölümünde görünecektir.',
            showcaseImageFailed: '❌ {type} görseli yükleme başarısız: {error}',
            showcaseVideoUploaded: '✅ Showcase video başarıyla yüklendi!\n\nAna sayfada showcase bölümünde görünecektir.',
            showcaseVideoFailed: '❌ Showcase video yükleme başarısız: {error}',
            adgeniusUploaded: '✅ Görsel başarıyla yüklendi!\n\nAna sayfada AdGenius bölümünde görünecektir.',
            uploadFailed: '❌ Yükleme başarısız: {error}',
            logoUploaded: '✅ Logo video/resim başarıyla veritabanına yüklendi!\n\nArtık tüm kullanıcılarda görünecektir.',
            logoDbFailed: '❌ Veritabanına yüklenemedi:',
            logoConstraintError: '\n\n⚠️ HATA NEDENİ: Veritabanı "logo_media" tipini kabul etmiyor.\nLütfen "ADD_LOGO_MEDIA_CONSTRAINT.sql" dosyasındaki SQL komutunu Supabase SQL Editöründe çalıştırın.',
            logoFallbackNote: '\n\n⚠️ Geçici olarak sadece bu tarayıcıda görünecektir.',
            productCreationError: 'Ürün oluşturma hatası:',
            topGarmentCreationError: 'Üst giyim oluşturma hatası:',
            bottomGarmentCreationError: 'Alt giyim oluşturma hatası:',
            topGarmentProcessingError: 'Üst giyim görseli işlenirken hata oluştu.',
            bottomGarmentProcessingError: 'Alt giyim görseli işlenirken hata oluştu.',
            outfitModeBothRequired: 'Kombin modu için hem üst hem alt giyim görseli gereklidir. Lütfen her iki parçayı da yükleyin veya çizimden oluşturun.',
            imageProcessingError: 'Görsel işlenirken hata oluştu.',
            pleaseUploadProduct: 'Lütfen önce bir ürün görseli yükleyin veya çizimden oluşturun.',
            imageGenerationError: 'Görsel oluşturulurken bir hata oluştu:',
            genericError: 'Hata:',
            videoCreationError: 'Video oluşturulurken hata:',
            downloadFailed: 'İndirme başarısız oldu. Lütfen tekrar deneyin.',
            noModelCreatedYet: 'Henüz bir model oluşturulmadı. Önce bir kez görsel oluşturun, sonra kilitleyebilirsiniz.',
            supabaseBucketHint: '\n\nLütfen Supabase storage bucket\'larının oluşturulduğundan emin olun.',
        },
        typeNames: {
            sketch: 'Çizim',
            product: 'Ürün',
            model: 'Model',
        },
    },
    en: {
        toolTabs: {
            design: { label: 'Live Model & Video', shortLabel: 'Model', credits: 'Model: $1 • Video: $3' },
            technical: { label: 'Technical Drawing (Tech Pack)', shortLabel: 'Tech Pack', credits: '1 credit/operation' },
            pixshop: { label: 'Pixshop', credits: '1 credit/operation' },
            fotomatik: { label: 'Fotomatik', credits: '1 credit/operation' },
            adgenius: { label: 'AdGenius', credits: '1-3 credits/operation' },
            collage: { label: 'Collage Studio', shortLabel: 'Collage', credits: '2 credits/operation' },
            techpack: { label: 'Tech Pack', shortLabel: 'Tech', credits: '3 credits/operation' },
        },
        kombiniMode: {
            title: 'Outfit Mode Active',
            description: 'Upload separate images for top and bottom garments',
            topSketchTitle: 'Top Garment - Sketch',
            topProductTitle: 'Top Garment - Product',
            bottomSketchTitle: 'Bottom Garment - Sketch',
            bottomProductTitle: 'Bottom Garment - Product',
            creditInfo: 'This operation costs <span>1 credit</span>',
            processing: 'Processing...',
            convertToProduct: 'Convert to Product →',
            ready: '✓ Ready',
            generatedFromSketch: 'Generated from sketch',
            uploadOrGenerate: 'Generate from sketch or upload directly',
            bothReady: 'Both pieces are ready! You can create a live model.',
            bothNeeded: 'Top and bottom garment images required',
            topNeeded: 'Top garment image required',
            bottomNeeded: 'Bottom garment image required',
        },
        standardMode: {
            sketchTitle: 'Sketch (Optional)',
            productTitle: 'Product Image',
            productColorLabel: 'Product Color (Optional)',
            productImageTitle: 'Product Image',
            creditInfo: 'This operation costs <span>1 credit</span>',
            processing: 'Processing...',
            convertToProduct: 'Convert to Product →',
            uploadDirectly: '✨ or upload product image directly →',
            generatedFromSketch: 'Generated by AI',
            uploadOrGenerate: 'Generate from sketch or upload directly',
            downloadProduct: 'Download Product Image',
            usingGeneratedImage: 'Using image generated from sketch.',
            uploadDirectPhoto: 'If no sketch, upload a product photo directly.',
        },
        modelSettings: {
            title: 'Model Settings',
            clothingType: {
                label: 'Clothing Type',
                auto: 'General (Auto Detect)',
                topOnly: 'Top Only (Shirt, T-Shirt, Jacket)',
                bottomOnly: 'Bottom Only (Pants, Skirt)',
                dress: 'Dress',
                suit: 'Suit / Two-Piece',
                topAndBottom: 'Top & Bottom (Outfit)',
            },
            topColor: 'Top Garment Color',
            pattern: {
                label: 'Add Pattern / Print (Optional)',
                patternLabel: 'Pattern',
                selectImage: 'Select pattern image...',
                description: 'The added pattern will be applied to the garment.',
            },
            shirtColor: 'Shirt/Inner Color',
            bottomColor: 'Bottom Garment Color',
            chatLabel: 'AI Chat / Detailed Request',
            chatPlaceholder: 'E.g.: A model sitting on a park bench, holding coffee, wearing sunglasses. Autumn leaves in the background...',
            ethnicity: {
                label: 'Ethnicity',
                diverse: 'Diverse (Mixed)',
                turkish: 'Turkish',
                european: 'European',
                scandinavian: 'Scandinavian',
                mediterranean: 'Mediterranean',
                eastAsian: 'East Asian',
                african: 'African',
                latin: 'Latin',
                middleEastern: 'Middle Eastern',
            },
            artisticStyle: {
                label: 'Artistic Style',
                photorealistic: 'Photorealistic',
                cinematic: 'Cinematic',
                illustration: 'Illustration',
            },
            lighting: {
                label: 'Lighting',
                natural: 'Natural Light',
                studio: 'Studio Softbox',
                goldenHour: 'Golden Hour (Sunset)',
                dramatic: 'Dramatic / High Contrast',
                neon: 'Neon / Night',
            },
            cameraAngle: {
                label: 'Camera Angle',
                eyeLevel: 'Eye Level',
                lowAngle: 'Low Angle',
                highAngle: 'High Angle',
                wideAngle: 'Wide Angle',
                closeUp: 'Close-Up (Portrait)',
            },
            cameraZoom: {
                label: 'Shot Distance (Zoom)',
                wide: 'Wide Shot - Full body + environment',
                medium: 'Medium Shot - Waist up',
                closeUp: 'Close-Up - Face and details',
            },
            modelConsistency: {
                label: 'Model Consistency',
                description: 'Keep the same model for subsequent generations.',
                noModelAlert: 'No model has been created yet. Generate an image first, then you can lock the model.',
                locked: 'Model Locked',
                lock: 'Lock Model',
            },
            ageGroup: {
                label: 'Age Group',
                child: 'Child',
                teen: 'Teen',
                adult: 'Adult',
                elderly: 'Elderly',
            },
            gender: {
                label: 'Gender',
                female: 'Female',
                male: 'Male',
            },
            bodyType: {
                label: 'Body Type',
                standard: 'Standard',
                slim: 'Slim',
                curvy: 'Curvy',
                athletic: 'Athletic',
                plusSize: 'Plus Size',
                xxl: 'XXL (130kg+)',
            },
            pose: {
                label: 'Pose',
                random: 'Random',
                standing: 'Standing (Straight)',
                walking: 'Walking',
                handsOnHips: 'Hands on Hips',
                sitting: 'Sitting',
            },
            hairColor: {
                label: 'Hair Color',
                natural: 'Natural / Auto',
                blonde: 'Blonde',
                brown: 'Brown',
                black: 'Black',
                red: 'Red',
                gray: 'Gray / Silver',
                pastelPink: 'Pastel Pink',
            },
            hairStyle: {
                label: 'Hair Style',
                natural: 'Natural / Auto',
                longStraight: 'Long Straight',
                longWavy: 'Long Wavy',
                shortBob: 'Short Bob',
                shortPixie: 'Short Pixie',
                bun: 'Bun',
                ponytail: 'Ponytail',
                curly: 'Curly',
            },
            fabricType: {
                label: 'Fabric Type',
                select: 'Select',
                woven: 'Woven',
                knit: 'Knit',
                leather: 'Leather',
                knitwear: 'Knitwear',
            },
            fabricFinish: {
                label: 'Fabric Finish',
                select: 'Select',
                soft: 'Soft',
                glossy: 'Glossy',
                matte: 'Matte',
                pastel: 'Pastel',
                satin: 'Satin',
                silk: 'Silk',
            },
            shoeType: {
                label: 'Shoe Type',
                auto: 'Auto / None',
                sneakers: 'Sneakers',
                highHeels: 'High Heels',
                boots: 'Boots',
                sandals: 'Sandals',
                loafer: 'Loafer / Moccasin',
                oxford: 'Oxford / Classic',
                tallBoots: 'Tall Boots',
            },
            shoeColor: {
                label: 'Shoe Color',
                auto: 'Auto',
                black: 'Black',
                white: 'White',
                brown: 'Brown',
                navy: 'Navy',
                red: 'Red',
                beige: 'Beige / Nude',
                gray: 'Gray',
            },
            accessories: {
                label: 'Accessories',
                none: 'None / Auto',
                sunglasses: 'Sunglasses',
                hat: 'Hat',
                beanie: 'Beanie',
                scarf: 'Scarf',
                handBag: 'Handbag',
                shoulderBag: 'Shoulder / Backpack Bag',
                watch: 'Watch',
                gloves: 'Gloves',
                belt: 'Belt (Accent)',
                necklaceEarring: 'Necklace / Earring',
            },
            aspectRatio: {
                label: 'Aspect Ratio',
                portrait: '3:4 (Portrait - Default)',
                story: '9:16 (Story / Reels)',
                instagram: '4:5 (Instagram Post)',
                square: '1:1 (Square)',
                landscape: '16:9 (Landscape / YouTube)',
            },
            location: {
                label: 'Location',
                runway: 'Fashion Runway',
                studio: 'Minimalist Studio',
                street: 'City Street',
                nature: 'Nature / Beach',
                luxuryStore: 'Luxury Store Interior',
                customBg: 'Upload Custom Background',
                uploaded: '✓ Uploaded:',
                bgPromptPlaceholder: 'E.g.: Walking on the beach at sunset... (optional)',
                bgPromptHint: 'Optional: Add custom details about the background',
            },
            creditInfo: {
                liveModel: 'Live Model:',
                currentCredits: 'Your credits:',
            },
            generateButton: 'Create Live Model',
        },
        resultLabel: '3. Result (Model & Video)',
        technicalDrawing: {
            uploadTitle: 'Upload Product',
            uploadDescription: 'Upload a photo of the garment you want to create a technical drawing (flat sketch) for.',
            styleLabel: 'Drawing Style',
            blackAndWhite: '🖤 Pencil Sketch',
            colored: '🎨 Colored',
            creditInfo: 'This operation costs <span>1 credit</span>',
            currentCredits: 'Your credits:',
            preparing: 'Preparing Drawing...',
            generateButton: 'Create Technical Drawing',
            resultLabel: 'Result (Tech Pack)',
            aiAnalyzing: 'AI is analyzing...',
            resultPlaceholder: 'Generated technical drawing will appear here.',
            downloadTitle: 'Download',
        },
        loading: {
            text: 'Loading...',
            gettingUserInfo: 'Getting user information...',
            retryButton: 'Retry',
            autoRetryHint: 'Will automatically retry if connection is slow',
            outfitModelCreating: 'Creating live model with outfit...',
            modelCreating: 'Creating live model...',
            videoCreatingFast: 'Creating video (Fast Mode)...',
            videoCreatingHigh: 'Processing high quality video (Veo 3.1). This may take 2-5 minutes, please wait...',
            sketchConverting: 'Converting sketch to product...',
            topGarmentConverting: 'Converting top garment to product...',
            bottomGarmentConverting: 'Converting bottom garment to product...',
            techDrawingPreparing: 'Preparing technical drawing...',
            aiThinking: 'AI is thinking...',
        },
        profileCreating: {
            title: 'Creating profile...',
            description: 'Setting up your account for the first time. This may take a few seconds.',
            autoRetrying: 'Automatically retrying...',
            retryButton: 'Retry',
            refreshPage: 'Refresh Page',
        },
        whatsappMessage: 'Hello, I would like to get information about Fasheone.',
        userName: 'User',
        alerts: {
            accountPreparing: 'Your account is being prepared. Please wait a few seconds and try again.',
            invalidAdmin: 'Invalid admin credentials!',
            fileUploadError: 'An error occurred while uploading the file. Please try again.',
            heroVideoUploaded: 'Hero Video {index} uploaded successfully!\n\nIt will appear on the homepage.',
            heroVideoFailed: '❌ Hero video upload failed: {error}',
            showcaseImageUploaded: '✅ {type} image uploaded successfully!\n\nIt will appear in the showcase section on the homepage.',
            showcaseImageFailed: '❌ {type} image upload failed: {error}',
            showcaseVideoUploaded: '✅ Showcase video uploaded successfully!\n\nIt will appear in the showcase section on the homepage.',
            showcaseVideoFailed: '❌ Showcase video upload failed: {error}',
            adgeniusUploaded: '✅ Image uploaded successfully!\n\nIt will appear in the AdGenius section on the homepage.',
            uploadFailed: '❌ Upload failed: {error}',
            logoUploaded: '✅ Logo video/image uploaded to database successfully!\n\nIt will now be visible to all users.',
            logoDbFailed: '❌ Could not upload to database:',
            logoConstraintError: '\n\n⚠️ ERROR CAUSE: Database does not accept "logo_media" type.\nPlease run the SQL command in "ADD_LOGO_MEDIA_CONSTRAINT.sql" file in the Supabase SQL Editor.',
            logoFallbackNote: '\n\n⚠️ Temporarily visible only in this browser.',
            productCreationError: 'Product creation error:',
            topGarmentCreationError: 'Top garment creation error:',
            bottomGarmentCreationError: 'Bottom garment creation error:',
            topGarmentProcessingError: 'Error processing top garment image.',
            bottomGarmentProcessingError: 'Error processing bottom garment image.',
            outfitModeBothRequired: 'Outfit mode requires both top and bottom garment images. Please upload or generate both pieces.',
            imageProcessingError: 'Error processing image.',
            pleaseUploadProduct: 'Please upload a product image first or generate one from a sketch.',
            imageGenerationError: 'An error occurred while generating the image:',
            genericError: 'Error:',
            videoCreationError: 'Error creating video:',
            downloadFailed: 'Download failed. Please try again.',
            noModelCreatedYet: 'No model has been created yet. Generate an image first, then you can lock the model.',
            supabaseBucketHint: '\n\nPlease make sure Supabase storage buckets are created.',
        },
        typeNames: {
            sketch: 'Sketch',
            product: 'Product',
            model: 'Model',
        },
    },
};
