import { useLocale } from '@/Providers/LocaleProvider';
import { fallbackSupportPhone, fallbackSupportPhoneDisplay } from '@/lib/supportContact';

function PhoneIcon() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 4.5h3l1.4 4.1-1.8 1.5a15.2 15.2 0 0 0 6.3 6.3l1.5-1.8L19.5 16v3a1.5 1.5 0 0 1-1.7 1.5A16.8 16.8 0 0 1 3.5 6.2 1.5 1.5 0 0 1 5 4.5Z" />
        </svg>
    );
}

export default function SupportCallButton({
    label = '',
    className = '',
    fullWidth = false,
    showPhone = false,
}) {
    const { t } = useLocale();
    const buttonLabel = label || (showPhone
        ? `${t('support.call.short', 'Call admin')} • ${fallbackSupportPhoneDisplay}`
        : t('support.call.label', 'Call admin now'));

    return (
        <a
            href={`tel:${fallbackSupportPhone}`}
            className={`btn-call inline-flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`.trim()}
        >
            <PhoneIcon />
            <span>{buttonLabel}</span>
        </a>
    );
}
