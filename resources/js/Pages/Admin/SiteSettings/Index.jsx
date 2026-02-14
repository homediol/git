import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, settings }) {
    const [files, setFiles] = useState({
        header_bg: null,
        main_bg: null,
        footer_bg: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (files.header_bg) formData.append('header_bg', files.header_bg);
        if (files.main_bg) formData.append('main_bg', files.main_bg);
        if (files.footer_bg) formData.append('footer_bg', files.footer_bg);
        
        router.post(route('admin.settings.update'), formData);
    };

    const handleDelete = (type) => {
        if (confirm('Delete this background?')) {
            router.delete(route('admin.settings.delete'), {
                data: { type },
            });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Site Backgrounds" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Manage Site Backgrounds</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Header Background */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Header Background (Image/Video)</label>
                                    {settings.header_bg && (
                                        <div className="mb-2">
                                            {settings.header_bg.match(/\.(mp4|webm|avi|mov)$/i) ? (
                                                <video src={`/storage/${settings.header_bg}`} className="h-32 object-cover rounded" muted loop autoPlay />
                                            ) : (
                                                <img src={`/storage/${settings.header_bg}`} alt="Header" className="h-32 object-cover rounded" />
                                            )}
                                            <button type="button" onClick={() => handleDelete('header_bg')} className="text-red-600 text-sm mt-1">Delete</button>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*,video/*" onChange={(e) => setFiles({...files, header_bg: e.target.files[0]})} className="block w-full" />
                                </div>

                                {/* Main Background */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Main Background (Image/Video)</label>
                                    {settings.main_bg && (
                                        <div className="mb-2">
                                            {settings.main_bg.match(/\.(mp4|webm|avi|mov)$/i) ? (
                                                <video src={`/storage/${settings.main_bg}`} className="h-32 object-cover rounded" muted loop autoPlay />
                                            ) : (
                                                <img src={`/storage/${settings.main_bg}`} alt="Main" className="h-32 object-cover rounded" />
                                            )}
                                            <button type="button" onClick={() => handleDelete('main_bg')} className="text-red-600 text-sm mt-1">Delete</button>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*,video/*" onChange={(e) => setFiles({...files, main_bg: e.target.files[0]})} className="block w-full" />
                                </div>

                                {/* Footer Background */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Footer Background (Image/Video)</label>
                                    {settings.footer_bg && (
                                        <div className="mb-2">
                                            {settings.footer_bg.match(/\.(mp4|webm|avi|mov)$/i) ? (
                                                <video src={`/storage/${settings.footer_bg}`} className="h-32 object-cover rounded" muted loop autoPlay />
                                            ) : (
                                                <img src={`/storage/${settings.footer_bg}`} alt="Footer" className="h-32 object-cover rounded" />
                                            )}
                                            <button type="button" onClick={() => handleDelete('footer_bg')} className="text-red-600 text-sm mt-1">Delete</button>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*,video/*" onChange={(e) => setFiles({...files, footer_bg: e.target.files[0]})} className="block w-full" />
                                </div>

                                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                                    Update Backgrounds
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
