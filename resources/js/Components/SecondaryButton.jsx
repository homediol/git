export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[color:var(--md-text)] shadow-sm transition duration-150 ease-in-out hover:bg-[color:var(--md-surface-alt)] focus:outline-none focus:ring-2 focus:ring-[color:var(--md-secondary)] focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
