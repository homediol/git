import { Link } from '@inertiajs/react';
import PavonaLogo from '@/Components/PavonaLogo';
import { useLocale } from '@/Providers/LocaleProvider';

export default function Footer({ settings = {} }) {
    const isVideo = (path) => path && path.match(/\.(mp4|webm|avi|mov)$/i);
    const { t } = useLocale();

    return (
        <footer className="relative mt-20 bg-white border-t border-[color:var(--md-outline)] overflow-hidden" style={!isVideo(settings.footer_bg) && settings.footer_bg ? { backgroundImage: `url(/storage/${settings.footer_bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            {isVideo(settings.footer_bg) && (
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-20">
                    <source src={`/storage/${settings.footer_bg}`} type="video/mp4" />
                </video>
            )}
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(255,109,0,0.16),_transparent_70%)] blur-3xl"></div>
            <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(66,133,244,0.16),_transparent_70%)] blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-4 py-10">
                <div className="grid gap-10 md:grid-cols-3 mb-8">
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
                                <a href="mailto:info@pavonastudios.com" className="hover:text-[color:var(--md-text)] transition">
                                    info@pavonastudios.com
                                </a>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{t('footer.contact.phone')}</p>
                                <a href="tel:+250783752954" className="hover:text-[color:var(--md-text)] transition">
                                    +250 783 752 954
                                </a>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{t('footer.contact.address')}</p>
                                <p>{t('footer.contact.address_value')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[color:var(--md-outline)] pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>{t('footer.rights')}</p>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-[color:var(--md-surface-alt)] text-xs font-semibold">{t('footer.values.creativity')}</span>
                        <span className="px-3 py-1 rounded-full bg-[color:var(--md-surface-alt)] text-xs font-semibold">{t('footer.values.reliability')}</span>
                        <span className="px-3 py-1 rounded-full bg-[color:var(--md-surface-alt)] text-xs font-semibold">{t('footer.values.quality')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
