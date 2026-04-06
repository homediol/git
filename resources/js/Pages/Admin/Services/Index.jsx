import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
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
    image: '',
};

const toFormData = (service = {}) => ({
    title: service.title || '',
    title_rw: service.title_rw || '',
    title_en: service.title_en || service.title || '',
    title_fr: service.title_fr || '',
    description: service.description || '',
    description_rw: service.description_rw || '',
    description_en: service.description_en || service.description || '',
    description_fr: service.description_fr || '',
    image: service.image || '',
});

export default function ServicesIndex({ services }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, delete: destroy, reset, errors, setError, clearErrors, transform } = useForm(emptyForm);
    const editingService = services.find((service) => String(service.id) === String(editing)) || null;
    const isEditingFixed = Boolean(editingService?.is_fixed);

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

        post(editing ? route('admin.services.update', editing) : route('admin.services.store'), {
            forceFormData: true,
            onSuccess: () => resetForm(),
            onFinish: () => transform((currentData) => currentData),
        });
    };

    const edit = (service) => {
        setData(toFormData(service));
        setEditing(service.id);
    };

    const deleteService = (id) => {
        if (confirm('Delete this service?')) {
            destroy(route('admin.services.destroy', id));
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Services</h2>}>
            <Head title="Manage Services" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Top-level services are fixed</h3>
                        <p className="text-sm text-slate-600">
                            Pavona now uses 4 main service cards only: Photography &amp; Videography, Graphics &amp; Printing Design,
                            Make Up, and Other Services. Add detailed offers like Software Development or Sound System inside
                            a service card through <span className="font-semibold">Manage items</span>.
                        </p>
                        <InputError message={errors.title} className="mt-3" />
                    </div>

                    {editingService && (
                        <div className="glass rounded-2xl p-6 mb-6">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Edit Service</h3>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {editingService.is_fixed
                                            ? 'This is a fixed top-level category. Titles stay locked, but you can update descriptions and media.'
                                            : 'Update this service and save your changes.'}
                                    </p>
                                </div>
                                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 rounded-xl">
                                    Cancel
                                </button>
                            </div>

                            <form onSubmit={submit}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel value="Default Title" />
                                        <TextInput
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                            disabled={isEditingFixed}
                                        />
                                        <InputError message={errors.title} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Kinyarwanda Title" />
                                        <TextInput
                                            value={data.title_rw}
                                            onChange={(e) => setData('title_rw', e.target.value)}
                                            className="mt-1 block w-full"
                                            disabled={isEditingFixed}
                                        />
                                        <InputError message={errors.title_rw} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="English Title" />
                                        <TextInput
                                            value={data.title_en}
                                            onChange={(e) => setData('title_en', e.target.value)}
                                            className="mt-1 block w-full"
                                            disabled={isEditingFixed}
                                        />
                                        <InputError message={errors.title_en} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="French Title" />
                                        <TextInput
                                            value={data.title_fr}
                                            onChange={(e) => setData('title_fr', e.target.value)}
                                            className="mt-1 block w-full"
                                            disabled={isEditingFixed}
                                        />
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

                                <div className="mb-4 mt-4">
                                    <InputLabel value="Media" />
                                    <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                    <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                    <AdminMediaHint
                                        title="Services Card Fit"
                                        recommendedSize="1600 x 900 px or larger"
                                        ratio="16:9 landscape"
                                        note="This media is used on service cards and the service detail header. Keep the important subject in the center because wide cards can crop the edges."
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
                                    <PrimaryButton>Update</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {!editingService && (
                        <div className="mb-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-4 text-sm text-slate-600">
                            Hit <span className="font-semibold">Edit</span> on any card below to change its descriptions or media.
                            Use <span className="font-semibold">Manage items</span> to add services inside each category.
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <div key={service.id} className="glass rounded-2xl p-6">
                                {service.image && (
                                    <MediaPreview
                                        src={service.image}
                                        alt={service.title}
                                        className="mb-4 h-40 w-full rounded-xl object-cover"
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
                                    {service.is_fixed && (
                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                            Fixed default
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-600 mb-2">{service.description}</p>
                                <p className="text-xs text-slate-500 mb-4">
                                    RW: {service.title_rw || 'Not set'} | EN: {service.title_en || service.title || 'Not set'} | FR: {service.title_fr || 'Not set'}
                                </p>
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    {service.sub_services_count || 0} items inside
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => edit(service)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Edit</button>
                                    {!service.is_fixed && (
                                        <button onClick={() => deleteService(service.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">Delete</button>
                                    )}
                                    <Link
                                        href={route('admin.services.subservices', service.id)}
                                        className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm"
                                    >
                                        Manage items
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
