import { useState, useEffect } from 'react';

export default function AdSlider({ advertisements = [] }) {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const activeAds = Array.isArray(advertisements) ? advertisements.filter(ad => ad.active) : [];

    console.log('AdSlider - Total ads:', advertisements.length, 'Active ads:', activeAds.length);
    if (activeAds.length > 0) {
        console.log('First ad media path:', activeAds[0].media, 'Type:', activeAds[0].type);
    }

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
            <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center">
                <p className="text-white text-xl">No advertisements available</p>
                <p className="text-white text-sm mt-2">Total: {advertisements.length} | Active: {activeAds.length}</p>
            </div>
        );
    }

    const currentAd = activeAds[current];

    return (
        <div 
            className="relative w-full h-80 bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-3xl overflow-hidden shadow-2xl group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 animate-pulse"></div>
            
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
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8 rounded-b-3xl">
                            {ad.title && <h3 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">{ad.title}</h3>}
                            {ad.description && <p className="text-white/95 text-base drop-shadow-md">{ad.description}</p>}
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
                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110"
                        aria-label="Previous slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrent((prev) => (prev + 1) % activeAds.length)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl hover:scale-110"
                        aria-label="Next slide"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {isPaused && (
                <div className="absolute top-6 right-6 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                    ⏸ Paused
                </div>
            )}
        </div>
    );
}
