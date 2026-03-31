const fallbackSupportPhone = '+250793037754';
const fallbackSupportPhoneDigits = '250793037754';
const fallbackSupportPhoneDisplay = '+250 793 037 754';
const fallbackSupportWhatsAppUrl = `https://wa.me/${fallbackSupportPhoneDigits}?text=${encodeURIComponent('Hello Pavona admin, I need help.')}`;

function extractSupportPhoneDigits(whatsappUrl = '') {
    if (!whatsappUrl) {
        return '';
    }

    const decodedUrl = decodeURIComponent(String(whatsappUrl));
    const waMeMatch = decodedUrl.match(/wa\.me\/(\d+)/i);

    if (waMeMatch?.[1]) {
        return waMeMatch[1];
    }

    const phoneParamMatch = decodedUrl.match(/[?&](?:phone|number)=([^&]+)/i);

    if (phoneParamMatch?.[1]) {
        return phoneParamMatch[1].replace(/\D/g, '');
    }

    const digits = decodedUrl.replace(/\D/g, '');
    return digits.length >= 10 ? digits : '';
}

function formatSupportPhoneDisplay(phoneDigits) {
    const digits = phoneDigits || fallbackSupportPhoneDigits;

    if (digits.startsWith('250') && digits.length === 12) {
        return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
    }

    if (digits.startsWith('+')) {
        return digits;
    }

    return `+${digits}`;
}

function resolveSupportPhoneDigits(whatsappUrl = '') {
    return extractSupportPhoneDigits(whatsappUrl) || fallbackSupportPhoneDigits;
}

function resolveSupportPhoneDisplay(whatsappUrl = '') {
    return formatSupportPhoneDisplay(resolveSupportPhoneDigits(whatsappUrl));
}

function resolveSupportPhoneTel(whatsappUrl = '') {
    return `+${resolveSupportPhoneDigits(whatsappUrl)}`;
}

function buildSupportWhatsAppUrl(whatsappUrl = '', message = 'Hello Pavona admin, I need help.') {
    const phoneDigits = extractSupportPhoneDigits(whatsappUrl);

    if (phoneDigits) {
        return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    }

    return whatsappUrl || `https://wa.me/${fallbackSupportPhoneDigits}?text=${encodeURIComponent(message)}`;
}

export {
    buildSupportWhatsAppUrl,
    fallbackSupportPhone,
    fallbackSupportPhoneDisplay,
    fallbackSupportWhatsAppUrl,
    resolveSupportPhoneDigits,
    resolveSupportPhoneDisplay,
    resolveSupportPhoneTel,
};
