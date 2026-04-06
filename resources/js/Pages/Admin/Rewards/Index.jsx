import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import MediaPreview, { isVideoFile } from '@/Components/MediaPreview';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { ADMIN_IMAGE_UPLOAD_LIMIT_MB, getAdminImageUploadError } from '@/lib/adminUploadLimits';

function formatDateTime(value) {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleString();
}

function formatFrw(value) {
    if (value === null || value === undefined || value === '') {
        return 'Not set';
    }

    return `${Number(value).toLocaleString()} FRW`;
}

const welcomeCardThemes = [
    'from-orange-500 via-amber-400 to-yellow-300 text-slate-950',
    'from-emerald-500 via-teal-400 to-lime-300 text-slate-950',
    'from-sky-500 via-cyan-400 to-blue-300 text-slate-950',
    'from-rose-500 via-pink-400 to-orange-300 text-slate-950',
];

function createEmptyDiscountCard(seed = {}) {
    return {
        title_rw: '',
        title_en: '',
        title_fr: '',
        service_id: '',
        discount_percent: 15,
        discount_code: '',
        original_price_rwf: '',
        discounted_price_rwf: '',
        ...seed,
    };
}

function normalizeDiscountCardForForm(card = {}, validSubServiceIds = new Set()) {
    const serviceId = card.service_id ?? card.service?.id ?? '';
    const normalizedServiceId = serviceId !== '' && validSubServiceIds.has(Number(serviceId)) ? serviceId : '';

    return createEmptyDiscountCard({
        title_rw: card.title_rw ?? card.title ?? '',
        title_en: card.title_en ?? '',
        title_fr: card.title_fr ?? '',
        service_id: normalizedServiceId,
        discount_percent: card.discount_percent ?? '',
        discount_code: card.discount_code ?? '',
        original_price_rwf: card.original_price_rwf ?? '',
        discounted_price_rwf: card.discounted_price_rwf ?? '',
    });
}

function getDiscountCardTitle(card, fallback) {
    return card.title_rw || card.title_en || card.title_fr || fallback;
}

function getDiscountCardTheme(index) {
    return welcomeCardThemes[index % welcomeCardThemes.length];
}

function getServiceOptionLabel(service) {
    if (!service) {
        return '';
    }

    const title = service.title_rw || service.title_en || service.title_fr || service.title;
    const parentTitle = service.parent_title_rw || service.parent_title;

    if (service.parent_service_id && parentTitle) {
        return `${parentTitle} / ${title}`;
    }

    return title;
}

function getDiscountCardSavings(card) {
    const originalPrice = Number(card.original_price_rwf || 0);
    const discountedPrice = Number(card.discounted_price_rwf || 0);

    if (!originalPrice || !discountedPrice || discountedPrice >= originalPrice) {
        return '';
    }

    return `${(originalPrice - discountedPrice).toLocaleString()} FRW saved`;
}

function hasDiscountCardValue(value) {
    return value !== null && value !== undefined && value !== '';
}

