import SupportChatPanel from '@/Components/SupportChatPanel';
import PublicLayout from '@/Layouts/PublicLayout';
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

export default function GuestMessagesIndex({
    thread = null,
    guestProfile,
    pollIntervalMs = 5000,
}) {
    const { auth } = usePage().props;
    const [threadState, setThreadState] = useState(thread);
    const [profileState, setProfileState] = useState(guestProfile);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        setThreadState(thread);
    }, [thread]);

    useEffect(() => {
        setProfileState(guestProfile);
    }, [guestProfile]);

    useEffect(() => {
        let isMounted = true;

        const fetchThread = async () => {
            try {
                const response = await axios.get(route('guest.messages.thread'));
                if (!isMounted) {
                    return;
                }

                setThreadState(response.data.thread);
                setProfileState(response.data.guest_profile || guestProfile);
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
    }, [guestProfile, pollIntervalMs]);

    const sendMessage = async (event) => {
        event.preventDefault();
        if (!draft.trim()) {
            return;
        }

        setSending(true);
        setFormError('');
        setActionError('');

        try {
            const response = await axios.post(route('guest.messages.store'), {
                ...profileState,
                body: draft,
            });

            setThreadState(response.data.thread);
            setProfileState(response.data.guest_profile || profileState);
            setDraft('');
        } catch (error) {
            setFormError(resolveRequestError(error, 'Could not send your message.'));
        } finally {
            setSending(false);
        }
    };

    const updateMessage = async (messageId, body) => {
        setActionError('');

        try {
            const response = await axios.post(route('guest.messages.update', messageId), {
                _method: 'put',
                body,
            });

            setThreadState(response.data.thread);
            setProfileState(response.data.guest_profile || profileState);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not update this message.'));
            throw error;
        }
    };

    const deleteMessage = async (messageId) => {
        setActionError('');

        try {
            const response = await axios.post(route('guest.messages.destroy', messageId), {
                _method: 'delete',
            });

            setThreadState(response.data.thread);
            setProfileState(response.data.guest_profile || profileState);
        } catch (error) {
            setActionError(resolveRequestError(error, 'Could not delete this message.'));
            throw error;
        }
    };

    const lastMessageAt = threadState?.messages?.length
        ? threadState.messages[threadState.messages.length - 1]?.created_at
        : threadState?.last_message_at;

    const guestIdentityValue = profileState.guest_name || profileState.guest_email || profileState.guest_phone || 'Not saved yet';

    return (
        <PublicLayout auth={auth}>
            <Head title="Guest Support Chat" />

            <div className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--md-primary)]">Guest Live Chat</p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Talk to Pavona without logging in</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Start as a guest, leave your contact details, and keep chatting with the studio team in this browser session.
                            </p>
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

                    <div className="chat-stage">
                        <div className="chat-layer mx-auto max-w-5xl">
                            <SupportChatPanel
                                theme="midnight"
                                title="Direct Support"
                                subtitle="Live polling keeps your guest conversation fresh while you stay on this page."
                                participantName="Pavona Support Team"
                                participantMeta={threadState?.assigned_admin?.name ? `Assigned admin: ${threadState.assigned_admin.name}` : 'Guest inbox'}
                                statusLabel="Guest session"
                                unreadCount={threadState?.messages?.filter((message) => !message.is_mine && !message.read_at).length || 0}
                                messages={threadState?.messages || []}
                                draft={draft}
                                onDraftChange={setDraft}
                                onSubmit={sendMessage}
                                sending={sending}
                                introSlot={
                                    <div className="mx-auto w-full max-w-3xl rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(4,10,20,0.9),rgba(17,24,39,0.88)_54%,rgba(38,24,27,0.84))] px-5 py-5 text-center shadow-[0_20px_50px_rgba(2,6,23,0.28)] backdrop-blur sm:px-6">
                                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200">Guest details</p>
                                        <h2 className="mt-3 text-2xl font-semibold text-white">Use one contact detail to start</h2>
                                        <p className="mt-3 text-sm leading-7 text-slate-300">
                                            Enter only a username, an email, or a phone number. One of these is enough for the team to identify your guest chat.
                                        </p>

                                        <div className="mt-5 grid gap-4 text-left md:grid-cols-3">
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">Username</label>
                                                <input
                                                    type="text"
                                                    value={profileState.guest_name}
                                                    onChange={(event) => setProfileState((current) => ({ ...current, guest_name: event.target.value }))}
                                                    className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-sm placeholder:text-slate-400 focus:border-[color:var(--md-secondary)] focus:ring-[rgba(66,133,244,0.3)]"
                                                    placeholder="Your username"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">Email</label>
                                                <input
                                                    type="email"
                                                    value={profileState.guest_email}
                                                    onChange={(event) => setProfileState((current) => ({ ...current, guest_email: event.target.value }))}
                                                    className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-sm placeholder:text-slate-400 focus:border-[color:var(--md-secondary)] focus:ring-[rgba(66,133,244,0.3)]"
                                                    placeholder="you@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-100">Phone</label>
                                                <input
                                                    type="text"
                                                    value={profileState.guest_phone}
                                                    onChange={(event) => setProfileState((current) => ({ ...current, guest_phone: event.target.value }))}
                                                    className="mt-2 block w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 shadow-sm placeholder:text-slate-400 focus:border-[color:var(--md-secondary)] focus:ring-[rgba(66,133,244,0.3)]"
                                                    placeholder="Phone number"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                                            <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs font-semibold text-orange-100">
                                                One field required
                                            </span>
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                                                Saved identity: {guestIdentityValue}
                                            </span>
                                        </div>

                                        {formError && (
                                            <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                                                {formError}
                                            </div>
                                        )}
                                    </div>
                                }
                                emptyTitle="Start your guest conversation"
                                emptyBody="Add one contact detail above, then send your question about bookings, design work, printing, or development."
                                placeholder="Write your message to the Pavona team..."
                                footerNote="Guest chat stays available in this browser session even without an account."
                                actionError={actionError}
                                onUpdateMessage={updateMessage}
                                onDeleteMessage={deleteMessage}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
