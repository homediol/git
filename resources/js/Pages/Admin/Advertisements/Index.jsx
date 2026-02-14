import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function Index({ auth, advertisements }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        link: '',
        media: null,
        active: true,
        order: 0,
        duration: 5,
    });

    const [preview, setPreview] = useState(null);
    const [previewType, setPreviewType] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('media', file);
            const url = URL.createObjectURL(file);
            setPreview(url);
            setPreviewType(file.type.startsWith('video') ? 'video' : 'image');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingId) {
            router.post(route('admin.advertisements.update', editingId), {
                _method: 'PUT',
                title: data.title || null,
                description: data.description || null,
                link: data.link || null,
                media: data.media,
                active: data.active ? 1 : 0,
                order: data.order,
                duration: data.duration,
            }, {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setPreview(null);
                    setEditingId(null);
                },
            });
        } else {
            post(route('admin.advertisements.store'), {
                title: data.title || null,
                description: data.description || null,
                link: data.link || null,
                media: data.media,
                active: data.active ? 1 : 0,
                order: data.order,
                duration: data.duration,
            }, {
                onSuccess: () => {
                    reset();
                    setPreview(null);
                },
            });
        }
    };

    const handleEdit = (ad) => {
        setEditingId(ad.id);
        setData({
            title: ad.title || '',
            description: ad.description || '',
            link: ad.link || '',
            media: null,
            active: ad.active,
            order: ad.order,
            duration: ad.duration,
        });
        setPreview(ad.media);
        setPreviewType(ad.type);
    };

    const handleDelete = (id) => {
        if (confirm('Delete this advertisement?')) {
            router.delete(route('admin.advertisements.destroy', id));
        }
    };

    const toggleActive = (ad) => {
        router.put(route('admin.advertisements.update', ad.id), {
            ...ad,
            active: !ad.active,
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Manage Advertisements" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">Header Advertisements</h2>

                        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Add'} Advertisement</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (Optional)</label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full rounded-md border-gray-300"
                                        placeholder="Advertisement title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Link (Optional)</label>
                                    <input
                                        type="text"
                                        value={data.link}
                                        onChange={e => setData('link', e.target.value)}
                                        className="w-full rounded-md border-gray-300"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full rounded-md border-gray-300"
                                        rows="2"
                                        placeholder="Brief description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Media (Image/Video) *</label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp,video/mp4,video/webm"
                                        className="w-full"
                                        required={!editingId}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Images: jpg, png, webp | Videos: mp4, webm (max 50MB)</p>
                                    {errors.media && <p className="text-red-500 text-sm">{errors.media}</p>}
                                </div>

                                <div className="flex gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Order</label>
                                        <input
                                            type="number"
                                            value={data.order}
                                            onChange={e => setData('order', e.target.value)}
                                            className="w-24 rounded-md border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Duration (sec)</label>
                                        <input
                                            type="number"
                                            value={data.duration}
                                            onChange={e => setData('duration', e.target.value)}
                                            min="1"
                                            max="60"
                                            className="w-24 rounded-md border-gray-300"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.active}
                                                onChange={e => setData('active', e.target.checked)}
                                                className="rounded"
                                            />
                                            <span className="ml-2 text-sm">Active</span>
                                        </label>
                                    </div>
                                </div>

                                {preview && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Preview</label>
                                        <div className="w-full h-64 bg-gray-900 rounded-lg overflow-hidden">
                                            {previewType === 'video' ? (
                                                <video src={preview} controls className="w-full h-full object-contain" />
                                            ) : (
                                                <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                                >
                                    {editingId ? 'Update' : 'Add'} Advertisement
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            reset();
                                            setPreview(null);
                                        }}
                                        className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="grid gap-4">
                            {advertisements.map((ad) => (
                                <div key={ad.id} className="border rounded-lg p-4 flex items-center gap-4">
                                    <div className="w-40 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {ad.type === 'video' ? (
                                            <video src={ad.media} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={ad.media} alt={ad.title} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{ad.title || 'Untitled'}</h3>
                                        <p className="text-sm text-gray-600">{ad.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Type: {ad.type} | Order: {ad.order} | Duration: {ad.duration}s
                                            {ad.link && <> | <a href={ad.link} target="_blank" className="text-blue-600">Link</a></>}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleActive(ad)}
                                            className={`px-3 py-1 rounded text-sm ${ad.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                                        >
                                            {ad.active ? 'Active' : 'Inactive'}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(ad)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
