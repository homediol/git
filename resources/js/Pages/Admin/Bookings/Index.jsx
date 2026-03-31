import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

const statusClasses = {
    pending: 'booking-status-pending',
    approved: 'booking-status-approved',
    rejected: 'booking-status-rejected',
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

export default function AdminBookingsIndex({ bookings = [], stats = {} }) {
    const { locale, t } = useLocale();
    const emptyDateLabel = t('booking.not_scheduled', 'Not scheduled');

    const updateBooking = (bookingId, action) => {
        router.put(route(action === 'approve' ? 'admin.bookings.approve' : 'admin.bookings.reject', bookingId), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="booking-stage">
                    <div className="booking-layer booking-hero px-6 py-8 sm:px-8 sm:py-10 animate-fire-entry" style={motionStyle()}>
                        <div className="booking-orb booking-orb-one animate-glow-pulse"></div>
                        <div className="booking-orb booking-orb-two animate-ember-rise"></div>

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <span className="booking-badge">
                                    {t('booking.admin.eyebrow', 'Admin bookings')}
                                </span>
                                <h2 className="mt-4 font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
                                    {t('booking.admin.title', 'Review client requests')}
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                    {t('booking.admin.subtitle', 'Approve or reject incoming bookings, inspect user details, and verify whether a free reward was used.')}
                                </p>
                            </div>
                            <Link href={route('admin.dashboard')} className="btn-outline">
                                {t('booking.admin.back', 'Back to Admin Dashboard')}
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('booking.page_title', 'Bookings')} />

            <div className="booking-stage">
                <div className="booking-layer space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="booking-stat-card animate-fire-entry p-5" style={motionStyle(80)}>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.stats.total', 'Total bookings')}</p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900">{stats.total || 0}</p>
                        </div>
                        <div className="booking-stat-card animate-fire-entry p-5" style={motionStyle(140)}>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.stats.pending', 'Pending review')}</p>
                            <p className="mt-3 text-3xl font-semibold text-amber-600">{stats.pending || 0}</p>
                        </div>
                        <div className="booking-stat-card animate-fire-entry p-5" style={motionStyle(200)}>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.stats.approved', 'Approved')}</p>
                            <p className="mt-3 text-3xl font-semibold text-emerald-600">{stats.approved || 0}</p>
                        </div>
                        <div className="booking-stat-card animate-fire-entry p-5" style={motionStyle(260)}>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.stats.rejected', 'Rejected')}</p>
                            <p className="mt-3 text-3xl font-semibold text-rose-600">{stats.rejected || 0}</p>
                        </div>
                    </div>

                    <div className="grid gap-5">
                        {bookings.length === 0 ? (
                            <div className="booking-panel animate-fire-entry px-6 py-12 text-center text-sm text-slate-500" style={motionStyle(140)}>
                                {t('booking.admin.empty', 'No bookings have been submitted yet.')}
                            </div>
                        ) : (
                            bookings.map((booking, index) => (
                                <div
                                    key={booking.id}
                                    className="booking-panel animate-fire-entry p-6"
                                    style={motionStyle(140 + index * 70)}
                                >
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-xl font-semibold text-slate-900">
                                                    {getLocalizedValue(locale, booking.service, 'title') || booking.service?.title || t('booking.admin.unknown_service', 'Unknown service')}
                                                </h3>
                                                <span className={`booking-status-pill ${statusClasses[booking.status] || 'booking-status-neutral'}`}>
                                                    {statusLabel(t, booking.status)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {t('booking.page_title', 'Bookings')} #{booking.id}
                                                {' • '}
                                                {t('booking.admin.captured', 'Captured automatically')}
                                                {' • '}
                                                {formatDateTime(booking.created_at, locale, emptyDateLabel)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() => updateBooking(booking.id, 'approve')}
                                                disabled={booking.status === 'approved'}
                                                className="btn-fire disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {t('booking.admin.approve', 'Approve')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateBooking(booking.id, 'reject')}
                                                disabled={booking.status === 'rejected'}
                                                className="admin-booking-action-danger disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {t('booking.admin.reject', 'Reject')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                                        <div className="booking-panel-soft p-5">
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.admin.user.title', 'User details')}</p>
                                            <div className="mt-4 space-y-3 text-sm text-slate-700">
                                                <p><span className="font-semibold text-slate-900">{t('booking.admin.user.name', 'Name')}:</span> {booking.user?.name || t('booking.admin.unknown_user', 'Unknown user')}</p>
                                                <p><span className="font-semibold text-slate-900">{t('booking.admin.user.email', 'Email')}:</span> {booking.user?.email || t('booking.admin.no_email', 'No email')}</p>
                                                <p><span className="font-semibold text-slate-900">{t('booking.admin.user.phone', 'Phone')}:</span> {booking.user?.phone || t('booking.admin.no_phone', 'No phone')}</p>
                                                <p><span className="font-semibold text-slate-900">{t('booking.admin.user.submitted', 'Submitted')}:</span> {formatDateTime(booking.created_at, locale, emptyDateLabel)}</p>
                                            </div>
                                        </div>

                                        <div className="booking-timeline-card p-5">
                                            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('booking.admin.details.title', 'Booking details')}</p>
                                            {booking.description ? (
                                                <p className="admin-booking-description mt-4 px-4 py-4 text-sm leading-7">{booking.description}</p>
                                            ) : (
                                                <p className="mt-4 text-sm text-slate-500">{t('booking.admin.details.empty', 'No additional description provided.')}</p>
                                            )}

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {booking.user_reward?.reward ? (
                                                    <span className="admin-booking-chip admin-booking-chip-success">
                                                        {t('booking.admin.reward_used', 'Reward used')}: {getLocalizedValue(locale, booking.user_reward.reward, 'name') || booking.user_reward.reward.name}
                                                    </span>
                                                ) : (
                                                    <span className="admin-booking-chip admin-booking-chip-muted">
                                                        {t('booking.admin.no_reward', 'No reward applied')}
                                                    </span>
                                                )}
                                                {booking.approved_at && (
                                                    <span className="admin-booking-chip admin-booking-chip-success">
                                                        {t('booking.admin.approved_on', 'Approved')}{' '}
                                                        {formatDate(booking.approved_at, locale, emptyDateLabel)}
                                                    </span>
                                                )}
                                                {booking.rejected_at && (
                                                    <span className="admin-booking-chip admin-booking-chip-danger">
                                                        {t('booking.admin.rejected_on', 'Rejected')}{' '}
                                                        {formatDate(booking.rejected_at, locale, emptyDateLabel)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
