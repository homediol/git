import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl shadow-2xl p-6">
                        <div className="text-gray-900">
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Welcome to Your Dashboard!
                            </h3>
                            <p className="text-gray-700">You're logged in and ready to explore.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="glass rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Fast Performance</h4>
                            <p className="text-gray-600 text-sm">Lightning-fast SPA navigation with Inertia.js</p>
                        </div>

                        <div className="glass rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Modern Design</h4>
                            <p className="text-gray-600 text-sm">Beautiful glassmorphism UI with Tailwind CSS</p>
                        </div>

                        <div className="glass rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">Secure</h4>
                            <p className="text-gray-600 text-sm">Built-in Laravel authentication and security</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
