import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function ContactsIndex({ contacts }) {
    const deleteContact = (id) => {
        if (confirm('Delete this contact?')) {
            router.delete(route('admin.contacts.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Contact Messages</h2>}>
            <Head title="Contact Messages" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="space-y-4">
                        {contacts.map((contact) => (
                            <div key={contact.id} className="glass rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{contact.name}</h3>
                                        <p className="text-gray-600">{contact.email}</p>
                                    </div>
                                    <button onClick={() => deleteContact(contact.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm">Delete</button>
                                </div>
                                <p className="text-lg font-semibold text-gray-700 mb-2">{contact.subject}</p>
                                <p className="text-gray-600">{contact.message}</p>
                                <p className="text-sm text-gray-500 mt-4">{new Date(contact.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
