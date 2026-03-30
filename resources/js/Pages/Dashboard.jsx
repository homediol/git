import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ChatTrigger from '@/Components/ChatTrigger';
import MediaPreview from '@/Components/MediaPreview';
import { Head, Link, usePage } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

const fallbackServiceKeys = {
    'Photography & Videography': 'photography-videography',
    'Graphics & Printing Design': 'graphics-printing',
    'Make Up': 'make-up',
    'Software Development': 'software-development',
};

const fallbackServiceImages = {
    'photography-videography': '/images/services/photography-videography.svg',
    'graphics-printing': '/images/services/graphics-printing.svg',
    'make-up': '/images/services/make-up.svg',
    'software-development': '/images/services/software-development.svg',
};

const rewardServiceMap = {
    'photography-videography': 'photography-videography',
    'graphics-printing-design': 'graphics-printing',
    'graphics-printing': 'graphics-printing',
    'make-up': 'make-up',
    'software-development': 'software-development',
};

function toServiceKey(service) {
    if (!service) return '';
    return service.service_key || fallbackServiceKeys[service.title] || '';
}

function resolveServiceImage(service) {
    if (service?.image) {
        return service.image;
    }

    return fallbackServiceImages[toServiceKey(service)] || fallbackServiceImages['photography-videography'];
}

function resolveRewardImage(item, services = []) {
    if (item?.reward?.image) {
        return item.reward.image;
    }

    const serviceKey = rewardServiceMap[item?.reward?.slug] || '';
    const matchingService = services.find((service) => toServiceKey(service) === serviceKey);

    return resolveServiceImage(matchingService);
}

function clipText(value = '', limit = 96) {
    if (!value) {
        return '';
    }

    return value.length > limit ? `${value.slice(0, limit).trim()}...` : value;
}

