import React, { useState, useRef } from 'react';
import { generateTechPack } from '../services/geminiService';
import { uploadBase64ToStorage, saveGeneration, checkAndDeductCredits } from '../lib/database';
import { CREDIT_COSTS } from '../lib/supabase';
import { WhatsAppPanel } from '../components/WhatsAppPanel';
import jsPDF from 'jspdf';

interface TechPackPageProps {
    profile: any;
    onRefreshProfile: () => void;
    onShowBuyCredits?: () => void;
}

const TechPackPage: React.FC<TechPackPageProps> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{
        frontView: string;
        backView: string;
        measurements: string;
        specifications: string;
    } | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
    const whatsappMessage = encodeURIComponent('Merhaba! Tech Pack hakkında bilgi almak istiyorum.');
    const whatsappSubtitle = 'Teknik çizim desteği için';

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedImage(event.target?.result as string);
            setResult(null);
            setErrorMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!selectedImage || !profile) {
            setErrorMessage('Lütfen bir görsel seçin ve giriş yapın.');
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

            // Generate tech pack
            const techPackResult = await generateTechPack(selectedImage);
            setResult(techPackResult);

            // Save to history
            const uploadedInput = await uploadBase64ToStorage(selectedImage, profile.id, 'input');
            const uploadedFront = await uploadBase64ToStorage(techPackResult.frontView, profile.id, 'output');
            const uploadedBack = await uploadBase64ToStorage(techPackResult.backView, profile.id, 'output');

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

            const pageWidth = 297; // A4 landscape width
            const pageHeight = 210; // A4 landscape height

            // Load images
            const frontImg = new Image();
            const backImg = new Image();
            frontImg.crossOrigin = 'anonymous';
            backImg.crossOrigin = 'anonymous';

            await Promise.all([
                new Promise<void>((resolve, reject) => {
                    frontImg.onload = () => resolve();
                    frontImg.onerror = reject;
                    frontImg.src = result.frontView;
                }),
                new Promise<void>((resolve, reject) => {
                    backImg.onload = () => resolve();
                    backImg.onerror = reject;
                    backImg.src = result.backView;
                })
            ]);

            // ========== PAGE 1: IMAGES ONLY ==========
            const canvas1 = document.createElement('canvas');
            const ctx1 = canvas1.getContext('2d')!;
            canvas1.width = pageWidth * 3.78; // 300 DPI
            canvas1.height = pageHeight * 3.78;

            // White background
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(0, 0, canvas1.width, canvas1.height);

            // Simple header bar
            ctx1.fillStyle = '#1e293b';
            ctx1.fillRect(0, 0, canvas1.width, 80);

            ctx1.fillStyle = '#ffffff';
            ctx1.font = 'bold 42px Arial';
            ctx1.textAlign = 'left';
            ctx1.fillText('FİCHA DE PRODUCTO - TEKNİK ÖZELLİKLER', 50, 55);

            // Date on right
            ctx1.font = '24px Arial';
            ctx1.textAlign = 'right';
            const date = new Date().toLocaleDateString('tr-TR');
            ctx1.fillText(date, canvas1.width - 50, 55);

            // Two large images side by side
            const imgMargin = 100;
            const imgStartY = 120;
            const availableWidth = canvas1.width - imgMargin * 3; // space for 2 images + 3 margins
            const imgWidth = availableWidth / 2;
            const imgHeight = canvas1.height - imgStartY - 150; // leave space for labels

            // Front view
            const frontX = imgMargin;

            // Draw white background box
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(frontX - 10, imgStartY - 10, imgWidth + 20, imgHeight + 70);

            // Draw border
            ctx1.strokeStyle = '#cbd5e1';
            ctx1.lineWidth = 2;
            ctx1.strokeRect(frontX - 10, imgStartY - 10, imgWidth + 20, imgHeight + 70);

            // Draw image
            ctx1.drawImage(frontImg, frontX, imgStartY, imgWidth, imgHeight);

            // Label below
            ctx1.fillStyle = '#1e293b';
            ctx1.font = 'bold 32px Arial';
            ctx1.textAlign = 'center';
            ctx1.fillText('FRENTE (ÖN)', frontX + imgWidth / 2, imgStartY + imgHeight + 45);

            // Back view
            const backX = imgMargin * 2 + imgWidth;

            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(backX - 10, imgStartY - 10, imgWidth + 20, imgHeight + 70);

            ctx1.strokeStyle = '#cbd5e1';
            ctx1.lineWidth = 2;
            ctx1.strokeRect(backX - 10, imgStartY - 10, imgWidth + 20, imgHeight + 70);

            ctx1.drawImage(backImg, backX, imgStartY, imgWidth, imgHeight);

            ctx1.fillStyle = '#1e293b';
            ctx1.font = 'bold 32px Arial';
            ctx1.fillText('ESPALDA (ARKA)', backX + imgWidth / 2, imgStartY + imgHeight + 45);

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
                    if (y > canvas.height - 80) return; // Stop if near bottom

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

            // Add measurements pages
            const measurements = result.measurements.split('\n').filter(l => l.trim());
            const measurementsPerPage = 20;

            for (let i = 0; i < measurements.length; i += measurementsPerPage) {
                pdf.addPage();
                const chunk = measurements.slice(i, i + measurementsPerPage);
                const pageNum = Math.floor(i / measurementsPerPage) + 1;
                const totalPages = Math.ceil(measurements.length / measurementsPerPage);
                const title = totalPages > 1
                    ? `ÖLÇÜLER (${pageNum}/${totalPages})`
                    : 'ÖLÇÜLER';

                const imgData = createTextPage(title, chunk);
                pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
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
                    <div className="bg-slate-800/30 border-2 border-dashed border-slate-600 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold mb-6 text-center">Ürün Görseli Yükle</h2>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        {!selectedImage ? (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-96 flex flex-col items-center justify-center gap-4 bg-slate-700/30 hover:bg-slate-700/50 border-2 border-slate-600 rounded-xl transition-all"
                            >
                                <span className="text-6xl">📸</span>
                                <span className="text-xl font-semibold">Görsel Seç</span>
                                <span className="text-sm text-slate-400">Ürün fotoğrafı yükleyin</span>
                            </button>
                        ) : (
                            <div className="relative">
                                <img
                                    src={selectedImage}
                                    alt="Selected"
                                    className="w-full h-96 object-contain rounded-xl bg-slate-900"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all"
                                >
                                    🔄 Değiştir
                                </button>
                            </div>
                        )}

                        {selectedImage && !result && (
                            <button
                                onClick={handleGenerate}
                                disabled={isProcessing || !profile}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? '⚙️ İşleniyor...' : '🚀 Tech Pack Oluştur'}
                            </button>
                        )}

                        {errorMessage && (
                            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
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

            <WhatsAppPanel
                phoneNumber={whatsappNumber}
                message={whatsappMessage}
                title="WhatsApp"
                subtitle={whatsappSubtitle}
            />
        </div>
    );
};

export default TechPackPage;
