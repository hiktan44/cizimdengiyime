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
            // Load custom font first
            const loadFont = () => {
                return new Promise<void>((resolve) => {
                    const link = document.createElement('link');
                    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
                    link.rel = 'stylesheet';
                    link.onload = () => resolve();
                    document.head.appendChild(link);
                });
            };

            await loadFont();

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 210; // A4 width
            const pageHeight = 297; // A4 height

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

            // Page 1: Cover + Images
            const canvas1 = document.createElement('canvas');
            const ctx1 = canvas1.getContext('2d')!;
            canvas1.width = pageWidth * 3.78; // 300 DPI
            canvas1.height = pageHeight * 3.78;

            // Background
            ctx1.fillStyle = '#ffffff';
            ctx1.fillRect(0, 0, canvas1.width, canvas1.height);

            // Gradient Header
            const gradient = ctx1.createLinearGradient(0, 0, canvas1.width, 200);
            gradient.addColorStop(0, '#6366f1'); // Indigo
            gradient.addColorStop(1, '#8b5cf6'); // Purple
            ctx1.fillStyle = gradient;
            ctx1.fillRect(0, 0, canvas1.width, 200);

            // Title
            ctx1.fillStyle = '#ffffff';
            ctx1.font = 'bold 56px Inter, Arial';
            ctx1.textAlign = 'center';
            ctx1.fillText('TEKNİK ÖZELLİKLER', canvas1.width / 2, 100);
            ctx1.font = '32px Inter, Arial';
            ctx1.fillText('Technical Specification Sheet', canvas1.width / 2, 150);

            // Date
            ctx1.font = '24px Inter, Arial';
            const date = new Date().toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            ctx1.fillText(date, canvas1.width / 2, 185);

            // Images Section
            const imgStartY = 250;
            const imgWidth = 500;
            const imgHeight = 650;
            const spacing = 80;

            // Front View
            const frontX = (canvas1.width - imgWidth * 2 - spacing) / 2;

            // Border for image
            ctx1.strokeStyle = '#e2e8f0';
            ctx1.lineWidth = 3;
            ctx1.strokeRect(frontX - 15, imgStartY - 15, imgWidth + 30, imgHeight + 80);

            ctx1.drawImage(frontImg, frontX, imgStartY, imgWidth, imgHeight);

            // Label
            ctx1.fillStyle = '#1e293b';
            ctx1.font = 'bold 32px Inter, Arial';
            ctx1.textAlign = 'center';
            ctx1.fillText('ÖN GÖRÜNÜM', frontX + imgWidth / 2, imgStartY + imgHeight + 50);

            // Back View
            const backX = frontX + imgWidth + spacing;

            ctx1.strokeRect(backX - 15, imgStartY - 15, imgWidth + 30, imgHeight + 80);
            ctx1.drawImage(backImg, backX, imgStartY, imgWidth, imgHeight);

            ctx1.fillText('ARKA GÖRÜNÜM', backX + imgWidth / 2, imgStartY + imgHeight + 50);

            // Add page 1 to PDF
            const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData1, 'JPEG', 0, 0, pageWidth, pageHeight);

            // Page 2: Measurements
            pdf.addPage();
            const canvas2 = document.createElement('canvas');
            const ctx2 = canvas2.getContext('2d')!;
            canvas2.width = pageWidth * 3.78;
            canvas2.height = pageHeight * 3.78;

            ctx2.fillStyle = '#ffffff';
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

            // Header
            const gradient2 = ctx2.createLinearGradient(0, 0, canvas2.width, 150);
            gradient2.addColorStop(0, '#6366f1');
            gradient2.addColorStop(1, '#8b5cf6');
            ctx2.fillStyle = gradient2;
            ctx2.fillRect(0, 0, canvas2.width, 150);

            ctx2.fillStyle = '#ffffff';
            ctx2.font = 'bold 48px Inter, Arial';
            ctx2.textAlign = 'center';
            ctx2.fillText('ÖLÇÜLER', canvas2.width / 2, 95);

            // Content
            let y = 230;
            const margin = 100;
            const lineHeight = 45;

            ctx2.textAlign = 'left';
            ctx2.fillStyle = '#1e293b';
            ctx2.font = '28px Inter, Arial';

            const measurements = result.measurements.split('\n').filter(line => line.trim());
            measurements.forEach((line, index) => {
                if (y > canvas2.height - 100) return;

                // Alternate row background
                if (index % 2 === 0) {
                    ctx2.fillStyle = '#f8fafc';
                    ctx2.fillRect(margin - 20, y - 35, canvas2.width - 2 * margin + 40, lineHeight);
                }

                ctx2.fillStyle = '#1e293b';
                ctx2.font = '28px Inter, Arial';

                // Word wrap
                const maxWidth = canvas2.width - 2 * margin;
                const words = line.split(' ');
                let currentLine = '';

                words.forEach(word => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const metrics = ctx2.measureText(testLine);

                    if (metrics.width > maxWidth && currentLine) {
                        ctx2.fillText(currentLine, margin, y);
                        y += lineHeight;
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });

                if (currentLine) {
                    ctx2.fillText(currentLine, margin, y);
                    y += lineHeight;
                }
            });

            const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData2, 'JPEG', 0, 0, pageWidth, pageHeight);

            // Page 3: Specifications
            pdf.addPage();
            const canvas3 = document.createElement('canvas');
            const ctx3 = canvas3.getContext('2d')!;
            canvas3.width = pageWidth * 3.78;
            canvas3.height = pageHeight * 3.78;

            ctx3.fillStyle = '#ffffff';
            ctx3.fillRect(0, 0, canvas3.width, canvas3.height);

            // Header
            const gradient3 = ctx3.createLinearGradient(0, 0, canvas3.width, 150);
            gradient3.addColorStop(0, '#6366f1');
            gradient3.addColorStop(1, '#8b5cf6');
            ctx3.fillStyle = gradient3;
            ctx3.fillRect(0, 0, canvas3.width, 150);

            ctx3.fillStyle = '#ffffff';
            ctx3.font = 'bold 48px Inter, Arial';
            ctx3.textAlign = 'center';
            ctx3.fillText('SPESİFİKASYONLAR', canvas3.width / 2, 95);

            // Content
            y = 230;
            ctx3.textAlign = 'left';
            ctx3.fillStyle = '#1e293b';
            ctx3.font = '28px Inter, Arial';

            const specs = result.specifications.split('\n').filter(line => line.trim());
            specs.forEach((line, index) => {
                if (y > canvas3.height - 100) return;

                if (index % 2 === 0) {
                    ctx3.fillStyle = '#f8fafc';
                    ctx3.fillRect(margin - 20, y - 35, canvas3.width - 2 * margin + 40, lineHeight);
                }

                ctx3.fillStyle = '#1e293b';
                ctx3.font = '28px Inter, Arial';

                const maxWidth = canvas3.width - 2 * margin;
                const words = line.split(' ');
                let currentLine = '';

                words.forEach(word => {
                    const testLine = currentLine + (currentLine ? ' ' : '') + word;
                    const metrics = ctx3.measureText(testLine);

                    if (metrics.width > maxWidth && currentLine) {
                        ctx3.fillText(currentLine, margin, y);
                        y += lineHeight;
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });

                if (currentLine) {
                    ctx3.fillText(currentLine, margin, y);
                    y += lineHeight;
                }
            });

            const imgData3 = canvas3.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData3, 'JPEG', 0, 0, pageWidth, pageHeight);

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
