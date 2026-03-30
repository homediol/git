import { Link } from '@inertiajs/react';

export default function ChatTrigger({ auth, className = '', children }) {
    if (auth?.user?.role === 'admin') {
        return (
            <Link href={route('admin.messages')} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={() => {
                if (typeof window === 'undefined') {
                    return;
                }

                window.dispatchEvent(new CustomEvent('pavona-chat:open', {
                    detail: { mode: 'company' },
                }));
            }}
            className={className}
        >
            {children}
        </button>
    );
}
