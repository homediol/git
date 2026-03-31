import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import SupportWhatsAppButton from '@/Components/SupportWhatsAppButton';
import { useLocale } from '@/Providers/LocaleProvider';

const menuMode = 'menu';
const aiMode = 'ai';
const companyMode = 'company';
const localeMap = {
    rw: 'rw-RW',
    en: 'en-US',
    fr: 'fr-FR',
};
const emptyGuestProfile = {
    guest_name: '',
    guest_email: '',
    guest_phone: '',
};

function normalizeGuestProfile(profile = {}) {
    return {
        ...emptyGuestProfile,
        guest_name: profile.guest_name ?? '',
        guest_email: profile.guest_email ?? '',
        guest_phone: profile.guest_phone ?? '',
    };
}

function guestProfileHasValue(profile = {}) {
    return Boolean(
        profile.guest_name?.trim()
            || profile.guest_email?.trim()
            || profile.guest_phone?.trim(),
    );
}

function guestProfilesEqual(left = {}, right = {}) {
    const normalizedLeft = normalizeGuestProfile(left);
    const normalizedRight = normalizeGuestProfile(right);

    return normalizedLeft.guest_name === normalizedRight.guest_name
        && normalizedLeft.guest_email === normalizedRight.guest_email
        && normalizedLeft.guest_phone === normalizedRight.guest_phone;
}

function getGuestProfileSummary(profile, t) {
    const normalizedProfile = normalizeGuestProfile(profile);
    const parts = [
        normalizedProfile.guest_name.trim(),
        normalizedProfile.guest_email.trim(),
        normalizedProfile.guest_phone.trim(),
    ].filter(Boolean);

    if (parts.length === 0) {
        return t('chat.company.guest.summary_empty', 'Add a username, email, or phone before sending.');
    }

    return parts.join(' • ');
}

function resolveLocale(locale) {
    return localeMap[locale] || 'en-US';
}

function formatTimestamp(value, locale) {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleTimeString(resolveLocale(locale), {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getInitialAiMessage(t) {
    return {
        kind: 'welcome',
        text: t('chat.ai.welcome', "Hi! I'm Pavona AI Assistant. How can I help you today?"),
        sender: 'bot',
    };
}

function MenuCard({ icon, title, subtitle, badge, onClick, accentClass }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative overflow-hidden rounded-[26px] border p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,23,42,0.14)] ${accentClass}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/12 text-white shadow-inner shadow-white/10">
                        {icon}
                    </div>
                    <div>
                        <p className="text-lg font-black tracking-[-0.03em] text-white">{title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/82">{subtitle}</p>
                    </div>
                </div>
                <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/84">
                    {badge}
                </span>
            </div>
        </button>
    );
}

function BackIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

function BrainIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 4.5a3.5 3.5 0 00-3.5 3.5v.5a2.5 2.5 0 00-1.5 2.3A2.7 2.7 0 006 13.3V14a3 3 0 003 3h.5M14.5 4.5A3.5 3.5 0 0118 8v.5a2.5 2.5 0 011.5 2.3 2.7 2.7 0 01-1.5 2.5V14a3 3 0 01-3 3h-.5M12 8v8M9.5 12H8m8 0h-1.5" />
        </svg>
    );
}

function CompanyIcon() {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
    );
}

