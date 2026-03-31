import SupportChatPanel from '@/Components/SupportChatPanel';
import SupportCallButton from '@/Components/SupportCallButton';
import SupportWhatsAppButton from '@/Components/SupportWhatsAppButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatDateTime(value) {
    if (!value) {
        return 'No messages yet';
    }

    return new Date(value).toLocaleString();
}

function resolveRequestError(error, fallback) {
    return error.response?.data?.message
        || Object.values(error.response?.data?.errors || {}).flat()[0]
        || fallback;
}

export default function MessagesIndex({ thread, pollIntervalMs = 5000 }) {
    const { auth } = usePage().props;
    const [threadState, setThreadState] = useState(thread);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        setThreadState(thread);
    }, [thread]);

    useEffect(() => {
        let isMounted = true;

        const fetchThread = async () => {
            try {
                const response = await axios.get(route('messages.thread'));
                if (!isMounted) {
                    return;
                }

                setThreadState(response.data.thread);
            } catch (error) {
                // silent fail
            }
        };

        fetchThread();
        const interval = setInterval(fetchThread, pollIntervalMs);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [pollIntervalMs]);

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!draft.trim()) {
            return;
        }

        setSending(true);
        setActionError('');

        try {
            const response = await axios.post(route('messages.store'), {
                body: draft,
            });

            setThreadState(response.data.thread);
            setDraft('');
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not send your message.'));
        } finally {
            setSending(false);
        }
    };

    const updateMessage = async (messageId, body) => {
        setActionError('');

        try {
            const response = await axios.post(route('messages.update', messageId), {
                _method: 'put',
                body,
            });

            setThreadState(response.data.thread);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not update this message.'));
            throw error;
        }
    };

    const deleteMessage = async (messageId) => {
        setActionError('');

        try {
            const response = await axios.post(route('messages.destroy', messageId), {
                _method: 'delete',
            });

            setThreadState(response.data.thread);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not delete this message.'));
            throw error;
        }
    };

    const lastMessageAt = threadState?.messages?.length
        ? threadState.messages[threadState.messages.length - 1]?.created_at
        : threadState?.last_message_at;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Support Inbox</p>
                        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Chat with Pavona Studio</h2>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Send your questions directly to the studio team and receive live replies in one private thread.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <SupportWhatsAppButton
                                message="Hello Pavona admin, I need help with support messages."
                                showPhone
                            />
                            <SupportCallButton showPhone />
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--md-primary)]">Unread replies</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">
                                {threadState?.messages?.filter((message) => !message.is_mine && !message.read_at).length || 0}
                            </p>
                        </div>
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Last activity</p>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{formatDateTime(lastMessageAt)}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Support Chat" />

            <div className="chat-stage">
                <div className="chat-layer grid gap-6 xl:grid-cols-[minmax(0,1fr)_0.72fr]">
                    <SupportChatPanel
                        theme="midnight"
                        title="Direct Support"
                        subtitle="Real-time polling keeps this conversation fresh while you stay on the page."
                        participantName="Pavona Support Team"
                        participantMeta={threadState?.assigned_admin?.name ? `Assigned admin: ${threadState.assigned_admin.name}` : 'Team inbox'}
                        statusLabel="Live polling"
                        unreadCount={threadState?.messages?.filter((message) => !message.is_mine && !message.read_at).length || 0}
                        messages={threadState?.messages || []}
                        draft={draft}
                        onDraftChange={setDraft}
                        onSubmit={sendMessage}
                        sending={sending}
                        emptyTitle="Start your conversation"
                        emptyBody="Ask about bookings, rewards, creative work, or anything else you need from Pavona Studio."
                        placeholder="Write your message to the admin team..."
                        footerNote="Messages are private to your account and the Pavona admin team."
                        actionError={actionError}
                        onUpdateMessage={updateMessage}
                        onDeleteMessage={deleteMessage}
                    />

                    <aside className="space-y-6">
                        <section className="chat-soft-card rounded-[30px] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Conversation</p>
                            <h3 className="mt-3 text-2xl font-semibold text-slate-900">Private support thread</h3>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                This inbox is linked to your account, so the admin team can follow your requests, bookings,
                                and rewards without losing context.
                            </p>
                            <div className="mt-5 space-y-3">
                                <div className="chat-soft-card rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--md-secondary)]">Member</p>
                                    <p className="mt-2 text-base font-semibold text-slate-900">{auth.user.name}</p>
                                    <p className="text-sm text-slate-500">{auth.user.email}</p>
                                </div>
                                <div className="chat-soft-card rounded-2xl p-4">
                                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Thread status</p>
                                    <p className="mt-2 text-base font-semibold text-slate-900">
                                        {threadState?.assigned_admin?.name || 'Waiting for the Pavona team'}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {threadState?.assigned_admin?.email || 'Your next admin reply will appear here.'}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
