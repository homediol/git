import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function PostsIndex({ posts }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, reset } = useForm({
        title: '',
        content: '',
        category: '',
        image: '',
        video: '',
    });

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('content', data.content);
        formData.append('category', data.category);
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }
        if (data.video instanceof File) {
            formData.append('video', data.video);
        }
        
        if (editing) {
            post(route('admin.posts.update', editing), {
                data: formData,
                forceFormData: true,
                onSuccess: () => { reset(); setEditing(null); }
            });
        } else {
            post(route('admin.posts.store'), {
                data: formData,
                forceFormData: true,
                onSuccess: () => reset()
            });
        }
    };

    const edit = (postItem) => {
        setData(postItem);
        setEditing(postItem.id);
    };

    const deletePost = (id) => {
        if (confirm('Delete this post?')) {
            destroy(route('admin.posts.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Blog Posts</h2>}>
            <Head title="Manage Posts" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Post</h3>
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
                                <InputLabel value="Content" />
                                <textarea value={data.content} onChange={(e) => setData('content', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="6" required />
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Image" />
                                <input type="file" accept="image/*" onChange={(e) => setData('image', e.target.files[0])} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                {data.image && typeof data.image === 'string' && <img src={data.image} alt="Preview" className="mt-2 h-20 rounded" />}
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Video (Optional)" />
                                <input type="file" accept="video/*" onChange={(e) => setData('video', e.target.files[0])} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                                {data.video && typeof data.video === 'string' && <p className="mt-2 text-sm text-gray-600">Video: {data.video.split('/').pop()}</p>}
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton>{editing ? 'Update' : 'Create'}</PrimaryButton>
                                {editing && <button type="button" onClick={() => { reset(); setEditing(null); }} className="px-4 py-2 bg-gray-300 rounded-xl">Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <div className="space-y-4">
                        {posts.map((postItem) => (
                            <div key={postItem.id} className="glass rounded-2xl p-6">
                                <span className="text-sm text-purple-600 font-semibold">{postItem.category}</span>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{postItem.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">{postItem.content}</p>
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
