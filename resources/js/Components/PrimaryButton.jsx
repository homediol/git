export default function PrimaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                `btn-primary focus:outline-none focus:ring-2 focus:ring-[color:var(--md-secondary)] focus:ring-offset-2 active:scale-95 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
