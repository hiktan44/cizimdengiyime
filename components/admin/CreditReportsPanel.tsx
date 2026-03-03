import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    getCreditUsageReport,
    getCreditDistributionByType,
    getDailyCreditTrend,
    getTopCreditUsers,
    CreditReportGeneration,
    TypeDistribution,
    DailyTrend,
    TopCreditUser,
} from '../../lib/adminService';
import { useI18n, useTranslation, TranslationRecord } from '../../lib/i18n';

// ==========================================
// TRANSLATIONS
// ==========================================
const trTranslations = {
    title: 'Kredi Kullanım Raporları',
    subtitle: 'Admin kullanıcılar hariç tüm kredi aktiviteleri',
    loading: 'Veriler yükleniyor...',
    noData: 'Seçilen tarih aralığında veri bulunamadı.',
    filters: {
        daily: 'Bugün',
        weekly: 'Bu Hafta',
        monthly: 'Bu Ay',
        yearly: 'Bu Yıl',
        custom: 'Özel',
        from: 'Başlangıç',
        to: 'Bitiş',
        apply: 'Uygula',
    },
    stats: {
        todayCredits: 'Bugünkü Kullanım',
        weekCredits: 'Haftalık Kullanım',
        monthCredits: 'Aylık Kullanım',
        totalUsers: 'Aktif Kullanıcı',
        credits: 'kredi',
        user: 'kullanıcı',
    },
    chart: {
        title: 'Kredi Kullanım Trendi',
        credits: 'Kredi',
        operations: 'İşlem',
    },
    donut: {
        title: 'Operasyon Tipi Dağılımı',
        total: 'Toplam',
    },
    topUsers: {
        title: 'En Çok Kredi Kullanan Kullanıcılar',
        rank: '#',
        email: 'E-posta',
        name: 'İsim',
        totalCredits: 'Toplam Kredi',
        totalOps: 'İşlem',
        mostUsed: 'En Çok Kullanılan',
    },
    table: {
        title: 'Detaylı İşlem Kayıtları',
        date: 'Tarih',
        user: 'Kullanıcı',
        type: 'Operasyon',
        credits: 'Kredi',
        export: 'CSV İndir',
        page: 'Sayfa',
        of: '/',
        showing: 'Gösterilen',
        total: 'toplam',
    },
    types: {
        sketch_to_product: 'Çizim → Ürün',
        product_to_model: 'Ürün → Model',
        video: 'Video',
        video_fast: 'Video (Hızlı)',
        video_high: 'Video (Yüksek)',
        tech_sketch: 'Teknik Çizim',
        tech_pack: 'Tech Pack',
        pixshop: 'Pixshop',
        pixshop_4k: 'Pixshop 4K',
        fotomatik_transform: 'Fotomatik',
        fotomatik_describe: 'Fotomatik Prompt',
        adgenius_campaign_image: 'AdGenius Görsel',
        adgenius_campaign_video: 'AdGenius Video',
        adgenius_ecommerce_image: 'AdGenius E-Ticaret',
        adgenius_ecommerce_video: 'AdGenius E-Tic. Video',
        collage: 'Kolaj',
    },
};

const enTranslations: typeof trTranslations = {
    title: 'Credit Usage Reports',
    subtitle: 'All credit activities excluding admin users',
    loading: 'Loading data...',
    noData: 'No data found for the selected date range.',
    filters: {
        daily: 'Today',
        weekly: 'This Week',
        monthly: 'This Month',
        yearly: 'This Year',
        custom: 'Custom',
        from: 'From',
        to: 'To',
        apply: 'Apply',
    },
    stats: {
        todayCredits: "Today's Usage",
        weekCredits: 'Weekly Usage',
        monthCredits: 'Monthly Usage',
        totalUsers: 'Active Users',
        credits: 'credits',
        user: 'users',
    },
    chart: {
        title: 'Credit Usage Trend',
        credits: 'Credits',
        operations: 'Operations',
    },
    donut: {
        title: 'Operation Type Distribution',
        total: 'Total',
    },
    topUsers: {
        title: 'Top Credit Users',
        rank: '#',
        email: 'Email',
        name: 'Name',
        totalCredits: 'Total Credits',
        totalOps: 'Operations',
        mostUsed: 'Most Used',
    },
    table: {
        title: 'Detailed Operation Logs',
        date: 'Date',
        user: 'User',
        type: 'Operation',
        credits: 'Credits',
        export: 'Export CSV',
        page: 'Page',
        of: '/',
        showing: 'Showing',
        total: 'total',
    },
    types: {
        sketch_to_product: 'Sketch → Product',
        product_to_model: 'Product → Model',
        video: 'Video',
        video_fast: 'Video (Fast)',
        video_high: 'Video (High)',
        tech_sketch: 'Technical Sketch',
        tech_pack: 'Tech Pack',
        pixshop: 'Pixshop',
        pixshop_4k: 'Pixshop 4K',
        fotomatik_transform: 'Fotomatik',
        fotomatik_describe: 'Fotomatik Prompt',
        adgenius_campaign_image: 'AdGenius Image',
        adgenius_campaign_video: 'AdGenius Video',
        adgenius_ecommerce_image: 'AdGenius E-Commerce',
        adgenius_ecommerce_video: 'AdGenius E-Com. Video',
        collage: 'Collage',
    },
};

