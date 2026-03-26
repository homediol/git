import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ stats }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-2">Admin Dashboard</h2>
                    <p className="text-sm text-slate-600 mt-2">Monitor studio activity, content, and user rewards.</p>
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Services</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.services}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Portfolios</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.portfolios}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Contacts</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.contacts}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Posts</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.posts}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Team</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.teams}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Promotions</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.promotions}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Rewards</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.rewards}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">User Rewards</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.userRewards}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Notifications</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.notifications}</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Activity Logs</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">{stats.activities}</p>
                </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Studio Management</h3>
                        <p className="text-sm text-slate-600">Quick access to the most used admin tools.</p>
                    </div>
                    <Link
                        href={route('admin.activities')}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        View Activity
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <Link href={route('admin.services')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Manage Services</h3>
                        <p className="text-sm text-slate-600">Add, edit, or delete services</p>
                    </Link>
                    <Link href={route('admin.portfolios')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Manage Portfolio</h3>
                        <p className="text-sm text-slate-600">Curate portfolio items</p>
                    </Link>
                    <Link href={route('admin.posts')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Manage Blog Posts</h3>
                        <p className="text-sm text-slate-600">Publish studio stories</p>
                    </Link>
                    <Link href={route('admin.promotions')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Promotions</h3>
                        <p className="text-sm text-slate-600">Schedule new campaigns</p>
                    </Link>
                    <Link href={route('admin.notifications')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Send Notifications</h3>
                        <p className="text-sm text-slate-600">Broadcast announcements</p>
                    </Link>
                    <Link href={route('admin.rewards')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Rewards</h3>
                        <p className="text-sm text-slate-600">Manage reward catalog</p>
                    </Link>
                    <Link href={route('admin.contacts')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Contact Messages</h3>
                        <p className="text-sm text-slate-600">Review client inquiries</p>
                    </Link>
                    <Link href={route('admin.teams')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Our Team</h3>
                        <p className="text-sm text-slate-600">Manage team profiles</p>
                    </Link>
                    <Link href={route('admin.settings')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Site Backgrounds</h3>
                        <p className="text-sm text-slate-600">Update section visuals</p>
                    </Link>
                    <Link href={route('admin.advertisements')} className="rounded-2xl bg-white/70 p-5 hover:shadow-lg transition">
                        <h3 className="text-base font-semibold text-slate-800 mb-1">Advertisements</h3>
                        <p className="text-sm text-slate-600">Update header slider</p>
                    </Link>
                </div>
            </div>

            <div className="mt-6">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full rounded-3xl bg-slate-900 px-6 py-4 text-left text-white hover:bg-slate-800"
                >
                    <h3 className="text-lg font-semibold">Logout</h3>
                    <p className="text-sm text-white/80">Sign out from the admin panel</p>
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}
