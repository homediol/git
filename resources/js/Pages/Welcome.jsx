import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
                <div className="relative flex min-h-screen flex-col items-center justify-center selection:bg-purple-500 selection:text-white">
                    <div className="relative w-full max-w-7xl px-6">
                        <header className="flex justify-between items-center py-10">
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Pavona Studio
                            </div>
                            <nav className="flex gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="glass rounded-xl px-6 py-2 text-gray-700 font-medium transition hover:shadow-xl hover:scale-105"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="glass rounded-xl px-6 py-2 text-gray-700 font-medium transition hover:shadow-xl hover:scale-105"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-6 py-2 text-white font-medium transition hover:shadow-xl hover:scale-105"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </header>

                        <main className="mt-20">
                            <div className="text-center mb-16">
                                <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                    Welcome to Pavona Studio
                                </h1>
                                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                                    A modern Single Page Application built with Laravel, Inertia.js, React, and Tailwind CSS
                                </p>
                            </div>

                            <div className="grid gap-8 lg:grid-cols-3 mb-16">
                                <div className="glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 mx-auto">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Lightning Fast</h2>
                                    <p className="text-gray-600 text-center">
                                        Experience blazing-fast page transitions with Inertia.js SPA architecture. No page reloads, just smooth navigation.
                                    </p>
                                </div>

                                <div className="glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl mb-6 mx-auto">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Beautiful Design</h2>
                                    <p className="text-gray-600 text-center">
                                        Modern glassmorphism UI with blurred backgrounds, soft gradients, and elegant animations.
                                    </p>
                                </div>

                                <div className="glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 mx-auto">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Secure & Robust</h2>
                                    <p className="text-gray-600 text-center">
                                        Built on Laravel's solid foundation with authentication, validation, and middleware intact.
                                    </p>
                                </div>
                            </div>

                            <div className="glass rounded-2xl p-12 text-center">
                                <h3 className="text-3xl font-bold mb-4 text-gray-800">Ready to Get Started?</h3>
                                <p className="text-gray-600 mb-8">Join us today and experience the future of web applications.</p>
                                <div className="flex gap-4 justify-center">
                                    {!auth.user && (
                                        <>
                                            <Link
                                                href={route('register')}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl px-8 py-3 text-white font-semibold transition hover:shadow-xl hover:scale-105"
                                            >
                                                Get Started
                                            </Link>
                                            <Link
                                                href={route('login')}
                                                className="glass rounded-xl px-8 py-3 text-gray-700 font-semibold transition hover:shadow-xl hover:scale-105"
                                            >
                                                Sign In
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </main>

                        <footer className="py-16 text-center text-sm text-gray-600">
                            <p>Built with Laravel, Inertia.js, React & Tailwind CSS</p>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}
