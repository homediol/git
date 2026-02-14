import ApplicationLogo from '@/Components/ApplicationLogo';
import AIChatbot from '@/Components/AIChatbot';
import PavonaLogo from '@/Components/PavonaLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
            <div>
                <Link href="/" className="flex flex-col items-center gap-2">
                    <PavonaLogo className="w-20 h-20" />
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Pavona Studios</span>
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 glass rounded-2xl shadow-2xl">
                {children}
            </div>
            <AIChatbot />
        </div>
    );
}