export default function AIChatbot() {
    const { auth } = usePage().props;
    const { locale, t } = useLocale();
    const isGuest = !auth?.user;
    const isAdmin = auth?.user?.role === 'admin';
    const canUseCompanyChat = !isAdmin;

    const [isOpen, setIsOpen] = useState(false);
    const [activeMode, setActiveMode] = useState(menuMode);

    const [aiMessages, setAiMessages] = useState(() => [getInitialAiMessage(t)]);
    const [aiInput, setAiInput] = useState('');
    const [aiTyping, setAiTyping] = useState(false);

    const [companyThread, setCompanyThread] = useState(null);
    const [companyDraft, setCompanyDraft] = useState('');
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companySending, setCompanySending] = useState(false);
    const [companyError, setCompanyError] = useState('');
    const [guestProfile, setGuestProfile] = useState(emptyGuestProfile);
    const [isGuestIdentityExpanded, setIsGuestIdentityExpanded] = useState(false);

    const aiMessagesEndRef = useRef(null);
    const companyMessagesEndRef = useRef(null);
    const guestProfileRef = useRef(emptyGuestProfile);
    const guestProfileDirtyRef = useRef(false);

    const companyMessages = companyThread?.messages || [];
    const companyUnreadCount = companyMessages.filter((message) => !message.is_mine && !message.read_at).length;
    const guestIdentityReady = Boolean(
        guestProfile.guest_name.trim()
            || guestProfile.guest_email.trim()
            || guestProfile.guest_phone.trim(),
    );

    useEffect(() => {
        guestProfileRef.current = guestProfile;
    }, [guestProfile]);

    const syncGuestProfileFromServer = (nextProfile, options = {}) => {
        const normalizedNextProfile = normalizeGuestProfile(nextProfile);
        const shouldForce = options.force === true;
        const shouldResetDirty = options.resetDirty === true;
        const currentProfile = guestProfileRef.current;

        if (!shouldForce && guestProfileDirtyRef.current && !guestProfilesEqual(currentProfile, normalizedNextProfile)) {
            return;
        }

        if (!guestProfilesEqual(currentProfile, normalizedNextProfile)) {
            guestProfileRef.current = normalizedNextProfile;
            setGuestProfile(normalizedNextProfile);
        }

        if (shouldResetDirty || guestProfilesEqual(currentProfile, normalizedNextProfile)) {
            guestProfileDirtyRef.current = false;
        }
    };

    const updateGuestProfileField = (field, value) => {
        guestProfileDirtyRef.current = true;
        setGuestProfile((current) => {
            const nextProfile = {
                ...current,
                [field]: value,
            };

            guestProfileRef.current = nextProfile;
            return nextProfile;
        });
    };

    const openWidget = (mode = menuMode) => {
        setIsOpen(true);

        if (mode === companyMode && canUseCompanyChat) {
            setActiveMode(companyMode);
            return;
        }

        if (mode === aiMode) {
            setActiveMode(aiMode);
            return;
        }

        setActiveMode(menuMode);
    };

    const closeWidget = () => {
        setIsOpen(false);
        setActiveMode(menuMode);
        setCompanyError('');
    };

    const openMenu = () => {
        setActiveMode(menuMode);
        setCompanyError('');
    };

    useEffect(() => {
        aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages, aiTyping, activeMode, isOpen]);

    useEffect(() => {
        companyMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [companyMessages.length, companySending, activeMode, isOpen]);

    useEffect(() => {
        const handleOpen = (event) => {
            openWidget(event.detail?.mode || menuMode);
        };

        window.addEventListener('pavona-chat:open', handleOpen);

        return () => {
            window.removeEventListener('pavona-chat:open', handleOpen);
        };
    }, [canUseCompanyChat]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const url = new URL(window.location.href);
        const requestedMode = url.searchParams.get('chat');

        if (requestedMode !== companyMode && requestedMode !== aiMode) {
            return;
        }

        openWidget(requestedMode);
        url.searchParams.delete('chat');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }, []);

    useEffect(() => {
        setAiMessages((previous) => {
            if (previous.length === 1 && previous[0]?.kind === 'welcome') {
                return [{ ...previous[0], text: t('chat.ai.welcome', "Hi! I'm Pavona AI Assistant. How can I help you today?") }];
            }

            return previous;
        });
    }, [locale, t]);

    const fetchCompanyThread = async (silently = false) => {
        if (!canUseCompanyChat) {
            return;
        }

        if (!silently) {
            setCompanyLoading(true);
        }

        try {
            const response = await axios.get(route(isGuest ? 'guest.messages.thread' : 'messages.thread'));
            setCompanyThread(response.data.thread || null);

            if (isGuest && response.data.guest_profile) {
                syncGuestProfileFromServer(response.data.guest_profile);
            } else if (isGuest && !guestProfileHasValue(guestProfileRef.current)) {
                syncGuestProfileFromServer(emptyGuestProfile);
            }

            setCompanyError('');
        } catch (error) {
            if (!silently) {
                setCompanyError(t('chat.company.error.load', 'Could not load live chat right now.'));
            }
        } finally {
            if (!silently) {
                setCompanyLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!isOpen || activeMode !== companyMode || !canUseCompanyChat) {
            return undefined;
        }

        fetchCompanyThread(false);
        const interval = setInterval(() => fetchCompanyThread(true), 5000);

        return () => clearInterval(interval);
    }, [isOpen, activeMode, canUseCompanyChat, isGuest]);

    const sendAiMessage = async (event) => {
        event.preventDefault();
        if (!aiInput.trim()) {
            return;
        }

        const userMessage = aiInput.trim();
        setAiInput('');
        setAiMessages((previous) => [...previous, { text: userMessage, sender: 'user' }]);
        setAiTyping(true);

        try {
            const response = await axios.post(route('chat'), {
                message: userMessage,
                locale,
            });
            setAiMessages((previous) => [
                ...previous,
                {
                    text: response.data.reply || t('chat.ai.fallback', 'Sorry, I could not process that.'),
                    sender: 'bot',
                },
            ]);
        } catch (error) {
            setAiMessages((previous) => [
                ...previous,
                {
                    text: t('chat.ai.error', 'Sorry, something went wrong. Please try again.'),
                    sender: 'bot',
                },
            ]);
        } finally {
            setAiTyping(false);
        }
    };

    const sendCompanyMessage = async (event) => {
        event.preventDefault();
        if (!companyDraft.trim()) {
            return;
        }

        if (isGuest && !guestIdentityReady) {
            setIsGuestIdentityExpanded(true);
            setCompanyError(t('chat.company.error.identity', 'Enter at least a username, email, or phone number first.'));
            return;
        }

        setCompanySending(true);
        setCompanyError('');

        try {
            const response = await axios.post(
                route(isGuest ? 'guest.messages.store' : 'messages.store'),
                {
                    body: companyDraft.trim(),
                    ...(isGuest ? guestProfile : {}),
                },
            );

            setCompanyThread(response.data.thread || null);
            setCompanyDraft('');

            if (isGuest && response.data.guest_profile) {
                syncGuestProfileFromServer(response.data.guest_profile, {
                    force: true,
                    resetDirty: true,
                });
                setIsGuestIdentityExpanded(false);
            }
        } catch (error) {
            setCompanyError(
                error.response?.data?.message
                    || Object.values(error.response?.data?.errors || {}).flat()[0]
                    || t('chat.company.error.send', 'Could not send your live chat message.'),
            );
        } finally {
            setCompanySending(false);
        }
    };

    const renderAiMode = () => (
        <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,rgba(255,122,24,0.06),rgba(66,133,244,0.04)_52%,transparent)] p-4">
                {aiMessages.map((message, index) => (
                    <div key={`${message.sender}-${index}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[88%] sm:max-w-[82%] rounded-[24px] px-4 py-3 text-sm leading-6 ${
                                message.sender === 'user'
                                    ? 'rounded-br-none text-white shadow-[0_18px_40px_rgba(234,67,53,0.22)]'
                                    : 'rounded-bl-none border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] text-[color:var(--md-text)] shadow-sm'
                            }`}
                            style={message.sender === 'user'
                                ? { background: 'linear-gradient(135deg, #ff7a18 0%, #ff5a1f 42%, #ea4335 100%)' }
                                : undefined}
                        >
                            {message.text}
                        </div>
                    </div>
                ))}

                {aiTyping && (
                    <div className="flex justify-start">
                        <div className="rounded-2xl rounded-bl-none border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] p-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--md-primary)]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--md-secondary)] delay-100" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--md-accent)] delay-200" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={aiMessagesEndRef} />
            </div>

            <form onSubmit={sendAiMessage} className="border-t border-[color:var(--md-outline)] bg-[color:var(--md-surface)] p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={aiInput}
                        onChange={(event) => setAiInput(event.target.value)}
                        placeholder={t('chat.ai.placeholder', 'Message Pavona AI...')}
                        className="flex-1 rounded-full border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-4 py-2 text-sm text-[color:var(--md-text)] placeholder:text-[color:var(--md-placeholder)] focus:outline-none focus:ring-2 focus:ring-[color:var(--md-secondary)]"
                    />
                    <button
                        type="submit"
                        disabled={!aiInput.trim() || aiTyping}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #4285F4 0%, #2563EB 52%, #FF6D00 100%)' }}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </form>
        </>
    );

    const renderCompanyMode = () => (
        <>
            <div className="border-b border-[color:var(--md-outline)] bg-[linear-gradient(180deg,rgba(255,122,24,0.08),rgba(255,255,255,0.92))] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--md-primary)]">
                            {t('chat.company.header.eyebrow', 'Live With Company')}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[color:var(--md-text)]">
                            {companyThread?.assigned_admin?.name
                                ? `${t('chat.company.header.connected_to', 'Connected to')} ${companyThread.assigned_admin.name}`
                                : t('chat.company.header.team', 'Pavona Support Team')}
                        </p>
                    </div>
                    <div className="rounded-full bg-[rgba(255,109,0,0.12)] px-3 py-1 text-xs font-bold text-[color:var(--md-primary)]">
                        {companyUnreadCount} {t('chat.company.header.unread', 'unread')}
                    </div>
                </div>
                <div className="mt-3">
                    <SupportWhatsAppButton
                        message="Hello Pavona admin, I need help from live chat."
                        label={t('support.whatsapp.short', 'WhatsApp admin')}
                        className="px-3 py-2 text-xs"
                        fullWidth
                    />
                </div>
            </div>

            {isGuest && (
                <div className="border-b border-[color:var(--md-outline)] bg-[color:var(--md-surface)] px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--md-secondary)]">
                                {t('chat.company.guest.eyebrow', 'Guest Identity')}
                            </p>
                            <p className="mt-1 text-xs leading-6 text-[color:var(--md-muted)]">
                                {getGuestProfileSummary(guestProfile, t)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsGuestIdentityExpanded((current) => !current)}
                            className="shrink-0 rounded-full border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--md-secondary)] transition hover:border-[color:var(--md-secondary)]"
                        >
                            {isGuestIdentityExpanded
                                ? t('chat.company.guest.hide', 'Hide')
                                : guestIdentityReady
                                    ? t('chat.company.guest.edit', 'Edit')
                                    : t('chat.company.guest.add', 'Add')}
                        </button>
                    </div>

                    {isGuestIdentityExpanded && (
                        <div className="mt-3 grid gap-2">
                            <input
                                type="text"
                                value={guestProfile.guest_name}
                                onChange={(event) => updateGuestProfileField('guest_name', event.target.value)}
                                placeholder={t('auth.fields.username', 'Username')}
                                className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-4 py-2.5 text-sm text-[color:var(--md-text)] placeholder:text-[color:var(--md-placeholder)] focus:outline-none focus:ring-2 focus:ring-[color:var(--md-secondary)]"
                            />
                            <input
                                type="email"
                                value={guestProfile.guest_email}
                                onChange={(event) => updateGuestProfileField('guest_email', event.target.value)}
                                placeholder={t('auth.fields.email', 'Email')}
                                className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-4 py-2.5 text-sm text-[color:var(--md-text)] placeholder:text-[color:var(--md-placeholder)] focus:outline-none focus:ring-2 focus:ring-[color:var(--md-secondary)]"
                            />
                            <input
                                type="text"
                                value={guestProfile.guest_phone}
                                onChange={(event) => updateGuestProfileField('guest_phone', event.target.value)}
                                placeholder={t('auth.fields.phone', 'Phone')}
                                className="rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-4 py-2.5 text-sm text-[color:var(--md-text)] placeholder:text-[color:var(--md-placeholder)] focus:outline-none focus:ring-2 focus:ring-[color:var(--md-secondary)]"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,rgba(255,109,0,0.06),rgba(255,255,255,0.34)_38%,rgba(66,133,244,0.06)_100%)] p-4">
                {companyLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="rounded-[24px] border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] px-5 py-4 text-sm font-semibold text-[color:var(--md-muted)] shadow-sm">
                            {t('chat.company.loading', 'Loading live chat...')}
                        </div>
                    </div>
                ) : companyMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="max-w-xs rounded-[26px] border border-dashed border-[rgba(255,109,0,0.24)] bg-[color:var(--md-surface)] px-5 py-6 text-center shadow-sm">
                            <p className="text-base font-black tracking-[-0.02em] text-[color:var(--md-text)]">
                                {t('chat.company.empty.title', 'Start live chat')}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[color:var(--md-muted)]">
                                {t('chat.company.empty.body', 'Ask about bookings, design work, or studio support and the company team will reply here.')}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {companyMessages.map((message) => (
                            <div key={message.id} className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[88%] flex-col sm:max-w-[84%] ${message.is_mine ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-[24px] px-4 py-3 text-sm leading-6 shadow-sm ${
                                            message.is_mine
                                                ? 'rounded-br-none text-white shadow-[0_18px_40px_rgba(234,67,53,0.22)]'
                                                : 'rounded-bl-none border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] text-[color:var(--md-text)]'
                                        }`}
                                        style={message.is_mine
                                            ? { background: 'linear-gradient(135deg, #ff7a18 0%, #ff5a1f 42%, #ea4335 100%)' }
                                            : undefined}
                                    >
                                        {!message.is_mine && (
                                            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--md-secondary)]">
                                                {message.sender?.role === 'admin'
                                                    ? t('chat.company.sender.team', 'Pavona Team')
                                                    : message.sender?.name || t('chat.company.sender.support', 'Support')}
                                            </p>
                                        )}
                                        <p className="whitespace-pre-wrap">{message.body}</p>
                                    </div>
                                    <p className="mt-1 px-1 text-[11px] text-[color:var(--md-muted-soft)]">
                                        {formatTimestamp(message.created_at, locale)}
                                    </p>
                                </div>
                            </div>
                        ))}

                        <div ref={companyMessagesEndRef} />
                    </div>
                )}
            </div>

            {companyError && (
                <div className="border-t border-[color:var(--md-outline)] bg-[rgba(234,67,53,0.06)] px-4 py-3 text-sm text-[color:var(--md-danger)]">
                    {companyError}
                </div>
            )}

            <form onSubmit={sendCompanyMessage} className="border-t border-[color:var(--md-outline)] bg-[color:var(--md-surface)] p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <textarea
                        value={companyDraft}
                        onChange={(event) => setCompanyDraft(event.target.value)}
                        rows="2"
                        placeholder={t('chat.company.placeholder', 'Write to the company...')}
                        className="min-h-[48px] flex-1 rounded-[20px] border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-4 py-3 text-sm text-[color:var(--md-text)] placeholder:text-[color:var(--md-placeholder)] focus:outline-none focus:ring-2 focus:ring-[color:var(--md-secondary)]"
                    />
                    <button
                        type="submit"
                        disabled={companySending || !companyDraft.trim()}
                        className="btn-fire w-full px-4 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-end"
                    >
                        {companySending ? t('chat.company.sending', 'Sending...') : t('chat.company.send', 'Send')}
                    </button>
                </div>
            </form>
        </>
    );

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    if (isOpen) {
                        closeWidget();
                        return;
                    }

                    openWidget(menuMode);
                }}
                className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_38px_rgba(234,67,53,0.28)] transition-all duration-300 hover:scale-110 hover:shadow-[0_24px_44px_rgba(234,67,53,0.34)] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
                style={{ background: 'linear-gradient(135deg, #ff7a18 0%, #ff5a1f 42%, #ea4335 100%)' }}
                aria-label={isOpen ? t('chat.fab.close', 'Close Pavona chat hub') : t('chat.fab.open', 'Open Pavona chat hub')}
            >
                {isOpen ? <CloseIcon /> : <CompanyIcon />}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
                    <button
                        type="button"
                        onClick={closeWidget}
                        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
                        aria-label={t('chat.close', 'Close chat')}
                    />
                    <div className="relative z-10 flex h-[min(78vh,640px)] w-full max-w-[420px] min-h-0 max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-[26px] border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl sm:h-[640px] sm:max-h-[calc(100vh-3rem)] sm:rounded-[30px]">
                        <div
                            className="relative overflow-hidden border-b border-white/10 px-4 py-4 text-white"
                            style={{ background: 'linear-gradient(135deg, #ff7a18 0%, #ff5a1f 42%, #ea4335 100%)' }}
                        >
                            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/14 blur-3xl" />
                            <div className="relative z-[1] flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    {activeMode !== menuMode && (
                                        <button
                                            type="button"
                                            onClick={openMenu}
                                            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/16"
                                        >
                                            <BackIcon />
                                        </button>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/78">
                                            {t('chat.header.eyebrow', 'Pavona AI Hub')}
                                        </p>
                                        <h3 className="mt-1 text-2xl font-black tracking-[-0.03em]">
                                            {activeMode === companyMode
                                                ? t('chat.header.title.company', 'Live Chat With Company')
                                                : activeMode === aiMode
                                                    ? t('chat.header.title.ai', 'Chat With Pavona AI')
                                                    : t('chat.header.title.menu', 'Choose Your Chat')}
                                        </h3>
                                        <p className="mt-1 text-sm text-white/82">
                                            {activeMode === companyMode
                                                ? t('chat.header.subtitle.company', 'Talk to the studio team in real time from this widget.')
                                                : activeMode === aiMode
                                                    ? t('chat.header.subtitle.ai', 'Direct message Pavona AI for instant answers.')
                                                    : t('chat.header.subtitle.menu', 'Pick live support or direct AI chat from one place.')}
                                        </p>
                                        <LanguageSwitcher variant="dark" className="mt-3" />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeWidget}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/16"
                                    aria-label={t('chat.close', 'Close chat')}
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                        </div>

                        {activeMode === menuMode && (
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,rgba(255,122,24,0.05),rgba(255,255,255,0.92)_36%,rgba(66,133,244,0.05)_100%)] p-5">
                                <div className="grid gap-4">
                                    {canUseCompanyChat && (
                                        <MenuCard
                                            icon={<CompanyIcon />}
                                            title={t('chat.menu.company.title', 'Live Chat With Company')}
                                            subtitle={t('chat.menu.company.subtitle', 'Speak with the Pavona team for bookings, support, services, and studio help.')}
                                            badge={t('chat.menu.company.badge', 'Live')}
                                            onClick={() => setActiveMode(companyMode)}
                                            accentClass="border-orange-300/18 bg-[linear-gradient(135deg,rgba(255,122,24,0.95),rgba(255,90,31,0.93)_42%,rgba(234,67,53,0.92)_100%)]"
                                        />
                                    )}

                                    <MenuCard
                                        icon={<BrainIcon />}
                                        title={t('chat.menu.ai.title', 'Chat With Pavona AI')}
                                        subtitle={t('chat.menu.ai.subtitle', 'Ask for quick answers, ideas, and guidance directly from Pavona AI.')}
                                        badge={t('chat.menu.ai.badge', 'AI')}
                                        onClick={() => setActiveMode(aiMode)}
                                        accentClass="border-blue-300/18 bg-[linear-gradient(135deg,rgba(66,133,244,0.95),rgba(37,99,235,0.93)_48%,rgba(255,109,0,0.9)_100%)]"
                                    />
                                </div>

                                <div className="mt-5 rounded-[24px] border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] px-4 py-4 shadow-sm">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--md-secondary)]">
                                        {t('chat.menu.hub.eyebrow', 'One Hub')}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[color:var(--md-muted)]">
                                        {t('chat.menu.hub.body', 'Use `Live Chat With Company` for real people at Pavona, or `Chat With Pavona AI` for instant direct replies.')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeMode === aiMode && renderAiMode()}
                        {activeMode === companyMode && renderCompanyMode()}
                    </div>
                </div>
            )}
        </>
    );
}
