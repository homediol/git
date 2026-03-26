import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function ActivityIndex({ activities = [] }) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">User Activity</h2>}>
            <Head title="User Activity" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                        {activities.length === 0 ? (
                            <p className="text-gray-600">No activity yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {activities.map((item) => (
                                    <div key={item.id} className="rounded-xl border border-white/10 bg-white/40 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{item.action}</p>
                                                <p className="text-xs text-gray-600">User: {item.user?.name || 'System'}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                                        </div>
                                        {item.meta && (
                                            <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(item.meta, null, 2)}</pre>
                                        )}
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
