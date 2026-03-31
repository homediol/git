import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ADMIN_IMAGE_UPLOAD_LIMIT_MB, getAdminImageUploadError } from '@/lib/adminUploadLimits';

export default function Index({ auth, settings }) {
    const [files, setFiles] = useState({
        header_bg: null,
        main_bg: null,
        footer_bg: null,
    });
    const [uploadErrors, setUploadErrors] = useState({
        header_bg: '',
        main_bg: '',
        footer_bg: '',
    });
    const [links, setLinks] = useState({
        whatsapp_url: settings.whatsapp_url || '',
        instagram_url: settings.instagram_url || '',
        facebook_url: settings.facebook_url || '',
        x_url: settings.x_url || '',
        contact_email: settings.contact_email || '',
    });

    const handleFileChange = (field) => (event) => {
        const file = event.target.files?.[0] ?? null;
        const error = getAdminImageUploadError(file);

        if (error) {
            setUploadErrors((current) => ({ ...current, [field]: error }));
            event.target.value = '';
            return;
        }

        setUploadErrors((current) => ({ ...current, [field]: '' }));
        setFiles((current) => ({ ...current, [field]: file }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (files.header_bg) formData.append('header_bg', files.header_bg);
        if (files.main_bg) formData.append('main_bg', files.main_bg);
        if (files.footer_bg) formData.append('footer_bg', files.footer_bg);
        formData.append('whatsapp_url', links.whatsapp_url);
        formData.append('instagram_url', links.instagram_url);
        formData.append('facebook_url', links.facebook_url);
        formData.append('x_url', links.x_url);
        formData.append('contact_email', links.contact_email);
        
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
            <Head title="Site Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-6">Manage Site Settings</h2>

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
                                    <input type="file" accept="image/*,video/*" onChange={handleFileChange('header_bg')} className="block w-full" />
                                    <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                    {uploadErrors.header_bg && <p className="mt-2 text-sm text-red-500">{uploadErrors.header_bg}</p>}
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
                                    <input type="file" accept="image/*,video/*" onChange={handleFileChange('main_bg')} className="block w-full" />
                                    <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                    {uploadErrors.main_bg && <p className="mt-2 text-sm text-red-500">{uploadErrors.main_bg}</p>}
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
                                    <input type="file" accept="image/*,video/*" onChange={handleFileChange('footer_bg')} className="block w-full" />
                                    <p className="mt-2 text-xs font-medium text-slate-500">Images up to {ADMIN_IMAGE_UPLOAD_LIMIT_MB}MB are supported.</p>
                                    {uploadErrors.footer_bg && <p className="mt-2 text-sm text-red-500">{uploadErrors.footer_bg}</p>}
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-xl font-bold mb-4">Footer Social URLs</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">WhatsApp URL</label>
                                            <input
                                                type="url"
                                                value={links.whatsapp_url}
                                                onChange={(e) => setLinks({ ...links, whatsapp_url: e.target.value })}
                                                placeholder="https://wa.me/2507..."
                                                className="block w-full rounded-lg border border-slate-200 px-4 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Instagram URL</label>
                                            <input
                                                type="url"
                                                value={links.instagram_url}
                                                onChange={(e) => setLinks({ ...links, instagram_url: e.target.value })}
                                                placeholder="https://instagram.com/yourhandle"
                                                className="block w-full rounded-lg border border-slate-200 px-4 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Facebook URL</label>
                                            <input
                                                type="url"
                                                value={links.facebook_url}
                                                onChange={(e) => setLinks({ ...links, facebook_url: e.target.value })}
                                                placeholder="https://facebook.com/yourpage"
                                                className="block w-full rounded-lg border border-slate-200 px-4 py-2"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">X URL</label>
                                            <input
                                                type="url"
                                                value={links.x_url}
                                                onChange={(e) => setLinks({ ...links, x_url: e.target.value })}
                                                placeholder="https://x.com/yourhandle"
                                                className="block w-full rounded-lg border border-slate-200 px-4 py-2"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2">Contact Email</label>
                                            <input
                                                type="email"
                                                value={links.contact_email}
                                                onChange={(e) => setLinks({ ...links, contact_email: e.target.value })}
                                                placeholder="info@company.com"
                                                className="block w-full rounded-lg border border-slate-200 px-4 py-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
                                    Update Settings
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
