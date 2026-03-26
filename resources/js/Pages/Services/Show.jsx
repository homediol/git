import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function ServiceShow({ auth, service, subServices = [], advertisements = [], settings }) {
    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={`${service.title} - Services`}>
                <meta name="description" content={service.description || 'Explore our professional services and sub-services'} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="font-display text-4xl sm:text-5xl font-semibold bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent">
                                {service.title}
                            </h1>
                            {service.description && (
                                <p className="mt-3 text-white/70 text-base sm:text-lg max-w-2xl" dangerouslySetInnerHTML={{ __html: service.description }} />
                            )}
                        </div>
                        <Link
                            href={route('services')}
                            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white"
                        >
                            Back to Services
                        </Link>
                    </div>

                    {service.image && (
                        <div className="glass-dark rounded-2xl p-4 mb-10">
                            <img
                                src={service.image}
                                alt={service.title}
                                className="h-64 w-full rounded-xl object-cover"
                            />
                        </div>
                    )}

                    <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white/90 mb-6">
                        Sub-services
                    </h2>

                    {subServices.length === 0 ? (
                        <p className="text-white/70">No sub-services available yet.</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {subServices.map((subService) => (
                                <Link
                                    key={subService.id}
                                    href={route('services.subservices.show', [service.id, subService.id])}
                                    className="glass-dark rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-[1.02]"
                                >
                                    {subService.image && (
                                        <img
                                            src={subService.image}
                                            alt={subService.title}
                                            className="mb-4 h-48 w-full rounded-xl object-cover"
                                        />
                                    )}
                                    <h3 className="text-2xl font-semibold text-cyan-300">{subService.title}</h3>
                                    {subService.description && (
                                        <p className="mt-2 text-white/70 text-sm sm:text-base">{subService.description}</p>
                                    )}
                                    <span className="mt-4 inline-flex text-sm font-semibold text-sky-200">
                                        View Details →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-center mb-10 text-white/90">Our Partners</h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
