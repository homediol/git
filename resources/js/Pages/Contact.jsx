import { Head, useForm } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import AdCircleGrid from '@/Components/AdCircleGrid';
import { bookingPhone, bookingWhatsAppUrl } from '@/Components/BookingContactActions';
import { useLocale } from '@/Providers/LocaleProvider';
import { googleMapsEmbedUrl, googleMapsUrl } from '@/lib/location';

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
                                        <a
                                            href={googleMapsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-base text-[color:var(--md-secondary)] transition hover:text-[color:var(--md-text)] hover:underline"
                                        >
                                            {t('footer.contact.address_value')}
                                        </a>
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

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <a href={`tel:${bookingPhone}`} className="btn-call w-full">
                                    <span>{t('contact.actions.call')}</span>
                                </a>
                                <a href={bookingWhatsAppUrl} target="_blank" className="btn-whatsapp w-full" rel="noreferrer">
                                    <span>{t('contact.actions.whatsapp')}</span>
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
                        <div className="overflow-hidden rounded-xl border border-[color:var(--md-outline)]">
                            <iframe
                                src={googleMapsEmbedUrl}
                                width="100%"
                                height="450"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Pavona Studios location"
                                className="h-[450px] w-full"
                            />
                        </div>

                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 block overflow-hidden rounded-xl border border-[color:var(--md-outline)] bg-[linear-gradient(135deg,rgba(255,109,0,0.14),rgba(66,133,244,0.12),rgba(52,168,83,0.12))] p-6 transition hover:shadow-elevated"
                        >
                            <div className="flex flex-col justify-between rounded-[20px] bg-white/85 p-6">
                                <div>
                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                        Google Maps
                                    </span>
                                    <h3 className="mt-4 font-display text-2xl font-semibold text-[color:var(--md-text)]">
                                        {t('footer.contact.address_value')}
                                    </h3>
                                    <p className="mt-3 max-w-xl text-sm text-slate-600">
                                        {t('contact.map.helper', 'Open this location directly in Google Maps for directions and exact navigation.')}
                                    </p>
                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            {t('contact.map.link_label', 'Map link provided')}
                                        </p>
                                        <p className="mt-2 break-all font-mono text-sm text-[color:var(--md-secondary)]">
                                            {googleMapsUrl}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center rounded-full bg-[color:var(--md-secondary)] px-4 py-2 text-sm font-semibold text-white">
                                        {t('contact.map.open', 'Open in Google Maps')}
                                    </span>
                                    <span className="text-sm font-medium text-slate-500">
                                        {t('contact.map.open_hint', 'Tap to open the exact location')}
                                    </span>
                                </div>
                            </div>
                        </a>
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
