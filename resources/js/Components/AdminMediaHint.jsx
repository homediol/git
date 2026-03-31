export default function AdminMediaHint({
    title,
    ratio,
    recommendedSize,
    note,
    className = '',
}) {
    return (
        <div className={`mt-3 rounded-2xl border border-[color:var(--md-outline)] bg-[color:var(--md-surface-alt)] px-4 py-3 text-xs text-slate-600 ${className}`.trim()}>
            <p className="font-semibold uppercase tracking-[0.18em] text-slate-900">
                {title}
            </p>
            <p className="mt-2">
                Recommended size: <span className="font-semibold text-slate-900">{recommendedSize}</span>
                {' '}<span className="text-slate-500">({ratio})</span>
            </p>
            <p className="mt-1 leading-6">
                {note}
            </p>
        </div>
    );
}
