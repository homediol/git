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
                <meta name="description" content="Contact Pavona Studio for inquiries, project discussions, or collaboration opportunities" />
                <meta name="keywords" content="contact, get in touch, inquiries, support" />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* 1. Page Title */}
                    <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Get in Touch
                    </h1>
                    
                    {/* 2. Introduction Text */}
                    <p className="text-center text-gray-700 text-lg mb-12 max-w-3xl mx-auto">
                        Have a project in mind? Need expert graphic design or printing services? We're here to help bring your vision to life. 
                        Contact Pavona Studios today and let's create something amazing together!
                    </p>

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
                    {flash?.error && (
                        <div className="glass rounded-xl p-4 mb-6 bg-red-50 border border-red-200 max-w-3xl mx-auto">
                            <p className="text-red-700 font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {flash.error}
                            </p>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-2 gap-8">
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Name" className="text-gray-700" />
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
                                <InputLabel htmlFor="email" value="Email" className="text-gray-700" />
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
                                <InputLabel htmlFor="subject" value="Subject" className="text-gray-700" />
                                <TextInput
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>

                            <div className="mb-6">
                                <InputLabel htmlFor="message" value="Message" className="text-gray-700" />
                                <textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm shadow-sm focus:border-purple-500 focus:ring-purple-500 transition"
                                    rows="5"
                                    required
                                />
                                <InputError message={errors.message} className="mt-2" />
                            </div>

                            <PrimaryButton className="w-full" disabled={processing}>
                                Send Message
                            </PrimaryButton>
                        </form>
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
