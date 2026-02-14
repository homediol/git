import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function TeamsIndex({ teams, flash }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, reset, errors } = useForm({
        name: '',
        position: '',
        bio: '',
        email: '',
        phone: '',
        image: null,
        order: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            router.post(`/admin/teams/${editing.id}`, {
                _method: 'put',
                name: data.name,
                position: data.position,
                bio: data.bio,
                email: data.email,
                phone: data.phone,
                image: data.image,
                order: data.order,
            }, {
                forceFormData: true,
                onSuccess: () => { reset(); setEditing(null); }
            });
        } else {
            post('/admin/teams', {
                forceFormData: true,
                onSuccess: () => reset()
            });
        }
    };

    const handleEdit = (team) => {
        setEditing(team);
        setData({
            name: team.name,
            position: team.position,
            bio: team.bio || '',
            email: team.email || '',
            phone: team.phone || '',
            image: null,
            order: team.order,
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this team member?')) {
            router.delete(`/admin/teams/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Team</h2>}>
            <Head title="Manage Team" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <span className="text-xl">✓</span>
                            <span>{flash.success}</span>
                        </div>
                    )}
                    
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} Team Member</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full rounded-lg border-gray-300" required />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Position *</label>
                                    <input type="text" value={data.position} onChange={e => setData('position', e.target.value)} className="w-full rounded-lg border-gray-300" required />
                                    {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full rounded-lg border-gray-300" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full rounded-lg border-gray-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Bio</label>
                                <textarea value={data.bio} onChange={e => setData('bio', e.target.value)} rows="3" className="w-full rounded-lg border-gray-300"></textarea>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image</label>
                                    <input type="file" onChange={e => setData('image', e.target.files[0])} className="w-full" accept="image/*" />
                                    {editing?.image && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <img src={editing.image} alt="Current" className="w-16 h-16 object-cover rounded" />
                                            <button type="button" onClick={() => router.post(`/admin/teams/${editing.id}`, { _method: 'put', delete_image: true }, { forceFormData: true })} className="text-red-600 text-sm hover:underline">
                                                Delete Image
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Order</label>
                                    <input type="number" value={data.order} onChange={e => setData('order', e.target.value)} className="w-full rounded-lg border-gray-300" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg">
                                    {editing ? 'Update' : 'Add'} Member
                                </button>
                                {editing && (
                                    <button type="button" onClick={() => { reset(); setEditing(null); }} className="bg-gray-500 text-white px-6 py-2 rounded-lg">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4">Team Members ({teams.length})</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teams.map(team => (
                                <div key={team.id} className="glass rounded-xl p-4">
                                    {team.image && <img src={team.image} alt={team.name} className="w-full h-48 object-cover rounded-lg mb-3" />}
                                    <h4 className="font-bold text-lg">{team.name}</h4>
                                    <p className="text-purple-600 text-sm mb-2">{team.position}</p>
                                    {team.bio && <p className="text-gray-600 text-sm mb-2">{team.bio.substring(0, 100)}...</p>}
                                    {team.email && <p className="text-sm text-gray-500">📧 {team.email}</p>}
                                    {team.phone && <p className="text-sm text-gray-500">📱 {team.phone}</p>}
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => handleEdit(team)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                                        <button onClick={() => handleDelete(team.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
