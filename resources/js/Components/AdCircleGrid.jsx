import { useEffect, useRef } from 'react';
import { useLocale } from '@/Providers/LocaleProvider';
import SupportWhatsAppButton from '@/Components/SupportWhatsAppButton';

export default function AdCircleGrid({ advertisements = [] }) {
    const { t } = useLocale();
    const activeAds = Array.isArray(advertisements) ? advertisements.filter(ad => ad.active) : [];
    const scrollRef = useRef(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || activeAds.length === 0) return;

        let scrollPosition = 0;
        const scrollSpeed = 1;

        const scroll = () => {
            const firstItem = scrollContainer.querySelector('[data-ad-item]');
            const computedStyles = window.getComputedStyle(scrollContainer);
            const gap = Number.parseFloat(computedStyles.columnGap || computedStyles.gap || '0') || 0;
            const itemWidth = (firstItem?.offsetWidth || (window.innerWidth < 640 ? 128 : 160)) + gap;
            scrollPosition += scrollSpeed;
            const maxScroll = itemWidth * activeAds.length;
            
            if (scrollPosition >= maxScroll) {
                scrollPosition = 0;
            }
            
            scrollContainer.scrollLeft = scrollPosition;
        };

        const interval = setInterval(scroll, 30);
        return () => clearInterval(interval);
    }, [activeAds.length]);

    if (activeAds.length === 0) return null;

    // Duplicate ads for seamless loop
    const duplicatedAds = [...activeAds, ...activeAds, ...activeAds];

    return (
        <div className="overflow-hidden">
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto px-1 sm:gap-8 sm:overflow-x-hidden">
                {duplicatedAds.map((ad, index) => (
                    <div key={`${ad.id}-${index}`} data-ad-item className="group flex flex-shrink-0 flex-col items-center">
                        {ad.link ? (
                            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="h-28 w-28 overflow-hidden rounded-full shadow-elevated ring-4 ring-[rgba(251,188,5,0.35)] transition-all duration-300 group-hover:scale-110 group-hover:ring-[rgba(255,109,0,0.55)] sm:h-40 sm:w-40">
                                    {ad.type === 'video' ? (
                                        <video
                                            src={ad.media}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={ad.media}
                                            alt={ad.title || t('ads.item')}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                {ad.title && (
                                    <p className="mt-3 w-28 text-center text-sm font-semibold text-[color:var(--md-text)] transition-colors group-hover:text-[color:var(--md-primary)] sm:mt-4 sm:w-40 sm:text-base">
                                        {ad.title}
                                    </p>
                                )}
                            </a>
                        ) : (
                            <>
                                <div className="h-28 w-28 overflow-hidden rounded-full shadow-elevated ring-4 ring-[rgba(251,188,5,0.35)] transition-all duration-300 group-hover:scale-110 group-hover:ring-[rgba(255,109,0,0.55)] sm:h-40 sm:w-40">
                                    {ad.type === 'video' ? (
                                        <video
                                            src={ad.media}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={ad.media}
                                            alt={ad.title || t('ads.item')}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                {ad.title && (
                                    <p className="mt-3 w-28 text-center text-sm font-semibold text-[color:var(--md-text)] transition-colors group-hover:text-[color:var(--md-primary)] sm:mt-4 sm:w-40 sm:text-base">
                                        {ad.title}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-center px-2">
                <SupportWhatsAppButton
                    message="Hello Pavona admin, I have a question about an advertisement I saw on the website."
                    showPhone
                />
            </div>
        </div>
    );
}
