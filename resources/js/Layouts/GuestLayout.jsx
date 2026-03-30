import AIChatbot from '@/Components/AIChatbot';
import PavonaLogo from '@/Components/PavonaLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemePickerButton from '@/Components/ThemePickerButton';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-transparent">
            <div>
                <Link href="/" className="flex flex-col items-center gap-2">
                    <PavonaLogo className="w-20 h-20" />
                    <span className="text-xl font-bold bg-gradient-to-r from-[color:var(--md-primary)] to-[color:var(--md-danger)] bg-clip-text text-transparent">
                        Pavona Studios
                    </span>
                </Link>
                <div className="mt-4 flex justify-center gap-3">
                    <LanguageSwitcher variant="light" />
                    <ThemePickerButton compact />
                </div>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 glass rounded-2xl shadow-2xl">
                {children}
            </div>
            <AIChatbot />
        </div>
    );
}
