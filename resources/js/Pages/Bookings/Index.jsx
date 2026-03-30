import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MediaPreview from '@/Components/MediaPreview';
import { Head, Link, useForm } from '@inertiajs/react';
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

const statusClasses = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-rose-100 text-rose-700',
};

const localeMap = {
    rw: 'rw-RW',
    en: 'en-US',
    fr: 'fr-FR',
};

function motionStyle(delay = 0) {
    return {
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
    };
}

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

function resolveRewardImage(rewardItem, services = []) {
    if (rewardItem?.reward?.image) {
        return rewardItem.reward.image;
    }

    const rewardKey = rewardServiceMap[rewardItem?.reward?.slug] || '';
    const matchingService = services.find((service) => toServiceKey(service) === rewardKey);

    return resolveServiceImage(matchingService || services[0]);
}

function rewardMatchesService(rewardItem, service) {
    if (!rewardItem?.reward || !service) return false;

    const serviceKey = toServiceKey(service);
    const rewardKey = rewardServiceMap[rewardItem.reward.slug] || rewardServiceMap[rewardItem.reward.slug || ''];

    if (rewardKey) {
        return rewardKey === serviceKey;
    }

    const rewardTitle = `${rewardItem.reward.name || ''} ${rewardItem.reward.name_en || ''}`.toLowerCase();
    return rewardTitle.includes((service.title || '').toLowerCase());
}

function resolveLocale(locale) {
    return localeMap[locale] || 'en-US';
}

