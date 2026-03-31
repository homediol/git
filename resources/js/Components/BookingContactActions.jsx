import { usePage } from '@inertiajs/react';
import SupportWhatsAppButton from '@/Components/SupportWhatsAppButton';
import { useLocale } from '@/Providers/LocaleProvider';
import {
    buildSupportWhatsAppUrl,
    fallbackSupportPhone as bookingPhone,
    fallbackSupportPhoneDisplay as bookingPhoneDisplay,
    resolveSupportPhoneDisplay,
    resolveSupportPhoneTel,
} from '@/lib/supportContact';

const bookingWhatsAppUrl = buildSupportWhatsAppUrl('', 'Hello Pavona Studios, I want to book a service.');

export default function BookingContactActions({ className = '' }) {
    const { siteSettings = {} } = usePage().props;
    const { t } = useLocale();
    const supportPhone = resolveSupportPhoneTel(siteSettings.whatsapp_url);
    const supportPhoneDisplay = resolveSupportPhoneDisplay(siteSettings.whatsapp_url);

    return (
        <div className={`grid gap-3 sm:flex sm:flex-wrap ${className}`.trim()}>
            <SupportWhatsAppButton
                message="Hello Pavona admin, I need help with my booking."
                label={t('support.whatsapp.short', 'WhatsApp admin')}
            />
            <a href={`tel:${supportPhone}`} className="btn-call w-full sm:w-auto">
                {t('booking.contact.call', `Call ${supportPhoneDisplay}`)}
            </a>
        </div>
    );
}

export { bookingPhone, bookingPhoneDisplay, bookingWhatsAppUrl };
