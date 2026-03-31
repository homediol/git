import { Link } from '@inertiajs/react';
import PavonaLogo from '@/Components/PavonaLogo';
import { bookingPhone, bookingPhoneDisplay, bookingWhatsAppUrl } from '@/Components/BookingContactActions';
import { useLocale } from '@/Providers/LocaleProvider';

const companyEmail = 'info@pavonastudios.com';

function WhatsAppIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.2-3.7A8 8 0 1 1 20 12Z" />
            <path d="M9.7 8.8c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.9c.1.2.1.4 0 .6l-.5.8c-.1.2-.1.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.1.4.1.6 0l.8-.5c.2-.1.4-.1.6 0l1.9.8c.2.1.4.3.4.5v.5c0 .2 0 .5-.4.7-.4.2-1.2.5-2 .3-1-.2-2.1-.8-3.7-2.3-1.6-1.6-2.2-2.7-2.3-3.7-.2-.8.1-1.6.3-2Z" />
        </svg>
    );
}

function InstagramIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function FacebookIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.2-1.6 1.5-1.6H16V4.8c-.2 0-.9-.1-1.8-.1-2.6 0-4.2 1.6-4.2 4.5V11H7.5v3H10v7h3.5Z" />
        </svg>
    );
}

function XIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M17.3 4h2.9l-6.3 7.2L21.3 20h-5.8L11 14.7 6.4 20H3.5l6.8-7.8L2.7 4h5.9l4.1 4.9L17.3 4Zm-1 14.3h1.6L7.7 5.6H6l10.3 12.7Z" />
        </svg>
    );
}

function MailIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    );
}

export default function Footer({ settings = {} }) {
    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);
    const { t } = useLocale();
    const contactEmail = settings.contact_email || companyEmail;
    const socialLinks = [
        {
            label: 'WhatsApp',
            href: settings.whatsapp_url || bookingWhatsAppUrl,
            icon: WhatsAppIcon,
            className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        },
        {
            label: 'Instagram',
            href: settings.instagram_url || 'https://instagram.com/pavonastudios',
            icon: InstagramIcon,
            className: 'border-transparent bg-[linear-gradient(135deg,#f58529_0%,#feda77_22%,#dd2a7b_58%,#8134af_80%,#515bd4_100%)] text-white hover:brightness-95',
        },
        {
            label: 'Facebook',
            href: settings.facebook_url || 'https://facebook.com/pavonastudios',
            icon: FacebookIcon,
            className: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
        },
        {
            label: 'X',
            href: settings.x_url || 'https://x.com/pavonastudios',
            icon: XIcon,
            className: 'border-slate-300 bg-slate-950 text-white hover:bg-slate-800',
        },
        {
            label: 'Email',
            href: `mailto:${contactEmail}`,
            icon: MailIcon,
            className: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
        },
    ];

    return (
        <footer className="relative mt-20 overflow-hidden border-t border-[color:var(--md-outline)] bg-[color:var(--md-surface)]" style={!isVideo(settings.footer_bg) && settings.footer_bg ? { backgroundImage: `url(/storage/${settings.footer_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {isVideo(settings.footer_bg) && (
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-20">
                    <source src={`/storage/${settings.footer_bg}`} type="video/mp4" />
                </video>
            )}
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,109,0,0.16),_transparent_70%)] blur-3xl"></div>
            <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(66,133,244,0.16),_transparent_70%)] blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 py-10">
                <div className="mb-8 grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <PavonaLogo className="w-12 h-12" />
                            <h3 className="text-2xl font-bold text-[color:var(--md-text)]">
                                Pavona Studios
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {t('footer.tagline')}
                        </p>
                        <span className="text-xs font-semibold text-[color:var(--md-secondary)]">
                            www.pavonastudios.com
                        </span>
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                {t('footer.social.title', 'Social & Contact')}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            target={item.href.startsWith('http') ? '_blank' : undefined}
                                            rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                                            className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition sm:w-auto ${item.className}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-[color:var(--md-text)] uppercase tracking-[0.2em]">
                            {t('footer.links.title')}
                        </h4>
                        <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-600">
                            <Link href={route('home')} className="hover:text-[color:var(--md-text)] transition">{t('nav.home')}</Link>
                            <Link href={route('about')} className="hover:text-[color:var(--md-text)] transition">{t('nav.about')}</Link>
                            <Link href={route('services')} className="hover:text-[color:var(--md-text)] transition">{t('nav.services')}</Link>
                            <Link href={route('portfolio')} className="hover:text-[color:var(--md-text)] transition">{t('nav.portfolio')}</Link>
                            <Link href={route('contact')} className="hover:text-[color:var(--md-text)] transition">{t('nav.contact')}</Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-[color:var(--md-text)] uppercase tracking-[0.2em]">
                            {t('footer.contact.title')}
                        </h4>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{t('footer.contact.email')}</p>
                                <a href={`mailto:${contactEmail}`} className="hover:text-[color:var(--md-text)] transition">
                                    {contactEmail}
                                </a>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{t('footer.contact.phone')}</p>
                                <a href={`tel:${bookingPhone}`} className="hover:text-[color:var(--md-text)] transition">
                                    {bookingPhoneDisplay}
                                </a>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{t('footer.contact.address')}</p>
                                <p>{t('footer.contact.address_value')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-[color:var(--md-outline)] pt-6 text-center text-sm text-slate-500 lg:flex-row lg:text-left">
                    <p>{t('footer.rights')}</p>
                    <div className="flex flex-wrap justify-center gap-2 lg:justify-end">
                        <span className="px-3 py-1 rounded-full bg-[color:var(--md-surface-alt)] text-xs font-semibold">{t('footer.values.creativity')}</span>
                        <span className="px-3 py-1 rounded-full bg-[color:var(--md-surface-alt)] text-xs font-semibold">{t('footer.values.reliability')}</span>
                        <span className="px-3 py-1 rounded-full bg-[color:var(--md-surface-alt)] text-xs font-semibold">{t('footer.values.quality')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