const translations: TranslationRecord<typeof trTranslations> = {
    tr: trTranslations,
    en: enTranslations,
};

// ==========================================
// COLOR PALETTE FOR CHARTS
// ==========================================
const CHART_COLORS = [
    '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981',
    '#ec4899', '#3b82f6', '#f97316', '#14b8a6', '#a855f7',
    '#84cc16', '#e11d48', '#0ea5e9', '#d946ef', '#22c55e',
    '#eab308',
];

// ==========================================
// HELPER: Tarih aralığı hesaplama
// ==========================================
type PeriodKey = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const getDateRange = (period: PeriodKey): { start: string; end: string } => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let start: Date;

    switch (period) {
        case 'daily':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            break;
        case 'weekly': {
            start = new Date(now);
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        }
        case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'yearly':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
        start: start.toISOString(),
        end: end.toISOString(),
    };
};

// ==========================================
// COMPONENT
// ==========================================
export const CreditReportsPanel: React.FC = () => {
    const t = useTranslation(translations);
    const { language } = useI18n();

    // State
    const [period, setPeriod] = useState<PeriodKey>('monthly');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [loading, setLoading] = useState(true);

    // Data state
    const [allGenerations, setAllGenerations] = useState<CreditReportGeneration[]>([]);
    const [distribution, setDistribution] = useState<TypeDistribution[]>([]);
    const [trend, setTrend] = useState<DailyTrend[]>([]);
    const [topUsers, setTopUsers] = useState<TopCreditUser[]>([]);

    // Today/Week/Month quick stats (separate fetch)
    const [todayCredits, setTodayCredits] = useState(0);
    const [weekCredits, setWeekCredits] = useState(0);
    const [monthCredits, setMonthCredits] = useState(0);

    // Table pagination
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 15;

    // Fetch data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const range = period === 'custom' && customStart && customEnd
                ? { start: new Date(customStart).toISOString(), end: new Date(customEnd + 'T23:59:59').toISOString() }
                : getDateRange(period);

            const [gens, dist, trendData, top] = await Promise.all([
                getCreditUsageReport(range.start, range.end),
                getCreditDistributionByType(range.start, range.end),
                getDailyCreditTrend(range.start, range.end),
                getTopCreditUsers(range.start, range.end, 20),
            ]);

            setAllGenerations(gens);
            setDistribution(dist);
            setTrend(trendData);
            setTopUsers(top);
            setPage(1);

            // Quick stats (always fresh)
            const todayRange = getDateRange('daily');
            const weekRange = getDateRange('weekly');
            const monthRange = getDateRange('monthly');

            const [todayGens, weekGens, monthGens] = await Promise.all([
                getCreditUsageReport(todayRange.start, todayRange.end),
                getCreditUsageReport(weekRange.start, weekRange.end),
                getCreditUsageReport(monthRange.start, monthRange.end),
            ]);

            setTodayCredits(todayGens.reduce((s, g) => s + g.credits_used, 0));
            setWeekCredits(weekGens.reduce((s, g) => s + g.credits_used, 0));
            setMonthCredits(monthGens.reduce((s, g) => s + g.credits_used, 0));
        } catch (err) {
            console.error('Credit reports error:', err);
        } finally {
            setLoading(false);
        }
    }, [period, customStart, customEnd]);

    useEffect(() => {
        if (period !== 'custom') fetchData();
    }, [period]);

    // Active users count
    const activeUserCount = useMemo(() => {
        const uniqueUsers = new Set(allGenerations.map(g => g.user_id));
        return uniqueUsers.size;
    }, [allGenerations]);

    // Total credits in current view
    const totalCreditsInView = useMemo(() =>
        allGenerations.reduce((s, g) => s + g.credits_used, 0),
        [allGenerations]);

    // Paginated table data
    const paginatedData = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return allGenerations.slice(start, start + PAGE_SIZE);
    }, [allGenerations, page]);

    const totalPages = Math.max(1, Math.ceil(allGenerations.length / PAGE_SIZE));

    // Type label helper
    const getTypeLabel = (type: string): string => {
        const key = type as keyof typeof trTranslations.types;
        return (t.types as any)[key] || type.replace(/_/g, ' ');
    };

    // CSV Export
    const handleExportCSV = () => {
        const header = `${t.table.date},${t.table.user},${t.table.type},${t.table.credits}\n`;
        const rows = allGenerations.map(g =>
            `${new Date(g.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')},${g.user_email},${getTypeLabel(g.type)},${g.credits_used}`
        ).join('\n');

        const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credit-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ==========================================
    // BAR CHART (Pure SVG)
    // ==========================================
    const BarChart: React.FC<{ data: DailyTrend[] }> = ({ data }) => {
        if (!data.length) return <p className="text-slate-500 text-center py-8">{t.noData}</p>;

        const maxCredits = Math.max(...data.map(d => d.total_credits), 1);
        const chartH = 220;
        const barW = Math.max(12, Math.min(48, (700 / data.length) - 4));

        return (
            <div className="overflow-x-auto">
                <svg width={Math.max(700, data.length * (barW + 6) + 60)} height={chartH + 50} className="mx-auto">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                        const y = chartH - frac * chartH + 10;
                        return (
                            <g key={frac}>
                                <line x1="50" y1={y} x2={data.length * (barW + 6) + 55} y2={y} stroke="#334155" strokeDasharray="4,4" />
                                <text x="45" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11">
                                    {Math.round(maxCredits * frac)}
                                </text>
                            </g>
                        );
                    })}
                    {/* Bars */}
                    {data.map((d, i) => {
                        const h = (d.total_credits / maxCredits) * chartH;
                        const x = 55 + i * (barW + 6);
                        const y = chartH - h + 10;
                        const label = d.date.slice(5); // MM-DD
                        return (
                            <g key={d.date}>
                                <defs>
                                    <linearGradient id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <rect x={x} y={y} width={barW} height={h} rx={4} fill={`url(#bar-grad-${i})`} className="transition-all duration-300 hover:opacity-80">
                                    <title>{`${d.date}: ${d.total_credits} ${t.chart.credits}, ${d.count} ${t.chart.operations}`}</title>
                                </rect>
                                {/* Value on top */}
                                {h > 20 && (
                                    <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="600">
                                        {d.total_credits}
                                    </text>
                                )}
                                {/* Date label */}
                                <text x={x + barW / 2} y={chartH + 28} textAnchor="middle" fill="#64748b" fontSize="9" transform={`rotate(-45, ${x + barW / 2}, ${chartH + 28})`}>
                                    {label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        );
    };

    // ==========================================
    // DONUT CHART (Pure CSS/SVG)
    // ==========================================
    const DonutChart: React.FC<{ data: TypeDistribution[] }> = ({ data }) => {
        if (!data.length) return <p className="text-slate-500 text-center py-8">{t.noData}</p>;

        const total = data.reduce((s, d) => s + d.total_credits, 0);
        const radius = 80;
        const circumference = 2 * Math.PI * radius;
        let offset = 0;

        return (
            <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        {data.map((d, i) => {
                            const pct = d.total_credits / total;
                            const dashArray = `${pct * circumference} ${circumference}`;
                            const rotation = (offset / total) * 360 - 90;
                            const el = (
                                <circle
                                    key={d.type}
                                    cx="100" cy="100" r={radius}
                                    fill="none"
                                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                    strokeWidth="24"
                                    strokeDasharray={dashArray}
                                    strokeDashoffset="0"
                                    transform={`rotate(${rotation} 100 100)`}
                                    className="transition-all duration-500 hover:opacity-75"
                                >
                                    <title>{`${getTypeLabel(d.type)}: ${d.total_credits} (${(pct * 100).toFixed(1)}%)`}</title>
                                </circle>
                            );
                            offset += d.total_credits;
                            return el;
                        })}
                        <text x="100" y="95" textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="bold">
                            {total}
                        </text>
                        <text x="100" y="115" textAnchor="middle" fill="#94a3b8" fontSize="12">
                            {t.donut.total}
                        </text>
                    </svg>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow">
                    {data.map((d, i) => (
                        <div key={d.type} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-slate-300 truncate">{getTypeLabel(d.type)}</span>
                            <span className="text-slate-400 font-mono ml-auto">{d.total_credits}</span>
                            <span className="text-slate-500 text-xs">({(d.total_credits / total * 100).toFixed(0)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={!allGenerations.length}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
                >
                    📥 {t.table.export}
                </button>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: t.stats.todayCredits, value: todayCredits, unit: t.stats.credits, icon: '📅', color: 'from-cyan-600/20 to-blue-600/20 border-cyan-500/30' },
                    { label: t.stats.weekCredits, value: weekCredits, unit: t.stats.credits, icon: '📊', color: 'from-purple-600/20 to-indigo-600/20 border-purple-500/30' },
                    { label: t.stats.monthCredits, value: monthCredits, unit: t.stats.credits, icon: '📈', color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30' },
                    { label: t.stats.totalUsers, value: activeUserCount, unit: t.stats.user, icon: '👥', color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30' },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-4 sm:p-5`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{stat.icon}</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{loading ? '...' : stat.value.toLocaleString()}</p>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Period Filter */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-2">
                    {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as PeriodKey[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p
                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {(t.filters as any)[p]}
                        </button>
                    ))}
                    {period === 'custom' && (
                        <div className="flex items-center gap-2 ml-2">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm"
                            />
                            <span className="text-slate-500">—</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-200 text-sm"
                            />
                            <button
                                onClick={fetchData}
                                disabled={!customStart || !customEnd}
                                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-40 transition-all"
                            >
                                {t.filters.apply}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
                    <span className="ml-3 text-slate-400">{t.loading}</span>
                </div>
            ) : (
                <>
                    {/* Charts Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Bar Chart */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                📊 {t.chart.title}
                            </h3>
                            <BarChart data={trend} />
                        </div>

                        {/* Donut Chart */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                🎯 {t.donut.title}
                            </h3>
                            <DonutChart data={distribution} />
                        </div>
                    </div>

                    {/* Top Users */}
                    {topUsers.length > 0 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                🏆 {t.topUsers.title}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-slate-400 border-b border-slate-700">
                                            <th className="text-left py-3 px-3 font-medium">{t.topUsers.rank}</th>
                                            <th className="text-left py-3 px-3 font-medium">{t.topUsers.email}</th>
                                            <th className="text-left py-3 px-3 font-medium hidden sm:table-cell">{t.topUsers.name}</th>
                                            <th className="text-right py-3 px-3 font-medium">{t.topUsers.totalCredits}</th>
                                            <th className="text-right py-3 px-3 font-medium hidden md:table-cell">{t.topUsers.totalOps}</th>
                                            <th className="text-left py-3 px-3 font-medium hidden lg:table-cell">{t.topUsers.mostUsed}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topUsers.map((user, i) => (
                                            <tr key={user.user_id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3 px-3">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                            i === 1 ? 'bg-slate-400/20 text-slate-300' :
                                                                i === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                                    'bg-slate-700 text-slate-400'
                                                        }`}>
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-200 font-medium truncate max-w-[200px]">{user.email}</td>
                                                <td className="py-3 px-3 text-slate-400 hidden sm:table-cell truncate max-w-[150px]">{user.full_name || '—'}</td>
                                                <td className="py-3 px-3 text-right">
                                                    <span className="text-cyan-400 font-bold">{user.total_credits_used}</span>
                                                </td>
                                                <td className="py-3 px-3 text-right text-slate-400 hidden md:table-cell">{user.total_generations}</td>
                                                <td className="py-3 px-3 hidden lg:table-cell">
                                                    <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs">{getTypeLabel(user.most_used_type)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Detailed Table */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                📋 {t.table.title}
                            </h3>
                            <span className="text-slate-400 text-sm">
                                {t.table.showing} {paginatedData.length} / {allGenerations.length} {t.table.total}
                            </span>
                        </div>

                        {allGenerations.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">{t.noData}</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-slate-700">
                                                <th className="text-left py-3 px-3 font-medium">{t.table.date}</th>
                                                <th className="text-left py-3 px-3 font-medium">{t.table.user}</th>
                                                <th className="text-left py-3 px-3 font-medium">{t.table.type}</th>
                                                <th className="text-right py-3 px-3 font-medium">{t.table.credits}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedData.map((gen) => (
                                                <tr key={gen.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                                                    <td className="py-2.5 px-3 text-slate-400 text-xs whitespace-nowrap">
                                                        {new Date(gen.created_at).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', {
                                                            day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-200 truncate max-w-[200px]">{gen.user_email}</td>
                                                    <td className="py-2.5 px-3">
                                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-lg text-xs">{getTypeLabel(gen.type)}</span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <span className="text-cyan-400 font-semibold">{gen.credits_used}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-700">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm disabled:opacity-40 transition-all"
                                        >
                                            ‹
                                        </button>
                                        <span className="text-slate-400 text-sm px-3">
                                            {t.table.page} {page} {t.table.of} {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm disabled:opacity-40 transition-all"
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CreditReportsPanel;
