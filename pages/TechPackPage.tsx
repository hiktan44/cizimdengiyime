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
            // Create PDF with multiple pages for full content
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 297;
            const pageHeight = 210;
            const margin = 15;
            const lineHeight = 5;
            let currentPage = 1;

            // Helper to add new page
            const addNewPage = () => {
                pdf.addPage();
                currentPage++;
                return margin; // Reset Y position
            };

            // Page 1: Header + Images
            pdf.setFillColor(30, 41, 59);
            pdf.rect(0, 0, pageWidth, 20, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('TECHNICAL SPECIFICATION SHEET', pageWidth / 2, 12, { align: 'center' });

            pdf.setTextColor(0, 0, 0);

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

            // Add images
            const imgWidth = 80;
            const imgHeight = 100;
            const startY = 30;

            pdf.addImage(frontImg, 'PNG', margin, startY, imgWidth, imgHeight, '', 'FAST');
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ÖN GÖRÜNÜM', margin + imgWidth / 2, startY + imgHeight + 8, { align: 'center' });

            const backX = margin + imgWidth + 15;
            pdf.addImage(backImg, 'PNG', backX, startY, imgWidth, imgHeight, '', 'FAST');
            pdf.text('ARKA GÖRÜNÜM', backX + imgWidth / 2, startY + imgHeight + 8, { align: 'center' });

            // Page 2: Full Measurements
            let textY = addNewPage();

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ÖLÇÜLER', margin, textY);
            textY += 10;

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const measurements = result.measurements.split('\n'); // TÜM satırlar

            measurements.forEach(line => {
                if (line.trim()) {
                    // Check if we need a new page
                    if (textY > pageHeight - 20) {
                        textY = addNewPage();
                        // Repeat header on new page
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text('ÖLÇÜLER (devam)', margin, textY);
                        textY += 8;
                        pdf.setFontSize(9);
                        pdf.setFont('helvetica', 'normal');
                    }

                    // Word wrap long lines
                    const maxWidth = pageWidth - 2 * margin;
                    const lines = pdf.splitTextToSize(line, maxWidth);
                    lines.forEach((wrappedLine: string) => {
                        pdf.text(wrappedLine, margin, textY);
                        textY += lineHeight;
                    });
                }
            });

            // Page 3+: Full Specifications
            textY += 10;
            if (textY > pageHeight - 20) {
                textY = addNewPage();
            }

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('SPESİFİKASYONLAR', margin, textY);
            textY += 10;

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            const specs = result.specifications.split('\n'); // TÜM satırlar

            specs.forEach(line => {
                if (line.trim()) {
                    // Check if we need a new page
                    if (textY > pageHeight - 20) {
                        textY = addNewPage();
                        // Repeat header on new page
                        pdf.setFontSize(12);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text('SPESİFİKASYONLAR (devam)', margin, textY);
                        textY += 8;
                        pdf.setFontSize(9);
                        pdf.setFont('helvetica', 'normal');
                    }

                    // Word wrap long lines
                    const maxWidth = pageWidth - 2 * margin;
                    const lines = pdf.splitTextToSize(line, maxWidth);
                    lines.forEach((wrappedLine: string) => {
                        pdf.text(wrappedLine, margin, textY);
                        textY += lineHeight;
                    });
                }
            });

            // Footer on last page
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(
                `Generated by Fasheone - ${new Date().toLocaleDateString('tr-TR')} - Sayfa ${currentPage}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: 'center' }
            );

            // Download PDF
            pdf.save(`tech-pack-${Date.now()}.pdf`);

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
