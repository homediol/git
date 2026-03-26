import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function ServicesIndex({ services }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, put, delete: destroy, reset, errors } = useForm({
        title: '',
        description: '',
        image: '',
    });

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }
        
        if (editing) {
            put(route('admin.services.update', editing), {
                data: formData,
                forceFormData: true,
                onSuccess: () => { reset(); setEditing(null); }
            });
        } else {
            post(route('admin.services.store'), {
                data: formData,
                forceFormData: true,
                onSuccess: () => reset()
            });
        }
    };

    const edit = (service) => {
        setData(service);
        setEditing(service.id);
    };

    const deleteService = (id) => {
        if (confirm('Delete this service?')) {
            destroy(route('admin.services.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Manage Services</h2>}>
            <Head title="Manage Services" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="glass rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{editing ? 'Edit' : 'Add'} Service</h3>
                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <InputLabel value="Title" />
                                <TextInput value={data.title} onChange={(e) => setData('title', e.target.value)} className="mt-1 block w-full" required />
                                <InputError message={errors.title} className="mt-2" />
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Description" />
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} className="mt-1 block w-full rounded-lg border-white/20 bg-white/50 backdrop-blur-sm" rows="3" required />
                                <InputError message={errors.description} className="mt-2" />
                            </div>
                            <div className="mb-4">
                                <InputLabel value="Image" />
                                <input type="file" accept="image/*" onChange={(e) => setData('image', e.target.files[0])} className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700" />
                                <InputError message={errors.image} className="mt-2" />
                                {data.image && typeof data.image === 'string' && <img src={data.image} alt="Preview" className="mt-2 h-20 rounded" />}
                            </div>
                            <div className="flex gap-2">
                                <PrimaryButton>{editing ? 'Update' : 'Create'}</PrimaryButton>
                                {editing && <button type="button" onClick={() => { reset(); setEditing(null); }} className="px-4 py-2 bg-gray-300 rounded-xl">Cancel</button>}
                            </div>
                        </form>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <div key={service.id} className="glass rounded-2xl p-6">
                                {service.image && (
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="mb-4 h-40 w-full rounded-xl object-cover"
                                    />
                                )}
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{service.title}</h3>
                                <p className="text-gray-600 mb-4">{service.description}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => edit(service)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Edit</button>
                                    <button onClick={() => deleteService(service.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">Delete</button>
                                    <Link
                                        href={route('admin.services.subservices', service.id)}
                                        className="px-4 py-2 bg-sky-500 text-white rounded-xl text-sm"
                                    >
                                        Sub-services
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
