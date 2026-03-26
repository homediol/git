import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function SubServiceShow({ auth, service, subService, advertisements = [], settings }) {
    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={`${subService.title} - ${service.title}`}>
                <meta name="description" content={subService.description || 'Explore our professional sub-service offerings'} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                        <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-sky-200/80 font-semibold">
                                {service.title}
                            </p>
                            <h1 className="font-display text-4xl sm:text-5xl font-semibold bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent">
                                {subService.title}
                            </h1>
                            {subService.description && (
                                <p className="mt-3 text-white/70 text-base sm:text-lg max-w-3xl">
                                    {subService.description}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('services.show', service.id)}
                                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white"
                            >
                                Back to {service.title}
                            </Link>
                            <Link
                                href={route('services')}
                                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 hover:text-white"
                            >
                                All Services
                            </Link>
                        </div>
                    </div>

                    {subService.image && (
                        <div className="glass-dark rounded-2xl p-4 mb-12">
                            <img
                                src={subService.image}
                                alt={subService.title}
                                className="h-72 w-full rounded-xl object-cover"
                            />
                        </div>
                    )}

                    <div className="glass-dark rounded-2xl p-6 sm:p-8">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-cyan-300">What you get</h2>
                        <p className="mt-3 text-white/70 text-base sm:text-lg">
                            Tell us about your goals and timeline, and we will craft a custom plan for {subService.title.toLowerCase()} that fits your event or business needs.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Link
                                href={route('contact')}
                                className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 text-white font-semibold text-sm hover:shadow-xl hover:scale-[1.02] transition"
                            >
                                Request a Quote
                            </Link>
                            <Link
                                href={route('services.show', service.id)}
                                className="rounded-xl bg-white/10 px-6 py-3 text-white/80 font-semibold text-sm hover:text-white"
                            >
                                See All {service.title}
                            </Link>
                        </div>
                    </div>

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
