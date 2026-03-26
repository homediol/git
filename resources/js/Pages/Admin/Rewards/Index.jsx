import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function RewardsAdminIndex({ rewards = [], userRewards = [] }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        name: '',
        slug: '',
        description: '',
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
            };
        });
        return initial;
    });

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('slug', data.slug);
        formData.append('description', data.description || '');
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
        } else {
            post(route('admin.rewards.store'), {
                data: formData,
                forceFormData: true,
                onSuccess: () => reset(),
            });
        }
    };

    const edit = (reward) => {
        setEditing(reward.id);
        setData({
            name: reward.name || '',
            slug: reward.slug || '',
            description: reward.description || '',
            image: reward.image || '',
            expires_after_days: reward.expires_after_days || 30,
            is_active: reward.is_active ?? true,
        });
    };

    const remove = (id) => {
        if (confirm('Delete this reward?')) {
            destroy(route('admin.rewards.destroy', id));
        }
    };

    const updateUserReward = (id) => {
        const payload = userRewardEdits[id];
        if (!payload) return;
        router.put(route('admin.rewards.user.update', id), payload, { preserveScroll: true });
    };

    const userRewardRows = useMemo(() => userRewards, [userRewards]);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Rewards</h2>}>
            <Head title="Manage Rewards" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Reward</h3>
                        <form onSubmit={submit}>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Name" />
                                    <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" required />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Slug" />
                                    <TextInput value={data.slug} onChange={(e) => setData('slug', e.target.value)} className="mt-1 block w-full" required />
                                    <InputError message={errors.slug} className="mt-2" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <InputLabel value="Description" />
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <InputLabel value="Expires After (Days)" />
                                    <TextInput type="number" value={data.expires_after_days} onChange={(e) => setData('expires_after_days', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.expires_after_days} className="mt-2" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded"
                                        />
                                        Active
                                    </label>
                                    <InputLabel value="Image" className="ml-auto" />
                                    <input type="file" accept="image/*" onChange={(e) => setData('image', e.target.files[0])} className="text-sm text-gray-600" />
                                </div>
                            </div>
                            {data.image && typeof data.image === 'string' && (
                                <img src={data.image} alt="Preview" className="mt-3 h-24 rounded" />
                            )}
                            <div className="flex gap-2 mt-6">
                                <PrimaryButton>{editing ? 'Update' : 'Create'}</PrimaryButton>
                                {editing && (
                                    <button type="button" onClick={() => { reset(); setEditing(null); }} className="px-4 py-2 bg-gray-300 rounded-xl">Cancel</button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {rewards.map((reward) => (
                            <div key={reward.id} className="glass rounded-2xl p-6">
                                {reward.image && (
                                    <img src={reward.image} alt={reward.name} className="mb-4 h-40 w-full rounded-xl object-cover" />
                                )}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-800">{reward.name}</h3>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${reward.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {reward.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2">{reward.description}</p>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => edit(reward)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Edit</button>
                                    <button onClick={() => remove(reward.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">User Rewards</h3>
                        {userRewardRows.length === 0 ? (
                            <p className="text-gray-600">No user rewards yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {userRewardRows.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/40 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.user?.name} - {item.reward?.name}</p>
                                                <p className="text-xs text-gray-600">Status: {item.status}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <select
                                                    value={userRewardEdits[item.id]?.status || item.status}
                                                    onChange={(e) => setUserRewardEdits((prev) => ({
                                                        ...prev,
                                                        [item.id]: { ...prev[item.id], status: e.target.value },
                                                    }))}
                                                    className="rounded-lg border-white/20 bg-white/60 text-sm"
                                                >
                                                    <option value="unused">unused</option>
                                                    <option value="used">used</option>
                                                </select>
                                                <input
                                                    type="date"
                                                    value={userRewardEdits[item.id]?.expires_at || ''}
                                                    onChange={(e) => setUserRewardEdits((prev) => ({
                                                        ...prev,
                                                        [item.id]: { ...prev[item.id], expires_at: e.target.value },
                                                    }))}
                                                    className="rounded-lg border-white/20 bg-white/60 text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateUserReward(item.id)}
                                                    className="px-3 py-2 bg-indigo-500 text-white rounded-xl text-xs"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
