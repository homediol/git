import { useState, useEffect } from 'react';
import { useLocale } from '@/Providers/LocaleProvider';
import SupportWhatsAppButton from '@/Components/SupportWhatsAppButton';

export default function AdSlider({ advertisements = [] }) {
    const { t } = useLocale();
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const activeAds = Array.isArray(advertisements) ? advertisements.filter(ad => ad.active) : [];

    useEffect(() => {
        if (activeAds.length === 0 || isPaused) return;
        
        const currentAd = activeAds[current];
        const duration = currentAd.type === 'video' ? currentAd.duration * 1000 : currentAd.duration * 1000;
        
        const timer = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % activeAds.length);
        }, duration);
        
        return () => clearTimeout(timer);
    }, [current, activeAds.length, isPaused]);

    if (activeAds.length === 0) {
        return (
            <div className="w-full h-64 surface flex flex-col items-center justify-center">
                <p className="text-[color:var(--md-text)] text-lg font-semibold">{t('ads.empty')}</p>
                <p className="text-slate-500 text-sm mt-2">
                    {t('ads.total')}: {advertisements.length} | {t('ads.active')}: {activeAds.length}
                </p>
            </div>
        );
    }

    const currentAd = activeAds[current];

    return (
        <div 
            className="relative w-full h-80 surface overflow-hidden shadow-elevated group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,109,0,0.12)] via-[rgba(251,188,5,0.12)] to-[rgba(66,133,244,0.12)]"></div>
            
            {activeAds.map((ad, index) => (
                <div
                    key={ad.id}
                    className={`absolute inset-0 transition-all duration-1000 ${index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                >
                    {ad.link ? (
                        <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                            {ad.type === 'video' ? (
                                <video
                                    key={ad.media}
                                    src={ad.media}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                    onError={(e) => console.error('Video load error:', ad.media)}
                                />
                            ) : (
                                <img
                                    key={ad.media}
                                    src={ad.media}
                                    alt={ad.title || 'Advertisement'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => console.error('Image load error:', ad.media)}
                                />
                            )}
                        </a>
                    ) : (
                        <div className="w-full h-full">
                            {ad.type === 'video' ? (
                                <video
                                    key={ad.media}
                                    src={ad.media}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                    onError={(e) => console.error('Video load error:', ad.media)}
                                />
                            ) : (
                                <img
                                    key={ad.media}
                                    src={ad.media}
                                    alt={ad.title || 'Advertisement'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => console.error('Image load error:', ad.media)}
                                />
                            )}
                        </div>
                    )}
                    
                    {(ad.title || ad.description) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                            {ad.title && <h3 className="text-white text-2xl font-semibold mb-2 drop-shadow">{ad.title}</h3>}
                            {ad.description && <p className="text-white/90 text-sm drop-shadow">{ad.description}</p>}
                            <div className="mt-4">
                                <SupportWhatsAppButton
                                    message={`Hello Pavona admin, I have a question about this advertisement${ad.title ? `: ${ad.title}` : ''}.`}
                                    label={t('support.whatsapp.short', 'WhatsApp admin')}
                                    className="px-4 py-2 text-xs"
                                />
                            </div>
                        </div>
                    )}

                    {!ad.title && !ad.description && (
                        <div className="absolute bottom-5 right-5">
                            <SupportWhatsAppButton
                                message="Hello Pavona admin, I have a question about this advertisement."
                                label={t('support.whatsapp.short', 'WhatsApp admin')}
                                className="px-4 py-2 text-xs"
                            />
                        </div>
                    )}
                </div>
            ))}

            {activeAds.length > 1 && (
                <>
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
                        {activeAds.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrent(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === current 
                                        ? 'bg-white w-12 shadow-lg' 
                                        : 'bg-white/40 w-2 hover:bg-white/60'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                    
                    <button
                        onClick={() => setCurrent((prev) => (prev - 1 + activeAds.length) % activeAds.length)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[color:var(--md-text)] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-elevated"
                        aria-label="Previous slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrent((prev) => (prev + 1) % activeAds.length)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[color:var(--md-text)] p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-elevated"
                        aria-label="Next slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {isPaused && (
                <div className="absolute top-6 right-6 bg-white/90 text-[color:var(--md-text)] px-4 py-2 rounded-full text-xs font-semibold shadow-elevated">
                    {t('ads.paused')}
                </div>
            )}
        </div>
    );
}
