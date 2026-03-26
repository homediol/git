import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash = {}, errors = {} } = usePage().props;
    const hasValidationErrors = Object.keys(errors || {}).length > 0;
    const errorList = hasValidationErrors ? Object.values(errors).flat() : [];
    const message = flash.success || flash.error || (hasValidationErrors ? 'Please check the form and try again.' : null);
    const type = flash.success ? 'success' : 'error';
    const [visible, setVisible] = useState(Boolean(message));

    useEffect(() => {
        setVisible(Boolean(message));
    }, [message]);

    if (!message || !visible) return null;

    const baseClasses = 'rounded-xl border px-4 py-3 text-sm backdrop-blur flex items-start justify-between gap-4';
    const styles =
        type === 'success'
            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
            : 'border-rose-400/30 bg-rose-500/10 text-rose-100';

    return (
        <div className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`${baseClasses} ${styles}`} role="alert">
                <div className="space-y-2">
                    <p className="font-semibold">{message}</p>
                    {hasValidationErrors && errorList.length > 0 && (
                        <ul className="list-disc pl-4 text-sm text-white/80">
                            {errorList.map((err, index) => (
                                <li key={`${err}-${index}`}>{err}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="text-xs uppercase tracking-wide text-white/70 hover:text-white"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
