import { Head, Link, usePage } from '@inertiajs/react';

export default function Forbidden() {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent text-[color:var(--md-text)] px-6">
            <Head title="Access Denied" />
            <div className="max-w-xl text-center surface p-8">
                <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--md-secondary)]">403</p>
                <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">Access denied</h1>
                <p className="mt-3 text-slate-600 text-base sm:text-lg">
                    You do not have permission to view this page. If you believe this is a mistake, contact the admin.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                        href={route('home')}
                        className="btn-outline"
                    >
                        Back to Home
                    </Link>
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="btn-primary"
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="btn-primary"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
