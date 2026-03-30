export default function PageHeader({ title, subtitle, icon }) {
    return (
        <div className="relative py-16 sm:py-20 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,109,0,0.18),_transparent_55%)]"></div>
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(66,133,244,0.18),_transparent_65%)] blur-3xl"></div>
            <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(251,188,5,0.18),_transparent_65%)] blur-3xl"></div>

            <div className="relative max-w-6xl mx-auto text-center">
                {icon && (
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-elevated flex items-center justify-center text-2xl">
                            {icon}
                        </div>
                    </div>
                )}
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[color:var(--md-text)] mb-4">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