export default function Dashboard({ rewards = [], services = [] }) {
    const { auth } = usePage().props;
    const { locale, t } = useLocale();
    const unusedRewards = rewards.filter((reward) => reward.status !== 'used');
    const totalRewards = rewards.length;
    const usedRewards = rewards.filter((reward) => reward.status === 'used').length;
    const rewardProgress = totalRewards > 0 ? Math.round((unusedRewards.length / totalRewards) * 100) : 0;
    const rewardPreview = rewards.slice(0, 3);
    const servicePreview = services.slice(0, 3);
    const heroService = servicePreview[0] || null;
    const heroImage = resolveServiceImage(heroService);

    const formatDate = (value) => {
        if (!value) {
            return '';
        }

        return new Date(value).toLocaleDateString(locale || 'rw', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const summaryCards = [
        {
            key: 'rewards',
            label: t('dashboard.cards.rewards.label'),
            value: unusedRewards.length,
            helper: `${unusedRewards.length}/${totalRewards || 0}`,
            image: rewardPreview[0] ? resolveRewardImage(rewardPreview[0], services) : resolveServiceImage(servicePreview[1] || heroService),
        },
        {
            key: 'progress',
            label: t('dashboard.rewards.readiness'),
            value: `${rewardProgress}%`,
            helper: `${usedRewards} ${t('dashboard.rewards.used')}`,
            image: resolveServiceImage(servicePreview[1] || heroService),
        },
        {
            key: 'support',
            label: t('dashboard.cards.support.label'),
            value: t('dashboard.cards.support.value'),
            helper: t('dashboard.cards.support.badge'),
            image: resolveServiceImage(servicePreview[2] || heroService),
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="booking-stage">
                    <div className="booking-layer booking-hero px-6 py-8 sm:px-8 sm:py-10">
                        <div className="booking-orb booking-orb-one animate-glow-pulse"></div>
                        <div className="booking-orb booking-orb-two animate-ember-rise"></div>

                        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
                            <div>
                                <span className="booking-badge">
                                    {t('dashboard.meta.label')}
                                </span>
                                <h2 className="mt-5 font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
                                    {t('dashboard.meta.welcome')} {auth.user.name}
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                    {t('dashboard.meta.subtitle')}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link href={route('rewards.index')} className="btn-fire">
                                        {t('dashboard.cta.rewards')}
                                    </Link>
                                    <ChatTrigger auth={auth} className="btn-outline">
                                        {t('dashboard.cta.chat')}
                                    </ChatTrigger>
                                    <Link href={route('bookings.index')} className="btn-outline">
                                        {t('dashboard.cta.services')}
                                    </Link>
                                </div>
                            </div>

                            <div className="booking-panel-soft p-4 sm:p-5">
                                <MediaPreview
                                    src={heroImage}
                                    alt={heroService ? (getLocalizedValue(locale, heroService, 'title') || heroService.title) : t('dashboard.support.title')}
                                    className="h-64 w-full rounded-[28px] object-cover"
                                    videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                />
                                <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] bg-white/88 px-4 py-4 shadow-sm">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">
                                            {heroService ? (getLocalizedValue(locale, heroService, 'title') || heroService.title) : t('dashboard.support.title')}
                                        </p>
                                        <p className="mt-2 text-lg font-black text-slate-950">
                                            {unusedRewards.length} {t('dashboard.rewards.ready')}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">
                                        {t('dashboard.cards.support.badge')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('dashboard.meta.label')} />

            <div className="booking-stage">
                <div className="booking-layer space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        {summaryCards.map((card, index) => (
                            <div
                                key={card.key}
                                className="booking-stat-card overflow-hidden p-5 animate-fire-entry"
                                style={{ animationDelay: `${index * 70}ms`, animationFillMode: 'both' }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{card.label}</p>
                                        <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">{card.value}</p>
                                        <p className="mt-2 text-sm font-bold text-slate-500">{card.helper}</p>
                                    </div>
                                    <MediaPreview
                                        src={card.image}
                                        alt={card.label}
                                        className="h-20 w-20 rounded-[22px] object-cover shadow-sm"
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                        <div className="booking-panel p-6 sm:p-8">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <span className="booking-badge">
                                        {t('dashboard.rewards.overview')}
                                    </span>
                                    <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">
                                        {t('dashboard.rewards.title')}
                                    </h3>
                                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                                        {t('dashboard.rewards.subtitle')}
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-orange-100 bg-orange-50/80 px-4 py-3 text-sm font-black text-orange-700">
                                    {unusedRewards.length} {t('dashboard.rewards.ready')}
                                </div>
                            </div>

                            <div className="mt-6 h-2 overflow-hidden rounded-full bg-orange-100">
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#ff7a18_0%,#ea4335_100%)] transition-all"
                                    style={{ width: `${rewardProgress}%` }}
                                />
                            </div>

                            {rewardPreview.length === 0 ? (
                                <div className="booking-panel-soft mt-6 p-6 text-center">
                                    <MediaPreview
                                        src={resolveServiceImage(heroService)}
                                        alt={t('dashboard.rewards.empty')}
                                        className="mx-auto h-32 w-full max-w-[240px] rounded-[24px] object-cover"
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                    <p className="mt-4 text-base font-black text-slate-950">{t('dashboard.rewards.empty')}</p>
                                </div>
                            ) : (
                                <div className="mt-6 grid gap-4 md:grid-cols-3">
                                    {rewardPreview.map((item) => (
                                        <div key={item.id} className="booking-panel-soft overflow-hidden p-4">
                                            <MediaPreview
                                                src={resolveRewardImage(item, services)}
                                                alt={getLocalizedValue(locale, item.reward, 'name')}
                                                className="h-40 w-full rounded-[22px] object-cover"
                                                videoProps={{ controls: true, playsInline: true, preload: 'metadata' }}
                                            />
                                            <div className="mt-4 flex items-start justify-between gap-3">
                                                <p className="text-base font-black leading-6 text-slate-950">
                                                    {getLocalizedValue(locale, item.reward, 'name')}
                                                </p>
                                                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${item.status === 'used' ? 'bg-[rgba(234,67,53,0.12)] text-[color:var(--md-danger)]' : 'bg-orange-100 text-orange-700'}`}>
                                                    {item.status === 'used' ? t('rewards.status.used') : t('rewards.status.unused')}
                                                </span>
                                            </div>
                                            {item.expires_at && (
                                                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                    {t('rewards.expires')} {formatDate(item.expires_at)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href={route('rewards.index')} className="btn-fire">
                                    {t('dashboard.rewards.view_all')}
                                </Link>
                                <Link href={route('bookings.index')} className="btn-outline">
                                    {t('dashboard.cta.services')}
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="booking-panel-soft p-6">
                                <span className="booking-badge">
                                    {t('dashboard.account.title')}
                                </span>
                                <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">{auth.user.name}</h3>
                                <div className="mt-5 grid gap-3">
                                    <div className="rounded-3xl bg-white/85 p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('dashboard.account.member')}</p>
                                        <p className="mt-2 text-base font-black text-slate-900">{auth.user.email}</p>
                                    </div>
                                    <div className="rounded-3xl bg-white/85 p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('dashboard.account.access')}</p>
                                        <p className="mt-2 text-base font-black text-slate-900">{t('dashboard.account.access_value')}</p>
                                    </div>
                                    <div className="rounded-3xl bg-white/85 p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('dashboard.account.next')}</p>
                                        <Link href={route('rewards.index')} className="mt-2 inline-flex text-base font-black text-orange-700 hover:text-orange-800">
                                            {t('dashboard.account.next_link')}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="booking-panel p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <span className="booking-badge">
                                            {t('dashboard.actions.title')}
                                        </span>
                                        <h3 className="mt-4 font-display text-xl font-semibold text-slate-950">
                                            {t('dashboard.cta.services')}
                                        </h3>
                                    </div>
                                    <Link href={route('services')} className="text-sm font-black text-orange-700 hover:text-orange-800">
                                        {t('services.view_more', 'View more')}
                                    </Link>
                                </div>

                                <div className="mt-5 grid gap-4">
                                    {servicePreview.map((service, index) => (
                                        <Link
                                            key={service.id}
                                            href={route('bookings.index')}
                                            className="booking-service-card animate-fire-entry"
                                            style={{ animationDelay: `${120 + index * 70}ms`, animationFillMode: 'both' }}
                                        >
                                            <img
                                                src={resolveServiceImage(service)}
                                                alt={getLocalizedValue(locale, service, 'title') || service.title}
                                                className="h-36 w-full rounded-[22px] object-cover"
                                            />
                                            <div className="mt-4 flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-base font-black text-slate-950">
                                                        {getLocalizedValue(locale, service, 'title') || service.title}
                                                    </p>
                                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                                        {clipText(getLocalizedValue(locale, service, 'description') || service.description || '')}
                                                    </p>
                                                </div>
                                                <span className="booking-status-pill bg-orange-100 text-orange-700">
                                                    {index + 1}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="fire-gradient rounded-[30px] p-6 text-white shadow-elevated">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/70">{t('dashboard.support.badge')}</p>
                                <h3 className="mt-4 font-display text-2xl font-semibold text-white">{t('dashboard.support.title')}</h3>
                                <p className="mt-3 text-sm font-semibold leading-7 text-white/82">{t('dashboard.cards.support.helper')}</p>
                                <div className="mt-5 flex flex-col gap-3">
                                    <ChatTrigger auth={auth} className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-[#d94719] transition hover:translate-y-[-1px]">
                                        {t('dashboard.support.cta')}
                                    </ChatTrigger>
                                    <Link href={route('contact')} className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:bg-white/16">
                                        {t('dashboard.cta.contact')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
