import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import MediaPreview from '@/Components/MediaPreview';
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
    image: '',
};

const toFormData = (subService = {}) => ({
    title: subService.title || '',
    title_rw: subService.title_rw || '',
    title_en: subService.title_en || subService.title || '',
    title_fr: subService.title_fr || '',
    description: subService.description || '',
    description_rw: subService.description_rw || '',
    description_en: subService.description_en || subService.description || '',
    description_fr: subService.description_fr || '',
    image: subService.image || '',
});

export default function SubServices({ service, subServices = [] }) {
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
            };

            if (currentData.image instanceof File) {
                payload.image = currentData.image;
            }

            if (editing) {
                payload._method = 'put';
            }

            return payload;
        });

        post(
            editing
                ? route('admin.services.subservices.update', [service.id, editing])
                : route('admin.services.subservices.store', service.id),
            {
                forceFormData: true,
                onSuccess: () => resetForm(),
                onFinish: () => transform((currentData) => currentData),
            }
        );
    };

    const edit = (subService) => {
        setData(toFormData(subService));
        setEditing(subService.id);
    };

    const deleteSubService = (id) => {
        if (confirm('Delete this item?')) {
            destroy(route('admin.services.subservices.destroy', [service.id, id]));
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Service Items</h2>}>
            <Head title="Manage Service Items" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Service: {service.title}</h3>
                            <p className="text-sm text-gray-600">Create and manage the items shown inside this service card.</p>
                        </div>
                        <Link
                            href={route('admin.services')}
                            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
                        >
                            Back to Services
                        </Link>
                    </div>

                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Item</h3>
                        <form onSubmit={submit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel value="Default Title" />
                                    <TextInput
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Kinyarwanda Title" />
                                    <TextInput
                                        value={data.title_rw}
                                        onChange={(e) => setData('title_rw', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.title_rw} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="English Title" />
                                    <TextInput
                                        value={data.title_en}
                                        onChange={(e) => setData('title_en', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.title_en} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="French Title" />
                                    <TextInput
                                        value={data.title_fr}
                                        onChange={(e) => setData('title_fr', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.title_fr} className="mt-2" />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-4">
                                <div>
                                    <InputLabel value="Default Description" />
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm"
                                        rows="3"
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Kinyarwanda Description" />
                                    <textarea
                                        value={data.description_rw}
                                        onChange={(e) => setData('description_rw', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm"
                                        rows="3"
                                    />
                                    <InputError message={errors.description_rw} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="English Description" />
                                    <textarea
                                        value={data.description_en}
                                        onChange={(e) => setData('description_en', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm"
                                        rows="3"
                                    />
                                    <InputError message={errors.description_en} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="French Description" />
                                    <textarea
                                        value={data.description_fr}
                                        onChange={(e) => setData('description_fr', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm"
                                        rows="3"
                                    />
                                    <InputError message={errors.description_fr} className="mt-2" />
                                </div>
                            </div>

                            <div className="mb-4 mt-4">
                                <InputLabel value="Media" />
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleMediaChange}
                                    className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                                <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
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
                                {editing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 bg-gray-300 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {subServices.map((subService) => (
                            <div key={subService.id} className="glass rounded-2xl p-6">
                                {subService.image && (
                                    <MediaPreview
                                        src={subService.image}
                                        alt={subService.title}
                                        className="mb-4 h-40 w-full rounded-xl object-cover"
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{subService.title}</h3>
                                {subService.description && (
                                    <p className="text-gray-600 mb-2">{subService.description}</p>
                                )}
                                <p className="text-xs text-slate-500 mb-4">
                                    RW: {subService.title_rw || 'Not set'} | EN: {subService.title_en || subService.title || 'Not set'} | FR: {subService.title_fr || 'Not set'}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => edit(subService)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteSubService(subService.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
