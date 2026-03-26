import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function AdminNotifications({ recentNotifications = [] }) {
    const { data, setData, post, reset, errors } = useForm({
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
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.notifications.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Send Notifications</h2>}>
            <Head title="Send Notifications" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Broadcast Notification</h3>
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
                            <div className="mt-6">
                                <PrimaryButton>Send to All Users</PrimaryButton>
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
                                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-sm text-gray-600 mt-1">{item.message}</p>
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
