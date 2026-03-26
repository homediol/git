import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function Services({ auth, services = [], advertisements = [], settings }) {
    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title="Our Services - Digital Solutions">
                <meta name="description" content="Explore our comprehensive digital services including web development, design, and creative solutions" />
                <meta name="keywords" content="services, web development, design, digital solutions" />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-display text-4xl sm:text-5xl font-semibold text-center mb-4 bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent">
                        Our Services
                    </h1>
                    <p className="text-center text-white/70 text-base sm:text-lg font-semibold mb-10 max-w-2xl mx-auto">
                        Professional graphic design, branding, and premium printing services tailored to your needs
                    </p>

                    {services.length === 0 ? (
                        <p className="text-center text-white/70">No services available yet.</p>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {services.map((service) => (
                                <Link
                                    key={service.id}
                                    href={route('services.show', service.id)}
                                    className="glass-dark rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-105"
                                >
                                    {service.image && (
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            loading="lazy"
                                            className="mb-4 h-48 w-full rounded-xl object-cover"
                                        />
                                    )}
                                    <h3 className="text-2xl font-semibold text-cyan-300">{service.title}</h3>
                                    <p
                                        className="mt-2 text-sm text-white/70 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: service.description }}
                                    />
                                    <span className="mt-4 inline-flex text-sm font-semibold text-sky-200">
                                        View Sub-services →
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
