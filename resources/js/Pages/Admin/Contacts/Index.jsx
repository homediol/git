import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function formatDateTime(value) {
    if (!value) {
        return 'Not available';
    }

    return new Date(value).toLocaleString();
}

function previewText(value, limit = 180) {
    if (!value) {
        return 'No message provided.';
    }

    return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

function StatCard({ label, value, tone = 'orange' }) {
    const toneClass = tone === 'blue'
        ? 'border-sky-200 bg-sky-50 text-sky-900'
        : 'border-orange-200 bg-orange-50 text-slate-900';

    return (
        <div className={`rounded-3xl border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${toneClass}`}>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black">{value}</p>
        </div>
    );
}

function MetaItem({ label, value, emphasize = false }) {
    return (
        <div className="rounded-2xl border border-orange-100 bg-white/90 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
            <p className={`mt-2 text-sm ${emphasize ? 'font-extrabold text-slate-950' : 'font-semibold text-slate-700'}`}>
                {value || 'Not available'}
            </p>
        </div>
    );
}

export default function ContactsIndex({ contacts = [] }) {
    const [replyingContact, setReplyingContact] = useState(null);
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        subject: '',
        message: '',
    });

    const stats = useMemo(() => ({
        total: contacts.length,
        registered: contacts.filter((contact) => Boolean(contact.matched_user)).length,
        chatReady: contacts.filter((contact) => Boolean(contact.chat_available)).length,
    }), [contacts]);

    useEffect(() => {
        if (!replyingContact) {
            reset('subject', 'message');
        }
    }, [replyingContact, reset]);

    const openReplyModal = (contact) => {
        setReplyingContact(contact);
        clearErrors();
        setData({
            subject: contact.reply_subject || 'Reply from Pavona Studio',
            message: `Hello ${contact.name},\n\nThank you for contacting Pavona Studio.\n\n`,
        });
    };

    const closeReplyModal = () => {
        setReplyingContact(null);
        clearErrors();
        reset('subject', 'message');
    };

    const sendReply = (event) => {
        event.preventDefault();

        if (!replyingContact) {
            return;
        }

        post(route('admin.contacts.reply', replyingContact.id), {
            preserveScroll: true,
            onSuccess: () => {
                closeReplyModal();
            },
        });
    };

    const openChat = (contact) => {
        router.post(route('admin.contacts.chat', contact.id));
    };

    const deleteContact = (id) => {
        if (confirm('Delete this contact message?')) {
            router.delete(route('admin.contacts.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.38em] text-orange-600">Admin Contacts</p>
                        <h2 className="mt-2 text-3xl font-black text-slate-950">Full customer details and instant follow-up</h2>
                        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-600">
                            Review contact submissions, check whether the sender already has a Pavona account,
                            and reply immediately by email or live chat.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <StatCard label="Total contacts" value={stats.total} />
                        <StatCard label="Matched accounts" value={stats.registered} tone="blue" />
                        <StatCard label="Chat ready" value={stats.chatReady} />
                    </div>
                </div>
            }
        >
            <Head title="Admin Contacts" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {contacts.length === 0 ? (
                        <div className="rounded-[2rem] border border-dashed border-orange-200 bg-white/80 px-8 py-16 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                            <p className="text-xs font-black uppercase tracking-[0.34em] text-orange-500">No contacts yet</p>
                            <h3 className="mt-3 text-2xl font-black text-slate-950">New contact requests will appear here.</h3>
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                Once customers submit the contact form, you will be able to review their details and respond from this page.
                            </p>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <section
                                key={contact.id}
                                className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.1)]"
                            >
                                <div className="border-b border-orange-100 bg-[linear-gradient(135deg,rgba(255,237,213,0.98),rgba(255,247,237,0.96)_45%,rgba(239,246,255,0.92))] px-6 py-6 sm:px-8">
                                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white">
                                                    {contact.matched_user ? 'Registered user' : 'Guest contact'}
                                                </span>
                                                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] ${
                                                    contact.chat_available
                                                        ? 'bg-sky-100 text-sky-800'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {contact.chat_available ? 'Chat available' : 'Email only'}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-2xl font-black text-slate-950">{contact.name}</h3>
                                                <p className="mt-2 text-lg font-bold text-orange-600">{contact.subject || 'Contact message'}</p>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                <MetaItem label="Email" value={contact.email} emphasize />
                                                <MetaItem label="Phone" value={contact.phone || contact.matched_user?.phone} />
                                                <MetaItem
                                                    label="Received"
                                                    value={formatDateTime(contact.created_at)}
                                                />
                                                <MetaItem
                                                    label="Account"
                                                    value={contact.matched_user ? `#${contact.matched_user.id} • ${contact.matched_user.role || 'user'}` : 'No linked account'}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 xl:justify-end">
                                            <PrimaryButton
                                                type="button"
                                                className="justify-center px-5 py-3 text-sm"
                                                onClick={() => openReplyModal(contact)}
                                            >
                                                Reply by Email
                                            </PrimaryButton>
                                            <SecondaryButton
                                                type="button"
                                                className="justify-center rounded-xl border-orange-200 px-5 py-3 text-sm font-black normal-case tracking-normal text-orange-700 hover:bg-orange-50"
                                                onClick={() => openChat(contact)}
                                                disabled={!contact.chat_available}
                                            >
                                                Open Chat
                                            </SecondaryButton>
                                            <DangerButton
                                                type="button"
                                                className="justify-center rounded-xl px-5 py-3 text-sm font-black normal-case tracking-normal"
                                                onClick={() => deleteContact(contact.id)}
                                            >
                                                Delete
                                            </DangerButton>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 px-6 py-6 sm:px-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
                                    <div className="space-y-4">
                                        <div className="rounded-[1.75rem] border border-orange-100 bg-orange-50/60 p-5">
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Customer message</p>
                                            <p className="mt-4 whitespace-pre-line text-base font-semibold leading-7 text-slate-700">
                                                {contact.message}
                                            </p>
                                        </div>

                                        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5">
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Quick reply preview</p>
                                            <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
                                                {`Subject: ${contact.reply_subject}`}
                                            </p>
                                            <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                                                Reply directly from this page and the sender can answer back to your admin email.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-orange-500">Account details</p>
                                            {contact.matched_user ? (
                                                <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
                                                    <p><span className="font-black text-slate-950">Name:</span> {contact.matched_user.name}</p>
                                                    <p><span className="font-black text-slate-950">Username:</span> {contact.matched_user.username || 'Not set'}</p>
                                                    <p><span className="font-black text-slate-950">Email:</span> {contact.matched_user.email}</p>
                                                    <p><span className="font-black text-slate-950">Phone:</span> {contact.matched_user.phone || 'Not provided'}</p>
                                                    <p><span className="font-black text-slate-950">Role:</span> {contact.matched_user.role || 'user'}</p>
                                                    <p><span className="font-black text-slate-950">Joined:</span> {formatDateTime(contact.matched_user.created_at)}</p>
                                                </div>
                                            ) : (
                                                <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                                                    No Pavona account was matched to this email yet. You can still respond immediately by email.
                                                </p>
                                            )}
                                        </div>

                                        <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                                            <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-600">Chat status</p>
                                            {contact.matched_thread ? (
                                                <div className="mt-4 space-y-3 text-sm text-slate-700">
                                                    <p className="font-semibold">
                                                        <span className="font-black text-slate-950">Thread:</span> #{contact.matched_thread.id}
                                                    </p>
                                                    <p className="font-semibold">
                                                        <span className="font-black text-slate-950">Last activity:</span> {formatDateTime(contact.matched_thread.last_message_at)}
                                                    </p>
                                                    <p className="font-semibold">
                                                        <span className="font-black text-slate-950">Assigned admin:</span> {contact.matched_thread.assigned_admin || 'Not assigned'}
                                                    </p>
                                                    <p className="text-sm font-medium leading-7 text-slate-600">
                                                        {previewText(contact.matched_thread.latest_message)}
                                                    </p>
                                                </div>
                                            ) : contact.chat_available ? (
                                                <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
                                                    This contact matches a registered account. Use <span className="font-black text-slate-950">Open Chat</span> to create a thread and respond right away.
                                                </p>
                                            ) : (
                                                <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                                                    Live chat is not ready for this contact yet because there is no linked account or previous chat thread.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))
                    )}
                </div>
            </div>

            <Modal show={Boolean(replyingContact)} onClose={closeReplyModal} maxWidth="2xl">
                <form onSubmit={sendReply} className="space-y-6 p-6 sm:p-8">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.35em] text-orange-500">Email Reply</p>
                        <h3 className="mt-2 text-2xl font-black text-slate-950">
                            {replyingContact ? `Reply to ${replyingContact.name}` : 'Reply to contact'}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                            This email will be sent directly from Pavona Studio and the customer can reply back to your admin email.
                        </p>
                    </div>

                    {replyingContact && (
                        <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/70 px-5 py-4">
                            <p className="text-sm font-bold text-slate-700">{replyingContact.email}</p>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Original request: {replyingContact.subject || 'Contact message'}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-black text-slate-900">Subject</label>
                        <input
                            type="text"
                            value={data.subject}
                            onChange={(event) => setData('subject', event.target.value)}
                            className="mt-2 block w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-orange-400 focus:ring-orange-400"
                        />
                        <InputError className="mt-2" message={errors.subject} />
                    </div>

                    <div>
                        <label className="text-sm font-black text-slate-900">Message</label>
                        <textarea
                            rows="9"
                            value={data.message}
                            onChange={(event) => setData('message', event.target.value)}
                            className="mt-2 block w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-orange-400 focus:ring-orange-400"
                        />
                        <InputError className="mt-2" message={errors.message} />
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <SecondaryButton
                            type="button"
                            className="justify-center rounded-xl border-orange-200 px-5 py-3 text-sm font-black normal-case tracking-normal text-slate-700"
                            onClick={closeReplyModal}
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            className="justify-center px-5 py-3 text-sm"
                            disabled={processing}
                        >
                            {processing ? 'Sending...' : 'Send Reply'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
