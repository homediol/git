import { Head, Link, usePage } from '@inertiajs/react';

export default function Forbidden() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 text-white px-6">
            <Head title="Access Denied" />
            <div className="max-w-xl text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-sky-200/70">403</p>
                <h1 className="mt-4 text-3xl sm:text-4xl font-semibold">Access denied</h1>
                <p className="mt-3 text-white/70 text-base sm:text-lg">
                    You do not have permission to view this page. If you believe this is a mistake, contact the admin.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href={route('home')}
                        className="rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white/90 hover:text-white"
                    >
                        Back to Home
                    </Link>
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-xl"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white hover:shadow-xl"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
