import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function About({ auth, teamMembers, advertisements = [], settings }) {
    return (
        <PublicLayout auth={auth} settings={settings} pageTitle="About Us" pageSubtitle="Learn about our mission, vision, and meet our talented team" pageIcon="👥">
            <Head title="About Us - Our Mission & Team">
                <meta name="description" content="Learn about Pavona Studio's mission, vision, and meet our talented team of professionals" />
                <meta name="keywords" content="about us, team, mission, vision, company" />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass rounded-2xl p-8 mb-12">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Our Mission</h2>
                        <p className="text-gray-900 text-xl font-semibold mb-6">
                            At Pavona Studios, we're dedicated to delivering exceptional graphic design, branding, and printing services 
                            that help businesses stand out. Our mission is to combine creativity with premium quality to bring your vision to life.
                        </p>
                        
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Our Vision</h2>
                        <p className="text-gray-900 text-xl font-semibold">
                            To be the leading creative studio for graphic design and printing, known for reliability, innovation, 
                            and delivering premium quality that exceeds expectations. We transform ideas into powerful visual communications.
                        </p>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">Our Team</h2>
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="glass rounded-2xl p-6 text-center hover:shadow-2xl hover:scale-105 transition-all">
                                {member.image && (
                                    <img src={member.image} alt={member.name} loading="lazy" className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                                )}
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{member.name}</h3>
                                <p className="text-xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-bold mb-3">{member.position}</p>
                                <p className="text-lg text-gray-900 font-semibold">{member.bio}</p>
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
