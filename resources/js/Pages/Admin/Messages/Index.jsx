import SupportChatPanel from '@/Components/SupportChatPanel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTheme } from '@/Providers/ThemeProvider';
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

function buildParticipantMeta(participant = {}) {
    const items = [];

    if (participant.is_guest) {
        items.push('Guest');
    }

    if (participant.email) {
        items.push(participant.email);
    }

    if (participant.phone) {
        items.push(participant.phone);
    }

    return items.length > 0 ? items.join(' • ') : 'No contact details yet';
}

function lastReplyLabel(thread) {
    if (!thread.latest_message?.sender_role) {
        return null;
    }

    return thread.latest_message.sender_role === 'admin'
        ? 'Last reply: admin'
        : 'Last reply: customer';
}

export default function AdminMessagesIndex({
    threads = [],
    activeThread = null,
    pollIntervalMs = 5000,
}) {
    const { theme } = useTheme();
    const [threadsState, setThreadsState] = useState(threads);
    const [activeThreadId, setActiveThreadId] = useState(activeThread?.id || null);
    const [activeThreadState, setActiveThreadState] = useState(activeThread);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [deletingThreadId, setDeletingThreadId] = useState(null);
    const [actionError, setActionError] = useState('');
    const unreadMessagesCount = threadsState.reduce((total, thread) => total + (thread.unread_count || 0), 0);
    const openThreadsCount = threadsState.filter((thread) => (thread.unread_count || 0) > 0).length;

    const syncThreadsState = (nextThreads, preferredThreadId = activeThreadId) => {
        setThreadsState(nextThreads);

        if (nextThreads.length === 0) {
            setActiveThreadId(null);
            setActiveThreadState(null);
            setDraft('');
            window.history.replaceState({}, '', route('admin.messages'));
            return null;
        }

        const resolvedThreadId = preferredThreadId && nextThreads.some((thread) => thread.id === preferredThreadId)
            ? preferredThreadId
            : nextThreads[0].id;

        if (resolvedThreadId !== activeThreadId) {
            setActiveThreadId(resolvedThreadId);
            setActiveThreadState(null);
            setDraft('');
            window.history.replaceState({}, '', route('admin.messages', { thread: resolvedThreadId }));
        }

        return resolvedThreadId;
    };

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

                syncThreadsState(response.data.threads || [], activeThreadId);
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
                if (!isMounted || error.response?.status !== 404) {
                    return;
                }

                try {
                    const threadsResponse = await axios.get(route('admin.messages.threads'));
                    if (!isMounted) {
                        return;
                    }

                    syncThreadsState(threadsResponse.data.threads || [], null);
                } catch (innerError) {
                    // silent fail
                }
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
        if (threadId === activeThreadId) {
            return;
        }

        setActiveThreadId(threadId);
        setActiveThreadState(null);
        setDraft('');
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
            syncThreadsState(threadsResponse.data.threads || [], activeThreadId);
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
            syncThreadsState(threadsResponse.data.threads || [], activeThreadId);
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
            syncThreadsState(threadsResponse.data.threads || [], activeThreadId);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not delete this reply.'));
            throw error;
        }
    };

    const deleteThread = async (threadId) => {
        if (deletingThreadId || !window.confirm('Delete this conversation and all of its messages?')) {
            return;
        }

        setDeletingThreadId(threadId);
        setActionError('');

        try {
            const response = await axios.post(route('admin.messages.thread.destroy', threadId), {
                _method: 'delete',
            });

            const nextThreads = response.data.threads || [];
            const preferredThreadId = activeThreadId === threadId ? null : activeThreadId;
            syncThreadsState(nextThreads, preferredThreadId);

            if (activeThreadId === threadId) {
                setActiveThreadState(null);
                setDraft('');
            }
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not delete this thread.'));
        } finally {
            setDeletingThreadId(null);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="admin-inbox-hero flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div className="max-w-2xl">
                        <span className="inline-flex rounded-full border border-[rgba(255,109,0,0.18)] bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--md-primary)] shadow-sm backdrop-blur">
                            Admin Inbox
                        </span>
                        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl">
                            Customer threads, cleaned up and easier to manage
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                            Follow new messages, jump into active conversations fast, and remove finished threads directly from the customer list.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Threads</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{threadsState.length}</p>
                        </div>
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--md-primary)]">Unread messages</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{unreadMessagesCount}</p>
                        </div>
                        <div className="chat-stat-card px-5 py-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-[color:var(--md-secondary)]">Active inboxes</p>
                            <p className="mt-2 text-2xl font-semibold text-slate-900">{openThreadsCount}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Admin Inbox" />

            <div className="chat-stage admin-inbox-stage">
                <div className="chat-layer grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
                    <aside className="chat-soft-card rounded-[32px] p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Threads</p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-950">Customer list</h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Open any conversation or delete completed ones straight from this panel.
                                </p>
                            </div>
                            <span className="rounded-full bg-[rgba(255,109,0,0.12)] px-3.5 py-1.5 text-xs font-semibold text-[color:var(--md-primary)]">
                                {threadsState.length}
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {threadsState.length === 0 ? (
                                <div className="rounded-[26px] border border-dashed border-[rgba(255,109,0,0.2)] bg-[rgba(255,109,0,0.05)] px-5 py-6 text-sm leading-7 text-slate-600">
                                    No customer messages yet.
                                </div>
                            ) : (
                                threadsState.map((thread) => {
                                    const isActive = thread.id === activeThreadId;
                                    const participantMeta = buildParticipantMeta(thread.user);
                                    const latestReply = lastReplyLabel(thread);

                                    return (
                                        <div
                                            key={thread.id}
                                            className={`chat-thread-card admin-thread-card-shell p-4 ${
                                                isActive
                                                    ? 'chat-thread-card-active admin-thread-card-shell-active'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-sm font-semibold text-slate-950">
                                                            {thread.user?.name || 'Unknown customer'}
                                                        </p>
                                                        <span className={`admin-thread-chip ${thread.user?.is_guest ? '' : 'admin-thread-chip-cool'}`}>
                                                            {thread.user?.is_guest ? 'Guest' : 'Member'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                        {participantMeta}
                                                    </p>
                                                </div>
                                                {thread.unread_count > 0 ? (
                                                    <span className="admin-thread-unread">
                                                        {thread.unread_count} new
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-slate-400">
                                                        Seen
                                                    </span>
                                                )}
                                            </div>

                                            <p className="admin-thread-preview mt-4 text-sm leading-6 text-slate-700">
                                                {thread.latest_message?.body || 'No messages yet'}
                                            </p>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="admin-thread-chip admin-thread-chip-muted">
                                                    {thread.assigned_admin?.name ? `Assigned: ${thread.assigned_admin.name}` : 'Waiting for admin'}
                                                </span>
                                                {latestReply && (
                                                    <span className="admin-thread-chip admin-thread-chip-subtle">
                                                        {latestReply}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                                <span className="text-[11px] text-slate-400">
                                                    {formatDateTime(thread.last_message_at)}
                                                </span>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => selectThread(thread.id)}
                                                        className={`admin-thread-action ${
                                                            isActive ? 'admin-thread-action-active' : ''
                                                        }`}
                                                    >
                                                        {isActive ? 'Viewing' : 'Open'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteThread(thread.id)}
                                                        disabled={deletingThreadId === thread.id}
                                                        className="admin-thread-action admin-thread-delete disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {deletingThreadId === thread.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    {activeThreadState ? (
                        <SupportChatPanel
                            title="Active Conversation"
                            subtitle="Polling keeps new customer messages and admin replies in sync without a page refresh."
                            participantName={activeThreadState.user?.name || 'Unknown customer'}
                            participantMeta={buildParticipantMeta(activeThreadState.user)}
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
                            theme={theme === 'dark' ? 'midnight' : 'sky'}
                            headerSlot={(
                                <button
                                    type="button"
                                    onClick={() => deleteThread(activeThreadState.id)}
                                    disabled={deletingThreadId === activeThreadState.id}
                                    className="admin-thread-action admin-thread-delete disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deletingThreadId === activeThreadState.id ? 'Deleting...' : 'Delete thread'}
                                </button>
                            )}
                        />
                    ) : (
                        <section className="chat-soft-card flex min-h-[52vh] items-center justify-center rounded-[32px] p-8 text-center">
                            <div className="max-w-lg">
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Inbox ready</p>
                                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Select a conversation</h3>
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
