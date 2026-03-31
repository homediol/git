import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';

export default function AdminDashboard({ stats, recentNotifications = [] }) {
    const { t } = useLocale();
    const overviewCards = [
        {
            label: 'Services',
            value: stats.services,
            href: route('admin.services'),
            helper: 'Open the service catalog',
        },
        {
            label: 'Portfolios',
            value: stats.portfolios,
            href: route('admin.portfolios'),
            helper: 'Manage portfolio entries',
        },
        {
            label: 'Contacts',
            value: stats.contacts,
            href: route('admin.contacts'),
            helper: 'Review incoming inquiries',
        },
        {
            label: 'Posts',
            value: stats.posts,
            href: route('admin.posts'),
            helper: 'Publish blog stories',
        },
        {
            label: 'Team',
            value: stats.teams,
            href: route('admin.teams'),
            helper: 'Update the About section',
        },
        {
            label: 'Promotions',
            value: stats.promotions,
            href: route('admin.promotions'),
            helper: 'Launch campaigns and banners',
        },
        {
            label: 'Rewards',
            value: stats.rewards,
            href: route('admin.rewards'),
            helper: 'Manage the reward catalog',
        },
        {
            label: 'User Rewards',
            value: stats.userRewards,
            href: route('admin.rewards'),
            helper: 'View claimed user rewards',
        },
        {
            label: 'Bookings',
            value: stats.bookings,
            href: route('admin.bookings'),
            helper: 'Open all booking requests',
        },
        {
            label: 'Pending Bookings',
            value: stats.pendingBookings,
            href: route('admin.bookings'),
            helper: 'Review waiting approvals first',
            tone: 'alert',
        },
        {
            label: 'Notifications',
            value: stats.notifications,
            href: route('admin.notifications'),
            helper: 'Broadcast announcements',
        },
        {
            label: 'Chat Threads',
            value: stats.chatThreads,
            href: route('admin.messages'),
            helper: 'Reply to live conversations',
        },
        {
            label: 'Unread Chats',
            value: stats.unreadChatMessages,
            href: route('admin.messages'),
            helper: 'Open unread inbox items',
            tone: 'alert',
        },
        {
            label: 'Activity Logs',
            value: stats.activities,
            href: route('admin.activities'),
            helper: 'Track recent admin actions',
        },
    ];
    const quickActions = [
        {
            label: 'Site Settings',
            description: 'Update backgrounds, footer social URLs, and contact email',
            href: route('admin.settings'),
        },
        {
            label: 'Advertisements',
            description: 'Update header slider',
            href: route('admin.advertisements'),
        },
    ];

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
                {overviewCards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.href}
                        className={`group rounded-3xl border p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${
                            card.tone === 'alert'
                                ? 'border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.9))] shadow-amber-100/70'
                                : 'border-white/70 bg-white/80 shadow-slate-200/60'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{card.label}</p>
                                <p className={`mt-2 text-2xl font-semibold ${card.tone === 'alert' ? 'text-amber-600' : 'text-slate-900'}`}>
                                    {card.value}
                                </p>
                            </div>
                            <span className="text-lg font-semibold text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500">
                                →
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">
                            {card.helper}
                        </p>
                    </Link>
                ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Studio Management</h3>
                        <p className="text-sm text-slate-600">Focused shortcuts that do not repeat the overview cards above.</p>
                    </div>
                    <Link
                        href={route('admin.activities')}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        View Activity
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {quickActions.map((action) => (
                        <Link key={action.label} href={action.href} className="rounded-2xl bg-white/70 p-5 transition hover:shadow-lg">
                            <h3 className="mb-1 text-base font-semibold text-slate-800">{action.label}</h3>
                            <p className="text-sm text-slate-600">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">{t('admin.notifications.title')}</h3>
                        <p className="text-sm text-slate-600 mt-1">{t('admin.notifications.subtitle')}</p>
                    </div>
                    <Link href={route('admin.notifications')} className="text-xs font-semibold text-sky-600 hover:text-sky-800">
                        {t('admin.notifications.view_all')}
                    </Link>
                </div>
                {recentNotifications.length === 0 ? (
                    <p className="text-sm text-slate-500 mt-4">{t('admin.notifications.empty')}</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {recentNotifications.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-white/60 bg-white/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{item.type}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">{item.message}</p>
                                <p className="text-[10px] text-slate-400 mt-2">{new Date(item.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
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
