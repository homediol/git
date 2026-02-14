import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ stats }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Services</h3>
                            <p className="text-4xl font-bold text-purple-600">{stats.services}</p>
                        </div>
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Portfolios</h3>
                            <p className="text-4xl font-bold text-pink-600">{stats.portfolios}</p>
                        </div>
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Contacts</h3>
                            <p className="text-4xl font-bold text-blue-600">{stats.contacts}</p>
                        </div>
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Posts</h3>
                            <p className="text-4xl font-bold text-indigo-600">{stats.posts}</p>
                        </div>
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-gray-600 text-sm font-semibold mb-2">Team Members</h3>
                            <p className="text-4xl font-bold text-green-600">{stats.teams}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Link href={route('admin.services')} className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Manage Services</h3>
                            <p className="text-gray-600">Add, edit, or delete services</p>
                        </Link>
                        <Link href={route('admin.portfolios')} className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Manage Portfolio</h3>
                            <p className="text-gray-600">Manage your portfolio items</p>
                        </Link>
                        <Link href={route('admin.contacts')} className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">View Contacts</h3>
                            <p className="text-gray-600">Review contact form submissions</p>
                        </Link>
                        <Link href={route('admin.posts')} className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Manage Blog Posts</h3>
                            <p className="text-gray-600">Create and manage blog articles</p>
                        </Link>
                        <Link href={route('admin.settings')} className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Site Backgrounds</h3>
                            <p className="text-gray-600">Manage header, main, and footer backgrounds</p>
                        </Link>
                        <Link href={route('admin.advertisements')} className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Advertisements</h3>
                            <p className="text-gray-600">Manage header advertisement slider</p>
                        </Link>
                        <Link href={route('admin.teams')} className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Our Team</h3>
                            <p className="text-gray-600">Manage team members</p>
                        </Link>
                    </div>

                    <div className="mt-6">
                        <Link href={route('logout')} method="post" as="button" className="glass rounded-2xl p-8 hover:shadow-2xl hover:scale-105 transition-all bg-gradient-to-r from-red-500 to-pink-500 text-white text-left w-full block">
                            <h3 className="text-2xl font-bold mb-2">🚪 Logout</h3>
                            <p className="text-white/90">Sign out from admin panel</p>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
