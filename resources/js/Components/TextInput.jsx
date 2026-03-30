import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-[color:var(--md-outline)] bg-[color:var(--md-surface)] shadow-sm text-[color:var(--md-text)] placeholder-[color:var(--md-placeholder)] focus:border-[color:var(--md-secondary)] focus:ring-[color:var(--md-secondary)] transition ' +
                className
            }
            ref={localRef}
        />
    );
});
