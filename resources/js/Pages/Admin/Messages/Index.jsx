import SupportChatPanel from '@/Components/SupportChatPanel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatDateTime(value) {
    if (!value) {
        return 'No activity yet';
    }

    return new Date(value).toLocaleString();
}

function resolveRequestError(error, fallback) {
    return error.response?.data?.message
        || Object.values(error.response?.data?.errors || {}).flat()[0]
        || fallback;
}

export default function AdminMessagesIndex({
    threads = [],
    activeThread = null,
    chatStats = {},
    pollIntervalMs = 5000,
}) {
    const [threadsState, setThreadsState] = useState(threads);
    const [activeThreadId, setActiveThreadId] = useState(activeThread?.id || null);
    const [activeThreadState, setActiveThreadState] = useState(activeThread);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [actionError, setActionError] = useState('');
    const unreadMessagesCount = threadsState.reduce((total, thread) => total + (thread.unread_count || 0), 0);
    const openThreadsCount = threadsState.filter((thread) => (thread.unread_count || 0) > 0).length;

    useEffect(() => {
        setThreadsState(threads);
        setActiveThreadId(activeThread?.id || null);
        setActiveThreadState(activeThread);
    }, [threads, activeThread]);

    useEffect(() => {
        let isMounted = true;

        const fetchThreads = async () => {
            try {
                const response = await axios.get(route('admin.messages.threads'));
                if (!isMounted) {
                    return;
                }

                const nextThreads = response.data.threads || [];
                setThreadsState(nextThreads);

                if (!activeThreadId && nextThreads.length > 0) {
                    const firstId = nextThreads[0].id;
                    setActiveThreadId(firstId);
                    window.history.replaceState({}, '', route('admin.messages', { thread: firstId }));
                }
            } catch (error) {
                // silent fail
            }
        };

        fetchThreads();
        const interval = setInterval(fetchThreads, pollIntervalMs);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [activeThreadId, pollIntervalMs]);

    useEffect(() => {
        if (!activeThreadId) {
            setActiveThreadState(null);
            return undefined;
        }

        let isMounted = true;

        const fetchThread = async () => {
            try {
                const response = await axios.get(route('admin.messages.show', activeThreadId));
                if (!isMounted) {
                    return;
                }

                setActiveThreadState(response.data.thread);
                setThreadsState((current) =>
                    current.map((thread) =>
                        thread.id === activeThreadId
                            ? { ...thread, unread_count: 0 }
                            : thread,
                    ),
                );
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
    }, [activeThreadId, pollIntervalMs]);

    const selectThread = (threadId) => {
        setActiveThreadId(threadId);
        window.history.replaceState({}, '', route('admin.messages', { thread: threadId }));
    };

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!draft.trim() || !activeThreadId) {
            return;
        }

        setSending(true);
        setActionError('');

        try {
            const response = await axios.post(route('admin.messages.store', activeThreadId), {
                body: draft,
            });

            setActiveThreadState(response.data.thread);
            setDraft('');

            const threadsResponse = await axios.get(route('admin.messages.threads'));
            setThreadsState(threadsResponse.data.threads || []);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not send this reply.'));
        } finally {
            setSending(false);
        }
    };

    const updateMessage = async (messageId, body) => {
        if (!activeThreadId) {
            return;
        }

        setActionError('');

        try {
            const response = await axios.post(route('admin.messages.update', {
                thread: activeThreadId,
                message: messageId,
            }), {
                _method: 'put',
                body,
            });

            setActiveThreadState(response.data.thread);

            const threadsResponse = await axios.get(route('admin.messages.threads'));
            setThreadsState(threadsResponse.data.threads || []);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not update this reply.'));
            throw error;
        }
    };

    const deleteMessage = async (messageId) => {
        if (!activeThreadId) {
            return;
        }

        setActionError('');

        try {
            const response = await axios.post(route('admin.messages.destroy', {
                thread: activeThreadId,
                message: messageId,
            }), {
                _method: 'delete',
            });

            setActiveThreadState(response.data.thread);

            const threadsResponse = await axios.get(route('admin.messages.threads'));
            setThreadsState(threadsResponse.data.threads || []);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not delete this reply.'));
            throw error;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Admin Inbox</p>
                        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Live customer conversations</h2>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            Monitor support threads, reply to users, and keep unread customer messages under control.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Threads</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{chatStats.threads || threadsState.length}</p>
                        </div>
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--md-primary)]">Unread messages</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{unreadMessagesCount}</p>
                        </div>
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--md-secondary)]">Open threads</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{openThreadsCount}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Admin Inbox" />

            <div className="chat-stage">
                <div className="chat-layer grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="chat-soft-card rounded-[30px] p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Threads</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900">Customer list</h3>
                        </div>
                        <span className="rounded-full bg-[rgba(255,109,0,0.12)] px-3 py-1.5 text-xs font-semibold text-[color:var(--md-primary)]">
                            {threadsState.length}
                        </span>
                    </div>

                    <div className="mt-5 space-y-3">
                        {threadsState.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-[rgba(255,109,0,0.2)] bg-[rgba(255,109,0,0.05)] px-4 py-5 text-sm text-slate-600">
                                No customer messages yet.
                            </div>
                        ) : (
                            threadsState.map((thread) => {
                                const isActive = thread.id === activeThreadId;

                                return (
                                    <button
                                        key={thread.id}
                                        type="button"
                                        onClick={() => selectThread(thread.id)}
                                        className={`chat-thread-card w-full px-4 py-4 text-left ${
                                            isActive
                                                ? 'chat-thread-card-active'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {thread.user?.name || 'Unknown user'}
                                                </p>
                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                    {thread.user?.email || 'No email'}
                                                </p>
                                            </div>
                                            {thread.unread_count > 0 && (
                                                <span className="rounded-full bg-[color:var(--md-primary)] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                                                    {thread.unread_count}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                                            {thread.latest_message?.body || 'No messages yet'}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <span className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                                                {thread.assigned_admin?.name || 'Unassigned'}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {formatDateTime(thread.last_message_at)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {activeThreadState ? (
                    <SupportChatPanel
                        title="Active Conversation"
                        subtitle="Polling keeps new customer messages and admin replies in sync without a page refresh."
                        participantName={activeThreadState.user?.name || 'Unknown user'}
                        participantMeta={`${activeThreadState.user?.email || 'No email'}${activeThreadState.user?.phone ? ` • ${activeThreadState.user.phone}` : ''}`}
                        statusLabel={activeThreadState.assigned_admin?.name ? `Assigned to ${activeThreadState.assigned_admin.name}` : 'Unassigned thread'}
                        unreadCount={threadsState.find((thread) => thread.id === activeThreadId)?.unread_count || 0}
                        messages={activeThreadState.messages || []}
                        draft={draft}
                        onDraftChange={setDraft}
                        onSubmit={sendMessage}
                        sending={sending}
                        emptyTitle="No messages in this thread"
                        emptyBody="Once the customer writes here, the full conversation will appear with timestamps and reply tools."
                        placeholder="Reply to this customer..."
                        footerNote="Replies are saved to the thread and the user gets an in-app notification."
                        actionError={actionError}
                        onUpdateMessage={updateMessage}
                        onDeleteMessage={deleteMessage}
                    />
                ) : (
                    <section className="chat-soft-card flex min-h-[52vh] items-center justify-center rounded-[30px] p-8 text-center">
                        <div className="max-w-lg">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Inbox ready</p>
                            <h3 className="mt-3 text-2xl font-semibold text-slate-900">Select a conversation</h3>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                                Choose a customer thread from the left to read messages, mark them as seen, and reply in real time.
                            </p>
                        </div>
                    </section>
                )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
