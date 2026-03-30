import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import MediaPreview, { isAudioFile, isVideoFile } from '@/Components/MediaPreview';

export default function AdminNotifications({ recentNotifications = [] }) {
    const { data, setData, post, put, reset, errors } = useForm({
        title_rw: '',
        title_en: '',
        title_fr: '',
        message_rw: '',
        message_en: '',
        message_fr: '',
        action_url: '',
        action_text_rw: '',
        action_text_en: '',
        action_text_fr: '',
        type: 'info',
        media: null,
        clear_media: false,
    });
    const [editingId, setEditingId] = useState(null);
    const [currentMedia, setCurrentMedia] = useState(null);

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title_rw', data.title_rw);
        formData.append('title_en', data.title_en || '');
        formData.append('title_fr', data.title_fr || '');
        formData.append('message_rw', data.message_rw || '');
        formData.append('message_en', data.message_en || '');
        formData.append('message_fr', data.message_fr || '');
        formData.append('action_url', data.action_url || '');
        formData.append('action_text_rw', data.action_text_rw || '');
        formData.append('action_text_en', data.action_text_en || '');
        formData.append('action_text_fr', data.action_text_fr || '');
        formData.append('type', data.type || 'info');
        if (data.media instanceof File) {
            formData.append('media', data.media);
        }
        if (data.clear_media) {
            formData.append('clear_media', '1');
        }

        if (editingId) {
            put(route('admin.notifications.update', editingId), {
                data: formData,
                forceFormData: true,
                onSuccess: () => handleReset(),
            });
        } else {
            post(route('admin.notifications.store'), {
                data: formData,
                forceFormData: true,
                onSuccess: () => handleReset(),
            });
        }
    };

    const handleReset = () => {
        reset();
        setEditingId(null);
        setCurrentMedia(null);
        setData('media', null);
        setData('clear_media', false);
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setCurrentMedia(item.media_url ? {
            url: item.media_url,
            type: item.media_type,
            name: item.media_name,
        } : null);
        setData({
            title_rw: item.title_rw || item.title || '',
            title_en: item.title_en || '',
            title_fr: item.title_fr || '',
            message_rw: item.message_rw || item.message || '',
            message_en: item.message_en || '',
            message_fr: item.message_fr || '',
            action_url: item.action_url || '',
            action_text_rw: item.action_text_rw || '',
            action_text_en: item.action_text_en || '',
            action_text_fr: item.action_text_fr || '',
            type: item.type || 'info',
            media: null,
            clear_media: false,
        });
    };

    const deleteNotification = (item) => {
        const confirmMessage = item.broadcast_id
            ? 'Delete this notification for all users who received it?'
            : 'Delete this notification?';
        if (!confirm(confirmMessage)) return;
        router.delete(route('admin.notifications.destroy', item.id), { preserveScroll: true });
        if (editingId === item.id) {
            handleReset();
        }
    };

    const previewSrc = useMemo(() => {
        if (data.media instanceof File) {
            return URL.createObjectURL(data.media);
        }
        if (currentMedia?.url && !data.clear_media) {
            return currentMedia.url;
        }
        return '';
    }, [data.media, currentMedia, data.clear_media]);

    const previewType = useMemo(() => {
        if (data.media instanceof File) {
            const mime = data.media.type || '';
            if (mime.startsWith('video/')) return 'video';
            if (mime.startsWith('audio/')) return 'audio';
            return 'image';
        }
        if (currentMedia?.type) {
            return currentMedia.type;
        }
        if (previewSrc) {
            if (isAudioFile(previewSrc)) return 'audio';
            if (isVideoFile(previewSrc)) return 'video';
        }
        return 'image';
    }, [data.media, currentMedia, previewSrc]);

    useEffect(() => {
        if (!(data.media instanceof File) || !previewSrc) return;
        return () => URL.revokeObjectURL(previewSrc);
    }, [data.media, previewSrc]);

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Send Notifications</h2>}>
            <Head title="Send Notifications" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingId ? 'Edit Notification' : 'Broadcast Notification'}
                            </h3>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
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
                                        <InputLabel value="Action Text (RW)" />
                                        <TextInput value={data.action_text_rw} onChange={(e) => setData('action_text_rw', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.action_text_rw} className="mt-2" />
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
                                        <InputLabel value="Action Text (EN)" />
                                        <TextInput value={data.action_text_en} onChange={(e) => setData('action_text_en', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.action_text_en} className="mt-2" />
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
                                        <InputLabel value="Action Text (FR)" />
                                        <TextInput value={data.action_text_fr} onChange={(e) => setData('action_text_fr', e.target.value)} className="mt-1 block w-full" />
                                        <InputError message={errors.action_text_fr} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <InputLabel value="Action URL" />
                                    <TextInput value={data.action_url} onChange={(e) => setData('action_url', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.action_url} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Type" />
                                    <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm">
                                        <option value="info">Info</option>
                                        <option value="success">Success</option>
                                        <option value="warning">Warning</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 rounded-2xl border border-white/20 bg-white/40 p-4">
                                <InputLabel value="Media (image, small video, or voice)" />
                                <input
                                    type="file"
                                    accept="image/*,video/*,audio/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setData('media', file);
                                        if (file) setData('clear_media', false);
                                    }}
                                    className="mt-2 text-sm text-gray-600"
                                />
                                <InputError message={errors.media} className="mt-2" />
                                {editingId && currentMedia && (
                                    <label className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={data.clear_media}
                                            onChange={(e) => setData('clear_media', e.target.checked)}
                                            className="rounded"
                                        />
                                        Remove current media
                                    </label>
                                )}
                                {previewSrc && !data.clear_media && (
                                    <MediaPreview
                                        src={previewSrc}
                                        alt="Notification media"
                                        isVideo={previewType === 'video'}
                                        isAudio={previewType === 'audio'}
                                        className={previewType === 'audio' ? 'mt-3 w-full' : 'mt-3 h-40 w-full rounded-xl object-cover'}
                                        videoProps={{ controls: true }}
                                        audioProps={{ controls: true }}
                                    />
                                )}
                                {currentMedia?.name && !data.media && !data.clear_media && (
                                    <p className="mt-2 text-xs text-gray-500">Current file: {currentMedia.name}</p>
                                )}
                            </div>
                            <div className="mt-6">
                                <PrimaryButton>{editingId ? 'Update Notification' : 'Send to All Users'}</PrimaryButton>
                            </div>
                        </form>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</h3>
                        {recentNotifications.length === 0 ? (
                            <p className="text-gray-600">No notifications sent yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentNotifications.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/40 p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-2">{item.type || 'info'}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(item)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 text-white"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteNotification(item)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        {item.media_url && (
                                            <MediaPreview
                                                src={item.media_url}
                                                alt={item.title}
                                                isVideo={item.media_type === 'video'}
                                                isAudio={item.media_type === 'audio'}
                                                className={item.media_type === 'audio' ? 'mt-3 w-full' : 'mt-3 h-40 w-full rounded-xl object-cover'}
                                                videoProps={{ controls: true }}
                                                audioProps={{ controls: true }}
                                            />
                                        )}
                                        <p className="text-xs text-gray-500 mt-2">{new Date(item.created_at).toLocaleString()}</p>
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