export default function RewardsAdminIndex({ rewards = [], userRewards = [], rewinds = [], serviceOptions = [], subServiceOptions = [], welcomeOffer = {} }) {
    const [editing, setEditing] = useState(null);
    const validSubServiceIds = new Set(subServiceOptions.map((service) => Number(service.id)));
    const subServiceGroups = useMemo(() => {
        const groups = [];
        let currentGroup = null;

        subServiceOptions.forEach((service) => {
            const groupKey = service.parent_service_id || service.parent_title || 'other';
            const groupLabel = service.parent_title_rw || service.parent_title || 'Other';

            if (!currentGroup || currentGroup.key !== groupKey) {
                currentGroup = {
                    key: groupKey,
                    label: groupLabel,
                    items: [],
                };
                groups.push(currentGroup);
            }

            currentGroup.items.push(service);
        });

        return groups;
    }, [subServiceOptions]);
    const { data, setData, post, delete: destroy, reset, errors, setError, clearErrors, transform } = useForm({
        name_rw: '',
        name_en: '',
        name_fr: '',
        slug: '',
        service_id: '',
        description_rw: '',
        description_en: '',
        description_fr: '',
        image: '',
        expires_after_days: 30,
        is_active: true,
    });
    const welcomeOfferForm = useForm({
        discount_cards: Array.isArray(welcomeOffer.discount_cards)
            ? welcomeOffer.discount_cards.map((card) => normalizeDiscountCardForForm(card, validSubServiceIds))
            : [],
        selected_reward_ids: welcomeOffer.selected_reward_ids ?? [],
    });

    const [userRewardEdits, setUserRewardEdits] = useState(() => {
        const initial = {};

        userRewards.forEach((item) => {
            initial[item.id] = {
                status: item.status,
                expires_at: item.expires_at ? item.expires_at.slice(0, 10) : '',
                rewind_action: item.is_expired ? 'reactivate' : 'reset_unused',
                expires_in_days: item.reward?.expires_after_days || 30,
                notes: '',
            };
        });

        return initial;
    });

    const activeRewardOptions = rewards.filter((reward) => reward.is_active);
    const serviceOptionsById = useMemo(
        () => Object.fromEntries(serviceOptions.map((service) => [Number(service.id), service])),
        [serviceOptions],
    );

    const submit = (event) => {
        event.preventDefault();
        transform((currentData) => {
            const payload = {
                name_rw: currentData.name_rw,
                name_en: currentData.name_en || '',
                name_fr: currentData.name_fr || '',
                slug: currentData.slug,
                service_id: currentData.service_id || '',
                description_rw: currentData.description_rw || '',
                description_en: currentData.description_en || '',
                description_fr: currentData.description_fr || '',
                expires_after_days: currentData.expires_after_days || 30,
                is_active: currentData.is_active ? '1' : '0',
            };

            if (currentData.image instanceof File) {
                payload.image = currentData.image;
            }

            if (editing) {
                payload._method = 'put';
            }

            return payload;
        });

        post(editing ? route('admin.rewards.update', editing) : route('admin.rewards.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setEditing(null);
            },
            onFinish: () => transform((currentData) => currentData),
        });
    };

    const edit = (reward) => {
        setEditing(reward.id);
        setData({
            name_rw: reward.name_rw || reward.name || '',
            name_en: reward.name_en || '',
            name_fr: reward.name_fr || '',
            slug: reward.slug || '',
            service_id: reward.service_id || '',
            description_rw: reward.description_rw || reward.description || '',
            description_en: reward.description_en || '',
            description_fr: reward.description_fr || '',
            image: reward.image || '',
            expires_after_days: reward.expires_after_days || 30,
            is_active: reward.is_active ?? true,
        });
    };

    const remove = (rewardId) => {
        if (confirm('Delete this reward?')) {
            destroy(route('admin.rewards.destroy', rewardId));
        }
    };

    const handleMediaChange = (event) => {
        const file = event.target.files?.[0] ?? null;
        const error = getAdminImageUploadError(file);

        if (error) {
            setError('image', error);
            event.target.value = '';
            return;
        }

        clearErrors('image');
        setData('image', file ?? '');
    };

    const submitWelcomeOffer = (event) => {
        event.preventDefault();
        welcomeOfferForm.post(route('admin.rewards.welcome-offer.update'), {
            preserveScroll: true,
        });
    };

    const toggleWelcomeRewardSelection = (rewardId) => {
        const normalizedId = Number(rewardId);

        welcomeOfferForm.setData(
            'selected_reward_ids',
            welcomeOfferForm.data.selected_reward_ids.includes(normalizedId)
                ? welcomeOfferForm.data.selected_reward_ids.filter((value) => value !== normalizedId)
                : [...welcomeOfferForm.data.selected_reward_ids, normalizedId],
        );
    };

    const addWelcomeDiscountCard = () => {
        welcomeOfferForm.setData('discount_cards', [...welcomeOfferForm.data.discount_cards, createEmptyDiscountCard()]);
    };

    const updateWelcomeDiscountCard = (index, field, value) => {
        welcomeOfferForm.setData(
            'discount_cards',
            welcomeOfferForm.data.discount_cards.map((card, cardIndex) => (
                cardIndex === index ? { ...card, [field]: value } : card
            )),
        );
    };

    const removeWelcomeDiscountCard = (index) => {
        welcomeOfferForm.setData(
            'discount_cards',
            welcomeOfferForm.data.discount_cards.filter((_, cardIndex) => cardIndex !== index),
        );
    };

    const updateUserReward = (userRewardId) => {
        const payload = userRewardEdits[userRewardId];
        if (!payload) {
            return;
        }

        router.put(
            route('admin.rewards.user.update', userRewardId),
            {
                status: payload.status,
                expires_at: payload.expires_at || null,
            },
            { preserveScroll: true },
        );
    };

    const rewindReward = (userRewardId) => {
        const payload = userRewardEdits[userRewardId];
        if (!payload) {
            return;
        }

        router.post(
            route('admin.rewards.user.rewind', userRewardId),
            {
                action: payload.rewind_action,
                expires_in_days: payload.expires_in_days || null,
                notes: payload.notes || '',
            },
            { preserveScroll: true },
        );
    };

    const previewSrc = useMemo(() => {
        if (data.image instanceof File) {
            return URL.createObjectURL(data.image);
        }

        if (typeof data.image === 'string') {
            return data.image;
        }

        return '';
    }, [data.image]);

    const previewIsVideo = useMemo(() => {
        if (data.image instanceof File) {
            return data.image.type.startsWith('video/');
        }

        return isVideoFile(previewSrc);
    }, [data.image, previewSrc]);

    useEffect(() => {
        if (!(data.image instanceof File) || !previewSrc) {
            return undefined;
        }

        return () => URL.revokeObjectURL(previewSrc);
    }, [data.image, previewSrc]);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-orange-500">Rewards Ops</p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-900">Reward catalog and rewind control</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Maintain the reward library, reset used rewards, reactivate expired ones, and resend free service
                        access to users who need another chance.
                    </p>
                </div>
            }
        >
            <Head title="Manage Rewards" />

            <div className="space-y-8">
                <section className="overflow-hidden rounded-[32px] border border-orange-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_38%),linear-gradient(135deg,_rgba(255,247,237,1),_rgba(255,255,255,1),_rgba(236,253,245,0.9))] shadow-[0_30px_80px_rgba(234,88,12,0.12)]">
                    <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Welcome Offer</p>
                            <h3 className="mt-3 font-display text-3xl font-semibold text-slate-900">
                                Build separate discount cards, then keep free services in their own clear block.
                            </h3>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                Instead of one shared discount line, you can now create multiple welcome cards like
                                "Kumfata 25" or "Make 10" with different prices. Free services stay separate and are
                                still controlled by admin selection.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <span className="chip bg-emerald-100 text-emerald-700">
                                    {welcomeOfferForm.data.discount_cards.length} discount cards
                                </span>
                                <span className="chip bg-orange-100 text-orange-700">
                                    {welcomeOfferForm.data.selected_reward_ids.length} selected free services
                                </span>
                                <span className="chip bg-sky-100 text-sky-700">
                                    Separate cards, separate pricing
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {welcomeOfferForm.data.discount_cards.length === 0 ? (
                                <div className="rounded-[28px] border border-dashed border-orange-200 bg-white/80 p-6 text-sm leading-7 text-slate-600">
                                    No welcome discount cards yet. Add one below and it will appear here as its own
                                    preview card.
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {welcomeOfferForm.data.discount_cards.slice(0, 4).map((card, index) => (
                                        <article
                                            key={`${getDiscountCardTitle(card, `Card ${index + 1}`)}-${index}`}
                                            className={`theme-static-ink overflow-hidden rounded-[28px] bg-gradient-to-br p-5 shadow-xl shadow-orange-200/20 ${getDiscountCardTheme(index)}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-900/65">
                                                        Welcome card {index + 1}
                                                    </p>
                                                    <h4 className="mt-3 text-xl font-semibold text-slate-950">
                                                        {getDiscountCardTitle(card, `Discount card ${index + 1}`)}
                                                    </h4>
                                                    {card.service_id && serviceOptionsById[Number(card.service_id)] && (
                                                        <p className="mt-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900">
                                                            {getServiceOptionLabel(serviceOptionsById[Number(card.service_id)])}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                                                    {hasDiscountCardValue(card.discount_percent) ? `${card.discount_percent}% OFF` : 'Custom'}
                                                </span>
                                            </div>

                                            <div className="mt-8 flex items-end justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-900/60">
                                                        Offer price
                                                    </p>
                                                    <p className="mt-2 text-3xl font-black text-slate-950">
                                                        {hasDiscountCardValue(card.discounted_price_rwf) ? formatFrw(card.discounted_price_rwf) : 'Set price'}
                                                    </p>
                                                </div>
                                                {hasDiscountCardValue(card.original_price_rwf) && (
                                                    <span className="rounded-full bg-slate-950/10 px-3 py-1 text-xs font-semibold text-slate-900/70 line-through">
                                                        {formatFrw(card.original_price_rwf)}
                                                    </span>
                                                )}
                                            </div>

                                            {(card.discount_code || getDiscountCardSavings(card)) && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {card.discount_code && (
                                                        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900">
                                                            Code: {card.discount_code}
                                                        </span>
                                                    )}
                                                    {getDiscountCardSavings(card) && (
                                                        <span className="rounded-full bg-slate-950/10 px-3 py-1 text-xs font-semibold text-slate-900">
                                                            {getDiscountCardSavings(card)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </article>
                                    ))}
                                </div>
                            )}

                            <div className="rounded-[28px] border border-sky-200 bg-white/80 p-5 shadow-lg shadow-sky-100/30">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-600">Free services panel</p>
                                <div className="mt-3 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-3xl font-semibold text-slate-900">{welcomeOfferForm.data.selected_reward_ids.length}</p>
                                        <p className="mt-1 text-sm text-slate-500">Shown separately from the discount cards</p>
                                    </div>
                                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                                        Admin controlled
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="glass rounded-[30px] p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Welcome Offer Settings</p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Discount cards plus admin-selected free services</h3>
                            <p className="mt-2 max-w-3xl text-sm text-slate-600">
                                Add each welcome discount as its own card with its own title, percent, code, and price.
                                Free services remain below in a different section so users can clearly see both at the same time.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={addWelcomeDiscountCard}
                            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5"
                        >
                            Add discount card
                        </button>
                    </div>

                    <form onSubmit={submitWelcomeOffer} className="mt-6 space-y-8">
                        {welcomeOfferForm.data.discount_cards.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/50 p-7 text-sm leading-7 text-slate-600">
                                No discount cards added yet. Click "Add discount card" to create a visible offer card
                                like "Kumfata 25" with its own price and discount.
                            </div>
                        ) : (
                            <div className="grid gap-5 xl:grid-cols-2">
                                {welcomeOfferForm.data.discount_cards.map((card, index) => (
                                    <article key={`discount-card-form-${index}`} className="overflow-hidden rounded-[30px] border border-orange-100 bg-white/80 shadow-lg shadow-orange-100/20">
                                        <div className={`bg-gradient-to-r px-5 py-4 ${getDiscountCardTheme(index)}`}>
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-900/65">
                                                        Card {index + 1}
                                                    </p>
                                                    <h4 className="mt-2 text-xl font-semibold text-slate-950">
                                                        {getDiscountCardTitle(card, `Discount card ${index + 1}`)}
                                                    </h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeWelcomeDiscountCard(index)}
                                                    className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-white"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-5 p-5">
                                            <div className="grid gap-4 md:grid-cols-3">
                                                <div>
                                                    <InputLabel value="Title (RW)" />
                                                    <TextInput
                                                        value={card.title_rw}
                                                        onChange={(event) => updateWelcomeDiscountCard(index, 'title_rw', event.target.value)}
                                                        className="mt-2 block w-full"
                                                        placeholder="Kumfata 25"
                                                    />
                                                    <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.title_rw`]} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel value="Title (EN)" />
                                                    <TextInput
                                                        value={card.title_en}
                                                        onChange={(event) => updateWelcomeDiscountCard(index, 'title_en', event.target.value)}
                                                        className="mt-2 block w-full"
                                                        placeholder="Capture 25"
                                                    />
                                                    <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.title_en`]} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel value="Title (FR)" />
                                                    <TextInput
                                                        value={card.title_fr}
                                                        onChange={(event) => updateWelcomeDiscountCard(index, 'title_fr', event.target.value)}
                                                        className="mt-2 block w-full"
                                                        placeholder="Capture 25"
                                                    />
                                                    <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.title_fr`]} className="mt-2" />
                                                </div>
                                            </div>

                                            <div>
                                                <InputLabel value="Show this discount on home page service card" />
                                                <select
                                                    value={card.service_id}
                                                    onChange={(event) => updateWelcomeDiscountCard(index, 'service_id', event.target.value)}
                                                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
                                                >
                                                    <option value="">Only in welcome discount section</option>
                                                    {subServiceGroups.map((group) => (
                                                        <optgroup key={group.key} label={group.label}>
                                                            {group.items.map((service) => (
                                                                <option key={service.id} value={service.id}>
                                                                    {service.title_rw || service.title_en || service.title_fr || service.title}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                                <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.service_id`]} className="mt-2" />
                                                <p className="mt-2 text-xs text-slate-500">
                                                    If you pick a service here, this welcome card will appear only on the matching card on the home page.
                                                </p>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                <div>
                                                    <InputLabel value="Discount percent" />
                                                    <TextInput
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={card.discount_percent}
                                                        onChange={(event) => updateWelcomeDiscountCard(index, 'discount_percent', event.target.value)}
                                                        className="mt-2 block w-full"
                                                        placeholder="25"
                                                    />
                                                    <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.discount_percent`]} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel value="Discount code" />
                                                    <TextInput
                                                        value={card.discount_code}
                                                        onChange={(event) => updateWelcomeDiscountCard(index, 'discount_code', event.target.value)}
                                                        className="mt-2 block w-full"
                                                        placeholder="CAPTURE25"
                                                    />
                                                    <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.discount_code`]} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel value="Original price (FRW)" />
                                                    <TextInput
                                                        type="number"
                                                        min="0"
                                                        value={card.original_price_rwf}
                                                        onChange={(event) => updateWelcomeDiscountCard(index, 'original_price_rwf', event.target.value)}
                                                        className="mt-2 block w-full"
                                                        placeholder="2000"
                                                    />
                                                    <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.original_price_rwf`]} className="mt-2" />
                                                </div>
                                                <div>
                                                    <InputLabel value="Discounted price (FRW)" />
                                                    <TextInput
                                                        type="number"
                                                        min="0"
                                                        value={card.discounted_price_rwf}
                                                        onChange={(event) => updateWelcomeDiscountCard(index, 'discounted_price_rwf', event.target.value)}
                                                        className="mt-2 block w-full"
                                                        placeholder="1500"
                                                    />
                                                    <InputError message={welcomeOfferForm.errors[`discount_cards.${index}.discounted_price_rwf`]} className="mt-2" />
                                                </div>
                                            </div>

                                            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {card.service_id && serviceOptionsById[Number(card.service_id)] && (
                                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                                            {getServiceOptionLabel(serviceOptionsById[Number(card.service_id)])}
                                                        </span>
                                                    )}
                                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                        {hasDiscountCardValue(card.discount_percent) ? `${card.discount_percent}% OFF` : 'No percent yet'}
                                                    </span>
                                                    {card.discount_code && (
                                                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                                                            Code: {card.discount_code}
                                                        </span>
                                                    )}
                                                    {getDiscountCardSavings(card) && (
                                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                            {getDiscountCardSavings(card)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                                    {hasDiscountCardValue(card.original_price_rwf) && (
                                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 line-through">
                                                            {formatFrw(card.original_price_rwf)}
                                                        </span>
                                                    )}
                                                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                                                        {hasDiscountCardValue(card.discounted_price_rwf) ? formatFrw(card.discounted_price_rwf) : 'Set discounted price'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        <div className="rounded-[30px] border border-sky-200 bg-sky-50/50 p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <InputLabel value="Free services to auto-assign" />
                                    <p className="mt-2 text-sm text-slate-500">
                                        These stay in a separate block from the discount cards. Pick only the active rewards
                                        that new customers should receive automatically.
                                    </p>
                                </div>
                                <div className="rounded-full bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700">
                                    {welcomeOfferForm.data.selected_reward_ids.length} selected
                                </div>
                            </div>

                            {welcomeOfferForm.data.selected_reward_ids.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {activeRewardOptions
                                        .filter((reward) => welcomeOfferForm.data.selected_reward_ids.includes(reward.id))
                                        .map((reward) => (
                                            <button
                                                key={reward.id}
                                                type="button"
                                                onClick={() => toggleWelcomeRewardSelection(reward.id)}
                                                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm"
                                            >
                                                {reward.name_rw || reward.name} x
                                            </button>
                                        ))}
                                </div>
                            )}

                            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                {activeRewardOptions.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-sky-200 bg-white/80 p-6 text-sm text-slate-600">
                                        Create or activate reward catalog entries first, then they will appear here for selection.
                                    </div>
                                ) : (
                                    activeRewardOptions.map((reward) => (
                                        <label
                                            key={reward.id}
                                            className={`rounded-3xl border px-4 py-4 transition ${
                                                welcomeOfferForm.data.selected_reward_ids.includes(reward.id)
                                                    ? 'border-sky-300 bg-white shadow-sm'
                                                    : 'border-slate-200 bg-white/70'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={welcomeOfferForm.data.selected_reward_ids.includes(reward.id)}
                                                    onChange={() => toggleWelcomeRewardSelection(reward.id)}
                                                    className="mt-1 rounded"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{reward.name_rw || reward.name}</p>
                                                    {reward.service && (
                                                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                                                            {reward.service.title_rw || reward.service.title}
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-sm text-slate-600">
                                                        {reward.description_rw || reward.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            <InputError message={welcomeOfferForm.errors.selected_reward_ids} className="mt-2" />
                        </div>

                        <PrimaryButton className="btn-fire">
                            {welcomeOfferForm.processing ? 'Saving...' : 'Save welcome offer'}
                        </PrimaryButton>
                    </form>
                </section>

                <section className="glass rounded-[30px] p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Reward Catalog</p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                                {editing ? 'Edit reward' : 'Add reward'}
                            </h3>
                        </div>
                        {editing && (
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setEditing(null);
                                }}
                                className="btn-outline"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>

                    <div className="mt-6 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-orange-100 bg-white/70 p-5">
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
                                                <InputLabel value={`Name (${languageKey.toUpperCase()})`} />
                                                <TextInput
                                                    value={data[`name_${languageKey}`]}
                                                    onChange={(event) => setData(`name_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full"
                                                    required={languageKey === 'rw'}
                                                />
                                                <InputError message={errors[`name_${languageKey}`]} className="mt-2" />
                                            </div>
                                            <div>
                                                <InputLabel value={`Description (${languageKey.toUpperCase()})`} />
                                                <textarea
                                                    value={data[`description_${languageKey}`]}
                                                    onChange={(event) => setData(`description_${languageKey}`, event.target.value)}
                                                    className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                    rows="4"
                                                />
                                                <InputError message={errors[`description_${languageKey}`]} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                    <InputLabel value="Slug" />
                                    <TextInput
                                        value={data.slug}
                                        onChange={(event) => setData('slug', event.target.value)}
                                        className="mt-2 block w-full"
                                        required
                                    />
                                    <InputError message={errors.slug} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Linked service" />
                                    <select
                                        value={data.service_id}
                                        onChange={(event) => setData('service_id', event.target.value)}
                                        className="mt-2 block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                    >
                                        <option value="">No specific service</option>
                                        {serviceOptions.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.parent_title
                                                    ? `${service.parent_title_rw || service.parent_title} -> ${service.title_rw || service.title}`
                                                    : (service.title_rw || service.title)}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.service_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Expires after (days)" />
                                    <TextInput
                                        type="number"
                                        value={data.expires_after_days}
                                        onChange={(event) => setData('expires_after_days', event.target.value)}
                                        className="mt-2 block w-full"
                                    />
                                    <InputError message={errors.expires_after_days} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Media" />
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleMediaChange}
                                        className="mt-2 block w-full text-sm text-slate-600"
                                    />
                                    <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                    <InputError message={errors.image} className="mt-2" />
                                </div>
                                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(event) => setData('is_active', event.target.checked)}
                                        className="rounded"
                                    />
                                    Active reward
                                </label>
                            </div>

                            {previewSrc && (
                                <MediaPreview
                                    src={previewSrc}
                                    alt="Reward preview"
                                    isVideo={previewIsVideo}
                                    className="h-36 w-full rounded-3xl object-cover"
                                    videoProps={{ controls: true }}
                                />
                            )}

                            <PrimaryButton className="btn-fire">
                                {editing ? 'Update reward' : 'Create reward'}
                            </PrimaryButton>
                        </form>

                        <div className="space-y-4">
                            {rewards.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-slate-600">
                                    No reward catalog entries yet.
                                </div>
                            ) : (
                                rewards.map((reward) => (
                                    <article key={reward.id} className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-lg shadow-orange-100/30">
                                        {reward.image && (
                                            <MediaPreview
                                                src={reward.image}
                                                alt={reward.name_rw || reward.name}
                                                className="h-44 w-full object-cover"
                                                videoProps={{ controls: true }}
                                            />
                                        )}
                                        <div className="p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">{reward.name_rw || reward.name}</h3>
                                                    {reward.service && (
                                                        <p className="mt-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                            Service: {reward.service.title_rw || reward.service.title}
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-sm text-slate-600">{reward.description_rw || reward.description}</p>
                                                </div>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        reward.is_active
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {reward.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {reward.expires_after_days} day window
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => edit(reward)}
                                                    className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(reward.id)}
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

                <section className="glass rounded-[30px] p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Assigned Rewards</p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-900">User reward rewind panel</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Reset a used reward to unused, reactivate an expired offer, or resend the free service with a new
                                validity window.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">
                            {userRewards.length} tracked user rewards
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {userRewards.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-slate-600">
                                No user rewards yet.
                            </div>
                        ) : (
                            userRewards.map((item) => (
                                <article key={item.id} className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-orange-100/30">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-lg font-semibold text-slate-900">
                                                    {item.user?.name} • {item.reward?.name_rw || item.reward?.name}
                                                </h4>
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        item.is_expired
                                                            ? 'bg-rose-100 text-rose-700'
                                                            : item.status === 'used'
                                                                ? 'bg-slate-100 text-slate-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                    }`}
                                                >
                                                    {item.is_expired ? 'expired' : item.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                {item.user?.email || 'No email'} • {item.user?.phone || 'No phone'}
                                            </p>
                                            {item.reward?.service && (
                                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                                                    {item.reward.service.title_rw || item.reward.service.title}
                                                </p>
                                            )}
                                            <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                                                <p>Assigned: {formatDateTime(item.assigned_at)}</p>
                                                <p>Expires: {formatDateTime(item.expires_at)}</p>
                                                <p>Used: {formatDateTime(item.used_at)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-semibold text-slate-900">Direct update</p>
                                            <div className="mt-4 grid gap-3">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <select
                                                        value={userRewardEdits[item.id]?.status || item.status}
                                                        onChange={(event) =>
                                                            setUserRewardEdits((current) => ({
                                                                ...current,
                                                                [item.id]: {
                                                                    ...current[item.id],
                                                                    status: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                    >
                                                        <option value="unused">unused</option>
                                                        <option value="used">used</option>
                                                    </select>
                                                    <input
                                                        type="date"
                                                        value={userRewardEdits[item.id]?.expires_at || ''}
                                                        onChange={(event) =>
                                                            setUserRewardEdits((current) => ({
                                                                ...current,
                                                                [item.id]: {
                                                                    ...current[item.id],
                                                                    expires_at: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => updateUserReward(item.id)}
                                                    className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
                                                >
                                                    Save status
                                                </button>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
                                            <p className="text-sm font-semibold text-slate-900">Reward rewind</p>
                                            <div className="mt-4 grid gap-3">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <select
                                                        value={userRewardEdits[item.id]?.rewind_action || 'reset_unused'}
                                                        onChange={(event) =>
                                                            setUserRewardEdits((current) => ({
                                                                ...current,
                                                                [item.id]: {
                                                                    ...current[item.id],
                                                                    rewind_action: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="rounded-2xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                    >
                                                        <option value="reactivate">Reactivate expired reward</option>
                                                        <option value="resend">Re-send free service</option>
                                                        <option value="reset_unused">Reset to unused</option>
                                                    </select>
                                                    <TextInput
                                                        type="number"
                                                        min="1"
                                                        value={userRewardEdits[item.id]?.expires_in_days || 30}
                                                        onChange={(event) =>
                                                            setUserRewardEdits((current) => ({
                                                                ...current,
                                                                [item.id]: {
                                                                    ...current[item.id],
                                                                    expires_in_days: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        className="block w-full"
                                                        placeholder="30"
                                                    />
                                                </div>

                                                <textarea
                                                    value={userRewardEdits[item.id]?.notes || ''}
                                                    onChange={(event) =>
                                                        setUserRewardEdits((current) => ({
                                                            ...current,
                                                            [item.id]: {
                                                                ...current[item.id],
                                                                notes: event.target.value,
                                                            },
                                                        }))
                                                    }
                                                    rows="3"
                                                    className="rounded-2xl border border-orange-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                                                    placeholder="Optional admin note"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => rewindReward(item.id)}
                                                    className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200"
                                                >
                                                    Apply rewind
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <section className="glass rounded-[30px] p-6 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Audit Trail</p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Recent rewind history</h3>
                        </div>
                        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">
                            {rewinds.length} recorded actions
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {rewinds.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/70 p-6 text-sm text-slate-600">
                                No rewind actions have been recorded yet.
                            </div>
                        ) : (
                            rewinds.map((rewind) => (
                                <article key={rewind.id} className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-orange-100/20">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-lg font-semibold text-slate-900">
                                                    {rewind.user?.name} • {rewind.reward?.name_rw || rewind.reward?.name}
                                                </h4>
                                                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                                    {rewind.action}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-500">
                                                Admin: {rewind.admin?.name || 'Unknown'} • {formatDateTime(rewind.created_at)}
                                            </p>
                                            {rewind.reward?.service && (
                                                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                                                    {rewind.reward.service.title_rw || rewind.reward.service.title}
                                                </p>
                                            )}
                                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                                                <span>Previous status: {rewind.previous_status || 'n/a'}</span>
                                                <span>New status: {rewind.new_status || 'n/a'}</span>
                                                <span>Previous expiry: {formatDateTime(rewind.previous_expires_at)}</span>
                                                <span>New expiry: {formatDateTime(rewind.new_expires_at)}</span>
                                            </div>
                                            {rewind.notes && (
                                                <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                    {rewind.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
