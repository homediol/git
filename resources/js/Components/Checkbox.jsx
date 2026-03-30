export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-[color:var(--md-outline-strong)] bg-[color:var(--md-surface)] text-[color:var(--md-secondary)] shadow-sm focus:ring-[color:var(--md-secondary)] focus:ring-offset-0 ' +
                className
            }
        />
    );
}
