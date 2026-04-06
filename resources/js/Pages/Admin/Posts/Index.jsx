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
    content: '',
    content_rw: '',
    content_en: '',
    content_fr: '',
    category: '',
    category_rw: '',
    category_en: '',
    category_fr: '',
    image: '',
    video: '',
    delete_image: false,
    delete_video: false,
};

const toFormData = (postItem = {}) => ({
    title: postItem.title || '',
    title_rw: postItem.title_rw || '',
    title_en: postItem.title_en || postItem.title || '',
    title_fr: postItem.title_fr || '',
    content: postItem.content || '',
    content_rw: postItem.content_rw || '',
    content_en: postItem.content_en || postItem.content || '',
    content_fr: postItem.content_fr || '',
    category: postItem.category || '',
    category_rw: postItem.category_rw || '',
    category_en: postItem.category_en || postItem.category || '',
    category_fr: postItem.category_fr || '',
    image: postItem.image || '',
    video: postItem.video || '',
    delete_image: false,
    delete_video: false,
});

export default function PostsIndex({ posts }) {
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
                content: currentData.content || '',
                content_rw: currentData.content_rw || '',
                content_en: currentData.content_en || '',
                content_fr: currentData.content_fr || '',
                category: currentData.category || '',
                category_rw: currentData.category_rw || '',
                category_en: currentData.category_en || '',
                category_fr: currentData.category_fr || '',
                delete_image: currentData.delete_image ? 1 : 0,
                delete_video: currentData.delete_video ? 1 : 0,
            };

            if (currentData.image instanceof File) {
                payload.image = currentData.image;
            }

            if (currentData.video instanceof File) {
                payload.video = currentData.video;
            }

            if (editing) {
                payload._method = 'put';
            }

            return payload;
        });

        post(editing ? route('admin.posts.update', editing) : route('admin.posts.store'), {
            forceFormData: true,
            onSuccess: () => resetForm(),
            onFinish: () => transform((currentData) => currentData),
        });
    };

    const edit = (postItem) => {
        setData(toFormData(postItem));
        setEditing(postItem.id);
    };

    const deletePost = (id) => {
        if (confirm('Delete this post?')) {
            destroy(route('admin.posts.destroy', id));
        }
    };

    const handleFeaturedMediaChange = (event) => {
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

    const handleVideoChange = (event) => {
        const file = event.target.files?.[0] ?? null;

        setData({
            ...data,
            video: file ?? '',
            delete_video: false,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.34em] text-orange-600">Admin Posts</p>
                    <h2 className="mt-2 text-3xl font-black text-slate-950">Manage blog posts</h2>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                        Update card media whenever needed and maintain localized versions for the languages used on the website.
                    </p>
                </div>
            }
        >
            <Head title="Manage Posts" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Post</h3>
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
                                    <InputLabel value="Default Content" />
                                    <textarea value={data.content} onChange={(e) => setData('content', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="6" required />
                                    <InputError message={errors.content} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Kinyarwanda Content" />
                                    <textarea value={data.content_rw} onChange={(e) => setData('content_rw', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="6" />
                                    <InputError message={errors.content_rw} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="English Content" />
                                    <textarea value={data.content_en} onChange={(e) => setData('content_en', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="6" />
                                    <InputError message={errors.content_en} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="French Content" />
                                    <textarea value={data.content_fr} onChange={(e) => setData('content_fr', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="6" />
                                    <InputError message={errors.content_fr} className="mt-2" />
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
                                <input type="file" accept="image/*,video/*" onChange={handleFeaturedMediaChange} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                <p className="mt-2 text-xs font-medium text-slate-500">Images and videos up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported for blog cards.</p>
                                <AdminMediaHint
                                    title="Blog Card Fit"
                                    recommendedSize="1600 x 900 px or larger"
                                    ratio="16:9 landscape"
                                    note="The same card media can appear on the blog list and at the top of the article page."
                                />
                                <InputError message={errors.image} className="mt-2" />
                                {data.image && typeof data.image === 'string' && (
                                    <div className="mt-3 space-y-3">
                                        <MediaPreview
                                            src={data.image}
                                            alt="Current card media"
                                            className="h-24 w-full rounded-xl object-cover"
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
                                    <p className="mt-3 text-sm text-slate-500">Selected card media: {data.image.name}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <InputLabel value="Article Video (Optional)" />
                                <input type="file" accept="video/*" onChange={handleVideoChange} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                                <p className="mt-2 text-xs font-medium text-slate-500">Upload a dedicated video only if this article needs a separate motion header.</p>
                                <AdminMediaHint
                                    title="Blog Video Fit"
                                    recommendedSize="1920 x 1080 px recommended"
                                    ratio="16:9 landscape"
                                    note="This optional video is used on the article page and can also be shown on the card when no separate card media is chosen."
                                />
                                <InputError message={errors.video} className="mt-2" />
                                {data.video && typeof data.video === 'string' && (
                                    <div className="mt-3 space-y-3">
                                        <MediaPreview
                                            src={data.video}
                                            alt="Current article video"
                                            className="h-24 w-full rounded-xl object-cover"
                                            videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                        />
                                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={data.delete_video}
                                                onChange={(e) => setData('delete_video', e.target.checked)}
                                                className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                            />
                                            Remove current article video on save
                                        </label>
                                    </div>
                                )}
                                {data.video instanceof File && (
                                    <p className="mt-3 text-sm text-slate-500">Selected article video: {data.video.name}</p>
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

                    <div className="space-y-4">
                        {posts.map((postItem) => (
                            <div key={postItem.id} className="glass rounded-2xl p-6">
                                {(postItem.video || postItem.image) && (
                                    <MediaPreview
                                        src={postItem.video || postItem.image}
                                        alt={postItem.title}
                                        className="mb-4 h-44 w-full rounded-xl object-cover"
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <span className="text-sm text-purple-600 font-semibold">{postItem.category}</span>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{postItem.title}</h3>
                                <p className="text-gray-600 mb-2 line-clamp-2">{postItem.content}</p>
                                <p className="text-xs text-slate-500 mb-2">
                                    RW: {postItem.title_rw || 'Not set'} | EN: {postItem.title_en || postItem.title || 'Not set'} | FR: {postItem.title_fr || 'Not set'}
                                </p>
                                <p className="text-xs text-slate-500 mb-4">
                                    Category RW: {postItem.category_rw || 'Not set'} | EN: {postItem.category_en || postItem.category || 'Not set'} | FR: {postItem.category_fr || 'Not set'}
                                </p>
                                <div className="flex gap-2">
                                    <button onClick={() => edit(postItem)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Edit</button>
                                    <button onClick={() => deletePost(postItem.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
