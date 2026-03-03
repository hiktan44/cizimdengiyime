import React, { useState, useRef } from 'react';
import { generateTechPackPro } from '../services/geminiService';
import { checkAndDeductCredits, refundCredits } from '../lib/database';
// @ts-ignore
import jsPDF from 'jspdf';

interface Props { profile: any; onRefreshProfile: () => void; onShowBuyCredits: () => void; }
const BRAND = 'FASHEONE';
const TP = 7;

// === LIGHTBOX ===
const Lightbox: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => (
    <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={onClose}>
        <img src={src} className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl" alt="Büyütülmüş" />
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-xl backdrop-blur">✕</button>
    </div>
);

const ZoomImg: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
    const [open, setOpen] = useState(false);
    return (<><img src={src} alt={alt} className={`${className || ''} cursor-zoom-in hover:opacity-90 transition`} onClick={() => setOpen(true)} />{open && <Lightbox src={src} onClose={() => setOpen(false)} />}</>);
};

// === EDITABLE FIELD ===
const EF: React.FC<{ value: string; onChange: (v: string) => void; className?: string; tag?: 'input' | 'textarea' }> = ({ value, onChange, className, tag = 'input' }) => {
    if (tag === 'textarea') return <textarea value={value} onChange={e => onChange(e.target.value)} className={`bg-transparent border-b border-dashed border-slate-600 focus:border-teal-400 focus:bg-slate-800/50 outline-none px-1 py-0.5 rounded transition w-full resize-none ${className || ''}`} rows={2} />;
    return <input type="text" value={value} onChange={e => onChange(e.target.value)} className={`bg-transparent border-b border-dashed border-slate-600 focus:border-teal-400 focus:bg-slate-800/50 outline-none px-1 py-0.5 rounded transition w-full ${className || ''}`} />;
};

// === PAGE HEADER (UI) ===
const PH: React.FC<{ sc: string; sn: string; pg: number; dt: string }> = ({ sc, sn, pg, dt }) => (
    <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 rounded-xl p-4 mb-5 border border-slate-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
                <span className="text-lg font-black text-teal-400">{BRAND}</span>
                <div className="h-6 w-px bg-slate-600" />
                <div><p className="text-xs text-slate-500">Stil No</p><p className="text-sm font-bold text-white">{sc}</p></div>
                <div className="h-6 w-px bg-slate-600" />
                <div><p className="text-xs text-slate-500">Ürün</p><p className="text-sm font-bold text-white">{sn}</p></div>
            </div>
            <div className="flex items-center gap-3">
                <div className="text-right"><p className="text-xs text-slate-500">Tarih</p><p className="text-sm text-slate-300">{dt}</p></div>
                <div className="bg-teal-600 px-3 py-1.5 rounded-lg"><p className="text-xs text-teal-200">Sayfa</p><p className="text-sm font-black text-white text-center">{pg}/{TP}</p></div>
            </div>
        </div>
        <p className="text-[10px] text-amber-400 mt-2">✏️ Tüm alanlar düzenlenebilir — tıklayarak değiştirebilirsiniz</p>
    </div>
);

