import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function Contact({ auth, flash, advertisements = [], settings }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('contact.store'), {
            onSuccess: () => {
                setData({ name: '', email: '', phone: '', subject: '', message: '' });
            }
        });
    };

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title="Contact Us - Get in Touch">
                <meta name="description" content="Contact Pavona Studios for graphic design, branding, and printing services" />
                <meta name="keywords" content="contact, get in touch, inquiries, support" />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* 1. Page Title */}
                    <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Get in Touch
                    </h1>
                    
                    {/* 2. Introduction Text */}
                    <div className="text-center text-white text-2xl font-bold drop-shadow-lg mb-12 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: "Have a project in mind? Need expert graphic design or printing services? We're here to help bring your vision to life. Contact Pavona Studios today and let's create something amazing together!" }} />

                    {/* 9. Success/Error Messages */}
                    {flash?.success && (
                        <div className="glass rounded-xl p-4 mb-6 bg-green-50 border border-green-200 max-w-3xl mx-auto">
                            <p className="text-green-700 font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {flash.success}
                            </p>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {/* LEFT - Contact Form */}
                        <div className="glass rounded-2xl p-8">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">Send Us a Message</h2>
                            
                            {/* 3. Contact Form */}
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <InputLabel htmlFor="name" value="Full Name *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="email" value="Email Address *" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="phone" value="Phone Number" />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="subject" value="Subject *" />
                                    <TextInput
                                        id="subject"
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <InputLabel htmlFor="message" value="Message *" />
                                    <textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                        rows="5"
                                        required
                                    />
                                </div>

                                <PrimaryButton className="w-full" disabled={processing}>
                                    Send Message
                                </PrimaryButton>
                            </form>
                            
                            {/* 10. Privacy Notice */}
                            <p className="text-xs text-gray-600 mt-4 flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Your privacy is protected. We never share your data.
                            </p>
                        </div>

                        {/* RIGHT - Contact Info */}
                        <div className="space-y-6">
                            {/* 4. Contact Information */}
                            <div className="glass rounded-2xl p-8">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Contact Information</h2>
                                <div className="space-y-4 text-gray-900">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Address</p>
                                            <p className="text-gray-900 text-xl font-bold">123 Design Street<br />Creative City, CC 12345</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Phone</p>
                                            <p className="text-gray-900 text-xl font-bold">+1 (555) 123-4567</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">Email</p>
                                            <p className="text-gray-900 text-xl font-bold">info@pavonastudios.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 6. Call-to-Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <a href="tel:+15551234567" className="glass rounded-xl p-4 text-center hover:shadow-xl transition group">
                                    <svg className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    <p className="font-bold text-gray-900 text-xl">Call Now</p>
                                </a>
                                <a href="https://wa.me/15551234567" target="_blank" className="glass rounded-xl p-4 text-center hover:shadow-xl transition group">
                                    <svg className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    <p className="font-bold text-gray-900 text-xl">WhatsApp</p>
                                </a>
                            </div>

                            {/* 8. Business Hours */}
                            <div className="glass rounded-2xl p-8">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Business Hours</h3>
                                <div className="space-y-2 text-gray-900 text-xl font-bold">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span className="font-semibold">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span className="font-semibold">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="font-semibold text-red-600">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 5. Google Map */}
                    <div className="glass rounded-2xl p-4 mb-12">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Find Us</h2>
                        <div className="w-full h-96 rounded-xl overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841!2d-73.9857!3d40.7484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQ0JzU0LjIiTiA3M8KwNTknMDguNSJX!5e0!3m2!1sen!2sus!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>

                    {/* 7. Social Media Links */}
                    <div className="glass rounded-2xl p-8 mb-12">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">Connect With Us</h2>
                        <div className="flex justify-center gap-6">
                            <a href="#" className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="#" className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
                            </a>
                            <a href="#" className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                            <a href="#" className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                        </div>
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-5xl md:text-6xl font-bold text-center mb-12 text-white drop-shadow-lg">Our Partners</h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
