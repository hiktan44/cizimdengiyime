import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, TranslationRecord } from '../../lib/i18n';
import { supabase } from '../../lib/supabase';

// ==========================================
// TYPES
// ==========================================

interface MobileLandingItem {
    id: string;
    type: 'hero_banner' | 'feature_card' | 'promo_banner' | 'app_screenshot';
    title: string;
    subtitle?: string;
    image_url: string;
    link_url?: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

type MobileLandingType = MobileLandingItem['type'];

// ==========================================
// TRANSLATIONS
// ==========================================

const trTranslations = {
    title: '📱 Mobil Landing İçerik Yönetimi',
    subtitle: 'Mobil uygulamanın ana ekranında görünecek banner, özellik kartı ve promosyon görsellerini buradan yönetin.',
    tabs: {
        hero_banner: '🖼️ Hero Bannerlar',
        feature_card: '⭐ Özellik Kartları',
        promo_banner: '🎯 Promosyon',
        app_screenshot: '📸 Ekran Görüntüleri',
    },
    form: {
        addNew: 'Yeni Ekle',
        title: 'Başlık',
        titlePlaceholder: 'Görsel başlığı...',
        subtitle: 'Alt Başlık (Opsiyonel)',
        subtitlePlaceholder: 'Açıklama metni...',
        linkUrl: 'Bağlantı URL (Opsiyonel)',
        linkPlaceholder: 'https://...',
        selectImage: 'Görsel Seç',
        changeImage: 'Görseli Değiştir',
        save: 'Kaydet',
        saving: 'Kaydediliyor...',
        cancel: 'İptal',
        delete: 'Sil',
        deleting: 'Siliniyor...',
        dragToReorder: 'Sıralamayı değiştirmek için sürükle-bırak yapın',
    },
    status: {
        active: 'Aktif',
        inactive: 'Pasif',
        noItems: 'Henüz içerik eklenmemiş.',
        uploaded: 'Yüklendi!',
        error: 'Hata oluştu',
        deleteConfirm: 'Bu içeriği silmek istediğinize emin misiniz?',
    },
    stats: {
        totalItems: 'Toplam İçerik',
        activeItems: 'Aktif İçerik',
        heroBanners: 'Hero Banner',
        featureCards: 'Özellik Kartı',
    },
};

const translations: TranslationRecord<typeof trTranslations> = {
    tr: trTranslations,
    en: {
        title: '📱 Mobile Landing Content',
        subtitle: 'Manage banners, feature cards, and promotional images displayed on the mobile app home screen.',
        tabs: {
            hero_banner: '🖼️ Hero Banners',
            feature_card: '⭐ Feature Cards',
            promo_banner: '🎯 Promotions',
            app_screenshot: '📸 Screenshots',
        },
        form: {
            addNew: 'Add New',
            title: 'Title',
            titlePlaceholder: 'Image title...',
            subtitle: 'Subtitle (Optional)',
            subtitlePlaceholder: 'Description text...',
            linkUrl: 'Link URL (Optional)',
            linkPlaceholder: 'https://...',
            selectImage: 'Select Image',
            changeImage: 'Change Image',
            save: 'Save',
            saving: 'Saving...',
            cancel: 'Cancel',
            delete: 'Delete',
            deleting: 'Deleting...',
            dragToReorder: 'Drag and drop to reorder',
        },
        status: {
            active: 'Active',
            inactive: 'Inactive',
            noItems: 'No content added yet.',
            uploaded: 'Uploaded!',
            error: 'Error occurred',
            deleteConfirm: 'Are you sure you want to delete this content?',
        },
        stats: {
            totalItems: 'Total Content',
            activeItems: 'Active Content',
            heroBanners: 'Hero Banners',
            featureCards: 'Feature Cards',
        },
    },
};

// ==========================================
// SERVICE FUNCTIONS
// ==========================================

const getMobileLandingItems = async (): Promise<MobileLandingItem[]> => {
    try {
        const { data, error } = await supabase
            .from('mobile_landing_content')
            .select('*')
            .order('type')
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching mobile landing items:', error);
        return [];
    }
};

const upsertMobileLandingItem = async (
    item: Partial<MobileLandingItem> & { type: MobileLandingType }
): Promise<{ success: boolean; data?: MobileLandingItem; error?: string }> => {
    try {
        const payload = {
            ...item,
            updated_at: new Date().toISOString(),
        };

        if (!item.id) {
            // New item — get next order_index
            const { data: existing } = await supabase
                .from('mobile_landing_content')
                .select('order_index')
                .eq('type', item.type)
                .order('order_index', { ascending: false })
                .limit(1);

            payload.order_index = (existing?.[0]?.order_index ?? -1) + 1;
            payload.is_active = true;
            payload.created_at = new Date().toISOString();
        }

        const { data, error } = item.id
            ? await supabase.from('mobile_landing_content').update(payload).eq('id', item.id).select().single()
            : await supabase.from('mobile_landing_content').insert(payload).select().single();

        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        console.error('Error upserting mobile landing item:', error);
        return { success: false, error: error.message };
    }
};

const deleteMobileLandingItem = async (id: string): Promise<boolean> => {
    try {
        const { error } = await supabase.from('mobile_landing_content').delete().eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting mobile landing item:', error);
        return false;
    }
};

const toggleMobileLandingActive = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('mobile_landing_content')
            .update({ is_active: isActive, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error toggling active:', error);
        return false;
    }
};

const uploadMobileLandingImage = async (
    file: File,
    type: MobileLandingType
): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    try {
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `mobile-${type}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('mobile-landing')
            .upload(uniqueFileName, file, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('mobile-landing')
            .getPublicUrl(uniqueFileName);

        return { success: true, imageUrl: urlData.publicUrl };
    } catch (error: any) {
        console.error('Error uploading mobile landing image:', error);
        return { success: false, error: error.message };
    }
};

// ==========================================
// COMPONENT
// ==========================================

export const MobileLandingPanel: React.FC = () => {
    const t = useTranslation(translations);
    const [items, setItems] = useState<MobileLandingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<MobileLandingType>('hero_banner');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<MobileLandingItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState('');
    const [formSubtitle, setFormSubtitle] = useState('');
    const [formLinkUrl, setFormLinkUrl] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formImageFile, setFormImageFile] = useState<File | null>(null);
    const [formImagePreview, setFormImagePreview] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        const data = await getMobileLandingItems();
        setItems(data);
        setLoading(false);
    };

    const filteredItems = items.filter((item) => item.type === activeType);

    const resetForm = () => {
        setFormTitle('');
        setFormSubtitle('');
        setFormLinkUrl('');
        setFormImageUrl('');
        setFormImageFile(null);
        setFormImagePreview('');
        setEditingItem(null);
        setShowForm(false);
    };

    const openEditForm = (item: MobileLandingItem) => {
        setEditingItem(item);
        setFormTitle(item.title);
        setFormSubtitle(item.subtitle || '');
        setFormLinkUrl(item.link_url || '');
        setFormImageUrl(item.image_url);
        setFormImagePreview(item.image_url);
        setFormImageFile(null);
        setShowForm(true);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormImageFile(file);
            const reader = new FileReader();
            reader.onload = () => setFormImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!formTitle.trim()) return;
        setSaving(true);

        try {
            let imageUrl = formImageUrl;

            // Upload new image if selected
            if (formImageFile) {
                const uploadResult = await uploadMobileLandingImage(formImageFile, activeType);
                if (!uploadResult.success) {
                    alert(`❌ Görsel yükleme hatası: ${uploadResult.error}`);
                    setSaving(false);
                    return;
                }
                imageUrl = uploadResult.imageUrl!;
            }

            if (!imageUrl) {
                alert('❌ Lütfen bir görsel seçin.');
                setSaving(false);
                return;
            }

            const result = await upsertMobileLandingItem({
                ...(editingItem ? { id: editingItem.id } : {}),
                type: activeType,
                title: formTitle.trim(),
                subtitle: formSubtitle.trim() || undefined,
                image_url: imageUrl,
                link_url: formLinkUrl.trim() || undefined,
            });

            if (result.success) {
                await loadItems();
                resetForm();
            } else {
                alert(`❌ Kayıt hatası: ${result.error}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('❌ Beklenmeyen hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.status.deleteConfirm)) return;
        setDeleting(id);
        const success = await deleteMobileLandingItem(id);
        if (success) {
            await loadItems();
        }
        setDeleting(null);
    };

    const handleToggleActive = async (id: string, currentState: boolean) => {
        const success = await toggleMobileLandingActive(id, !currentState);
        if (success) {
            setItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, is_active: !currentState } : item))
            );
        }
    };

    // Stats
    const totalItems = items.length;
    const activeItems = items.filter((i) => i.is_active).length;
    const heroBannerCount = items.filter((i) => i.type === 'hero_banner').length;
    const featureCardCount = items.filter((i) => i.type === 'feature_card').length;

    const typeLabels: Record<MobileLandingType, string> = {
        hero_banner: t.tabs.hero_banner,
        feature_card: t.tabs.feature_card,
        promo_banner: t.tabs.promo_banner,
        app_screenshot: t.tabs.app_screenshot,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-1">{t.title}</h2>
                <p className="text-slate-400 text-sm">{t.subtitle}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">{t.stats.totalItems}</div>
                    <div className="text-2xl font-bold text-white">{totalItems}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">{t.stats.activeItems}</div>
                    <div className="text-2xl font-bold text-green-400">{activeItems}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">{t.stats.heroBanners}</div>
                    <div className="text-2xl font-bold text-blue-400">{heroBannerCount}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-400 text-xs mb-1">{t.stats.featureCards}</div>
                    <div className="text-2xl font-bold text-purple-400">{featureCardCount}</div>
                </div>
            </div>

            {/* Type Tabs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(Object.keys(typeLabels) as MobileLandingType[]).map((type) => (
                        <button
                            key={type}
                            onClick={() => { setActiveType(type); resetForm(); }}
                            className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${activeType === type
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {typeLabels[type]}
                            <span className="ml-2 text-xs opacity-70">
                                ({items.filter((i) => i.type === type).length})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Add New Button */}
            {!showForm && (
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="w-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-2 border-dashed border-blue-500/40 hover:border-blue-500/70 rounded-xl p-6 text-blue-400 hover:text-blue-300 transition-all flex items-center justify-center gap-3 group"
                >
                    <svg className="w-8 h-8 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-lg font-semibold">{t.form.addNew}</span>
                </button>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-slate-800/70 border border-slate-600 rounded-2xl p-6 space-y-5 animate-fade-in">
                    <h3 className="text-lg font-bold text-white">
                        {editingItem ? `✏️ Düzenle: ${editingItem.title}` : `➕ ${t.form.addNew} — ${typeLabels[activeType]}`}
                    </h3>

                    {/* Image Upload */}
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                        {formImagePreview ? (
                            <div className="relative group">
                                <img
                                    src={formImagePreview}
                                    alt="Preview"
                                    className="w-full max-h-64 object-contain bg-slate-900 rounded-xl border border-slate-600"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl"
                                >
                                    <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white font-semibold border border-white/20">
                                        {t.form.changeImage}
                                    </span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-48 bg-slate-900/60 border-2 border-dashed border-slate-600 hover:border-cyan-500/50 rounded-xl flex flex-col items-center justify-center gap-3 transition group"
                            >
                                <svg className="w-12 h-12 text-slate-500 group-hover:text-cyan-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-slate-400 group-hover:text-cyan-400 font-medium transition">{t.form.selectImage}</span>
                            </button>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.form.title}</label>
                        <input
                            type="text"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder={t.form.titlePlaceholder}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.form.subtitle}</label>
                        <textarea
                            value={formSubtitle}
                            onChange={(e) => setFormSubtitle(e.target.value)}
                            placeholder={t.form.subtitlePlaceholder}
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Link URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.form.linkUrl}</label>
                        <input
                            type="url"
                            value={formLinkUrl}
                            onChange={(e) => setFormLinkUrl(e.target.value)}
                            placeholder={t.form.linkPlaceholder}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving || !formTitle.trim()}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
                        >
                            {saving ? t.form.saving : t.form.save}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition"
                        >
                            {t.form.cancel}
                        </button>
                    </div>
                </div>
            )}

            {/* Items Grid */}
            {filteredItems.length === 0 && !showForm ? (
                <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-500 text-lg">{t.status.noItems}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className={`bg-slate-800/60 rounded-2xl overflow-hidden border transition-all hover:shadow-xl group ${item.is_active
                                    ? 'border-slate-700 hover:border-cyan-500/50'
                                    : 'border-red-500/30 opacity-60'
                                }`}
                        >
                            {/* Image */}
                            <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {/* Status badge */}
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={() => handleToggleActive(item.id, item.is_active)}
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold transition shadow-lg ${item.is_active
                                                ? 'bg-green-500/90 text-white hover:bg-green-600'
                                                : 'bg-red-500/90 text-white hover:bg-red-600'
                                            }`}
                                    >
                                        {item.is_active ? t.status.active : t.status.inactive}
                                    </button>
                                </div>
                                {/* Order badge */}
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10">
                                    #{item.order_index + 1}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h4 className="font-bold text-white text-lg mb-1 truncate">{item.title}</h4>
                                {item.subtitle && (
                                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{item.subtitle}</p>
                                )}
                                {item.link_url && (
                                    <div className="text-xs text-cyan-400/60 truncate mb-3" title={item.link_url}>
                                        🔗 {item.link_url}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditForm(item)}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={deleting === item.id}
                                        className="bg-red-600/20 hover:bg-red-600/40 text-red-400 py-2 px-3 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-1.5 border border-red-500/20"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        {deleting === item.id ? '...' : t.form.delete}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
