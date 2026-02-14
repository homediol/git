import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function Services({ auth, services, advertisements = [], settings }) {
    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title="Our Services - Digital Solutions">
                <meta name="description" content="Explore our comprehensive digital services including web development, design, and creative solutions" />
                <meta name="keywords" content="services, web development, design, digital solutions" />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Our Services
                    </h1>
                    <p className="text-center text-gray-900 text-2xl font-semibold mb-12 max-w-2xl mx-auto">
                        Professional graphic design, branding, and premium printing services tailored to your needs
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <div key={service.id} className="glass rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all">
                                {service.image && (
                                    <img src={service.image} alt={service.title} loading="lazy" className="w-full h-48 object-cover rounded-xl mb-4" />
                                )}
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3" dangerouslySetInnerHTML={{ __html: service.title }} />
                                <p className="text-xl text-gray-900 font-semibold" dangerouslySetInnerHTML={{ __html: service.description }} />
                            </div>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Partners</h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
