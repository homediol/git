import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { ADMIN_IMAGE_UPLOAD_LIMIT_MB, getAdminImageUploadError } from '@/lib/adminUploadLimits';

const audienceLabels = {
    all_users: 'All users',
    new_users: 'New users only',
    specific_users: 'Specific users',
    users_with_bookings: 'Users with bookings',
    users_without_bookings: 'Users without bookings',
    booked_service: 'Booked service category',
};

const rewardFilterLabels = {
    any: 'Any reward state',
    unused: 'Unused rewards',
    used: 'Used rewards',
    expired: 'Expired rewards',
    none: 'No rewards',
};

const ageSegmentLabels = {
    all: 'All ages',
    new: 'Only new users',
    existing: 'Only existing users',
};

const strategyLabels = {
    standard: 'Standard',
    free_reward: 'Free reward',
    reward_reminder: 'Reminder',
    discount: 'Discount',
    discount_rewind: 'Discount rewind',
};

const offerTypeLabels = {
    standard: 'Standard announcement',
    smart_reward: 'Smart reward flow',
    free_reward: 'Free reward grant',
    discount_rewind: 'Discount rewind',
};

function formatDateTime(value) {
    if (!value) {
        return 'Not yet';
    }

    return new Date(value).toLocaleString();
}

export default function PromotionsIndex({
    promotions = [],
    campaigns = [],
    serviceOptions = [],
    rewardOptions = [],
    userOptions = [],
    audienceStats = {},
}) {
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [userSearch, setUserSearch] = useState('');

    const campaignForm = useForm({
        name: '',
        title_rw: '',
        title_en: '',
        title_fr: '',
        message_rw: '',
        message_en: '',
        message_fr: '',
        cta_text_rw: '',
        cta_text_en: '',
        cta_text_fr: '',
        cta_url: '',
        image: null,
        audience_type: 'all_users',
        user_age_segment: 'all',
        new_user_window_days: 30,
        target_user_ids: [],
        specific_users: '',
        target_service_ids: [],
        booking_status_filter: 'any',
        reward_filter: 'any',
        reference_reward_id: '',
        offer_type: 'smart_reward',
        smart_reward_mode: true,
        discount_percent: 15,
        discount_code: '',
        original_price_rwf: '',
        discounted_price_rwf: '',
        send_in_app: true,
        send_email: false,
        send_sms: false,
    });

    const publicPromotionForm = useForm({
        title_rw: '',
        title_en: '',
        title_fr: '',
        message_rw: '',
        message_en: '',
        message_fr: '',
        cta_text_rw: '',
        cta_text_en: '',
        cta_text_fr: '',
        cta_url: '',
        image: '',
        is_active: true,
        starts_at: '',
        ends_at: '',
    });

    const handleCampaignImageChange = (event) => {
        const file = event.target.files?.[0] ?? null;
        const error = getAdminImageUploadError(file);

        if (error) {
            campaignForm.setError('image', error);
            event.target.value = '';
            return;
        }

        campaignForm.clearErrors('image');
        campaignForm.setData('image', file ?? null);
    };

    const handlePublicPromotionImageChange = (event) => {
        const file = event.target.files?.[0] ?? null;
        const error = getAdminImageUploadError(file);

        if (error) {
            publicPromotionForm.setError('image', error);
            event.target.value = '';
            return;
        }

        publicPromotionForm.clearErrors('image');
        publicPromotionForm.setData('image', file ?? '');
    };

    const serviceLookup = Object.fromEntries(serviceOptions.map((service) => [service.id, service.title]));

    const resetCampaignForm = () => {
        campaignForm.reset();
        setUserSearch('');
        campaignForm.setData({
            name: '',
            title_rw: '',
            title_en: '',
            title_fr: '',
            message_rw: '',
            message_en: '',
            message_fr: '',
            cta_text_rw: '',
            cta_text_en: '',
            cta_text_fr: '',
            cta_url: '',
            image: null,
            audience_type: 'all_users',
            user_age_segment: 'all',
            new_user_window_days: 30,
            target_user_ids: [],
            specific_users: '',
            target_service_ids: [],
            booking_status_filter: 'any',
            reward_filter: 'any',
            reference_reward_id: '',
            offer_type: 'smart_reward',
            smart_reward_mode: true,
            discount_percent: 15,
            discount_code: '',
            original_price_rwf: '',
            discounted_price_rwf: '',
            send_in_app: true,
            send_email: false,
            send_sms: false,
        });
    };

    const submitCampaign = (event) => {
        event.preventDefault();
        campaignForm.transform((currentData) => {
            const payload = {
                name: currentData.name,
                title_rw: currentData.title_rw,
                title_en: currentData.title_en || '',
                title_fr: currentData.title_fr || '',
                message_rw: currentData.message_rw,
                message_en: currentData.message_en || '',
                message_fr: currentData.message_fr || '',
                cta_text_rw: currentData.cta_text_rw || '',
                cta_text_en: currentData.cta_text_en || '',
                cta_text_fr: currentData.cta_text_fr || '',
                cta_url: currentData.cta_url || '',
                audience_type: currentData.audience_type,
                user_age_segment: currentData.user_age_segment,
                new_user_window_days: currentData.new_user_window_days || 30,
                booking_status_filter: currentData.booking_status_filter || 'any',
                reward_filter: currentData.reward_filter,
                reference_reward_id: currentData.reference_reward_id || '',
                offer_type: currentData.offer_type || 'standard',
                smart_reward_mode: currentData.offer_type === 'smart_reward' ? '1' : '0',
                discount_percent: currentData.discount_percent || '',
                discount_code: currentData.discount_code || '',
                original_price_rwf: currentData.original_price_rwf || '',
                discounted_price_rwf: currentData.discounted_price_rwf || '',
                send_in_app: currentData.send_in_app ? '1' : '0',
                send_email: currentData.send_email ? '1' : '0',
                send_sms: currentData.send_sms ? '1' : '0',
                target_user_ids: currentData.target_user_ids,
                target_service_ids: currentData.target_service_ids,
            };

            if (currentData.image instanceof File) {
                payload.image = currentData.image;
            }

            return payload;
        });

        campaignForm.post(route('admin.promotions.campaigns.store'), {
            forceFormData: true,
            onSuccess: () => resetCampaignForm(),
            onFinish: () => campaignForm.transform((currentData) => currentData),
        });
    };

    const submitPublicPromotion = (event) => {
        event.preventDefault();
        publicPromotionForm.transform((currentData) => {
            const payload = {
                title_rw: currentData.title_rw,
                title_en: currentData.title_en || '',
                title_fr: currentData.title_fr || '',
                message_rw: currentData.message_rw,
                message_en: currentData.message_en || '',
                message_fr: currentData.message_fr || '',
                cta_text_rw: currentData.cta_text_rw || '',
                cta_text_en: currentData.cta_text_en || '',
                cta_text_fr: currentData.cta_text_fr || '',
                cta_url: currentData.cta_url || '',
                is_active: currentData.is_active ? '1' : '0',
            };

            if (currentData.starts_at) {
                payload.starts_at = currentData.starts_at;
            }

            if (currentData.ends_at) {
                payload.ends_at = currentData.ends_at;
            }

            if (currentData.image instanceof File) {
                payload.image = currentData.image;
            }

            if (editingPromotion) {
                payload._method = 'put';
            }

            return payload;
        });

        publicPromotionForm.post(
            editingPromotion
                ? route('admin.promotions.update', editingPromotion)
                : route('admin.promotions.store'),
            {
                forceFormData: true,
                onSuccess: () => {
                    publicPromotionForm.reset();
                    setEditingPromotion(null);
                },
                onFinish: () => publicPromotionForm.transform((currentData) => currentData),
            }
        );
    };

    const editPromotion = (promotion) => {
        setEditingPromotion(promotion.id);
        publicPromotionForm.setData({
            title_rw: promotion.title_rw || promotion.title || '',
            title_en: promotion.title_en || '',
            title_fr: promotion.title_fr || '',
            message_rw: promotion.message_rw || promotion.message || '',
            message_en: promotion.message_en || '',
            message_fr: promotion.message_fr || '',
            cta_text_rw: promotion.cta_text_rw || promotion.cta_text || '',
            cta_text_en: promotion.cta_text_en || '',
            cta_text_fr: promotion.cta_text_fr || '',
            cta_url: promotion.cta_url || '',
            image: promotion.image || '',
            is_active: promotion.is_active ?? true,
            starts_at: promotion.starts_at ? promotion.starts_at.slice(0, 10) : '',
            ends_at: promotion.ends_at ? promotion.ends_at.slice(0, 10) : '',
        });
    };

    const cancelPromotionEdit = () => {
        setEditingPromotion(null);
        publicPromotionForm.reset();
    };

    const removePromotion = (promotionId) => {
        if (confirm('Delete this public promotion?')) {
            publicPromotionForm.delete(route('admin.promotions.destroy', promotionId));
        }
    };

    const toggleServiceSelection = (serviceId) => {
        campaignForm.setData(
            'target_service_ids',
            campaignForm.data.target_service_ids.includes(serviceId)
                ? campaignForm.data.target_service_ids.filter((value) => value !== serviceId)
                : [...campaignForm.data.target_service_ids, serviceId],
        );
    };

    const toggleUserSelection = (userId) => {
        campaignForm.setData(
            'target_user_ids',
            campaignForm.data.target_user_ids.includes(userId)
                ? campaignForm.data.target_user_ids.filter((value) => value !== userId)
                : [...campaignForm.data.target_user_ids, userId],
        );
    };

    const filteredUsers = userOptions.filter((user) => {
        const query = userSearch.trim().toLowerCase();
        if (!query) {
            return true;
        }

        return [user.name, user.email, user.phone, String(user.id)]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));
    });

    const selectedUsers = userOptions.filter((user) => campaignForm.data.target_user_ids.includes(user.id));

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-orange-500">Campaign Studio</p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-900">Advanced Promotions</h2>
                    <p className="mt-2 max-w-3xl text-sm text-slate-600">
                        Target the right audience, switch between reward reminders and discount flows, and track delivery
                        responses directly from the admin panel.
                    </p>
                </div>
            }
        >
            <Head title="Promotion Campaigns" />

            <div className="space-y-8">
                <section className="overflow-hidden rounded-[32px] border border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-[0_30px_80px_rgba(234,88,12,0.12)]">
                    <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Segmentation Snapshot</p>
                            <h3 className="mt-3 font-display text-3xl font-semibold text-slate-900">
                                Build campaigns for real behavior, not just broad broadcasts.
                            </h3>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                This panel supports free reward grants, discount rewinds, and smart follow-up campaigns
                                for all users, new users, exact users, users with bookings, and users who booked a
                                specific service category.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <span className="chip bg-emerald-100 text-emerald-700">Free reward grants</span>
                                <span className="chip bg-orange-100 text-orange-700">In-app tracking</span>
                                <span className="chip bg-amber-100 text-amber-700">Optional email</span>
                                <span className="chip bg-rose-100 text-rose-700">Optional SMS log</span>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-orange-200/30">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Audience</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{audienceStats.users || 0}</p>
                                <p className="mt-1 text-sm text-slate-500">Non-admin users available for targeting</p>
                            </div>
                            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-orange-200/30">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">New Users</p>
                                <p className="mt-3 text-3xl font-semibold text-orange-600">{audienceStats.newUsers30d || 0}</p>
                                <p className="mt-1 text-sm text-slate-500">Joined in the last 30 days</p>
                            </div>
                            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-orange-200/30">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Booked Users</p>
                                <p className="mt-3 text-3xl font-semibold text-sky-600">{audienceStats.bookedUsers || 0}</p>
                                <p className="mt-1 text-sm text-slate-500">Have at least one booking history</p>
                            </div>
                            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-orange-200/30 sm:col-span-2">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recent Campaigns</p>
                                <p className="mt-3 text-3xl font-semibold text-slate-900">{campaigns.length}</p>
                                <p className="mt-1 text-sm text-slate-500">Live campaign records with delivery analytics</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="glass rounded-[30px] p-6 sm:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Create Campaign</p>
                                <h3 className="mt-2 text-2xl font-semibold text-slate-900">Targeted promotion launch</h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    Define the audience, choose whether this is a free reward, smart reward flow, or
                                    discount rewind, then send it through the channels you want.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">
                                Service-linked offers
                            </div>
                        </div>

                        <form onSubmit={submitCampaign} className="mt-6 space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Campaign name" />
                                    <TextInput
                                        value={campaignForm.data.name}
                                        onChange={(event) => campaignForm.setData('name', event.target.value)}
                                        className="mt-2 block w-full"
                                        placeholder="Photography reminder blast"
                                    />
                                    <InputError message={campaignForm.errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="CTA URL" />
                                    <TextInput
                                        value={campaignForm.data.cta_url}
                                        onChange={(event) => campaignForm.setData('cta_url', event.target.value)}
                                        className="mt-2 block w-full"
                                        placeholder="/bookings"
                                    />
                                    <InputError message={campaignForm.errors.cta_url} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-3">
                                {[
                                    ['rw', 'Kinyarwanda'],
                                    ['en', 'English'],
                                    ['fr', 'Francais'],
                                ].map(([languageKey, label]) => (
                                    <div key={languageKey} className="rounded-3xl border border-orange-100 bg-white/70 p-4">
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <InputLabel value={`Title (${languageKey.toUpperCase()})`} />
                                                <TextInput
                                                    value={campaignForm.data[`title_${languageKey}`]}
                                                    onChange={(event) => campaignForm.setData(`title_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full"
                                                    required={languageKey === 'rw'}
                                                />
                                                <InputError message={campaignForm.errors[`title_${languageKey}`]} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value={`Message (${languageKey.toUpperCase()})`} />
                                                <textarea
                                                    value={campaignForm.data[`message_${languageKey}`]}
                                                    onChange={(event) => campaignForm.setData(`message_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:border-[color:var(--md-secondary)] focus:ring-[color:var(--md-secondary)]"
                                                    rows="4"
                                                    required={languageKey === 'rw'}
                                                />
                                                <InputError message={campaignForm.errors[`message_${languageKey}`]} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value={`CTA text (${languageKey.toUpperCase()})`} />
                                                <TextInput
                                                    value={campaignForm.data[`cta_text_${languageKey}`]}
                                                    onChange={(event) => campaignForm.setData(`cta_text_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full"
                                                />
                                                <InputError message={campaignForm.errors[`cta_text_${languageKey}`]} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-3xl border border-orange-100 bg-white/70 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Audience rules</p>
                                    <div className="mt-4 grid gap-4">
                                        <div>
                                            <InputLabel value="Audience type" />
                                            <select
                                                value={campaignForm.data.audience_type}
                                                onChange={(event) => campaignForm.setData('audience_type', event.target.value)}
                                                className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                            >
                                                <option value="all_users">All users</option>
                                                <option value="new_users">New users only</option>
                                                <option value="specific_users">Specific users from database</option>
                                                <option value="users_with_bookings">Users with any booking</option>
                                                <option value="users_without_bookings">Users without bookings</option>
                                                <option value="booked_service">Users who booked a service</option>
                                            </select>
                                            <InputError message={campaignForm.errors.audience_type} className="mt-2" />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel value="Age segment" />
                                                <select
                                                    value={campaignForm.data.user_age_segment}
                                                    onChange={(event) => campaignForm.setData('user_age_segment', event.target.value)}
                                                    className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                >
                                                    <option value="all">All users</option>
                                                    <option value="new">Only new users</option>
                                                    <option value="existing">Only existing users</option>
                                                </select>
                                            </div>
                                            <div>
                                                <InputLabel value="New-user window (days)" />
                                                <TextInput
                                                    type="number"
                                                    min="1"
                                                    value={campaignForm.data.new_user_window_days}
                                                    onChange={(event) => campaignForm.setData('new_user_window_days', event.target.value)}
                                                    className="mt-2 block w-full"
                                                />
                                            </div>
                                        </div>

                                        {['users_with_bookings', 'booked_service'].includes(campaignForm.data.audience_type) && (
                                            <div>
                                                <InputLabel value="Booking status filter" />
                                                <select
                                                    value={campaignForm.data.booking_status_filter}
                                                    onChange={(event) => campaignForm.setData('booking_status_filter', event.target.value)}
                                                    className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                >
                                                    <option value="any">Any booking status</option>
                                                    <option value="pending">Pending bookings</option>
                                                    <option value="approved">Approved bookings</option>
                                                    <option value="rejected">Rejected bookings</option>
                                                </select>
                                                <InputError message={campaignForm.errors.booking_status_filter} className="mt-2" />
                                            </div>
                                        )}

                                        {campaignForm.data.audience_type === 'specific_users' && (
                                            <div>
                                                <InputLabel value="Specific users" />
                                                <div className="mt-2 rounded-3xl border border-[color:var(--md-outline)] bg-white p-4 shadow-sm">
                                                    <TextInput
                                                        value={userSearch}
                                                        onChange={(event) => setUserSearch(event.target.value)}
                                                        className="block w-full"
                                                        placeholder="Search by name, email, phone, or user ID"
                                                    />

                                                    {selectedUsers.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {selectedUsers.map((user) => (
                                                                <button
                                                                    key={user.id}
                                                                    type="button"
                                                                    onClick={() => toggleUserSelection(user.id)}
                                                                    className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700"
                                                                >
                                                                    {user.name} #{user.id} x
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                                                        {filteredUsers.length === 0 ? (
                                                            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                                                                No matching users found.
                                                            </p>
                                                        ) : (
                                                            filteredUsers.map((user) => {
                                                                const isSelected = campaignForm.data.target_user_ids.includes(user.id);

                                                                return (
                                                                    <label
                                                                        key={user.id}
                                                                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                                                                            isSelected
                                                                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                                                                : 'border-slate-200 bg-white text-slate-700'
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={() => toggleUserSelection(user.id)}
                                                                            className="mt-1 rounded"
                                                                        />
                                                                        <span className="min-w-0 flex-1">
                                                                            <span className="block text-sm font-semibold">
                                                                                {user.name} #{user.id}
                                                                            </span>
                                                                            <span className="mt-1 block text-xs text-slate-500">
                                                                                {user.email || 'No email'}
                                                                                {user.phone ? ` • ${user.phone}` : ''}
                                                                            </span>
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Select users directly from the Pavona Studio database.
                                                </p>
                                                <InputError message={campaignForm.errors.target_user_ids} className="mt-2" />
                                            </div>
                                        )}

                                        {campaignForm.data.audience_type === 'booked_service' && (
                                            <div>
                                                <InputLabel value="Booked service categories" />
                                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                    {serviceOptions.map((service) => (
                                                        <label
                                                            key={service.id}
                                                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                                                                campaignForm.data.target_service_ids.includes(service.id)
                                                                    ? 'border-orange-300 bg-orange-50 text-orange-700'
                                                                    : 'border-slate-200 bg-white text-slate-700'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={campaignForm.data.target_service_ids.includes(service.id)}
                                                                onChange={() => toggleServiceSelection(service.id)}
                                                                className="mr-3 rounded"
                                                            />
                                                            {service.title}
                                                        </label>
                                                    ))}
                                                </div>
                                                <InputError message={campaignForm.errors.target_service_ids} className="mt-2" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-orange-100 bg-white/70 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Reward and delivery logic</p>
                                    <div className="mt-4 grid gap-4">
                                        <div>
                                            <InputLabel value="Offer type" />
                                            <select
                                                value={campaignForm.data.offer_type}
                                                onChange={(event) => campaignForm.setData('offer_type', event.target.value)}
                                                className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                            >
                                                <option value="standard">Standard announcement</option>
                                                <option value="smart_reward">Smart reward reminder/discount flow</option>
                                                <option value="free_reward">Grant or rewind a free reward</option>
                                                <option value="discount_rewind">Send a discount rewind offer</option>
                                            </select>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Free reward grants create or rewind a user reward. Discount rewinds keep the
                                                offer in notifications and on the rewards page.
                                            </p>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel value="Reward filter" />
                                                <select
                                                    value={campaignForm.data.reward_filter}
                                                    onChange={(event) => campaignForm.setData('reward_filter', event.target.value)}
                                                    className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                >
                                                    <option value="any">Any reward state</option>
                                                    <option value="unused">Only unused rewards</option>
                                                    <option value="used">Only used rewards</option>
                                                    <option value="expired">Only expired rewards</option>
                                                    <option value="none">Users without rewards</option>
                                                </select>
                                            </div>
                                            <div>
                                                <InputLabel value="Reference reward" />
                                                <select
                                                    value={campaignForm.data.reference_reward_id}
                                                    onChange={(event) => campaignForm.setData('reference_reward_id', event.target.value)}
                                                    className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                >
                                                    <option value="">Any reward</option>
                                                    {rewardOptions.map((reward) => (
                                                        <option key={reward.id} value={reward.id}>
                                                            {reward.name_rw || reward.name}
                                                            {reward.service?.title ? ` • ${reward.service.title}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                                {(campaignForm.data.offer_type === 'free_reward' || campaignForm.data.offer_type === 'discount_rewind') && (
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Choose the service-linked reward this campaign should use.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {campaignForm.data.offer_type === 'smart_reward' && (
                                            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-slate-700">
                                                Matching users with unused rewards receive reminders. Users with used rewards
                                                receive discount offers automatically.
                                            </div>
                                        )}

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel value="Discount percent" />
                                                <TextInput
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    value={campaignForm.data.discount_percent}
                                                    onChange={(event) => campaignForm.setData('discount_percent', event.target.value)}
                                                    className="mt-2 block w-full"
                                                />
                                                <InputError message={campaignForm.errors.discount_percent} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value="Discount code" />
                                                <TextInput
                                                    value={campaignForm.data.discount_code}
                                                    onChange={(event) => campaignForm.setData('discount_code', event.target.value)}
                                                    className="mt-2 block w-full"
                                                    placeholder="PAVONA15"
                                                />
                                                <InputError message={campaignForm.errors.discount_code} className="mt-2" />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <InputLabel value="Original price (FRW)" />
                                                <TextInput
                                                    type="number"
                                                    min="1"
                                                    value={campaignForm.data.original_price_rwf}
                                                    onChange={(event) => campaignForm.setData('original_price_rwf', event.target.value)}
                                                    className="mt-2 block w-full"
                                                    placeholder="2000"
                                                />
                                                <InputError message={campaignForm.errors.original_price_rwf} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value="Discounted price (FRW)" />
                                                <TextInput
                                                    type="number"
                                                    min="1"
                                                    value={campaignForm.data.discounted_price_rwf}
                                                    onChange={(event) => campaignForm.setData('discounted_price_rwf', event.target.value)}
                                                    className="mt-2 block w-full"
                                                    placeholder="1000"
                                                />
                                                <InputError message={campaignForm.errors.discounted_price_rwf} className="mt-2" />
                                            </div>
                                        </div>

                                        <div>
                                            <InputLabel value="Channels" />
                                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                                {[
                                                    ['send_in_app', 'In-app'],
                                                    ['send_email', 'Email'],
                                                    ['send_sms', 'SMS log'],
                                                ].map(([key, label]) => (
                                                    <label key={key} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={campaignForm.data[key]}
                                                            onChange={(event) => campaignForm.setData(key, event.target.checked)}
                                                            className="mr-3 rounded"
                                                        />
                                                        {label}
                                                    </label>
                                                ))}
                                            </div>
                                            <InputError message={campaignForm.errors.send_in_app} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel value="Campaign image" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCampaignImageChange}
                                                className="mt-2 block w-full text-sm text-slate-600"
                                            />
                                            <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                            <InputError message={campaignForm.errors.image} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <PrimaryButton className="btn-fire">
                                    {campaignForm.processing ? 'Sending...' : 'Launch targeted campaign'}
                                </PrimaryButton>
                                <button type="button" onClick={resetCampaignForm} className="btn-outline">
                                    Reset form
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="glass rounded-[30px] p-6 sm:p-7">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Campaign Intelligence</p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Recent campaigns</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Track delivery, opens, and early booking conversions from the same place you launch them.
                            </p>
                        </div>

                        <div className="mt-6 space-y-4">
                            {campaigns.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-slate-600">
                                    No targeted campaigns yet. Launch one from the left panel to start tracking responses.
                                </div>
                            ) : (
                                campaigns.map((campaign) => (
                                    <article key={campaign.id} className="overflow-hidden rounded-3xl border border-white/70 bg-white/75 shadow-lg shadow-orange-100/40">
                                        <div className="border-b border-orange-100 bg-gradient-to-r from-white to-orange-50 px-5 py-5">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.3em] text-orange-500">
                                                        {campaign.name}
                                                    </p>
                                                    <h4 className="mt-2 text-xl font-semibold text-slate-900">
                                                        {campaign.title_rw}
                                                    </h4>
                                                    <p className="mt-2 max-w-2xl text-sm text-slate-600">{campaign.message_rw}</p>
                                                </div>
                                                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-right">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-orange-600">
                                                        {campaign.status}
                                                    </p>
                                                    <p className="mt-2 text-sm font-medium text-slate-700">
                                                        {formatDateTime(campaign.launched_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="chip bg-orange-100 text-orange-700">
                                                    {audienceLabels[campaign.audience_type] || campaign.audience_type}
                                                </span>
                                                <span className="chip bg-amber-100 text-amber-700">
                                                    {ageSegmentLabels[campaign.user_age_segment] || campaign.user_age_segment}
                                                </span>
                                                <span className="chip bg-emerald-100 text-emerald-700">
                                                    {offerTypeLabels[campaign.offer_type] || campaign.offer_type}
                                                </span>
                                                <span className="chip bg-slate-100 text-slate-700">
                                                    {rewardFilterLabels[campaign.reward_filter] || campaign.reward_filter}
                                                </span>
                                                {campaign.booking_status_filter && campaign.booking_status_filter !== 'any' && (
                                                    <span className="chip bg-sky-100 text-sky-700">
                                                        Booking status: {campaign.booking_status_filter}
                                                    </span>
                                                )}
                                                {campaign.reference_reward && (
                                                    <span className="chip bg-rose-100 text-rose-700">
                                                        Reward: {campaign.reference_reward.name}
                                                    </span>
                                                )}
                                                {campaign.original_price_rwf && campaign.discounted_price_rwf && (
                                                    <span className="chip bg-emerald-100 text-emerald-700">
                                                        {campaign.original_price_rwf} FRW {'->'} {campaign.discounted_price_rwf} FRW
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-5 py-5">
                                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Recipients</p>
                                                    <p className="mt-2 text-2xl font-semibold text-slate-900">{campaign.stats.recipients}</p>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Opened</p>
                                                    <p className="mt-2 text-2xl font-semibold text-emerald-600">{campaign.stats.opened}</p>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Free / Reminder / Discount</p>
                                                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                                                        {campaign.stats.free_rewards} / {campaign.stats.reminders} / {campaign.stats.discounts}
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Conversions</p>
                                                    <p className="mt-2 text-2xl font-semibold text-orange-600">{campaign.stats.conversions}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                                                <span className="rounded-full bg-slate-100 px-3 py-1.5">In-app: {campaign.stats.in_app}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1.5">Email: {campaign.stats.email}</span>
                                                <span className="rounded-full bg-slate-100 px-3 py-1.5">SMS log: {campaign.stats.sms}</span>
                                            </div>

                                            {(campaign.target_user_ids.length > 0 || campaign.target_emails.length > 0 || campaign.target_service_ids.length > 0) && (
                                                <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-slate-700">
                                                    <p className="font-semibold text-slate-900">Target details</p>
                                                    {campaign.target_user_ids.length > 0 && (
                                                        <p className="mt-2">
                                                            Users:{' '}
                                                            {campaign.target_user_ids
                                                                .map((userId) => {
                                                                    const user = userOptions.find((item) => item.id === userId);
                                                                    return user ? `${user.name} (#${user.id})` : `#${userId}`;
                                                                })
                                                                .join(', ')}
                                                        </p>
                                                    )}
                                                    {campaign.target_emails.length > 0 && (
                                                        <p className="mt-2">Emails: {campaign.target_emails.join(', ')}</p>
                                                    )}
                                                    {campaign.target_service_ids.length > 0 && (
                                                        <p className="mt-2">
                                                            Services:{' '}
                                                            {campaign.target_service_ids
                                                                .map((serviceId) => serviceLookup[serviceId] || `#${serviceId}`)
                                                                .join(', ')}
                                                        </p>
                                                    )}
                                                    {campaign.booking_status_filter && campaign.booking_status_filter !== 'any' && (
                                                        <p className="mt-2">Booking status: {campaign.booking_status_filter}</p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-5">
                                                <div className="flex items-center justify-between gap-3">
                                                    <h5 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                                                        Recipient sample
                                                    </h5>
                                                    <p className="text-xs text-slate-500">Showing up to 10 tracked users</p>
                                                </div>

                                                {campaign.recipients.length === 0 ? (
                                                    <p className="mt-3 text-sm text-slate-500">No recipients were matched for this campaign.</p>
                                                ) : (
                                                    <div className="mt-3 space-y-3">
                                                        {campaign.recipients.map((recipient) => (
                                                            <div key={recipient.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-900">
                                                                            {recipient.user?.name || 'Unknown user'}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                            {recipient.user?.email || 'No email'} • {recipient.user?.phone || 'No phone'}
                                                                        </p>
                                                                        {recipient.meta?.service_title && (
                                                                            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-600">
                                                                                {recipient.meta.service_title}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                                            {strategyLabels[recipient.delivery_strategy] || recipient.delivery_strategy}
                                                                        </span>
                                                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                                            {recipient.reward_state || 'none'}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                                                                    <p>In-app: {formatDateTime(recipient.in_app_sent_at)}</p>
                                                                    <p>Email: {formatDateTime(recipient.email_sent_at)}</p>
                                                                    <p>SMS: {formatDateTime(recipient.sms_sent_at)}</p>
                                                                    <p>Opened: {formatDateTime(recipient.opened_at)}</p>
                                                                </div>

                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {Object.entries(recipient.channel_results || {}).map(([channel, result]) => (
                                                                        <span key={channel} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                                                            {channel}: {String(result)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="glass rounded-[30px] p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Public Announcements</p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Homepage promotion banners</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Keep the original public promotion system active for site-wide hero banners and marketing cards.
                            </p>
                        </div>
                        {editingPromotion && (
                            <button type="button" onClick={cancelPromotionEdit} className="btn-outline">
                                Cancel edit
                            </button>
                        )}
                    </div>

                    <div className="mt-6 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                        <form onSubmit={submitPublicPromotion} className="space-y-5 rounded-3xl border border-orange-100 bg-white/70 p-5">
                            <div className="grid gap-4 xl:grid-cols-3">
                                {[
                                    ['rw', 'Kinyarwanda'],
                                    ['en', 'English'],
                                    ['fr', 'Francais'],
                                ].map(([languageKey, label]) => (
                                    <div key={languageKey} className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
                                        <div className="mt-4 space-y-3">
                                            <div>
                                                <InputLabel value={`Title (${languageKey.toUpperCase()})`} />
                                                <TextInput
                                                    value={publicPromotionForm.data[`title_${languageKey}`]}
                                                    onChange={(event) => publicPromotionForm.setData(`title_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full"
                                                    required={languageKey === 'rw'}
                                                />
                                                <InputError message={publicPromotionForm.errors[`title_${languageKey}`]} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value={`Message (${languageKey.toUpperCase()})`} />
                                                <textarea
                                                    value={publicPromotionForm.data[`message_${languageKey}`]}
                                                    onChange={(event) => publicPromotionForm.setData(`message_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                    rows="4"
                                                    required={languageKey === 'rw'}
                                                />
                                                <InputError message={publicPromotionForm.errors[`message_${languageKey}`]} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value={`CTA (${languageKey.toUpperCase()})`} />
                                                <TextInput
                                                    value={publicPromotionForm.data[`cta_text_${languageKey}`]}
                                                    onChange={(event) => publicPromotionForm.setData(`cta_text_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="CTA URL" />
                                    <TextInput
                                        value={publicPromotionForm.data.cta_url}
                                        onChange={(event) => publicPromotionForm.setData('cta_url', event.target.value)}
                                        className="mt-2 block w-full"
                                    />
                                    <InputError message={publicPromotionForm.errors.cta_url} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Image" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePublicPromotionImageChange}
                                        className="mt-2 block w-full text-sm text-slate-600"
                                    />
                                    <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                    <InputError message={publicPromotionForm.errors.image} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Starts at" />
                                    <TextInput
                                        type="date"
                                        value={publicPromotionForm.data.starts_at}
                                        onChange={(event) => publicPromotionForm.setData('starts_at', event.target.value)}
                                        className="mt-2 block w-full"
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Ends at" />
                                    <TextInput
                                        type="date"
                                        value={publicPromotionForm.data.ends_at}
                                        onChange={(event) => publicPromotionForm.setData('ends_at', event.target.value)}
                                        className="mt-2 block w-full"
                                    />
                                </div>
                            </div>

                            <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={publicPromotionForm.data.is_active}
                                    onChange={(event) => publicPromotionForm.setData('is_active', event.target.checked)}
                                    className="rounded"
                                />
                                Active on the public site
                            </label>

                            {publicPromotionForm.data.image && typeof publicPromotionForm.data.image === 'string' && (
                                <img src={publicPromotionForm.data.image} alt="Promotion preview" className="h-32 w-full rounded-3xl object-cover" />
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                                <PrimaryButton className="btn-fire">
                                    {editingPromotion ? 'Update public promotion' : 'Create public promotion'}
                                </PrimaryButton>
                                {editingPromotion && (
                                    <button type="button" onClick={cancelPromotionEdit} className="btn-outline">
                                        Clear form
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="space-y-4">
                            {promotions.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-slate-600">
                                    No public promotions yet.
                                </div>
                            ) : (
                                promotions.map((promotion) => (
                                    <article key={promotion.id} className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-lg shadow-orange-100/40">
                                        {promotion.image && (
                                            <img src={promotion.image} alt={promotion.title_rw || promotion.title} className="h-44 w-full object-cover" />
                                        )}
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-slate-900">{promotion.title_rw || promotion.title}</h4>
                                                    <p className="mt-2 text-sm text-slate-600">{promotion.message_rw || promotion.message}</p>
                                                </div>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        promotion.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {promotion.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => editPromotion(promotion)}
                                                    className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removePromotion(promotion.id)}
                                                    className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
