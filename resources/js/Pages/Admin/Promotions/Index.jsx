import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function PromotionsIndex({ promotions = [] }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
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

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title_rw', data.title_rw);
        formData.append('title_en', data.title_en || '');
        formData.append('title_fr', data.title_fr || '');
        formData.append('message_rw', data.message_rw);
        formData.append('message_en', data.message_en || '');
        formData.append('message_fr', data.message_fr || '');
        formData.append('cta_text_rw', data.cta_text_rw || '');
        formData.append('cta_text_en', data.cta_text_en || '');
        formData.append('cta_text_fr', data.cta_text_fr || '');
        formData.append('cta_url', data.cta_url || '');
        formData.append('is_active', data.is_active ? '1' : '0');
        if (data.starts_at) formData.append('starts_at', data.starts_at);
        if (data.ends_at) formData.append('ends_at', data.ends_at);
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }

        if (editing) {
            put(route('admin.promotions.update', editing), {
                data: formData,
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setEditing(null);
                },
            });
        } else {
            post(route('admin.promotions.store'), {
                data: formData,
                forceFormData: true,
                onSuccess: () => reset(),
            });
        }
    };

    const edit = (promotion) => {
        setEditing(promotion.id);
        setData({
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

    const remove = (id) => {
        if (confirm('Delete this promotion?')) {
            destroy(route('admin.promotions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Promotions</h2>}>
            <Head title="Manage Promotions" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Promotion</h3>
                        <form onSubmit={submit}>
                            <div className="grid gap-4 lg:grid-cols-3">
                                <div className="rounded-2xl border border-white/20 bg-white/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Kinyarwanda</p>
                                    <div className="mb-3">
                                        <InputLabel value="Title (RW)" />
                                        <TextInput value={data.title_rw} onChange={(e) => setData('title_rw', e.target.value)} className="mt-1 block w-full" required />
                                        <InputError message={errors.title_rw} className="mt-2" />
                                    </div>
                                    <div className="mb-3">
                                        <InputLabel value="Message (RW)" />
                                        <textarea value={data.message_rw} onChange={(e) => setData('message_rw', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" required />
                                        <InputError message={errors.message_rw} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="CTA Text (RW)" />
                                        <TextInput value={data.cta_text_rw} onChange={(e) => setData('cta_text_rw', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.cta_text_rw} className="mt-2" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">English</p>
                                    <div className="mb-3">
                                        <InputLabel value="Title (EN)" />
                                        <TextInput value={data.title_en} onChange={(e) => setData('title_en', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.title_en} className="mt-2" />
                                    </div>
                                    <div className="mb-3">
                                        <InputLabel value="Message (EN)" />
                                        <textarea value={data.message_en} onChange={(e) => setData('message_en', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" />
                                        <InputError message={errors.message_en} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="CTA Text (EN)" />
                                        <TextInput value={data.cta_text_en} onChange={(e) => setData('cta_text_en', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.cta_text_en} className="mt-2" />
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/20 bg-white/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">Francais</p>
                                    <div className="mb-3">
                                        <InputLabel value="Title (FR)" />
                                        <TextInput value={data.title_fr} onChange={(e) => setData('title_fr', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.title_fr} className="mt-2" />
                                    </div>
                                    <div className="mb-3">
                                        <InputLabel value="Message (FR)" />
                                        <textarea value={data.message_fr} onChange={(e) => setData('message_fr', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" />
                                        <InputError message={errors.message_fr} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="CTA Text (FR)" />
                                        <TextInput value={data.cta_text_fr} onChange={(e) => setData('cta_text_fr', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.cta_text_fr} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <InputLabel value="CTA URL" />
                                    <TextInput value={data.cta_url} onChange={(e) => setData('cta_url', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.cta_url} className="mt-2" />
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
                                    <InputError message={errors.image} className="mt-2" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <InputLabel value="Starts At" />
                                    <TextInput type="date" value={data.starts_at} onChange={(e) => setData('starts_at', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.starts_at} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Ends At" />
                                    <TextInput type="date" value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.ends_at} className="mt-2" />
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

                    <div className="grid md:grid-cols-2 gap-6">
                        {promotions.map((promo) => (
                            <div key={promo.id} className="glass rounded-2xl p-6">
                                {promo.image && (
                                    <img src={promo.image} alt={promo.title_rw || promo.title} className="mb-4 h-40 w-full rounded-xl object-cover" />
                                )}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-800">{promo.title_rw || promo.title}</h3>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${promo.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {promo.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-gray-600 mt-2">{promo.message_rw || promo.message}</p>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => edit(promo)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Edit</button>
                                    <button onClick={() => remove(promo.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
