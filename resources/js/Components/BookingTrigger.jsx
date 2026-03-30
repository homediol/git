import { Link } from '@inertiajs/react';
import { useState } from 'react';
import AuthRequiredModal from '@/Components/AuthRequiredModal';

export default function BookingTrigger({ auth, serviceId = null, rewardId = null, className = '', children }) {
    const [open, setOpen] = useState(false);

    const params = {};
    if (serviceId) params.service = serviceId;
    if (rewardId) params.reward = rewardId;

    const href = Object.keys(params).length > 0
        ? route('bookings.index', params)
        : route('bookings.index');

    if (auth?.user) {
        return (
            <Link href={href} className={className}>
                {children}
            </Link>
        );
    }

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className}>
                {children}
            </button>
            <AuthRequiredModal open={open} onClose={() => setOpen(false)} />
        </>
    );
}
