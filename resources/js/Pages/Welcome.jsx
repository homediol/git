import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen overflow-hidden text-white sky-stars">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1b2a6b]/40 via-[#0b1d3a]/30 to-transparent" />
                <div className="absolute -top-52 left-1/2 h-[420px] w-[980px] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-violet-500/60 via-purple-500/30 to-transparent blur-3xl" />
                <div className="absolute left-16 top-32 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />

                <div className="relative z-10">
                    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
                        <div className="font-display text-xl font-semibold tracking-wide text-white/90">
                            Kulikeun
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20">
                        <p className="font-display text-center text-xs sm:text-sm uppercase tracking-[0.35em] text-sky-200/70">
                            Sleek &amp; Modern
                        </p>
                        <h1 className="font-display mt-5 text-center text-4xl sm:text-5xl font-semibold bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent">
                            AI Chat Mobile App UI
                        </h1>
                        <p className="mt-4 max-w-2xl text-center text-base sm:text-lg text-white/70">
                            Explore curated AI chat experiences with a bold, glassy interface and intelligent cards
                            designed for focus, clarity, and calm.
                        </p>

                        <div className="mt-14 grid w-full gap-8 md:grid-cols-3">
                            <div className="relative flex h-full flex-col rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>09:41</span>
                                    <span className="text-white/40">LTE ▪︎ ▪︎ ▪︎</span>
                                </div>
                                <div className="mx-auto mt-4 h-2 w-24 rounded-full bg-black/40" />
                                <div className="mt-6">
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Explore</p>
                                    <div className="mt-4 space-y-3">
                                        {[
                                            { title: 'Daily Productivity', author: 'By Budar1 Rahman' },
                                            { title: 'Mindfulness & Stress', author: 'By texella' },
                                            { title: 'Career Advice', author: 'By sekolaramaal' },
                                        ].map((item) => (
                                            <div
                                                key={item.title}
                                                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                            >
                                                <p className="text-sm font-semibold text-white/80">{item.title}</p>
                                                <p className="text-xs text-white/50">{item.author}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex h-full flex-col items-center rounded-[36px] border border-white/15 bg-gradient-to-b from-white/15 via-white/5 to-transparent p-6 shadow-2xl shadow-violet-500/20 backdrop-blur-xl">
                                <div className="flex w-full items-center justify-between text-xs text-white/60">
                                    <span>09:41</span>
                                    <span className="text-white/40">LTE ▪︎ ▪︎ ▪︎</span>
                                </div>
                                <div className="mx-auto mt-4 h-2 w-24 rounded-full bg-black/40" />
                                <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-300 to-fuchsia-500 shadow-lg shadow-fuchsia-500/40 animate-float" />
                                <p className="mt-8 text-sm text-white/70">Kulikeun</p>
                                <h2 className="font-display mt-2 text-center text-3xl font-semibold text-white">
                                    Welcome back
                                </h2>
                                <h3 className="font-display text-center text-3xl font-semibold text-white">
                                    ISHIMWE
                                </h3>
                                <div className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                                    <p className="text-sm text-white/70">Tap to continue your focus session</p>
                                </div>
                            </div>

                            <div className="relative flex h-full flex-col rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>09:41</span>
                                    <span className="text-white/40">LTE ▪︎ ▪︎ ▪︎</span>
                                </div>
                                <div className="mx-auto mt-4 h-2 w-24 rounded-full bg-black/40" />
                                <div className="mt-6">
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Kulikeun 2.1</p>
                                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                        <p className="text-sm font-semibold text-white/80">
                                            How can I learn English language quickly?
                                        </p>
                                        <p className="mt-3 text-xs leading-relaxed text-white/50">
                                            Learning requires effective strategies, consistency, and motivation. Here are the
                                            steps you can try:
                                        </p>
                                        <ul className="mt-3 space-y-2 text-xs text-white/60">
                                            <li>1. Set clear goals and review daily.</li>
                                            <li>2. Use active recall and speak often.</li>
                                            <li>3. Watch short videos and mimic accents.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!auth.user && (
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href={route('register')}
                                    className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:scale-[1.02]"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
