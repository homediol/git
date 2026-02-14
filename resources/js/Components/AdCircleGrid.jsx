import { useEffect, useRef } from 'react';

export default function AdCircleGrid({ advertisements = [] }) {
    const activeAds = Array.isArray(advertisements) ? advertisements.filter(ad => ad.active) : [];
    const scrollRef = useRef(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || activeAds.length === 0) return;

        let scrollPosition = 0;
        const scrollSpeed = 1;
        const itemWidth = 192; // 160px + 32px gap

        const scroll = () => {
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
            <div ref={scrollRef} className="flex gap-8 overflow-x-hidden">
                {duplicatedAds.map((ad, index) => (
                    <div key={`${ad.id}-${index}`} className="flex-shrink-0 flex flex-col items-center group">
                        {ad.link ? (
                            <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-purple-500/30 group-hover:ring-purple-500 transition-all duration-300 group-hover:scale-110">
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
                                            alt={ad.title || 'Advertisement'}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                {ad.title && (
                                    <p className="mt-4 text-center text-white text-xl font-bold drop-shadow-lg group-hover:text-yellow-300 transition-colors w-40">
                                        {ad.title}
                                    </p>
                                )}
                            </a>
                        ) : (
                            <>
                                <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-purple-500/30 group-hover:ring-purple-500 transition-all duration-300 group-hover:scale-110">
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
                                            alt={ad.title || 'Advertisement'}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                {ad.title && (
                                    <p className="mt-4 text-center text-white text-xl font-bold drop-shadow-lg group-hover:text-yellow-300 transition-colors w-40">
                                        {ad.title}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