function formatDate(dateValue, locale, fallback) {
    if (!dateValue) return fallback;

    const parsedDate = String(dateValue).includes('T') || String(dateValue).includes(' ')
        ? new Date(dateValue)
        : new Date(`${dateValue}T00:00:00`);

    return parsedDate.toLocaleDateString(resolveLocale(locale), {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(dateValue, locale, fallback) {
    if (!dateValue) return fallback;

    return new Date(dateValue).toLocaleString(resolveLocale(locale), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function statusLabel(t, status) {
    return t(`booking.status.${status}`, status);
}

export default function BookingsIndex({ bookings = [], services = [], availableRewards = [], prefill = {} }) {
    const { locale, t } = useLocale();
    const emptyDateLabel = t('booking.not_scheduled', 'Not scheduled');

    const initialServiceId = prefill.service_id ? String(prefill.service_id) : '';
    const initialRewardId = prefill.user_reward_id ? String(prefill.user_reward_id) : '';

    const { data, setData, post, processing, errors } = useForm({
        service_id: initialServiceId,
        description: '',
        use_reward: Boolean(initialRewardId),
        user_reward_id: initialRewardId,
    });

    const selectedService = services.find((service) => String(service.id) === String(data.service_id));
    const compatibleRewards = availableRewards.filter((rewardItem) => rewardMatchesService(rewardItem, selectedService));
    const selectedReward = compatibleRewards.find((rewardItem) => String(rewardItem.id) === String(data.user_reward_id));
    const heroService = selectedService || services[0] || null;

    const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
    const approvedCount = bookings.filter((booking) => booking.status === 'approved').length;

    const handleServiceChange = (value) => {
        setData('service_id', value);

        const nextService = services.find((service) => String(service.id) === String(value));
        const currentReward = availableRewards.find((rewardItem) => String(rewardItem.id) === String(data.user_reward_id));

        if (currentReward && !rewardMatchesService(currentReward, nextService)) {
            setData('user_reward_id', '');
            setData('use_reward', false);
        }
    };

    const submit = (event) => {
        event.preventDefault();

        post(route('bookings.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setData({
                    service_id: data.service_id,
                    description: '',
                    use_reward: false,
                    user_reward_id: '',
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="booking-stage">
                    <div className="booking-layer booking-hero px-6 py-8 sm:px-8 sm:py-10 animate-fire-entry" style={motionStyle()}>
                        <div className="booking-orb booking-orb-one animate-glow-pulse"></div>
                        <div className="booking-orb booking-orb-two animate-ember-rise"></div>

                        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                            <div>
                                <span className="booking-badge">
                                    {t('booking.eyebrow', 'Booking hub')}
                                </span>
                                <h2 className="mt-5 font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
                                    {t('booking.title', 'Reserve your creative session')}
                                </h2>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                                    {t('booking.subtitle', 'Choose a service, lock in a date and time, and apply an unused reward when you have one.')}
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link href={route('services')} className="btn-outline">
                                        {t('booking.browse_services', 'Browse services')}
                                    </Link>
                                    <span className="chip">
                                        {availableRewards.length} {t('nav.rewards', 'Rewards')}
                                    </span>
                                </div>
                            </div>

                            <div className="booking-panel-soft p-5 sm:p-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-600">
                                    {t('booking.form.helper', 'Fast, clear, and ready for approval')}
                                </p>
                                <div className="mt-5 overflow-hidden rounded-[28px] bg-white/85 shadow-sm">
                                    <img
                                        src={resolveServiceImage(heroService)}
                                        alt={heroService ? (getLocalizedValue(locale, heroService, 'title') || heroService.title) : t('booking.summary.title', 'Current selection')}
                                        className="h-56 w-full object-cover"
                                    />
                                </div>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-3xl bg-white/80 p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                            {t('booking.summary.title', 'Current selection')}
                                        </p>
                                        <p className="mt-3 text-base font-black text-slate-900">
                                            {selectedService
                                                ? getLocalizedValue(locale, selectedService, 'title') || selectedService.title
                                                : t('booking.summary.empty', 'Choose a service to start the booking.')}
                                        </p>
                                    </div>
                                    <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-lg shadow-slate-900/20">
                                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                                            {t('booking.reward.eyebrow', 'Reward integration')}
                                        </p>
                                        <p className="mt-3 text-3xl font-black">
                                            {compatibleRewards.length}
                                        </p>
                                        <p className="mt-2 text-sm text-white/70">
                                            {selectedService
                                                ? t('booking.reward.title', 'Use a free reward on this booking')
                                                : t('booking.reward.empty', 'No eligible reward matches the selected service yet.')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('booking.page_title', 'Bookings')} />

            <div className="booking-stage">
                <div className="booking-layer space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="booking-stat-card animate-fire-entry p-5" style={motionStyle(80)}>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.stats.total', 'Total bookings')}</p>
                            <p className="mt-3 text-3xl font-black text-slate-900">{bookings.length}</p>
                        </div>
                        <div className="booking-stat-card animate-fire-entry p-5" style={motionStyle(140)}>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.stats.pending', 'Pending review')}</p>
                            <p className="mt-3 text-3xl font-black text-orange-600">{pendingCount}</p>
                        </div>
                        <div className="booking-stat-card animate-fire-entry p-5" style={motionStyle(200)}>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.stats.approved', 'Approved')}</p>
                            <p className="mt-3 text-3xl font-black text-orange-600">{approvedCount}</p>
                        </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                        <div className="booking-panel animate-fire-entry p-6 sm:p-8" style={motionStyle(120)}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <span className="booking-badge">
                                        {t('booking.form.eyebrow', 'New request')}
                                    </span>
                                    <h3 className="mt-4 font-display text-2xl font-semibold text-slate-950">
                                        {t('booking.form.title', 'Build your booking in a few focused steps')}
                                    </h3>
                                </div>
                            </div>

                            <form onSubmit={submit} className="mt-8 space-y-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800">
                                        {t('booking.fields.service', 'Service')}
                                    </label>
                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        {services.length === 0 ? (
                                            <div className="booking-panel-soft p-5 text-sm text-slate-500 md:col-span-2">
                                                {t('booking.services.empty', 'No services are available for booking right now.')}
                                            </div>
                                        ) : (
                                            services.map((service, index) => {
                                                const active = String(data.service_id) === String(service.id);
                                                const title = getLocalizedValue(locale, service, 'title') || service.title;
                                                const description = getLocalizedValue(locale, service, 'description') || service.description;

                                                return (
                                                    <button
                                                        key={service.id}
                                                        type="button"
                                                        onClick={() => handleServiceChange(String(service.id))}
                                                        className={`booking-service-card animate-fire-entry ${active ? 'booking-service-card-active' : ''}`}
                                                        style={motionStyle(180 + index * 70)}
                                                    >
                                                        <img
                                                            src={resolveServiceImage(service)}
                                                            alt={title}
                                                            className="h-44 w-full rounded-[24px] object-cover"
                                                        />
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-base font-black text-slate-900">{title}</p>
                                                            </div>
                                                            <span className={`booking-status-pill ${active ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                                                                {active ? t('booking.cta', 'Book now') : `${index + 1}`}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                    {errors.service_id && <p className="mt-3 text-sm text-rose-600">{errors.service_id}</p>}
                                </div>

                                <div className="booking-panel-soft flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <span className="booking-badge">
                                            {t('booking.auto_capture.title', 'Timing captured automatically')}
                                        </span>
                                        {t('booking.submit.helper', 'Bookings are created as pending until an admin reviews them.')}
                                    </div>
                                </div>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-800">
                                        {t('booking.fields.description', 'Description')}
                                    </span>
                                    <textarea
                                        rows="5"
                                        value={data.description}
                                        onChange={(event) => setData('description', event.target.value)}
                                        placeholder={t('booking.fields.description_placeholder', 'Add notes, event details, location, or what you need help with.')}
                                        className="booking-input min-h-[148px] resize-y"
                                    />
                                    {errors.description && <p className="mt-2 text-sm text-rose-600">{errors.description}</p>}
                                </label>

                                <div className="booking-panel-soft p-5 sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <span className="booking-badge">
                                                {t('booking.reward.eyebrow', 'Reward integration')}
                                            </span>
                                            <h4 className="mt-4 text-xl font-semibold text-slate-950">
                                                {t('booking.reward.title', 'Use a free reward on this booking')}
                                            </h4>
                                        </div>
                                        <label className="inline-flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                                            <input
                                                type="checkbox"
                                                checked={data.use_reward}
                                                onChange={(event) => {
                                                    setData('use_reward', event.target.checked);
                                                    if (!event.target.checked) {
                                                        setData('user_reward_id', '');
                                                    }
                                                }}
                                                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                                            />
                                            {t('booking.reward.toggle', 'Apply reward')}
                                        </label>
                                    </div>

                                    {data.use_reward && (
                                        <div className="mt-5 grid gap-3">
                                            {compatibleRewards.length === 0 ? (
                                                <div className="rounded-3xl border border-dashed border-orange-200 bg-white/85 px-5 py-5 text-sm text-slate-600">
                                                    {t('booking.reward.empty', 'No eligible reward matches the selected service yet.')}
                                                </div>
                                            ) : (
                                                compatibleRewards.map((rewardItem, index) => (
                                                    <label
                                                        key={rewardItem.id}
                                                        className={`booking-choice-card flex cursor-pointer items-start gap-4 px-4 py-4 animate-fire-entry ${
                                                            String(data.user_reward_id) === String(rewardItem.id)
                                                                ? 'booking-choice-card-active'
                                                                : ''
                                                        }`}
                                                        style={motionStyle(260 + index * 60)}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="user_reward_id"
                                                            value={rewardItem.id}
                                                            checked={String(data.user_reward_id) === String(rewardItem.id)}
                                                            onChange={(event) => setData('user_reward_id', event.target.value)}
                                                            className="mt-1 border-slate-300 text-orange-600 focus:ring-orange-500"
                                                        />
                                                        <MediaPreview
                                                            src={resolveRewardImage(rewardItem, services)}
                                                            alt={getLocalizedValue(locale, rewardItem.reward, 'name') || rewardItem.reward?.name}
                                                            className="h-24 w-24 rounded-[20px] object-cover"
                                                            videoProps={{ controls: true, playsInline: true, preload: 'metadata' }}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <p className="text-sm font-black text-slate-900">
                                                                    {getLocalizedValue(locale, rewardItem.reward, 'name') || rewardItem.reward?.name}
                                                                </p>
                                                                {rewardItem.expires_at && (
                                                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                                                        {t('booking.reward.expires', 'Expires')}{' '}
                                                                        {formatDate(rewardItem.expires_at, locale, emptyDateLabel)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))
                                            )}
                                            {errors.user_reward_id && <p className="text-sm text-rose-600">{errors.user_reward_id}</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-slate-500">
                                        {selectedReward
                                            ? `${t('booking.reward.cta', 'Book with this reward')}: ${getLocalizedValue(locale, selectedReward.reward, 'name') || selectedReward.reward?.name}`
                                            : t('booking.form.helper', 'Fast, clear, and ready for approval')}
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={processing || services.length === 0}
                                        className="btn-fire disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? t('booking.submit.processing', 'Submitting...') : t('booking.submit.label', 'Send booking request')}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="booking-panel-soft animate-fire-entry p-6" style={motionStyle(160)}>
                                <span className="booking-badge">
                                    {t('booking.summary.title', 'Current selection')}
                                </span>
                                <div className="mt-5 space-y-4">
                                    <div className="rounded-3xl bg-white/85 p-4 shadow-sm">
                                        <img
                                            src={resolveServiceImage(selectedService || heroService)}
                                            alt={selectedService ? (getLocalizedValue(locale, selectedService, 'title') || selectedService.title) : t('booking.summary.title', 'Current selection')}
                                            className="h-40 w-full rounded-[22px] object-cover"
                                        />
                                        <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">
                                            {t('booking.fields.service', 'Service')}
                                        </p>
                                        <p className="mt-2 text-lg font-black text-slate-900">
                                            {selectedService
                                                ? getLocalizedValue(locale, selectedService, 'title') || selectedService.title
                                                : t('booking.summary.empty', 'Choose a service to start the booking.')}
                                        </p>
                                    </div>
                                    <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-lg shadow-slate-900/20">
                                        <p className="text-xs uppercase tracking-[0.24em] text-white/50">
                                            {t('booking.reward.title', 'Use a free reward on this booking')}
                                        </p>
                                        <p className="mt-2 text-base font-black">
                                            {selectedReward
                                                ? getLocalizedValue(locale, selectedReward.reward, 'name') || selectedReward.reward?.name
                                                : t('booking.reward.empty', 'No eligible reward matches the selected service yet.')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="booking-panel animate-fire-entry p-6" style={motionStyle(220)}>
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <span className="booking-badge">
                                            {t('booking.timeline.title', 'Recent bookings')}
                                        </span>
                                        <h3 className="mt-4 text-xl font-semibold text-slate-950">
                                            {t('booking.timeline.subtitle', 'Track status and reward usage')}
                                        </h3>
                                    </div>
                                </div>

                                {bookings.length === 0 ? (
                                    <div className="mt-5 rounded-3xl border border-dashed border-orange-200 bg-orange-50/60 px-5 py-8 text-center text-sm text-slate-500">
                                        {t('booking.timeline.empty', 'You have not placed any bookings yet.')}
                                    </div>
                                ) : (
                                    <div className="mt-5 space-y-4">
                                        {bookings.map((booking, index) => (
                                            <div
                                                key={booking.id}
                                                className="booking-timeline-card animate-fire-entry p-5"
                                                style={motionStyle(260 + index * 70)}
                                            >
                                                <div className="flex flex-wrap items-start gap-4">
                                                    <img
                                                        src={resolveServiceImage(booking.service)}
                                                        alt={getLocalizedValue(locale, booking.service, 'title') || booking.service?.title}
                                                        className="h-24 w-24 rounded-[20px] object-cover"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-base font-black text-slate-900">
                                                                    {getLocalizedValue(locale, booking.service, 'title') || booking.service?.title}
                                                                </p>
                                                                <p className="mt-2 text-sm text-slate-500">
                                                                    {t('booking.timeline.captured', 'Captured automatically')}
                                                                    {' • '}
                                                                    {formatDateTime(booking.created_at, locale, emptyDateLabel)}
                                                                </p>
                                                            </div>
                                                            <span className={`booking-status-pill ${statusClasses[booking.status] || 'bg-slate-100 text-slate-700'}`}>
                                                                {statusLabel(t, booking.status)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {booking.user_reward?.reward && (
                                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                            {t('booking.timeline.reward', 'Reward')}: {getLocalizedValue(locale, booking.user_reward.reward, 'name') || booking.user_reward.reward.name}
                                                        </span>
                                                    )}
                                                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                                        #{booking.id}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
