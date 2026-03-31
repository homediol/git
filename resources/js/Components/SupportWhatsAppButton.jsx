import { usePage } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';
import { buildSupportWhatsAppUrl, resolveSupportPhoneDisplay } from '@/lib/supportContact';

function WhatsAppIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.2-3.7A8 8 0 1 1 20 12Z" />
            <path d="M9.7 8.8c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.9c.1.2.1.4 0 .6l-.5.8c-.1.2-.1.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.1.4.1.6 0l.8-.5c.2-.1.4-.1.6 0l1.9.8c.2.1.4.3.4.5v.5c0 .2 0 .5-.4.7-.4.2-1.2.5-2 .3-1-.2-2.1-.8-3.7-2.3-1.6-1.6-2.2-2.7-2.3-3.7-.2-.8.1-1.6.3-2Z" />
        </svg>
    );
}

export default function SupportWhatsAppButton({
    message = 'Hello Pavona admin, I need help.',
    label = '',
    className = '',
    fullWidth = false,
    showPhone = false,
}) {
    const { siteSettings = {} } = usePage().props;
    const { t } = useLocale();
    const phoneDisplay = resolveSupportPhoneDisplay(siteSettings.whatsapp_url);
    const buttonLabel = label || (showPhone
        ? `${t('support.whatsapp.short', 'WhatsApp admin')} • ${phoneDisplay}`
        : t('support.whatsapp.label', 'Talk to admin on WhatsApp'));

    return (
        <a
            href={buildSupportWhatsAppUrl(siteSettings.whatsapp_url, message)}
            target="_blank"
            rel="noreferrer"
            className={`btn-whatsapp inline-flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`.trim()}
        >
            <WhatsAppIcon />
            <span>{buttonLabel}</span>
        </a>
    );
}
