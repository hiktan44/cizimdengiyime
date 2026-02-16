import React from 'react';
import { BeforeAfterSlider } from '../BeforeAfterSlider';

interface ShowcaseSectionProps {
    t: any;
    sketchUrl?: string;
    productUrl?: string;
    modelUrl?: string;
    videoUrl?: string;
}

export const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
    t, sketchUrl, productUrl, modelUrl, videoUrl
}) => {
    const demoSketch = sketchUrl || '/demo/sketch.jpg';
    const demoProduct = productUrl || '/demo/product.jpg';
    const demoModel = modelUrl || '/demo/model.jpg';
    const demoVideo = videoUrl;

    const showcaseItems = [
        {
            title: t?.showcase?.step1 || 'Sketch → Product',
            desc: t?.showcase?.step1Desc || 'Transform fashion sketches into product photos',
            before: demoSketch,
            after: demoProduct,
            beforeLabel: t?.showcase?.step1Before || t?.showcase?.before || 'BEFORE',
            afterLabel: t?.showcase?.step1After || t?.showcase?.after || 'AFTER',
            color: 'from-cyan-500 to-blue-600',
        },
        {
            title: t?.showcase?.step2 || 'Product → Model',
            desc: t?.showcase?.step2Desc || 'Place products on AI-generated models',
            before: demoProduct,
            after: demoModel,
            beforeLabel: t?.showcase?.step2Before || t?.showcase?.before || 'BEFORE',
            afterLabel: t?.showcase?.step2After || t?.showcase?.after || 'AFTER',
            color: 'from-purple-500 to-pink-600',
        },
    ];

    return (
        <section id="showcase" className="relative py-20 px-6 z-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="section-title title-violet">
                    {t?.showcase?.title || 'See The Results'}
                </h2>
                <p className="section-subtitle">
                    {t?.showcase?.subtitle || 'AI technology transforms your designs into professional visuals'}
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {showcaseItems.map((item, i) => (
                        <div
                            key={i}
                            className="glass-card p-6 animate-fadeInUp"
                            style={{ animationDelay: `${i * 150}ms` }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-white text-sm font-bold">{i + 1}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                            </div>
                            <p className="text-white/50 text-sm mb-4">{item.desc}</p>
                            <div className="aspect-[4/5] rounded-xl overflow-hidden">
                                <BeforeAfterSlider
                                    beforeImage={item.before}
                                    afterImage={item.after}
                                    beforeLabel={item.beforeLabel}
                                    afterLabel={item.afterLabel}
                                />
                            </div>
                        </div>
                    ))}

                    {/* Video Card */}
                    {demoVideo && (
                        <div className="glass-card p-6 md:col-span-2 animate-fadeInUp delay-300">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                    {t?.showcase?.step3 || 'Model → Video'}
                                </h3>
                            </div>
                            <div className="aspect-video rounded-xl overflow-hidden">
                                <video
                                    src={demoVideo}
                                    className="w-full h-full object-cover"
                                    autoPlay loop muted playsInline
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};
