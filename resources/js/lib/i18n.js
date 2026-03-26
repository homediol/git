export const supportedLocales = ['rw', 'en', 'fr'];
export const localeStorageKey = 'pavona_locale';

export const translations = {
    rw: {
        'language.label': 'Ururimi',
        'language.rw': 'Kinyarwanda',
        'language.en': 'English',
        'language.fr': 'Francais',
        'promo.special_offer': 'Itangwa ryihariye',
        'promo.claim_offer': 'Fata itangwa',
        'promo.maybe_later': 'Wenda nyuma',
        'notifications.title': 'Ubutumwa',
        'notifications.mark_all': 'Soma byose',
        'notifications.none_guest': 'Injira kugirango ubone ubutumwa.',
        'notifications.none_user': 'Nta butumwa burimo.',
        'notifications.mark_read': 'Shyira ku musomye',
        'notifications.mark_unread': 'Subiza ku butarasomwa',
        'notifications.signin_hint': 'Injira kugirango ubone ubutumwa bwawe bwihariye.',
        'notifications.view': 'Reba',
        'rewards.title': "Serivisi z'ubuntu",
        'rewards.subtitle': 'Impano zakira zagenewe wowe. Zikoreshe mbere y\'uko zirangira.',
        'rewards.none': 'Nta mpano zihari ubu.',
        'rewards.go_dashboard': 'Subira kuri Dashboard',
        'rewards.expires': 'Irangira:',
        'rewards.status.used': 'Byakoreshejwe',
        'rewards.status.unused': 'Ntibyakoreshejwe',
    },
    en: {
        'language.label': 'Language',
        'language.rw': 'Kinyarwanda',
        'language.en': 'English',
        'language.fr': 'French',
        'promo.special_offer': 'Special Offer',
        'promo.claim_offer': 'Claim Offer',
        'promo.maybe_later': 'Maybe Later',
        'notifications.title': 'Notifications',
        'notifications.mark_all': 'Mark all read',
        'notifications.none_guest': 'Log in to see your notifications.',
        'notifications.none_user': 'No notifications yet.',
        'notifications.mark_read': 'Mark read',
        'notifications.mark_unread': 'Mark unread',
        'notifications.signin_hint': 'Sign in for personalized alerts.',
        'notifications.view': 'View',
        'rewards.title': 'Your Free Services',
        'rewards.subtitle': 'Welcome rewards reserved for you. Book them before they expire.',
        'rewards.none': 'No rewards available yet.',
        'rewards.go_dashboard': 'Go to Dashboard',
        'rewards.expires': 'Expires:',
        'rewards.status.used': 'Used',
        'rewards.status.unused': 'Unused',
    },
    fr: {
        'language.label': 'Langue',
        'language.rw': 'Kinyarwanda',
        'language.en': 'Anglais',
        'language.fr': 'Francais',
        'promo.special_offer': 'Offre speciale',
        'promo.claim_offer': 'Profiter de l\'offre',
        'promo.maybe_later': 'Peut-etre plus tard',
        'notifications.title': 'Notifications',
        'notifications.mark_all': 'Tout marquer comme lu',
        'notifications.none_guest': 'Connectez-vous pour voir vos notifications.',
        'notifications.none_user': 'Aucune notification pour le moment.',
        'notifications.mark_read': 'Marquer comme lu',
        'notifications.mark_unread': 'Marquer comme non lu',
        'notifications.signin_hint': 'Connectez-vous pour des alertes personnalisees.',
        'notifications.view': 'Voir',
        'rewards.title': 'Vos services gratuits',
        'rewards.subtitle': 'Recompenses de bienvenue reservees pour vous. Utilisez-les avant expiration.',
        'rewards.none': 'Aucune recompense disponible pour le moment.',
        'rewards.go_dashboard': 'Aller au tableau de bord',
        'rewards.expires': 'Expire le :',
        'rewards.status.used': 'Utilise',
        'rewards.status.unused': 'Non utilise',
    },
};

export const getTranslation = (locale, key, fallback = '') => {
    if (!locale || !translations[locale]) {
        return translations.rw[key] || fallback || key;
    }
    return translations[locale][key] || translations.rw[key] || fallback || key;
};

export const getLocalizedValue = (locale, record, field) => {
    if (!record) return '';
    const map = {
        rw: `${field}_rw`,
        en: `${field}_en`,
        fr: `${field}_fr`,
    };
    const localizedField = map[locale];
    return (
        record[localizedField] ||
        record[field] ||
        record[map.rw] ||
        ''
    );
};
