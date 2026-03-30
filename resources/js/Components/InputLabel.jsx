export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-semibold text-[color:var(--md-text)] mb-2 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
