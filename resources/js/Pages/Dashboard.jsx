import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-2">Welcome back, {auth.user.name}</h2>
                    <p className="text-sm text-slate-600 mt-2">Manage rewards, notifications, and creative services in one place.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Free Rewards</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">3 Active</p>
                    <p className="text-xs text-slate-500 mt-1">Ready to claim</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Notifications</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">Always On</p>
                    <p className="text-xs text-slate-500 mt-1">Never miss an update</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Support</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">24/7</p>
                    <p className="text-xs text-slate-500 mt-1">Priority response</p>
                </div>
                <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-2">Active</p>
                    <p className="text-xs text-slate-500 mt-1">Account verified</p>
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 grid gap-6">
                    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60">
                        <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                        <p className="text-sm text-slate-600 mt-2">Jump back into the services you use most.</p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <Link
                                href={route('rewards.index')}
                                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 text-center"
                            >
                                View Rewards
                            </Link>
                            <Link
                                href={route('services')}
                                className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white text-center"
                            >
                                Browse Services
                            </Link>
                            <Link
                                href={route('contact')}
                                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 text-center"
                            >
                                Contact Team
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60">
                        <h3 className="text-lg font-semibold text-slate-900">Latest Activity</h3>
                        <p className="text-sm text-slate-600 mt-2">Highlights from your Pavona journey.</p>
                        <div className="mt-5 space-y-3">
                            <div className="rounded-2xl bg-white/70 p-4">
                                <p className="text-sm font-semibold text-slate-800">New promotions are live</p>
                                <p className="text-xs text-slate-500 mt-1">Check the notification bell for updates.</p>
                            </div>
                            <div className="rounded-2xl bg-white/70 p-4">
                                <p className="text-sm font-semibold text-slate-800">Rewards assigned</p>
                                <p className="text-xs text-slate-500 mt-1">Your free services are ready to claim.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60">
                    <h3 className="text-lg font-semibold text-slate-900">Account Snapshot</h3>
                    <p className="text-sm text-slate-600 mt-2">A quick overview of your studio access.</p>
                    <div className="mt-5 space-y-4">
                        <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Member</p>
                            <p className="text-base font-semibold text-slate-800 mt-1">{auth.user.name}</p>
                            <p className="text-xs text-slate-500">{auth.user.email}</p>
                        </div>
                        <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Access</p>
                            <p className="text-base font-semibold text-slate-800 mt-1">Creative Services</p>
                            <p className="text-xs text-slate-500">Photography, design, and development</p>
                        </div>
                        <div className="rounded-2xl bg-white/70 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next Step</p>
                            <p className="text-base font-semibold text-slate-800 mt-1">Claim your free rewards</p>
                            <Link href={route('rewards.index')} className="text-xs text-sky-600 hover:text-sky-800">
                                Open rewards dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
