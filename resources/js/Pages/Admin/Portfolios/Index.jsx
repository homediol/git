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

const emptyForm = {
    title: '',
    title_rw: '',
    title_en: '',
    title_fr: '',
    description: '',
    description_rw: '',
    description_en: '',
    description_fr: '',
    category: '',
    category_rw: '',
    category_en: '',
    category_fr: '',
    image: '',
    delete_image: false,
};

const toFormData = (portfolio = {}) => ({
    title: portfolio.title || '',
    title_rw: portfolio.title_rw || '',
    title_en: portfolio.title_en || portfolio.title || '',
    title_fr: portfolio.title_fr || '',
    description: portfolio.description || '',
    description_rw: portfolio.description_rw || '',
    description_en: portfolio.description_en || portfolio.description || '',
    description_fr: portfolio.description_fr || '',
    category: portfolio.category || '',
    category_rw: portfolio.category_rw || '',
    category_en: portfolio.category_en || portfolio.category || '',
    category_fr: portfolio.category_fr || '',
    image: portfolio.image || '',
    delete_image: false,
});

export default function PortfoliosIndex({ portfolios }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, delete: destroy, reset, errors, setError, clearErrors, transform } = useForm(emptyForm);

    const resetForm = () => {
        reset();
        setEditing(null);
    };

    const submit = (e) => {
        e.preventDefault();
        transform((currentData) => {
            const payload = {
                title: currentData.title || '',
                title_rw: currentData.title_rw || '',
                title_en: currentData.title_en || '',
                title_fr: currentData.title_fr || '',
                description: currentData.description || '',
                description_rw: currentData.description_rw || '',
                description_en: currentData.description_en || '',
                description_fr: currentData.description_fr || '',
                category: currentData.category || '',
                category_rw: currentData.category_rw || '',
                category_en: currentData.category_en || '',
                category_fr: currentData.category_fr || '',
                delete_image: currentData.delete_image ? 1 : 0,
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
            onSuccess: () => resetForm(),
            onFinish: () => transform((currentData) => currentData),
        });
    };

    const edit = (portfolio) => {
        setData(toFormData(portfolio));
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
        setData({
            ...data,
            image: file ?? '',
            delete_image: false,
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Portfolio</h2>}>
            <Head title="Manage Portfolio" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Portfolio</h3>
                        <form onSubmit={submit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Default Title" />
                                    <TextInput value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1 block w-full" required />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Kinyarwanda Title" />
                                    <TextInput value={data.title_rw} onChange={(e) => setData('title_rw', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.title_rw} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="English Title" />
                                    <TextInput value={data.title_en} onChange={(e) => setData('title_en', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.title_en} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="French Title" />
                                    <TextInput value={data.title_fr} onChange={(e) => setData('title_fr', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.title_fr} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4">
                                <div>
                                    <InputLabel value="Default Description" />
                                    <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" required />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Kinyarwanda Description" />
                                    <textarea value={data.description_rw} onChange={(e) => setData('description_rw', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" />
                                    <InputError message={errors.description_rw} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="English Description" />
                                    <textarea value={data.description_en} onChange={(e) => setData('description_en', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" />
                                    <InputError message={errors.description_en} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="French Description" />
                                    <textarea value={data.description_fr} onChange={(e) => setData('description_fr', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" />
                                    <InputError message={errors.description_fr} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Default Category" />
                                    <TextInput value={data.category} onChange={(e) => setData('category', e.target.value)} className="mt-1 block w-full" required />
                                    <InputError message={errors.category} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Kinyarwanda Category" />
                                    <TextInput value={data.category_rw} onChange={(e) => setData('category_rw', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.category_rw} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="English Category" />
                                    <TextInput value={data.category_en} onChange={(e) => setData('category_en', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.category_en} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="French Category" />
                                    <TextInput value={data.category_fr} onChange={(e) => setData('category_fr', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.category_fr} className="mt-2" />
                                </div>
                            </div>

                            <div className="mb-4 mt-4">
                                <InputLabel value="Card Media (Image or Video)" />
                                <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                <p className="mt-2 text-xs font-medium text-slate-500">Images and videos up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported for the card preview.</p>
                                <AdminMediaHint
                                    title="Portfolio Card Fit"
                                    recommendedSize="1600 x 1200 px or larger"
                                    ratio="4:3 landscape"
                                    note="Portfolio cards can show either an image or a looping video. Keep the main subject centered so the preview stays clean across devices."
                                />
                                <InputError message={errors.image} className="mt-2" />
                                {data.image && typeof data.image === 'string' && (
                                    <div className="mt-3 space-y-3">
                                        <MediaPreview
                                            src={data.image}
                                            alt="Current media preview"
                                            className="h-28 w-full rounded-xl object-cover"
                                            videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                        />
                                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={data.delete_image}
                                                onChange={(e) => setData('delete_image', e.target.checked)}
                                                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                            />
                                            Remove current card media on save
                                        </label>
                                    </div>
                                )}
                                {data.image instanceof File && (
                                    <p className="mt-3 text-sm text-slate-500">Selected file: {data.image.name}</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <PrimaryButton>{editing ? 'Update' : 'Create'}</PrimaryButton>
                                {editing && (
                                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 rounded-xl">
                                        Cancel
                                    </button>
                                )}
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
                                <p className="text-gray-600 mb-2">{portfolio.description}</p>
                                <p className="text-xs text-slate-500 mb-4">
                                    RW: {portfolio.title_rw || 'Not set'} | EN: {portfolio.title_en || portfolio.title || 'Not set'} | FR: {portfolio.title_fr || 'Not set'}
                                </p>
                                <p className="text-xs text-slate-500 mb-4">
                                    Category RW: {portfolio.category_rw || 'Not set'} | EN: {portfolio.category_en || portfolio.category || 'Not set'} | FR: {portfolio.category_fr || 'Not set'}
                                </p>
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
