import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import MediaPreview, { isVideoFile } from '@/Components/MediaPreview';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

function formatDateTime(value) {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleString();
}

export default function RewardsAdminIndex({ rewards = [], userRewards = [], rewinds = [] }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name_rw: '',
        name_en: '',
        name_fr: '',
        slug: '',
        description_rw: '',
        description_en: '',
        description_fr: '',
        image: '',
        expires_after_days: 30,
        is_active: true,
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

    const submit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('name_rw', data.name_rw);
        formData.append('name_en', data.name_en || '');
        formData.append('name_fr', data.name_fr || '');
        formData.append('slug', data.slug);
        formData.append('description_rw', data.description_rw || '');
        formData.append('description_en', data.description_en || '');
        formData.append('description_fr', data.description_fr || '');
        formData.append('expires_after_days', data.expires_after_days || 30);
        formData.append('is_active', data.is_active ? '1' : '0');

        if (data.image instanceof File) {
            formData.append('image', data.image);
        }

        if (editing) {
            put(route('admin.rewards.update', editing), {
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setEditing(null);
                },
            });
            return;
        }

        post(route('admin.rewards.store'), {
            data: formData,
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const edit = (reward) => {
        setEditing(reward.id);
        setData({
            name_rw: reward.name_rw || reward.name || '',
            name_en: reward.name_en || '',
            name_fr: reward.name_fr || '',
            slug: reward.slug || '',
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

                            <div className="grid gap-4 md:grid-cols-2">
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
                                        onChange={(event) => setData('image', event.target.files[0])}
                                        className="mt-2 block w-full text-sm text-slate-600"
                                    />
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
