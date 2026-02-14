export default function PageHeader({ title, subtitle, icon }) {
    return (
        <div className="relative py-20 px-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-90"></div>
            <div className="absolute inset-0">
                <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse animation-delay-2000"></div>
            </div>
            
            {/* Content */}
            <div className="relative max-w-7xl mx-auto text-center">
                {icon && (
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <span className="text-4xl">{icon}</span>
                        </div>
                    </div>
                )}
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
