import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import AdCircleGrid from '@/Components/AdCircleGrid';
import { useLocale } from '@/Providers/LocaleProvider';

export default function Contact({ auth, flash, advertisements = [], settings }) {
    const { t } = useLocale();
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
            <Head title={t('contact.meta.title')}>
                <meta name="description" content={t('contact.meta.description')} />
                <meta name="keywords" content={t('contact.meta.keywords')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                            {t('contact.title')}
                        </h1>
                        <p className="text-slate-600 mt-3">
                            {t('contact.subtitle')}
                        </p>
                    </div>

                    {flash?.success && (
                        <div className="surface p-4 mb-6 bg-[rgba(52,168,83,0.12)] border border-[rgba(52,168,83,0.3)] max-w-3xl mx-auto">
                            <p className="text-[color:var(--md-success)] font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {flash.success}
                            </p>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        <div className="surface p-8">
                            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[color:var(--md-text)] mb-6">
                                {t('contact.form.title')}
                            </h2>
                            <form onSubmit={submit}>
                                <div className="mb-4">
                                    <InputLabel htmlFor="name" value={t('contact.form.name')} />
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
                                    <InputLabel htmlFor="email" value={t('contact.form.email')} />
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
                                    <InputLabel htmlFor="phone" value={t('contact.form.phone')} />
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div className="mb-4">
                                    <InputLabel htmlFor="subject" value={t('contact.form.subject')} />
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
                                    <InputLabel htmlFor="message" value={t('contact.form.message')} />
                                    <textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-[color:var(--md-outline)] bg-white text-[color:var(--md-text)] shadow-sm focus:border-[color:var(--md-secondary)] focus:ring-[color:var(--md-secondary)]"
                                        rows="5"
                                        required
                                    />
                                </div>

                                <PrimaryButton className="w-full" disabled={processing}>
                                    {t('contact.form.send')}
                                </PrimaryButton>
                            </form>

                            <p className="text-xs text-slate-500 mt-4 flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                {t('contact.privacy')}
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="surface p-8">
                                <h2 className="font-display text-xl sm:text-2xl font-semibold text-[color:var(--md-text)] mb-6">
                                    {t('contact.info.title')}
                                </h2>
                                <div className="space-y-4 text-slate-600">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-500">{t('footer.contact.address')}</p>
                                        <p className="text-base">{t('footer.contact.address_value')}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-500">{t('footer.contact.phone')}</p>
                                        <p className="text-base">{t('contact.info.phone_value')}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-500">{t('footer.contact.email')}</p>
                                        <p className="text-base">{t('contact.info.email_value')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <a href="tel:+250783752954" className="surface-soft rounded-xl p-4 text-center hover:shadow-elevated transition group">
                                    <p className="font-semibold text-[color:var(--md-text)] text-sm">{t('contact.actions.call')}</p>
                                </a>
                                <a href="https://wa.me/250783752954" target="_blank" className="surface-soft rounded-xl p-4 text-center hover:shadow-elevated transition group" rel="noreferrer">
                                    <p className="font-semibold text-[color:var(--md-text)] text-sm">{t('contact.actions.whatsapp')}</p>
                                </a>
                            </div>

                            <div className="surface p-8">
                                <h3 className="font-display text-lg sm:text-xl font-semibold text-[color:var(--md-text)] mb-4">{t('contact.hours.title')}</h3>
                                <div className="space-y-2 text-slate-600 text-sm font-semibold">
                                    <div className="flex justify-between">
                                        <span>{t('contact.hours.weekdays')}</span>
                                        <span>{t('contact.hours.weekdays_time')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('contact.hours.saturday')}</span>
                                        <span>{t('contact.hours.saturday_time')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('contact.hours.sunday')}</span>
                                        <span className="text-[color:var(--md-danger)]">{t('contact.hours.closed')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="surface p-4 mb-12">
                        <h2 className="font-display text-xl sm:text-2xl font-semibold text-[color:var(--md-text)] mb-4">{t('contact.map.title')}</h2>
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

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-6 text-[color:var(--md-text)]">
                                {t('contact.partners')}
                            </h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