const TechPackProPage: React.FC<Props> = ({ profile, onRefreshProfile, onShowBuyCredits }) => {
    const [frontImg, setFrontImg] = useState<string | null>(null);
    const [backImg, setBackImg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('');
    const [prog, setProg] = useState(0);
    const [err, setErr] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [fSketch, setFSketch] = useState<string | null>(null);
    const [bSketch, setBSketch] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const fRef = useRef<HTMLInputElement>(null);
    const bRef = useRef<HTMLInputElement>(null);

    const upload = (e: React.ChangeEvent<HTMLInputElement>, t: 'f' | 'b') => {
        const f = e.target.files?.[0]; if (!f) return;
        const r = new FileReader();
        r.onload = () => { t === 'f' ? setFrontImg(r.result as string) : setBackImg(r.result as string); };
        r.readAsDataURL(f);
    };

    const generate = async () => {
        if (!frontImg) { setErr('Ön görsel yükleyin.'); return; }
        if (!profile?.id) { setErr('Giriş yapın.'); return; }
        setErr(null); setLoading(true); setProg(0); setStep('Kredi kontrol...');
        const cc = await checkAndDeductCredits(profile.id, 'tech_sketch');
        if (!cc.success) { setLoading(false); if (cc.message?.includes('Yetersiz')) onShowBuyCredits(); setErr(cc.message || 'Kredi yok.'); return; }
        try {
            setStep('📡 AI analiz...'); setProg(10);
            const timer = setInterval(() => setProg(p => Math.min(p + 3, 90)), 800);
            const res = await generateTechPackPro(frontImg, backImg);
            clearInterval(timer); setProg(100); setStep('✅ Tamamlandı!');
            setData(res.techPackData); setFSketch(res.frontSketchBase64); setBSketch(res.backSketchBase64); setPage(1);
            onRefreshProfile();
        } catch (e: any) { await refundCredits(profile.id, 'tech_sketch'); onRefreshProfile(); setErr(e.message); }
        finally { setLoading(false); }
    };

    // === DEEP UPDATE HELPER ===
    const upd = (path: string, val: string) => {
        setData((prev: any) => {
            const d = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let obj = d;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (!isNaN(Number(k))) obj = obj[Number(k)];
                else obj = obj[k];
            }
            const last = keys[keys.length - 1];
            if (!isNaN(Number(last))) obj[Number(last)] = val;
            else obj[last] = val;
            return d;
        });
    };

    // ===== EXCEL (uses current data state) =====
    const excelExport = () => {
        if (!data) return;
        const cp = data.coverPage || {};
        let h = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>`;
        ['Kapak', 'Yapım', 'BOM', 'POM', 'Renkler', 'Etiket'].forEach(s => { h += `<x:ExcelWorksheet><x:Name>${s}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>`; });
        h += `</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
        h += `<table border="1"><tr><td colspan="6" style="font-size:16px;font-weight:bold">${BRAND} TEKNİK DOSYA</td></tr>`;
        h += `<tr><td><b>Stil No</b></td><td>${cp.styleCode || ''}</td><td><b>Stil Adı</b></td><td>${cp.styleName || cp.productName || ''}</td><td><b>Sezon</b></td><td>${cp.season || ''}</td></tr>`;
        h += `<tr><td><b>Kategori</b></td><td>${cp.category || ''}</td><td><b>Hedef Beden</b></td><td>${cp.targetSize || 'M'}</td><td><b>Beden Aralığı</b></td><td>${cp.sizeRange || ''}</td></tr></table>`;
        h += `<table border="1"><tr><td colspan="4" style="font-weight:bold">YAPI</td></tr><tr><td><b>Bölge</b></td><td><b>Detay</b></td><td><b>Dikiş</b></td><td><b>Genişlik</b></td></tr>`;
        const cf = data.construction?.front || (Array.isArray(data.construction) ? data.construction : []);
        cf.forEach((c: any) => { h += `<tr><td>${c.area || c.detail || ''}</td><td>${c.detail || c.specification || ''}</td><td>${c.stitchType || ''}</td><td>${c.stitchWidth || ''}</td></tr>`; });
        (data.construction?.back || []).forEach((c: any) => { h += `<tr><td>${c.area || ''}</td><td>${c.detail || ''}</td><td>${c.stitchType || ''}</td><td>${c.stitchWidth || ''}</td></tr>`; });
        h += `</table>`;
        h += `<table border="1"><tr><td colspan="5" style="font-weight:bold">BOM</td></tr><tr><td><b>Tanım</b></td><td><b>Kompozisyon</b></td><td><b>Kullanım</b></td><td><b>Renk</b></td><td><b>Ağırlık (gr/m²)</b></td></tr>`;
        (data.bom?.fabrics || (Array.isArray(data.bom) ? data.bom : [])).forEach((f: any) => { h += `<tr><td>${f.description || f.placement || ''}</td><td>${f.composition || f.materialDescription || ''}</td><td>${f.usage || ''}</td><td>${f.colorCode || f.color || ''}</td><td>${f.weight || ''}</td></tr>`; });
        (data.bom?.trims || []).forEach((t: any) => { h += `<tr><td>${t.description || ''}</td><td>${t.specification || ''}</td><td>${t.usage || ''}</td><td>${t.quantity || ''}</td><td></td></tr>`; });
        h += `</table>`;
        h += `<table border="1"><tr><td colspan="9" style="font-weight:bold">POM (CM)</td></tr><tr><td><b>Kod</b></td><td><b>Ölçü</b></td><td><b>Tol.</b></td><td><b>XS</b></td><td><b>S</b></td><td><b>M★</b></td><td><b>L</b></td><td><b>XL</b></td><td><b>XXL</b></td></tr>`;
        (data.pom || []).forEach((p: any) => { const s = p.sizes || p.gradedSizes || {}; h += `<tr><td>${p.code || ''}</td><td>${p.measurement || p.pointOfMeasurement || ''}</td><td>${p.tolerance || ''}</td><td>${s.XS || s.xs || ''}</td><td>${s.S || s.s || ''}</td><td>${s.M || s.m || ''}</td><td>${s.L || s.l || ''}</td><td>${s.XL || s.xl || ''}</td><td>${s.XXL || s.xxl || ''}</td></tr>`; });
        h += `</table>`;
        h += `<table border="1"><tr><td colspan="5" style="font-weight:bold">RENK</td></tr>`;
        (data.colorways || []).forEach((c: any) => { h += `<tr><td>${c.name || ''}</td><td>${c.pantoneCode || ''}</td><td>${c.components?.shell || ''}</td><td>${c.components?.trim || ''}</td><td>${c.components?.thread || ''}</td></tr>`; });
        h += `</table>`;
        h += `<table border="1"><tr><td colspan="2" style="font-weight:bold">ETİKET</td></tr>`;
        const lp2 = data.labelsAndPackaging || {};
        [['Ana Etiket', `${lp2.mainLabel?.placement || ''}`], ['Bakım', `${lp2.careLabel?.content || ''}`], ['Katlama', lp2.folding || ''], ['Polybag', lp2.polybag || '']].forEach(([a, b]) => { h += `<tr><td><b>${a}</b></td><td>${b}</td></tr>`; });
        h += `</table></body></html>`;
        const blob = new Blob([h], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = `TechPack_${(cp.styleCode || 'X').replace(/\s/g, '_')}.xls`; a.click(); URL.revokeObjectURL(u);
    };

    // ===== FONT CACHE =====
    let fontCache: { regular: string; bold: string } | null = null;
    const loadFont = async (doc: any): Promise<string> => {
        try {
            if (!fontCache) {
                const toB64 = (buf: ArrayBuffer) => {
                    const arr = new Uint8Array(buf);
                    let s = '';
                    const chunk = 8192;
                    for (let i = 0; i < arr.length; i += chunk) {
                        s += String.fromCharCode.apply(null, Array.from(arr.slice(i, i + chunk)));
                    }
                    return btoa(s);
                };
                const [regBuf, boldBuf] = await Promise.all([
                    fetch('/fonts/NotoSans-Regular.ttf').then(r => { if (!r.ok) throw new Error('Font 404'); return r.arrayBuffer(); }),
                    fetch('/fonts/NotoSans-Bold.ttf').then(r => { if (!r.ok) throw new Error('Font 404'); return r.arrayBuffer(); })
                ]);
                fontCache = { regular: toB64(regBuf), bold: toB64(boldBuf) };
            }
            doc.addFileToVFS('NotoSans-Regular.ttf', fontCache.regular);
            doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
            doc.addFileToVFS('NotoSans-Bold.ttf', fontCache.bold);
            doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
            return 'NotoSans';
        } catch (e) {
            console.warn('Font yüklenemedi, Helvetica kullanılıyor:', e);
            return 'helvetica';
        }
    };

    // ===== PDF — SUNUM KALİTESİ =====
    const pdfExport = async () => {
        if (!data) return;
        const cp = data.coverPage || {};
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const FF = await loadFont(doc);
        const W = 297, H = 210, M = 12;
        let y = 0, pn = 0;
        const CW = W - 2 * M; // content width

        // === SUNUM SLIDE HEADER ===
        const slide = (title: string, subtitle?: string) => {
            if (pn > 0) doc.addPage();
            pn++;
            // Beyaz sayfa arka planı
            doc.setFillColor(255, 255, 255); doc.rect(0, 0, W, H, 'F');
            // Header bar — koyu teal
            doc.setFillColor(15, 118, 110); doc.rect(0, 0, W, 36, 'F');
            // Alt accent çizgi — açık teal
            doc.setFillColor(20, 184, 166); doc.rect(0, 34, W, 2, 'F');
            // Marka adı — sol üst (beyaz)
            doc.setTextColor(255); doc.setFontSize(22); doc.setFont(FF, 'bold');
            doc.text(BRAND, M + 2, 13);
            // Stil bilgi
            doc.setTextColor(167, 243, 208); doc.setFontSize(11); doc.setFont(FF, 'bold');
            doc.text(`${cp.styleCode || ''} — ${cp.styleName || cp.productName || ''}`, M + 2, 21);
            doc.setFontSize(9); doc.setFont(FF, 'normal');
            doc.text(`${cp.season || ''} | ${cp.category || ''} | ${cp.date || ''}`, M + 2, 27);
            // Sayfa başlığı — ortada büyük beyaz
            doc.setTextColor(255); doc.setFontSize(20); doc.setFont(FF, 'bold');
            doc.text(title, W / 2, 15, { align: 'center' });
            if (subtitle) {
                doc.setFontSize(11); doc.setFont(FF, 'bold'); doc.setTextColor(167, 243, 208);
                doc.text(subtitle, W / 2, 24, { align: 'center' });
            }
            // Sayfa numarası badge
            doc.setFillColor(245, 158, 11); doc.roundedRect(W - M - 24, 7, 22, 22, 4, 4, 'F');
            doc.setTextColor(255); doc.setFontSize(8); doc.setFont(FF, 'bold');
            doc.text('SAYFA', W - M - 13, 14, { align: 'center' });
            doc.setFontSize(15); doc.setFont(FF, 'bold');
            doc.text(`${pn}/${TP}`, W - M - 13, 24, { align: 'center' });
            y = 42;
            // Footer
            doc.setFontSize(8); doc.setTextColor(120, 130, 140); doc.setFont(FF, 'bold');
            doc.text(`${BRAND}  |  ${cp.styleCode || ''}  |  ${title}  |  Sayfa ${pn}/${TP}`, W / 2, H - 5, { align: 'center' });
            doc.setDrawColor(209, 213, 219); doc.line(M, H - 8, W - M, H - 8);
            // Metin rengini sıfırla
            doc.setTextColor(17, 24, 39);
        };

        // === YARDIMCI FONKSİYONLAR ===
        const txt = (text: string, x: number, yy: number, opts?: any) => {
            doc.text(String(text || ''), x, yy, opts);
        };
        // Bölüm başlığı — teal bar beyaz yazı
        const sectionTitle = (title: string) => {
            doc.setFillColor(13, 148, 136); doc.roundedRect(M, y - 1, CW, 11, 2, 2, 'F');
            doc.setTextColor(255); doc.setFontSize(13); doc.setFont(FF, 'bold');
            txt(title, M + 5, y + 6);
            doc.setTextColor(17, 24, 39); y += 15;
        };
        // Tablo başlığı — koyu gri bar
        const tableHead = (cols: string[], xs: number[]) => {
            doc.setFillColor(236, 253, 245); doc.rect(M, y - 3, CW, 10, 'F');
            doc.setTextColor(5, 102, 92); doc.setFontSize(10); doc.setFont(FF, 'bold');
            cols.forEach((c, i) => txt(c, xs[i], y + 4));
            doc.setTextColor(17, 24, 39); y += 11;
        };
        // Tablo satırı
        const tableRow = (vals: string[], xs: number[], idx: number, highlight?: number) => {
            if (idx % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(M, y - 3, CW, 10, 'F'); }
            doc.setFont(FF, 'normal'); doc.setFontSize(10); doc.setTextColor(17, 24, 39);
            const colWidths = xs.map((x, i) => (i < xs.length - 1 ? xs[i + 1] - x - 2 : W - M - x - 2));
            vals.forEach((v, i) => {
                if (highlight !== undefined && i === highlight) {
                    doc.setFont(FF, 'bold'); doc.setTextColor(5, 102, 92);
                }
                const maxW = colWidths[i];
                const trimmed = doc.getTextWidth(v) > maxW ? v.substring(0, Math.floor(v.length * maxW / doc.getTextWidth(v))) : v;
                txt(trimmed, xs[i], y + 4);
                if (highlight !== undefined && i === highlight) {
                    doc.setFont(FF, 'normal'); doc.setTextColor(17, 24, 39);
                }
            });
            y += 10;
        };

        // ══════════ P1: KAPAK ══════════
        slide('KAPAK VE STİL ÖZETİ', 'Teknik Dosya Özet Sayfası');
        // Sol: bilgi kartları
        const infoX = M + 2; let infoY = y;
        const infoCard = (label: string, val: string) => {
            doc.setFillColor(240, 253, 250); doc.roundedRect(infoX, infoY, 72, 15, 3, 3, 'F');
            doc.setDrawColor(13, 148, 136); doc.setLineWidth(0.5); doc.roundedRect(infoX, infoY, 72, 15, 3, 3, 'S'); doc.setLineWidth(0.2);
            doc.setTextColor(75, 85, 99); doc.setFontSize(8); doc.setFont(FF, 'bold');
            txt(label.toUpperCase(), infoX + 4, infoY + 5);
            doc.setTextColor(0, 0, 0); doc.setFontSize(13); doc.setFont(FF, 'bold');
            txt(val || '—', infoX + 4, infoY + 12);
            doc.setDrawColor(0);
            infoY += 18;
        };
        [['Stil No', cp.styleCode], ['Stil Adı', cp.styleName || cp.productName], ['Sezon', cp.season], ['Kategori', cp.category], ['Hedef Beden', cp.targetSize || 'M'], ['Beden Aralığı', cp.sizeRange]].forEach(([l, v]) => infoCard(l as string, v as string));
        if (cp.description) {
            infoY += 3; doc.setFontSize(9); doc.setTextColor(107, 114, 128); doc.setFont(FF, 'normal');
            txt(String(cp.description), infoX + 2, infoY, { maxWidth: 68 }); infoY += 14;
        }
        // Revizyon
        doc.setFillColor(240, 253, 250); doc.roundedRect(infoX, infoY, 72, 20, 3, 3, 'F');
        doc.setTextColor(13, 148, 136); doc.setFontSize(9); doc.setFont(FF, 'bold');
        txt('REVİZYON GEÇMİŞİ', infoX + 4, infoY + 5);
        doc.setTextColor(55, 65, 81); doc.setFontSize(9); doc.setFont(FF, 'normal');
        txt(`${cp.date || '—'} — Orijinal dosya — Onaylı`, infoX + 4, infoY + 12);

        // Sağ: çizimler + orijinal fotoğraf
        const hasBack = !!bSketch;
        const totalW = W - M - (M + 84); // mevcut alan genişliği
        const panelGap = 6;
        let panelW: number, panelX1: number, panelX2: number, panelX3: number;
        const skH = H - 56;

        if (hasBack) {
            // 3 panel: Ön Çizim | Orijinal Fotoğraf | Arka Çizim
            panelW = Math.floor((totalW - panelGap * 2) / 3);
            panelX1 = M + 84;
            panelX2 = panelX1 + panelW + panelGap;
            panelX3 = panelX2 + panelW + panelGap;

            // Panel 1: Ön Çizim
            doc.setDrawColor(229, 231, 235); doc.setLineWidth(0.3);
            doc.roundedRect(panelX1 - 1, y - 2, panelW + 2, skH + 12, 3, 3, 'S');
            if (fSketch) { try { doc.addImage(fSketch, 'PNG', panelX1, y, panelW, skH); } catch (e) { } }
            doc.setTextColor(55, 65, 81); doc.setFontSize(8); doc.setFont(FF, 'bold');
            txt('ÖN ÇİZİM', panelX1 + panelW / 2, y + skH + 6, { align: 'center' });

            // Panel 2: Orijinal Fotoğraf (ortada)
            doc.setDrawColor(13, 148, 136); doc.setLineWidth(0.5);
            doc.roundedRect(panelX2 - 1, y - 2, panelW + 2, skH + 12, 3, 3, 'S');
            doc.setLineWidth(0.2);
            if (frontImg) { try { doc.addImage(frontImg, 'JPEG', panelX2, y, panelW, skH); } catch (e) { } }
            doc.setTextColor(13, 148, 136); doc.setFontSize(8); doc.setFont(FF, 'bold');
            txt('ORİJİNAL FOTOĞRAF', panelX2 + panelW / 2, y + skH + 6, { align: 'center' });

            // Panel 3: Arka Çizim
            doc.setDrawColor(229, 231, 235); doc.setLineWidth(0.3);
            doc.roundedRect(panelX3 - 1, y - 2, panelW + 2, skH + 12, 3, 3, 'S');
            doc.setLineWidth(0.2);
            try { doc.addImage(bSketch, 'PNG', panelX3, y, panelW, skH); } catch (e) { }
            doc.setTextColor(55, 65, 81); doc.setFontSize(8); doc.setFont(FF, 'bold');
            txt('ARKA ÇİZİM', panelX3 + panelW / 2, y + skH + 6, { align: 'center' });
        } else {
            // 2 panel: Ön Çizim | Orijinal Fotoğraf
            panelW = Math.floor((totalW - panelGap) / 2);
            panelX1 = M + 84;
            panelX2 = panelX1 + panelW + panelGap;

            // Panel 1: Ön Çizim
            doc.setDrawColor(229, 231, 235); doc.setLineWidth(0.3);
            doc.roundedRect(panelX1 - 1, y - 2, panelW + 2, skH + 12, 3, 3, 'S');
            if (fSketch) { try { doc.addImage(fSketch, 'PNG', panelX1, y, panelW, skH); } catch (e) { } }
            doc.setTextColor(55, 65, 81); doc.setFontSize(8); doc.setFont(FF, 'bold');
            txt('ÖN TEKNİK ÇİZİM', panelX1 + panelW / 2, y + skH + 6, { align: 'center' });

            // Panel 2: Orijinal Fotoğraf
            doc.setDrawColor(13, 148, 136); doc.setLineWidth(0.5);
            doc.roundedRect(panelX2 - 1, y - 2, panelW + 2, skH + 12, 3, 3, 'S');
            doc.setLineWidth(0.2);
            if (frontImg) { try { doc.addImage(frontImg, 'JPEG', panelX2, y, panelW, skH); } catch (e) { } }
            doc.setTextColor(13, 148, 136); doc.setFontSize(8); doc.setFont(FF, 'bold');
            txt('ORİJİNAL FOTOĞRAF', panelX2 + panelW / 2, y + skH + 6, { align: 'center' });
        }

        // ══════════ P2: TASARIM ÖZELLİKLERİ ══════════
        const df = data.designFeatures || {};
        if (df.collarType || df.closure || df.sleeveType) {
            slide('TASARIM ÖZELLİKLERİ', 'Yaka, Kapama, Kol ve Örgü Detayları');
            const dfItems: [string, string][] = [
                ['Yaka Tipi', df.collarType || '-'],
                ['Kapama', df.closure || '-'],
                ['Kol Yapısı', df.sleeveType || '-'],
                ['Örgü Detayları', df.knitDetails || '-'],
                ['Etek Bitimi', df.hemFinish || '-'],
                ['Özel Detaylar', df.specialDetails || '-'],
            ].filter(([, v]) => v && v !== '-') as [string, string][];
            sectionTitle('TASARIM DETAYLARI');
            dfItems.forEach(([l, v], idx) => {
                if (idx % 2 === 0) { doc.setFillColor(240, 253, 250); } else { doc.setFillColor(255, 255, 255); }
                doc.roundedRect(M, y - 3, CW, 16, 2, 2, 'F');
                doc.setFontSize(12); doc.setFont(FF, 'bold'); doc.setTextColor(5, 102, 92);
                txt(l, M + 6, y + 5);
                doc.setFontSize(10); doc.setFont(FF, 'normal'); doc.setTextColor(17, 24, 39);
                txt(v.substring(0, 80), M + 70, y + 5, { maxWidth: CW - 80 });
                y += 18;
            });
            // Tela detayı
            const interf = data.construction?.interfacing;
            if (interf && interf !== 'Yok') {
                y += 4;
                sectionTitle('TELA / ARA MALZEME');
                doc.setFillColor(255, 243, 205); doc.roundedRect(M, y - 3, CW, 14, 2, 2, 'F');
                doc.setFontSize(10); doc.setFont(FF, 'bold'); doc.setTextColor(120, 53, 15);
                txt('⚠ ' + interf.substring(0, 90), M + 6, y + 5, { maxWidth: CW - 14 });
                y += 16;
            }
            // Fit bilgisi
            if (cp.fit) {
                y += 2;
                doc.setFillColor(236, 253, 245); doc.roundedRect(M, y - 3, 60, 12, 2, 2, 'F');
                doc.setFontSize(11); doc.setFont(FF, 'bold'); doc.setTextColor(5, 102, 92);
                txt('KESİM: ' + cp.fit, M + 6, y + 5);
                y += 14;
            }
        }

        // ══════════ P3: CONSTRUCTION ══════════
        slide('YAPI VE DİKİŞ DETAYLARI', 'Konfeksiyon ve Dikiş Talimatları');
        const cF2 = data.construction?.front || (Array.isArray(data.construction) ? data.construction : []);
        const cB2 = data.construction?.back || [];
        const mx = W / 2;
        // Sol panel başlık
        doc.setFillColor(13, 148, 136); doc.roundedRect(M, y - 1, mx - M - 4, 10, 2, 2, 'F');
        doc.setTextColor(255); doc.setFontSize(12); doc.setFont(FF, 'bold'); txt('ÖN GÖRÜNÜM', M + 5, y + 5);
        // Sağ panel başlık
        doc.setFillColor(13, 148, 136); doc.roundedRect(mx + 2, y - 1, W - M - mx - 2, 10, 2, 2, 'F');
        txt('ARKA GÖRÜNÜM', mx + 7, y + 5);
        y += 14;
        // Dikey ayırıcı
        doc.setDrawColor(209, 213, 219); doc.setLineDashPattern([3, 2], 0); doc.line(mx, y, mx, H - 12); doc.setLineDashPattern([], 0);
        let yL2 = y, yR2 = y;
        cF2.forEach((c: any) => {
            doc.setFillColor(240, 253, 250); doc.roundedRect(M + 1, yL2 - 2, mx - M - 6, 18, 2, 2, 'F');
            doc.setFontSize(12); doc.setFont(FF, 'bold'); doc.setTextColor(5, 102, 92);
            txt(c.area || c.detail || '', M + 5, yL2 + 4);
            doc.setFontSize(10); doc.setFont(FF, 'normal'); doc.setTextColor(17, 24, 39);
            txt(c.detail || c.specification || '', M + 5, yL2 + 10, { maxWidth: mx - M - 16 });
            doc.setTextColor(75, 85, 99); doc.setFontSize(9); doc.setFont(FF, 'bold');
            const saF = c.seamAllowance ? ` | Dikiş Payı: ${c.seamAllowance}` : '';
            txt(`[${c.stitchType || ''}] ${c.stitchWidth || ''}${saF}`, M + 5, yL2 + 14);
            yL2 += 21;
        });
        cB2.forEach((c: any) => {
            doc.setFillColor(240, 253, 250); doc.roundedRect(mx + 3, yR2 - 2, W - M - mx - 4, 18, 2, 2, 'F');
            doc.setFontSize(12); doc.setFont(FF, 'bold'); doc.setTextColor(5, 102, 92);
            txt(c.area || '', mx + 7, yR2 + 4);
            doc.setFontSize(10); doc.setFont(FF, 'normal'); doc.setTextColor(17, 24, 39);
            txt(c.detail || '', mx + 7, yR2 + 10, { maxWidth: mx - M - 16 });
            doc.setTextColor(75, 85, 99); doc.setFontSize(9); doc.setFont(FF, 'bold');
            const saB = c.seamAllowance ? ` | Dikiş Payı: ${c.seamAllowance}` : '';
            txt(`[${c.stitchType || ''}]${saB}`, mx + 7, yR2 + 14);
            yR2 += 21;
        });

        // ══════════ P3: BOM ══════════
        slide('MALZEME LİSTESİ (BOM)', 'Kumaş ve Yardımcı Malzemeler');
        sectionTitle('KUMAŞLAR');
        const bx = [M + 3, M + 48, M + 118, M + 185, M + 245];
        tableHead(['TANIM', 'KOMPOZİSYON', 'KULLANIM', 'RENK KODU', 'gr/m²'], bx);
        (data.bom?.fabrics || (Array.isArray(data.bom) ? data.bom : [])).forEach((f: any, idx: number) => {
            tableRow([(f.description || f.placement || '').substring(0, 18), (f.composition || f.materialDescription || '').substring(0, 28), (f.usage || '').substring(0, 22), (f.colorCode || f.color || '').substring(0, 22), f.weight || ''], bx, idx);
        });
        y += 6;
        sectionTitle('YARDIMCI MALZEMELER');
        const tx = [M + 3, M + 65, M + 148, M + 235];
        tableHead(['TANIM', 'ÖZELLİK', 'KULLANIM', 'ADET'], tx);
        (data.bom?.trims || []).forEach((tr: any, idx: number) => {
            tableRow([(tr.description || '').substring(0, 22), (tr.specification || '').substring(0, 32), (tr.usage || '').substring(0, 30), tr.quantity || ''], tx, idx);
        });

        // ══════════ P4: POM ══════════
        slide('ÖLÇÜ TABLOSU (POM)', 'Birim: CM | Baz Beden: M');
        sectionTitle('ÖLÇÜ NOKTALARI VE BEDENLER');
        const px = [M + 3, M + 15, M + 90, M + 140, M + 162, M + 184, M + 206, M + 232, M + 258];
        tableHead(['KOD', 'ÖLÇÜ NOKTASI', 'TOL.', 'XS', 'S', 'M ★', 'L', 'XL', 'XXL'], px);
        (data.pom || []).forEach((p: any, idx: number) => {
            if (y > H - 20) { slide('ÖLÇÜ TABLOSU (devam)', 'Birim: CM'); sectionTitle('ÖLÇÜ NOKTALARI (devam)'); tableHead(['KOD', 'ÖLÇÜ NOKTASI', 'TOL.', 'XS', 'S', 'M ★', 'L', 'XL', 'XXL'], px); }
            const s = p.sizes || p.gradedSizes || {};
            tableRow([
                p.code || '', (p.measurement || p.pointOfMeasurement || '').substring(0, 24),
                p.tolerance || '', String(s.XS || s.xs || ''), String(s.S || s.s || ''),
                String(s.M || s.m || ''), String(s.L || s.l || ''),
                String(s.XL || s.xl || ''), String(s.XXL || s.xxl || '')
            ], px, idx, 5);
        });

        // ══════════ P5: COLORWAYS ══════════
        slide('RENK YOLLARI VE BASKI', 'Pantone Renk Kodları ve Detaylar');
        sectionTitle('RENK YOLLARI');
        (data.colorways || []).forEach((c: any) => {
            doc.setFillColor(240, 253, 250); doc.roundedRect(M, y - 3, CW, 20, 3, 3, 'F');
            doc.setDrawColor(13, 148, 136); doc.setLineWidth(0.3); doc.roundedRect(M, y - 3, CW, 20, 3, 3, 'S'); doc.setLineWidth(0.2);
            doc.setFontSize(14); doc.setFont(FF, 'bold'); doc.setTextColor(0, 0, 0);
            txt(c.name || '', M + 6, y + 4);
            doc.setFontSize(11); doc.setTextColor(5, 102, 92); doc.setFont(FF, 'bold');
            txt(c.pantoneCode || '', M + 80, y + 4);
            doc.setFontSize(10); doc.setTextColor(55, 65, 81); doc.setFont(FF, 'normal');
            txt(`Ana Kumaş: ${c.components?.shell || ''} | Aksesuar: ${c.components?.trim || ''} | İplik: ${c.components?.thread || ''} | Astar: ${c.components?.lining || '-'}`, M + 6, y + 13, { maxWidth: CW - 14 });
            doc.setDrawColor(0);
            y += 25;
        });
        if ((data.artwork || []).length > 0) {
            y += 3; sectionTitle('BASKI / NAKIŞ');
            const ax = [M + 4, M + 60, M + 120, M + 190, M + 240];
            tableHead(['TİP', 'TEKNİK', 'KONUM', 'BOYUT', 'RENK'], ax);
            (data.artwork || []).forEach((a: any, idx: number) => {
                tableRow([a.type || '', a.technique || '', a.placement || '', a.dimensions || '', a.colors || ''], ax, idx);
            });
        }

        // ══════════ P6: LABELS ══════════
        slide('ETİKETLEME VE PAKETLEME', 'Etiket, Katlama ve Ambalaj Talimatları');
        const lp = data.labelsAndPackaging || {};
        const labelItems: [string, string][] = [
            ['Ana Etiket', `${lp.mainLabel?.placement || '-'} — ${lp.mainLabel?.type || ''}`],
            ['Bakım Etiketi', `${lp.careLabel?.placement || '-'} — ${lp.careLabel?.content || ''}`],
            ['Beden Etiketi', `${lp.sizeLabel?.placement || '-'} — ${lp.sizeLabel?.type || ''}`],
            ['Askı Etiketi', lp.hangtag || '-'],
            ['Katlama', lp.folding || '-'],
            ['Polybag', lp.polybag || '-'],
            ['Koli', lp.cartonPacking || '-']
        ];
        labelItems.forEach(([l, v], idx) => {
            if (idx % 2 === 0) { doc.setFillColor(249, 250, 251); } else { doc.setFillColor(255, 255, 255); }
            doc.roundedRect(M, y - 3, CW, 15, 2, 2, 'F');
            doc.setFontSize(12); doc.setFont(FF, 'bold'); doc.setTextColor(5, 102, 92);
            txt(l, M + 6, y + 5);
            doc.setFontSize(11); doc.setFont(FF, 'normal'); doc.setTextColor(17, 24, 39);
            txt(v, M + 60, y + 5, { maxWidth: CW - 70 });
            y += 17;
        });

        doc.save(`TechPack_${(cp.styleCode || 'X').replace(/\s/g, '_')}.pdf`);
    };

    const cp = data?.coverPage || {};
    const hP = { sc: cp.styleCode || '—', sn: cp.styleName || cp.productName || '—', dt: cp.date || new Date().toLocaleDateString('tr-TR') };
    const tabs = [{ n: 1, l: 'Kapak', i: '📋' }, { n: 2, l: 'Yapım', i: '🔧' }, { n: 3, l: 'BOM', i: '📦' }, { n: 4, l: 'POM', i: '📏' }, { n: 5, l: 'Renk', i: '🎨' }, { n: 6, l: 'Etiket', i: '🏷️' }];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">⚙️ TechPack PRO</h1>
                    <p className="text-slate-500 text-xs mt-1">Fabrika-Ready • Yatay PDF & Excel • Tıkla-Düzenle</p>
                </div>

                {!data && (<>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-teal-500/50 transition" onClick={() => fRef.current?.click()}>
                            <input ref={fRef} type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'f')} />
                            {frontImg ? <ZoomImg src={frontImg} alt="Ön" className="w-full max-h-48 object-contain rounded" /> : <div className="py-10"><div className="text-4xl mb-2">👕</div><p className="text-sm text-slate-300 font-bold">Ön Görsel (ZORUNLU)</p></div>}
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-teal-500/50 transition" onClick={() => bRef.current?.click()}>
                            <input ref={bRef} type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'b')} />
                            {backImg ? <ZoomImg src={backImg} alt="Arka" className="w-full max-h-48 object-contain rounded" /> : <div className="py-10"><div className="text-4xl mb-2">👔</div><p className="text-sm text-slate-300 font-bold">Arka Görsel (Opsiyonel)</p></div>}
                        </div>
                    </div>
                    {err && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-2 mb-4 text-sm">{err}</div>}
                    <button onClick={generate} disabled={loading || !frontImg} className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg disabled:opacity-50">
                        {loading ? <div className="flex flex-col items-center gap-1"><div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{step}</div><div className="w-2/3 h-1.5 bg-white/10 rounded-full"><div className="h-full bg-white/40 rounded-full transition-all" style={{ width: `${prog}%` }} /></div></div> : '⚙️ Tech Pack Oluştur'}
                    </button>
                </>)}

                {data && (<>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={pdfExport} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold text-sm">📄 PDF (Yatay)</button>
                        <button onClick={excelExport} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-sm">📊 Excel</button>
                        <button onClick={() => { setData(null); setFSketch(null); setBSketch(null); setFrontImg(null); setBackImg(null); }} className="ml-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-sm">🔄 Yeni</button>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 mb-4 text-sm text-amber-300">✏️ Tüm alanlar düzenlenebilir. Değerleri tıklayarak değiştirin, sonra PDF/Excel indirin.</div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tabs.map(tb => (<button key={tb.n} onClick={() => setPage(tb.n)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${page === tb.n ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>{tb.i} {tb.l} <span className="opacity-50">{tb.n}/{TP}</span></button>))}
                    </div>

                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 min-h-[400px]">
                        <PH sc={hP.sc} sn={hP.sn} pg={page} dt={hP.dt} />

                        {/* P1: KAPAK — Editable */}
                        {page === 1 && (<div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                {([['Stil No', 'coverPage.styleCode', cp.styleCode], ['Stil Adı', 'coverPage.styleName', cp.styleName || cp.productName], ['Sezon', 'coverPage.season', cp.season], ['Kategori', 'coverPage.category', cp.category], ['Hedef Beden', 'coverPage.targetSize', cp.targetSize || 'M'], ['Beden Aralığı', 'coverPage.sizeRange', cp.sizeRange], ['Tarih', 'coverPage.date', cp.date]] as [string, string, string][]).map(([l, path, v], i) => (<div key={i} className="bg-slate-800 rounded-lg p-3"><p className="text-xs text-slate-500 uppercase font-semibold">{l}</p><EF value={v || ''} onChange={val => upd(path, val)} className="text-base font-bold text-slate-200" /></div>))}
                            </div>
                            <div className="bg-slate-800 rounded-lg p-3 mb-4"><p className="text-xs text-slate-500 uppercase font-semibold mb-1">Açıklama</p><EF value={cp.description || ''} onChange={val => upd('coverPage.description', val)} tag="textarea" className="text-base text-slate-300 italic" /></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {fSketch && <div className="bg-white rounded-lg p-3"><p className="text-sm text-gray-500 font-bold text-center mb-2">ÖN TEKNİK ÇİZİM (tıkla büyüt)</p><ZoomImg src={fSketch} alt="Ön" className="w-full max-h-72 object-contain" /></div>}
                                {bSketch && <div className="bg-white rounded-lg p-3"><p className="text-sm text-gray-500 font-bold text-center mb-2">ARKA TEKNİK ÇİZİM (tıkla büyüt)</p><ZoomImg src={bSketch} alt="Arka" className="w-full max-h-72 object-contain" /></div>}
                            </div>
                            <div className="bg-slate-800 rounded-lg p-3"><p className="text-sm font-bold text-slate-300 mb-2">REVİZYON GEÇMİŞİ</p><table className="w-full text-sm"><thead><tr className="text-slate-500"><th className="text-left pb-1">Tarih</th><th className="text-left pb-1">Açıklama</th><th className="text-left pb-1">Durum</th></tr></thead><tbody><tr className="text-slate-400"><td>{cp.date || '—'}</td><td>Orijinal teknik dosya</td><td className="text-green-400">✓ Onaylandı</td></tr></tbody></table></div>
                        </div>)}

                        {/* P2: CONSTRUCTION — Editable */}
                        {page === 2 && (<div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><h3 className="text-lg font-bold text-teal-400 mb-3 border-b border-slate-700 pb-2">ÖN DETAYLAR</h3>
                                {(data.construction?.front || (Array.isArray(data.construction) ? data.construction : [])).map((c: any, i: number) => {
                                    const base = data.construction?.front ? `construction.front.${i}` : `construction.${i}`; return (
                                        <div key={i} className="mb-3 bg-slate-800/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1"><span className="text-teal-400 text-lg">→</span><EF value={c.area || c.detail || ''} onChange={v => upd(`${base}.area`, v)} className="text-base font-bold text-slate-200" /></div>
                                            <EF value={c.detail || c.specification || ''} onChange={v => upd(`${base}.detail`, v)} className="text-sm text-slate-400" />
                                            <div className="flex gap-3 mt-2"><EF value={c.stitchType || ''} onChange={v => upd(`${base}.stitchType`, v)} className="text-sm text-teal-300 w-28" /><EF value={c.stitchWidth || ''} onChange={v => upd(`${base}.stitchWidth`, v)} className="text-sm text-slate-500 w-24" /></div>
                                        </div>);
                                })}
                            </div>
                            <div><h3 className="text-lg font-bold text-teal-400 mb-3 border-b border-slate-700 pb-2">ARKA DETAYLAR</h3>
                                {(data.construction?.back || []).length > 0 ? (data.construction.back).map((c: any, i: number) => (<div key={i} className="mb-3 bg-slate-800/50 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1"><span className="text-teal-400 text-lg">→</span><EF value={c.area || ''} onChange={v => upd(`construction.back.${i}.area`, v)} className="text-base font-bold text-slate-200" /></div>
                                    <EF value={c.detail || ''} onChange={v => upd(`construction.back.${i}.detail`, v)} className="text-sm text-slate-400" />
                                    <EF value={c.stitchType || ''} onChange={v => upd(`construction.back.${i}.stitchType`, v)} className="text-sm text-teal-300 w-28 mt-2" />
                                </div>)) : <p className="text-slate-500 text-sm italic">Arka görsel yok.</p>}
                            </div>
                        </div></div>)}

                        {/* P3: BOM — Editable */}
                        {page === 3 && (<div>
                            <h3 className="text-lg font-bold text-teal-400 mb-3">1. KUMAŞLAR</h3>
                            <div className="overflow-x-auto mb-4"><table className="w-full text-sm border-collapse"><thead><tr className="bg-slate-800"><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Tanım</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Kompozisyon</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Kullanım</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Renk Kodu</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">gr/m²</th></tr></thead><tbody>
                                {(data.bom?.fabrics || (Array.isArray(data.bom) ? data.bom : [])).map((f: any, i: number) => { const base = data.bom?.fabrics ? `bom.fabrics.${i}` : `bom.${i}`; return (<tr key={i}><td className="border border-slate-700 px-2 py-1.5"><EF value={f.description || f.placement || ''} onChange={v => upd(`${base}.description`, v)} className="text-slate-200 font-semibold text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={f.composition || f.materialDescription || ''} onChange={v => upd(`${base}.composition`, v)} className="text-slate-400 text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={f.usage || ''} onChange={v => upd(`${base}.usage`, v)} className="text-slate-400 text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={f.colorCode || f.color || ''} onChange={v => upd(`${base}.colorCode`, v)} className="text-teal-300 font-mono text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={f.weight || ''} onChange={v => upd(`${base}.weight`, v)} className="text-slate-400 text-sm w-20" /></td></tr>); })}
                            </tbody></table></div>
                            <h3 className="text-lg font-bold text-teal-400 mb-3">2. YARDIMCI MALZEMELER</h3>
                            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse"><thead><tr className="bg-slate-800"><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Tanım</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Özellik</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Kullanım</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Adet</th></tr></thead><tbody>
                                {(data.bom?.trims || []).map((tr: any, i: number) => (<tr key={i}><td className="border border-slate-700 px-2 py-1.5"><EF value={tr.description || ''} onChange={v => upd(`bom.trims.${i}.description`, v)} className="text-slate-200 font-semibold text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={tr.specification || ''} onChange={v => upd(`bom.trims.${i}.specification`, v)} className="text-slate-400 text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={tr.usage || ''} onChange={v => upd(`bom.trims.${i}.usage`, v)} className="text-slate-400 text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={tr.quantity || ''} onChange={v => upd(`bom.trims.${i}.quantity`, v)} className="text-slate-400 text-sm w-20" /></td></tr>))}
                            </tbody></table></div>
                        </div>)}

                        {/* P4: POM — Editable */}
                        {page === 4 && (<div>
                            <p className="text-sm text-slate-500 mb-3 font-semibold">Ölçü Birimi: CM | Baz Beden: M (EU 38-40)</p>
                            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse"><thead><tr className="bg-slate-800">
                                {['Kod', 'Ölçü Noktası', 'Tol.', 'XS', 'S', 'M ★', 'L', 'XL', 'XXL'].map((h, i) => (<th key={i} className={`border border-slate-700 px-3 py-2 text-slate-300 font-bold ${h.includes('★') ? 'bg-teal-900/30' : ''}`}>{h}</th>))}
                            </tr></thead><tbody>
                                    {(data.pom || []).map((p: any, i: number) => {
                                        const s = p.sizes || p.gradedSizes || {}; const sKey = p.sizes ? 'sizes' : 'gradedSizes'; return (<tr key={i} className={i % 2 === 0 ? 'bg-slate-800/30' : ''}>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={p.code || ''} onChange={v => upd(`pom.${i}.code`, v)} className="font-bold text-teal-300 text-center text-sm w-10" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={p.measurement || p.pointOfMeasurement || ''} onChange={v => upd(`pom.${i}.measurement`, v)} className="text-slate-200 text-sm" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={p.tolerance || ''} onChange={v => upd(`pom.${i}.tolerance`, v)} className="text-yellow-400 text-center text-sm w-20" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={String(s.XS || s.xs || '')} onChange={v => upd(`pom.${i}.${sKey}.XS`, v)} className="text-slate-400 text-center text-sm w-14" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={String(s.S || s.s || '')} onChange={v => upd(`pom.${i}.${sKey}.S`, v)} className="text-slate-400 text-center text-sm w-14" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5 bg-teal-900/20"><EF value={String(s.M || s.m || '')} onChange={v => upd(`pom.${i}.${sKey}.M`, v)} className="font-bold text-white text-center text-sm w-14" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={String(s.L || s.l || '')} onChange={v => upd(`pom.${i}.${sKey}.L`, v)} className="text-slate-400 text-center text-sm w-14" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={String(s.XL || s.xl || '')} onChange={v => upd(`pom.${i}.${sKey}.XL`, v)} className="text-slate-400 text-center text-sm w-14" /></td>
                                            <td className="border border-slate-700 px-2 py-1.5"><EF value={String(s.XXL || s.xxl || '')} onChange={v => upd(`pom.${i}.${sKey}.XXL`, v)} className="text-slate-400 text-center text-sm w-14" /></td>
                                        </tr>);
                                    })}
                                </tbody></table></div>
                        </div>)}

                        {/* P5: COLORWAYS — Editable */}
                        {page === 5 && (<div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {(data.colorways || []).map((c: any, i: number) => (<div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                    <EF value={c.name || ''} onChange={v => upd(`colorways.${i}.name`, v)} className="font-bold text-slate-200 text-base" />
                                    <EF value={c.pantoneCode || ''} onChange={v => upd(`colorways.${i}.pantoneCode`, v)} className="text-sm text-teal-300 font-mono mt-1" />
                                    {c.components && <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        <div><span className="text-slate-500 font-semibold">Ana Kumaş: </span><EF value={c.components.shell || ''} onChange={v => upd(`colorways.${i}.components.shell`, v)} className="text-slate-300 text-sm inline w-28" /></div>
                                        <div><span className="text-slate-500 font-semibold">Aksesuar: </span><EF value={c.components.trim || ''} onChange={v => upd(`colorways.${i}.components.trim`, v)} className="text-slate-300 text-sm inline w-28" /></div>
                                        <div><span className="text-slate-500 font-semibold">İplik: </span><EF value={c.components.thread || ''} onChange={v => upd(`colorways.${i}.components.thread`, v)} className="text-slate-300 text-sm inline w-28" /></div>
                                        <div><span className="text-slate-500 font-semibold">Astar: </span><EF value={c.components.lining || ''} onChange={v => upd(`colorways.${i}.components.lining`, v)} className="text-slate-300 text-sm inline w-28" /></div>
                                    </div>}
                                </div>))}
                            </div>
                            {(data.artwork || []).length > 0 && <><h3 className="text-lg font-bold text-teal-400 mb-3">BASKI / NAKIŞ</h3><div className="overflow-x-auto"><table className="w-full text-sm border-collapse"><thead><tr className="bg-slate-800"><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Tip</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Teknik</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Konum</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Boyut</th><th className="border border-slate-700 px-3 py-2 text-left text-slate-300 font-bold">Renk</th></tr></thead><tbody>
                                {(data.artwork).map((a: any, i: number) => (<tr key={i}><td className="border border-slate-700 px-2 py-1.5"><EF value={a.type || ''} onChange={v => upd(`artwork.${i}.type`, v)} className="text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={a.technique || ''} onChange={v => upd(`artwork.${i}.technique`, v)} className="text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={a.placement || ''} onChange={v => upd(`artwork.${i}.placement`, v)} className="text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={a.dimensions || ''} onChange={v => upd(`artwork.${i}.dimensions`, v)} className="text-sm" /></td><td className="border border-slate-700 px-2 py-1.5"><EF value={a.colors || ''} onChange={v => upd(`artwork.${i}.colors`, v)} className="text-teal-300 text-sm" /></td></tr>))}
                            </tbody></table></div></>}
                        </div>)}

                        {/* P6: LABELS — Editable */}
                        {page === 6 && (<div>
                            {(() => {
                                const lp = data.labelsAndPackaging || {}; return [
                                    { i: '🏷️', l: 'Ana Etiket - Konum', p: 'labelsAndPackaging.mainLabel.placement', v: lp.mainLabel?.placement || '' },
                                    { i: '🏷️', l: 'Ana Etiket - Tip', p: 'labelsAndPackaging.mainLabel.type', v: lp.mainLabel?.type || '' },
                                    { i: '🧼', l: 'Bakım - Konum', p: 'labelsAndPackaging.careLabel.placement', v: lp.careLabel?.placement || '' },
                                    { i: '🧼', l: 'Bakım - İçerik', p: 'labelsAndPackaging.careLabel.content', v: lp.careLabel?.content || '' },
                                    { i: '📐', l: 'Beden Etiketi', p: 'labelsAndPackaging.sizeLabel.placement', v: lp.sizeLabel?.placement || '' },
                                    { i: '🔖', l: 'Askı Etiketi', p: 'labelsAndPackaging.hangtag', v: lp.hangtag || '' },
                                    { i: '📦', l: 'Katlama', p: 'labelsAndPackaging.folding', v: lp.folding || '' },
                                    { i: '🛍️', l: 'Polybag', p: 'labelsAndPackaging.polybag', v: lp.polybag || '' },
                                    { i: '📋', l: 'Koli', p: 'labelsAndPackaging.cartonPacking', v: lp.cartonPacking || '' },
                                ].map((x, i) => (<div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex gap-3 mb-2">
                                    <span className="text-xl">{x.i}</span>
                                    <div className="flex-1"><p className="font-bold text-slate-300 text-sm mb-1">{x.l}</p><EF value={x.v} onChange={v => upd(x.p, v)} className="text-slate-200 text-base" /></div>
                                </div>));
                            })()}
                        </div>)}
                    </div>
                </>)}
            </div>
        </div>
    );
};
export default TechPackProPage;
