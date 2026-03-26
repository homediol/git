export default function PageHeader({ title, subtitle, icon }) {
    return (
        <div className="relative py-20 px-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f45]/70 via-[#0b0f1e]/80 to-[#0b0f1e]/90"></div>
            <div className="absolute inset-0">
                <div className="absolute w-96 h-96 bg-violet-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse animation-delay-2000"></div>
            </div>
            
            {/* Content */}
            <div className="relative max-w-7xl mx-auto text-center">
                {icon && (
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <span className="text-4xl">{icon}</span>
                        </div>
                    </div>
                )}
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight bg-gradient-to-r from-sky-200 via-blue-100 to-indigo-200 bg-clip-text text-transparent mb-4 drop-shadow-lg">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto drop-shadow">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
