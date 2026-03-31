import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import MediaPreview from '@/Components/MediaPreview';
import AdminMediaHint from '@/Components/AdminMediaHint';
import { ADMIN_IMAGE_UPLOAD_LIMIT_MB, getAdminImageUploadError } from '@/lib/adminUploadLimits';

export default function PortfoliosIndex({ portfolios }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, delete: destroy, reset, errors, setError, clearErrors, transform } = useForm({
        title: '',
        description: '',
        category: '',
        image: '',
    });

    const submit = (e) => {
        e.preventDefault();
        transform((currentData) => {
            const payload = {
                title: currentData.title,
                description: currentData.description,
                category: currentData.category,
            };

            if (currentData.image instanceof File) {
                payload.image = currentData.image;
            }

            if (editing) {
                payload._method = 'put';
            }

            return payload;
        });

        post(editing ? route('admin.portfolios.update', editing) : route('admin.portfolios.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setEditing(null);
            },
            onFinish: () => transform((currentData) => currentData),
        });
    };

    const edit = (portfolio) => {
        setData(portfolio);
        setEditing(portfolio.id);
    };

    const deletePortfolio = (id) => {
        if (confirm('Delete this portfolio?')) {
            destroy(route('admin.portfolios.destroy', id));
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

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Portfolio</h2>}>
            <Head title="Manage Portfolio" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Portfolio</h3>
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <InputLabel value="Title" />
                                <TextInput value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1 block w-full" required />
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Category" />
                                <TextInput value={data.category} onChange={(e) => setData('category', e.target.value)} className="mt-1 block w-full" required />
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Description" />
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" required />
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Media" />
                                <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                <AdminMediaHint
                                    title="Portfolio Card Fit"
                                    recommendedSize="1600 x 1200 px or larger"
                                    ratio="4:3 landscape"
                                    note="Portfolio cards are slightly taller than service cards. Use a balanced landscape image or video and keep the main subject near the center."
                                />
                                <InputError message={errors.image} className="mt-2" />
                                {data.image && typeof data.image === 'string' && (
                                    <MediaPreview
                                        src={data.image}
                                        alt="Preview"
                                        className="mt-2 h-20 w-full rounded object-cover"
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton>{editing ? 'Update' : 'Create'}</PrimaryButton>
                                {editing && <button type="button" onClick={() => { reset(); setEditing(null); }} className="px-4 py-2 bg-gray-300 rounded-xl">Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {portfolios.map((portfolio) => (
                            <div key={portfolio.id} className="glass rounded-2xl p-6">
                                {portfolio.image && (
                                    <MediaPreview
                                        src={portfolio.image}
                                        alt={portfolio.title}
                                        className="mb-4 h-44 w-full rounded-xl object-cover"
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <span className="text-sm text-purple-600 font-semibold">{portfolio.category}</span>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{portfolio.title}</h3>
                                <p className="text-gray-600 mb-4">{portfolio.description}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => edit(portfolio)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Edit</button>
                                    <button onClick={() => deletePortfolio(portfolio.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
