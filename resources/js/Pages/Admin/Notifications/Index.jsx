import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function AdminNotifications({ recentNotifications = [] }) {
    const { data, setData, post, reset, errors } = useForm({
        title: '',
        message: '',
        action_url: '',
        action_text: '',
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
                            <div className="mb-4">
                                <InputLabel value="Title" />
                                <TextInput value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.title} className="mt-2" />
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Message" />
                                <textarea value={data.message} onChange={(e) => setData('message', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" required />
                                <InputError message={errors.message} className="mt-2" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Action URL" />
                                    <TextInput value={data.action_url} onChange={(e) => setData('action_url', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.action_url} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Action Text" />
                                    <TextInput value={data.action_text} onChange={(e) => setData('action_text', e.target.value)} className="mt-1 block w-full" />
                                    <InputError message={errors.action_text} className="mt-2" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <InputLabel value="Type" />
                                <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm">
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="urgent">Urgent</option>
                                </select>
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
