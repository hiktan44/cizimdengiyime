import React, { useState, useRef } from 'react';
import { generateTechPack } from '../services/geminiService';
import { uploadBase64ToStorage, saveGeneration, checkAndDeductCredits } from '../lib/database';
import { CREDIT_COSTS } from '../lib/supabase';
import jsPDF from 'jspdf';
import { GoogleGenAI } from '@google/genai';

interface TechPackPageProps {
    profile: any;
    onRefreshProfile: () => void;
    onShowBuyCredits?: () => void;
}

interface TechPackResult {
    frontView: string;
    backView: string;
    measurements: string;
    specifications: string;
}

const TechPackPage: React.FC<TechPackPageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
    const [frontImage, setFrontImage] = useState<string | null>(null);
    const [backImage, setBackImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<TechPackResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const frontInputRef = useRef<HTMLInputElement>(null);
    const backInputRef = useRef<HTMLInputElement>(null);


    const handleFrontImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setFrontImage(reader.result as string);
            setResult(null);
            setErrorMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleBackImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setBackImage(reader.result as string);
            setResult(null);
            setErrorMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if ((!frontImage && !backImage) || !profile) {
            setErrorMessage('Lütfen en az bir görsel seçin ve giriş yapın.');
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        try {
            // Check and deduct credits
            const creditResult = await checkAndDeductCredits(profile.id, 'tech_pack');
            if (!creditResult.success) {
                setErrorMessage(creditResult.message || 'Yetersiz kredi');
                if (onShowBuyCredits) onShowBuyCredits();
                return;
            }

            // AI TEKNİK ÇİZİM + TEXT ANALİZ
            let frontTechDrawing = '';
            let backTechDrawing = '';
            let measurements = '';
            let specifications = '';

            // Öncelik sırası: frontImage varsa onu kullan, yoksa backImage
            const primaryImage = frontImage || backImage;

            if (primaryImage) {
                try {
                    // generateTechPack hem ön hem arka çizim döndürür
                    const techPackResult = await generateTechPack(primaryImage);

                    // Ön çizim
                    if (frontImage) {
                        frontTechDrawing = techPackResult.frontView; // AI teknik çizim (ön)
                    } else {
                        // Sadece arka yüklendiyse, arka çizimi ön olarak kullan
                        frontTechDrawing = techPackResult.backView;
                    }

                    // Arka çizim - her durumda arka çizimi al
                    backTechDrawing = techPackResult.backView; // AI teknik çizim (arka)

                } catch (error) {
                    console.error('Teknik çizim hatası:', error);
                    // Fallback: gerçek resimleri kullan
                    frontTechDrawing = frontImage || backImage || '';
                    backTechDrawing = backImage || frontImage || '';
                }
            }

            // 3. TEXT analiz (ölçüler + spesifikasyonlar)
            const imageToAnalyze = frontImage || backImage;
            if (imageToAnalyze) {
                try {
                    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
                    const base64Data = imageToAnalyze.split(',')[1];
                    const mimeType = imageToAnalyze.split(';')[0].split(':')[1];

                    const imagePart = {
                        inlineData: { data: base64Data, mimeType }
                    };

                    const analysisPrompt = `Bu kıyafeti analiz et ve SADECE metin olarak detaylı teknik spesifikasyon hazırla:

1. ÖLÇÜLER (cm cinsinden):
- Göğüs/Beden genişliği: [tahmin et]
- Omuz genişliği: [tahmin et]  
- Kol boyu: [tahmin et]
- Ürün boyu: [tahmin et]
- Etek genişliği: [tahmin et]
- Yaka ölçüleri: [varsa]
- Kol ağzı ölçüleri: [varsa]
- Koltuk derinliği: [tahmin et]

2. KUMAŞ VE MALZEME:
- Ana kumaş: [türü ve ağırlığı]
- Astar: [varsa]
- Ara malzeme: [varsa]

3. DİKİŞ DETAYLARI:
- Dikiş türleri: [301, 401, 504 vb.]
- Dikiş payları: [standart veya özel]
- Üst dikiş detayları: [genişlik ve renk]

4. TASARIM ÖZELLİKLERİ:
- Yaka tipi ve yapısı: [detaylı açıklama]
- Kol tipi ve yapısı: [detaylı açıklama]
- Kapama türü: [düğme, fermuar vb.]
- Cep detayları: [tip, yerleşim, yapı]
- Etek bitimi: [tip ve ölçü]
- Kol ağzı bitimi: [varsa]

5. AKSESUAR VE DONANIM:
- Düğme: [tip, boyut, adet]
- Fermuar: [tip ve uzunluk, varsa]
- İplik rengi: [uyumlu veya kontrast]

Profesyonel tech pack formatında sun. SADECE METIN döndür, görsel oluşturma.`;

                    const response = await ai.models.generateContent({
                        model: 'gemini-3-pro-preview',
                        contents: {
                            parts: [imagePart, { text: analysisPrompt }]
                        }
                    });

                    const fullText = response.text || '';
                    const sections = fullText.split(/2\.\s*KUMAŞ VE MALZEME:/i);
                    measurements = sections[0].replace(/1\.\s*ÖLÇÜLER.*?:/i, '').trim();
                    specifications = sections[1] ? '2. KUMAŞ VE MALZEME:' + sections[1] : fullText;
                } catch (error) {
                    console.error('AI analiz hatası:', error);
                    measurements = 'Analiz yapılamadı';
                    specifications = 'Analiz yapılamadı';
                }
            }

            const techPackResult = {
                frontView: frontTechDrawing || frontImage || '',
                backView: backTechDrawing || backImage || '',
                measurements,
                specifications
            };
            setResult(techPackResult);

            // Save to history
            const uploadedInput = frontImage ? await uploadBase64ToStorage(frontImage, profile.id, 'input') : '';
            const uploadedFront = frontImage ? await uploadBase64ToStorage(frontImage, profile.id, 'output') : '';
            const uploadedBack = backImage ? await uploadBase64ToStorage(backImage, profile.id, 'output') : '';

            await saveGeneration(
                profile.id,
                'tech_pack',
                CREDIT_COSTS.TECH_PACK,
                uploadedInput,
                uploadedFront,
                null,
                {
                    backView: uploadedBack,
                    measurements: techPackResult.measurements,
                    specifications: techPackResult.specifications
                }
            );

            onRefreshProfile();

            // Track event if analytics exists
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'generate_tech_pack', {
                    userId: profile.id
                });
            }

        } catch (error: any) {
            setErrorMessage(error.message || 'Bir hata oluştu');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTechPack = async () => {
        if (!result) return;

        try {
            // Create PDF - Landscape A4
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 297;
            const pageHeight = 210;

            // Load images for PDF - Boş görselleri kontrol et
            const frontImg = new Image();
            const schemaImg = new Image();
            const backImg = new Image();
            frontImg.crossOrigin = 'anonymous';
            schemaImg.crossOrigin = 'anonymous';
            backImg.crossOrigin = 'anonymous';

            // Fallback görseller - boş olanlar için
            const fallbackFront = result.frontView || frontImage || backImage || '';
            const fallbackSchema = frontImage || result.frontView || backImage || '';
            const fallbackBack = result.backView || backImage || frontImage || '';

            if (!fallbackFront || !fallbackSchema || !fallbackBack) {
                throw new Error('Teknik çizimler oluşturulamadı. Lütfen tekrar deneyin.');
            }

            await Promise.all([
                new Promise<void>((resolve, reject) => {
                    frontImg.onload = () => resolve();
                    frontImg.onerror = () => {
                        console.error('Ön görsel yüklenemedi');
                        reject(new Error('Ön görsel yüklenemedi'));
                    };
                    frontImg.src = fallbackFront;
                }),
                new Promise<void>((resolve, reject) => {
                    schemaImg.onload = () => resolve();
                    schemaImg.onerror = () => {
                        console.error('Schema görsel yüklenemedi');
                        reject(new Error('Schema görsel yüklenemedi'));
                    };
                    schemaImg.src = fallbackSchema;
                }),
                new Promise<void>((resolve, reject) => {
                    backImg.onload = () => resolve();
                    backImg.onerror = () => {
                        console.error('Arka görsel yüklenemedi');
                        reject(new Error('Arka görsel yüklenemedi'));
                    };
                    backImg.src = fallbackBack;
                })
            ]);

            // ========== PAGE 1: TECH PACK SHEET ==========
            const canvas1 = document.createElement('canvas');
            const ctx1 = canvas1.getContext('2d')!;
            canvas1.width = pageWidth * 3.78; // 300 DPI
            canvas1.height = pageHeight * 3.78;

            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(0, 0, canvas1.width, canvas1.height);

            const scale = 3.78; // mm to pixels
            const drawRect = (x: number, y: number, w: number, h: number, fill = false) => {
                if (fill) ctx1.fillRect(x * scale, y * scale, w * scale, h * scale);
                else ctx1.strokeRect(x * scale, y * scale, w * scale, h * scale);
            };
            const drawText = (text: string, x: number, y: number, align: 'left' | 'center' | 'right' = 'left') => {
                ctx1.textAlign = align;
                ctx1.fillText(text, x * scale, y * scale);
            };

            // Border
            ctx1.strokeStyle = '#000000';
            ctx1.lineWidth = 2;
            drawRect(3, 3, 291, 204);

            // Header section
            ctx1.fillStyle = '#e5e7eb';
            drawRect(5, 5, 100, 12, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 20px Arial';
            drawText('FİRMA BİLGİLERİ', 7, 13);

            ctx1.strokeStyle = '#666666';
            ctx1.lineWidth = 1;
            drawRect(5, 18, 100, 20);
            ctx1.font = '16px Arial';
            drawText('Firma: Fasheone', 7, 25);
            drawText('Model No: _________', 7, 32);
            drawText('Sezon: FW 2026', 7, 39);

            // Product info
            ctx1.fillStyle = '#e5e7eb';
            drawRect(107, 5, 120, 12, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 20px Arial';
            drawText('ÜRÜN BİLGİLERİ', 109, 13);

            ctx1.strokeStyle = '#666666';
            drawRect(107, 18, 120, 20);
            ctx1.font = '16px Arial';
            drawText('Stil No: _________', 109, 25);
            drawText('Model: Klasik', 109, 32);
            drawText('Renk: _________', 165, 25);
            drawText('Beden: _________', 165, 32);

            // Size table - FIXED LAYOUT
            ctx1.fillStyle = '#e5e7eb';
            drawRect(229, 5, 63, 12, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 18px Arial';
            drawText('BEDEN TABLOSU', 231, 13, 'left');

            // Size grid - NO OVERLAPPING
            const sizes = ['S', 'M', 'L'];
            const sizeX = 229;
            const sizeW = 21; // Sabit genişlik
            let sizeY = 18;

            ctx1.strokeStyle = '#000000';
            ctx1.lineWidth = 1.5; // Kalın çerçeve
            ctx1.font = 'bold 12px Arial'; // Biraz küçültüldü

            // Header row
            sizes.forEach((size, i) => {
                drawRect(sizeX + i * sizeW, sizeY, sizeW, 7);
                drawText(size, sizeX + i * sizeW + sizeW / 2, sizeY + 5, 'center');
            });

            // Data rows
            ctx1.font = '11px Arial';
            for (let i = 0; i < 2; i++) { // 2 satır yeterli
                sizeY += 7;
                sizes.forEach((_, j) => {
                    drawRect(sizeX + j * sizeW, sizeY, sizeW, 7);
                    drawText('—', sizeX + j * sizeW + sizeW / 2, sizeY + 5, 'center');
                });
            }



            // Main images section
            const imgY = 42;
            const imgW = 60;
            const imgH = 75;

            // FRONT
            ctx1.fillStyle = '#e5e7eb';
            drawRect(5, imgY, imgW, 8, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 18px Arial';
            drawText('FRONT', 35, imgY + 6, 'center');

            ctx1.strokeStyle = '#666666';
            drawRect(5, imgY + 8, imgW, imgH);
            ctx1.drawImage(frontImg, 5 * scale, (imgY + 8) * scale, imgW * scale, imgH * scale);

            // SCHEMA - REAL PRODUCT IMAGE HERE
            ctx1.fillStyle = '#e5e7eb';
            drawRect(67, imgY, imgW, 8, true);
            ctx1.fillStyle = '#000000';
            drawText('SCHEMA', 97, imgY + 6, 'center');

            ctx1.strokeStyle = '#666666';
            ctx1.lineWidth = 1;
            drawRect(67, imgY + 8, imgW, imgH);
            // Place REAL product image in schema section
            ctx1.drawImage(schemaImg, 67 * scale, (imgY + 8) * scale, imgW * scale, imgH * scale);

            // BACK
            ctx1.fillStyle = '#e5e7eb';
            drawRect(129, imgY, imgW, 8, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 18px Arial';
            drawText('BACK', 159, imgY + 6, 'center');

            ctx1.strokeStyle = '#666666';
            drawRect(129, imgY + 8, imgW, imgH);
            ctx1.drawImage(backImg, 129 * scale, (imgY + 8) * scale, imgW * scale, imgH * scale);

            // Measurements Table
            const tableY = 125;
            ctx1.fillStyle = '#e5e7eb';
            drawRect(5, tableY, 284, 8, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 16px Arial';
            drawText('ÖLÇÜ TABLOSU', 8, tableY + 6);

            // Table headers
            const cols = [
                { x: 5, w: 50, label: 'PARÇA' },
                { x: 55, w: 20, label: 'KOD' },
                { x: 75, w: 50, label: 'ÜRÜN BİLGİSİ' },
                { x: 125, w: 40, label: 'ÖLÇÜ (CM)' },
                { x: 165, w: 60, label: 'TÜKETİM MİKTARI' },
                { x: 225, w: 64, label: 'RENK / MALZEME' }
            ];

            ctx1.font = 'bold 12px Arial';
            cols.forEach(col => {
                drawRect(col.x, tableY + 8, col.w, 6);
                drawText(col.label, col.x + 2, tableY + 13);
            });

            // Empty rows - NO MEASUREMENT TEXT, just empty rows for manual fill
            let rowY = tableY + 14;

            ctx1.font = '11px Arial';
            ctx1.strokeStyle = '#666666';
            ctx1.lineWidth = 1;

            // Draw 10 empty rows
            for (let i = 0; i < 10; i++) {
                drawRect(5, rowY, 50, 6);
                drawRect(55, rowY, 20, 6);
                drawRect(75, rowY, 50, 6);
                drawRect(125, rowY, 40, 6);
                drawRect(165, rowY, 60, 6);
                drawRect(225, rowY, 64, 6);
                rowY += 6;
            }

            // Color variants section
            const colorY = 165;
            ctx1.fillStyle = '#e5e7eb';
            drawRect(5, colorY, 140, 6, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 14px Arial';
            drawText('RENK VARYANTları', 8, colorY + 5);

            // Color boxes
            for (let i = 0; i < 6; i++) {
                const x = 5 + i * 23;
                drawRect(x, colorY + 7, 22, 15);
                ctx1.font = '10px Arial';
                drawText(`Renk ${i + 1}`, x + 11, colorY + 24, 'center');
            }

            // Material info
            ctx1.fillStyle = '#e5e7eb';
            drawRect(148, colorY, 72, 6, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 14px Arial';
            drawText('KUMAŞ / MALZEME', 150, colorY + 5);

            drawRect(148, colorY + 7, 72, 28);
            ctx1.font = '11px Arial';
            drawText('Ana Kumaş: ________', 150, colorY + 12);
            drawText('Astar: ________', 150, colorY + 20);
            drawText('Detay: ________', 150, colorY + 28);
            drawText('Diğer: ________', 150, colorY + 36);

            // Notes section
            ctx1.fillStyle = '#e5e7eb';
            drawRect(223, colorY, 66, 6, true);
            ctx1.fillStyle = '#000000';
            ctx1.font = 'bold 14px Arial';
            drawText('NOTLAR', 225, colorY + 5);

            drawRect(223, colorY + 7, 66, 28);
            ctx1.font = '10px Arial';
            drawText('Dikkat edilecek', 225, colorY + 12);
            drawText('hususlar...', 225, colorY + 20);

            // Footer
            ctx1.font = '10px Arial';
            ctx1.fillStyle = '#666666';
            drawText(`Generated by Fasheone - ${new Date().toLocaleDateString('tr-TR')}`, 148, 206, 'center');

            // Add page 1 to PDF
            const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData1, 'JPEG', 0, 0, pageWidth, pageHeight);

            // ========== PAGE 2+: TEXT CONTENT ==========
            const createTextPage = (title: string, content: string[]) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;
                canvas.width = pageWidth * 3.78;
                canvas.height = pageHeight * 3.78;

                // Background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Header
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 0, canvas.width, 100);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(title, canvas.width / 2, 65);

                // Content area
                let y = 180;
                const margin = 80;
                const lineHeight = 42;
                const maxWidth = canvas.width - 2 * margin;

                ctx.textAlign = 'left';
                ctx.fillStyle = '#1e293b';
                ctx.font = '26px Arial';

                content.forEach((line, index) => {
                    if (y > canvas.height - 80) return;

                    // Zebra striping
                    if (index % 2 === 0) {
                        ctx.fillStyle = '#f8fafc';
                        ctx.fillRect(margin - 30, y - 32, canvas.width - 2 * margin + 60, lineHeight);
                    }

                    ctx.fillStyle = '#1e293b';
                    ctx.font = '26px Arial';

                    // Word wrap
                    const words = line.split(' ');
                    let currentLine = '';

                    words.forEach(word => {
                        const testLine = currentLine + (currentLine ? ' ' : '') + word;
                        const metrics = ctx.measureText(testLine);

                        if (metrics.width > maxWidth && currentLine) {
                            ctx.fillText(currentLine, margin, y);
                            y += lineHeight;
                            currentLine = word;
                        } else {
                            currentLine = testLine;
                        }
                    });

                    if (currentLine) {
                        ctx.fillText(currentLine, margin, y);
                        y += lineHeight;
                    }
                });

                return canvas.toDataURL('image/jpeg', 0.95);
            };

            // Add detail pages for remaining measurements
            const measurements = result.measurements.split('\n').filter(l => l.trim());
            if (measurements.length > 5) {
                const remaining = measurements.slice(5);
                const perPage = 20;

                for (let i = 0; i < remaining.length; i += perPage) {
                    pdf.addPage();
                    const chunk = remaining.slice(i, i + perPage);
                    const pageNum = Math.floor(i / perPage) + 1;
                    const totalPages = Math.ceil(remaining.length / perPage);
                    const title = totalPages > 1
                        ? `DETAYLI ÖLÇÜLER (${pageNum}/${totalPages})`
                        : 'DETAYLI ÖLÇÜLER';

                    const imgData = createTextPage(title, chunk);
                    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
                }
            }

            // Add specifications pages
            const specs = result.specifications.split('\n').filter(l => l.trim());
            const specsPerPage = 20;

            for (let i = 0; i < specs.length; i += specsPerPage) {
                pdf.addPage();
                const chunk = specs.slice(i, i + specsPerPage);
                const pageNum = Math.floor(i / specsPerPage) + 1;
                const totalPages = Math.ceil(specs.length / specsPerPage);
                const title = totalPages > 1
                    ? `SPESİFİKASYONLAR (${pageNum}/${totalPages})`
                    : 'SPESİFİKASYONLAR';

                const imgData = createTextPage(title, chunk);
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
            }

            // Download
            pdf.save(`fasheone-tech-pack-${Date.now()}.pdf`);

        } catch (error) {
            console.error('Download error:', error);
            alert('İndirme sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
                            Tech Pack
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        Ürün fotoğraflarınızı üretim için detaylı teknik çizimlere dönüştürün
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                    {[
                        { icon: '📐', title: 'Ölçülü Çizim', desc: 'Detaylı ölçü notları' },
                        { icon: '🧵', title: 'Dikiş Analizi', desc: 'Otomatik dikiş tespiti' },
                        { icon: '👔', title: 'Ön/Arka Görünüm', desc: 'Profesyonel layout' },
                        { icon: '📋', title: 'Teknik Detaylar', desc: 'Üretim spesifikasyonları' }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                            <div className="text-4xl mb-3">{feature.icon}</div>
                            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Credit Info */}
                {profile && (
                    <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 rounded-lg px-6 py-4 mb-8 flex items-center justify-between">
                        <span className="text-slate-300">
                            Bu işlem <span className="text-orange-400 font-bold">{CREDIT_COSTS.TECH_PACK} kredi</span> harcar
                        </span>
                        <span className="text-slate-200">
                            Mevcut: <span className="text-orange-400 font-bold">{profile.credits}</span> kredi
                        </span>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="space-y-6">
                        {/* Front Image Upload */}
                        <div className="bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 text-center">📸 Ön Görsel</h2>

                            <input
                                ref={frontInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFrontImageSelect}
                                className="hidden"
                            />

                            {!frontImage ? (
                                <button
                                    onClick={() => frontInputRef.current?.click()}
                                    className="w-full h-64 flex flex-col items-center justify-center gap-3 bg-slate-700/30 hover:bg-slate-700/50 border-2 border-slate-600 rounded-xl transition-all"
                                >
                                    <span className="text-4xl">🔼</span>
                                    <span className="text-lg font-semibold">Ön Görsel Seç</span>
                                </button>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={frontImage}
                                        alt="Front"
                                        className="w-full h-64 object-contain rounded-xl bg-slate-900"
                                    />
                                    <button
                                        onClick={() => frontInputRef.current?.click()}
                                        className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-sm transition-all"
                                    >
                                        🔄 Değiştir
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Back Image Upload */}
                        <div className="bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-2xl p-6">
                            <h2 className="text-xl font-bold mb-4 text-center">📸 Arka Görsel</h2>

                            <input
                                ref={backInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleBackImageSelect}
                                className="hidden"
                            />

                            {!backImage ? (
                                <button
                                    onClick={() => backInputRef.current?.click()}
                                    className="w-full h-64 flex flex-col items-center justify-center gap-3 bg-slate-700/30 hover:bg-slate-700/50 border-2 border-slate-600 rounded-xl transition-all"
                                >
                                    <span className="text-4xl">🔽</span>
                                    <span className="text-lg font-semibold">Arka Görsel Seç</span>
                                </button>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={backImage}
                                        alt="Back"
                                        className="w-full h-64 object-contain rounded-xl bg-slate-900"
                                    />
                                    <button
                                        onClick={() => backInputRef.current?.click()}
                                        className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-sm transition-all"
                                    >
                                        🔄 Değiştir
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Generate Button */}
                        {(frontImage || backImage) && !result && (
                            <button
                                onClick={handleGenerate}
                                disabled={isProcessing || !profile}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? '⚙️ İşleniyor...' : '🚀 Tech Pack Oluştur'}
                            </button>
                        )}

                        {errorMessage && (
                            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                                {errorMessage}
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-6 text-center">Tech Pack Sonucu</h2>

                        {!result ? (
                            <div className="h-96 flex flex-col items-center justify-center text-slate-500">
                                <span className="text-6xl mb-4">📋</span>
                                <p>Teknik çizim burada görünecek</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Front and Back Views */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400 mb-2 text-center">ÖN GÖRÜNÜM</p>
                                        <img
                                            src={result.frontView}
                                            alt="Front View"
                                            className="w-full rounded-lg bg-white"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-2 text-center">ARKA GÖRÜNÜM</p>
                                        <img
                                            src={result.backView}
                                            alt="Back View"
                                            className="w-full rounded-lg bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Measurements */}
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <h3 className="font-bold text-orange-400 mb-2">ÖLÇÜLER</h3>
                                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">{result.measurements}</pre>
                                </div>

                                {/* Specifications */}
                                <div className="bg-slate-900/50 rounded-lg p-4">
                                    <h3 className="font-bold text-orange-400 mb-2">TEKNİK DETAYLAR</h3>
                                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">{result.specifications}</pre>
                                </div>

                                {/* Download Button */}
                                <button
                                    onClick={downloadTechPack}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all"
                                >
                                    📥 Tech Pack İndir
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default TechPackPage;
