import { useEffect, useRef, useState } from 'react';

function formatDateTime(value) {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleString();
}

export default function SupportChatPanel({
    title,
    subtitle,
    participantName,
    participantMeta,
    statusLabel,
    unreadCount = 0,
    messages = [],
    draft,
    onDraftChange,
    onSubmit,
    sending = false,
    emptyTitle,
    emptyBody,
    placeholder,
    disabled = false,
    footerNote,
    actionError = '',
    introSlot = null,
    headerSlot = null,
    theme = 'sky',
    onUpdateMessage = null,
    onDeleteMessage = null,
}) {
    const bottomRef = useRef(null);
    const isMidnight = theme === 'midnight';
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingDraft, setEditingDraft] = useState('');
    const [workingMessageId, setWorkingMessageId] = useState(null);

    const panelClass = isMidnight ? 'chat-panel-midnight animate-fire-entry' : 'chat-panel animate-fire-entry';
    const headerClass = isMidnight ? 'relative border-b border-white/10 px-5 py-5 sm:px-6' : 'relative border-b border-[rgba(66,133,244,0.12)] px-5 py-5 sm:px-6';
    const heroWrapClass = 'min-w-0 max-w-xl';
    const heroCardClass = isMidnight
        ? 'relative overflow-hidden rounded-[26px] border border-orange-300/20 bg-[linear-gradient(135deg,rgba(255,122,24,0.95),rgba(255,90,31,0.93)_42%,rgba(234,67,53,0.92)_100%)] px-5 py-4 text-white shadow-[0_24px_60px_rgba(234,67,53,0.3)]'
        : 'relative overflow-hidden rounded-[26px] border border-[rgba(255,109,0,0.18)] bg-[linear-gradient(135deg,rgba(255,122,24,0.95),rgba(255,90,31,0.93)_42%,rgba(234,67,53,0.92)_100%)] px-5 py-4 text-white shadow-[0_22px_54px_rgba(234,67,53,0.22)]';
    const heroCardGlowClass = isMidnight
        ? 'pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/12 blur-3xl'
        : 'pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-white/16 blur-3xl';
    const heroIconClass = isMidnight
        ? 'flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-inner shadow-white/10'
        : 'flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/12 text-white shadow-inner shadow-white/10';
    const eyebrowClass = 'text-[11px] font-bold uppercase tracking-[0.34em] text-white/80';
    const titleClass = 'mt-1 text-[1.35rem] font-black leading-tight tracking-[-0.03em] text-white sm:text-[1.5rem]';
    const subtitleClass = 'mt-2 text-sm font-medium leading-6 text-white/82';
    const metaPillClass = isMidnight
        ? 'rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur'
        : 'rounded-full border border-[color:var(--md-outline)] bg-white/92 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm';
    const statusPillClass = isMidnight
        ? 'rounded-full bg-orange-400/15 px-3 py-1.5 text-xs font-semibold text-orange-100'
        : 'rounded-full bg-[rgba(255,109,0,0.12)] px-3 py-1.5 text-xs font-semibold text-[color:var(--md-primary)]';
    const unreadCardClass = isMidnight
        ? 'rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-right shadow-[0_14px_36px_rgba(2,6,23,0.38)] backdrop-blur'
        : 'rounded-2xl border border-[rgba(66,133,244,0.18)] bg-white/92 px-4 py-3 text-right shadow-sm';
    const unreadLabelClass = isMidnight
        ? 'text-[11px] uppercase tracking-[0.25em] text-orange-200'
        : 'text-[11px] uppercase tracking-[0.25em] text-[color:var(--md-primary)]';
    const unreadValueClass = isMidnight ? 'mt-1 text-2xl font-semibold text-white' : 'mt-1 text-2xl font-semibold text-slate-900';
    const scrollClass = isMidnight
        ? 'support-chat-scroll h-[52vh] overflow-y-auto bg-[linear-gradient(180deg,rgba(255,109,0,0.08),rgba(17,24,39,0.06)_26%,rgba(66,133,244,0.08)_100%)] px-4 py-5 sm:px-6'
        : 'support-chat-scroll h-[52vh] overflow-y-auto bg-[linear-gradient(180deg,rgba(255,109,0,0.06),rgba(255,255,255,0.35)_38%,rgba(66,133,244,0.06)_100%)] px-4 py-5 sm:px-6';
    const emptyCardClass = isMidnight
        ? 'max-w-md rounded-[28px] border border-white/10 bg-slate-950/45 px-6 py-8 text-center shadow-sm backdrop-blur'
        : 'max-w-md rounded-[28px] border border-dashed border-[rgba(255,109,0,0.24)] bg-white/84 px-6 py-8 text-center shadow-sm';
    const emptyTitleClass = isMidnight ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-slate-900';
    const emptyBodyClass = isMidnight ? 'mt-3 text-sm leading-7 text-slate-300' : 'mt-3 text-sm leading-7 text-slate-600';
    const myBubbleClass = isMidnight
        ? 'bg-gradient-to-br from-[color:var(--md-primary)] via-[#ff5a1f] to-[color:var(--md-danger)] text-white shadow-[0_18px_40px_rgba(234,67,53,0.3)]'
        : 'bg-gradient-to-br from-[color:var(--md-primary)] via-[#ff5a1f] to-[color:var(--md-danger)] text-white shadow-[0_18px_40px_rgba(234,67,53,0.22)]';
    const theirBubbleClass = isMidnight
        ? 'border border-white/10 bg-slate-900/55 text-slate-100 backdrop-blur'
        : 'border border-[color:var(--md-outline)] bg-white/95 text-slate-800';
    const senderClass = isMidnight
        ? 'mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-200'
        : 'mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--md-secondary)]';
    const timestampClass = isMidnight ? 'mt-2 px-1 text-[11px] text-slate-400' : 'mt-2 px-1 text-[11px] text-slate-500';
    const footerClass = isMidnight
        ? 'border-t border-white/10 bg-slate-950/35 px-4 py-4 backdrop-blur sm:px-6'
        : 'border-t border-[rgba(66,133,244,0.12)] bg-white/82 px-4 py-4 backdrop-blur sm:px-6';
    const textareaClass = isMidnight
        ? 'block w-full rounded-[24px] border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-100 shadow-sm placeholder:text-slate-400 focus:border-[color:var(--md-secondary)] focus:ring-[rgba(66,133,244,0.3)] disabled:cursor-not-allowed disabled:opacity-60'
        : 'block w-full rounded-[24px] border border-[color:var(--md-outline)] bg-white/95 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-[color:var(--md-secondary)] focus:ring-[rgba(66,133,244,0.24)] disabled:cursor-not-allowed disabled:opacity-60';
    const footerNoteClass = isMidnight ? 'text-xs text-slate-400' : 'text-xs text-slate-500';
    const messageActionClass = isMidnight
        ? 'text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200 transition hover:text-white'
        : 'text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--md-secondary)] transition hover:text-blue-700';
    const deleteActionClass = isMidnight
        ? 'text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-300 transition hover:text-rose-100'
        : 'text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500 transition hover:text-rose-700';
    const editAreaClass = isMidnight
        ? 'mt-2 rounded-[20px] border border-white/10 bg-slate-950/40 p-3'
        : 'mt-2 rounded-[20px] border border-[rgba(255,109,0,0.18)] bg-[rgba(255,109,0,0.06)] p-3';
    const editInputClass = isMidnight
        ? 'block w-full rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-[color:var(--md-secondary)] focus:ring-[rgba(66,133,244,0.3)]'
        : 'block w-full rounded-2xl border border-[color:var(--md-outline)] bg-white px-3 py-2 text-sm text-slate-700 focus:border-[color:var(--md-secondary)] focus:ring-[rgba(66,133,244,0.24)]';

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages.length]);

    useEffect(() => {
        if (!editingMessageId) {
            return;
        }

        const activeMessage = messages.find((message) => message.id === editingMessageId);
        if (!activeMessage) {
            setEditingMessageId(null);
            setEditingDraft('');
        }
    }, [messages, editingMessageId]);

    const startEditing = (message) => {
        setEditingMessageId(message.id);
        setEditingDraft(message.body);
    };

    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditingDraft('');
    };

    const saveMessageUpdate = async (messageId) => {
        if (!onUpdateMessage || !editingDraft.trim()) {
            return;
        }

        setWorkingMessageId(messageId);

        try {
            await onUpdateMessage(messageId, editingDraft.trim());
            cancelEditing();
        } catch (error) {
            // handled by caller
        } finally {
            setWorkingMessageId(null);
        }
    };

    const removeMessage = async (messageId) => {
        if (!onDeleteMessage || !window.confirm('Delete this message?')) {
            return;
        }

        setWorkingMessageId(messageId);

        try {
            await onDeleteMessage(messageId);
            if (editingMessageId === messageId) {
                cancelEditing();
            }
        } catch (error) {
            // handled by caller
        } finally {
            setWorkingMessageId(null);
        }
    };

    return (
        <section className={panelClass}>
            <div className="chat-orb chat-orb-one" />
            <div className="chat-orb chat-orb-two" />
            <div className="chat-orb chat-orb-three" />
            <div
                className={`absolute inset-x-0 top-0 h-32 ${
                    isMidnight
                        ? 'bg-gradient-to-r from-orange-400/10 via-blue-400/10 to-red-400/10'
                        : 'bg-gradient-to-r from-orange-400/12 via-blue-400/10 to-red-400/10'
                }`}
            />

            <div className={headerClass}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className={heroWrapClass}>
                        <div className={heroCardClass}>
                            <div className={heroCardGlowClass} />
                            <div className="relative z-[1] flex items-start gap-3">
                                <div className={heroIconClass}>
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className={eyebrowClass}>{title}</p>
                                    <h3 className={titleClass}>{participantName}</h3>
                                    {subtitle && <p className={subtitleClass}>{subtitle}</p>}
                                </div>
                            </div>
                        </div>
                        {(participantMeta || statusLabel) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {participantMeta && (
                                    <span className={metaPillClass}>
                                        {participantMeta}
                                    </span>
                                )}
                                {statusLabel && (
                                    <span className={statusPillClass}>
                                        {statusLabel}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {headerSlot}
                        <div className={unreadCardClass}>
                            <p className={unreadLabelClass}>Unread</p>
                            <p className={unreadValueClass}>{unreadCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {introSlot && (
                <div className="relative z-[1] px-4 pt-4 sm:px-6">
                    {introSlot}
                </div>
            )}

            <div className={scrollClass}>
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                        <div className={emptyCardClass}>
                            <p className={emptyTitleClass}>{emptyTitle}</p>
                            <p className={emptyBodyClass}>{emptyBody}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] sm:max-w-[75%] ${message.is_mine ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div
                                        className={`rounded-[24px] px-4 py-3 shadow-sm ${
                                            message.is_mine
                                                ? myBubbleClass
                                                : theirBubbleClass
                                        }`}
                                    >
                                        {!message.is_mine && (
                                            <p className={senderClass}>
                                                {message.sender?.role === 'admin' ? 'Pavona Team' : message.sender?.name}
                                            </p>
                                        )}
                                        {editingMessageId === message.id ? (
                                            <div className={editAreaClass}>
                                                <textarea
                                                    value={editingDraft}
                                                    onChange={(event) => setEditingDraft(event.target.value)}
                                                    rows="3"
                                                    disabled={workingMessageId === message.id}
                                                    className={editInputClass}
                                                />
                                                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={cancelEditing}
                                                        disabled={workingMessageId === message.id}
                                                        className="btn-outline px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => saveMessageUpdate(message.id)}
                                                        disabled={workingMessageId === message.id || !editingDraft.trim()}
                                                        className="btn-fire px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {workingMessageId === message.id ? 'Saving...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap text-sm leading-7">{message.body}</p>
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 px-1">
                                        <p className={timestampClass}>
                                            {formatDateTime(message.created_at)}
                                            {message.edited_at ? ' • Edited' : ''}
                                        </p>
                                        {message.can_manage && editingMessageId !== message.id && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(message)}
                                                    disabled={workingMessageId === message.id}
                                                    className={messageActionClass}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMessage(message.id)}
                                                    disabled={workingMessageId === message.id}
                                                    className={deleteActionClass}
                                                >
                                                    {workingMessageId === message.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            <div className={footerClass}>
                {actionError && (
                    <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {actionError}
                    </div>
                )}
                <form onSubmit={onSubmit} className="space-y-3">
                    <textarea
                        value={draft}
                        onChange={(event) => onDraftChange(event.target.value)}
                        rows="3"
                        disabled={disabled || sending}
                        className={textareaClass}
                        placeholder={placeholder}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className={footerNoteClass}>{footerNote}</p>
                        <button
                            type="submit"
                            disabled={disabled || sending || !draft.trim()}
                            className="btn-fire disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {sending ? 'Sending...' : 'Send message'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
