import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';

const options = [
    {
        id: 'light',
        label: 'Light Mode',
        description: 'Bright canvases, crisp cards, and an airy studio feel.',
        badge: 'Clean & airy',
    },
    {
        id: 'dark',
        label: 'Dark Mode',
        description: 'A focused night palette with deeper contrast and calmer glow.',
        badge: 'Focused & sleek',
    },
];

function PreviewCard({ theme }) {
    const isDark = theme === 'dark';

    return (
        <div
            className={`theme-option-preview p-4 ${
                isDark
                    ? 'bg-[linear-gradient(180deg,#08111f_0%,#0d1b31_52%,#050912_100%)]'
                    : 'bg-[linear-gradient(180deg,#ffffff_0%,#f3f8ff_55%,#edf5ff_100%)]'
            }`}
        >
            <div
                className={`absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl ${
                    isDark ? 'bg-sky-400/20' : 'bg-sky-300/35'
                }`}
            />
            <div
                className={`absolute bottom-0 left-0 h-24 w-24 rounded-full blur-3xl ${
                    isDark ? 'bg-orange-400/20' : 'bg-orange-300/30'
                }`}
            />
            <div
                className={`relative rounded-[18px] border p-3 backdrop-blur-xl ${
                    isDark
                        ? 'border-white/10 bg-white/5'
                        : 'border-slate-200/80 bg-white/85'
                }`}
            >
                <div className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-white/40' : 'bg-slate-300'}`} />
                    <span className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-white/30' : 'bg-slate-200'}`} />
                    <span className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-100'}`} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                    <div className={`h-3 w-20 rounded-full ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />
                    <div
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            isDark
                                ? 'bg-sky-400/15 text-sky-100'
                                : 'bg-sky-500/10 text-sky-700'
                        }`}
                    >
                        Studio
                    </div>
                </div>
                <div className="mt-4 grid gap-3">
                    <div
                        className={`rounded-2xl border p-3 ${
                            isDark
                                ? 'border-white/10 bg-white/5'
                                : 'border-slate-200/80 bg-white/90'
                        }`}
                    >
                        <div className={`h-3 w-28 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                        <div className={`mt-2 h-2.5 w-full rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                        <div className={`mt-2 h-2.5 w-4/5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div
                            className={`rounded-2xl border p-3 ${
                                isDark
                                    ? 'border-white/10 bg-white/5'
                                    : 'border-slate-200/80 bg-white/80'
                            }`}
                        >
                            <div className={`h-10 rounded-2xl ${isDark ? 'bg-white/8' : 'bg-slate-100'}`} />
                            <div className={`mt-3 h-2.5 w-12 rounded-full ${isDark ? 'bg-white/15' : 'bg-slate-200'}`} />
                        </div>
                        <div
                            className={`rounded-2xl border bg-gradient-to-br p-3 ${
                                isDark
                                    ? 'border-sky-400/20 from-sky-500/20 to-blue-400/5'
                                    : 'border-sky-200/80 from-sky-100 to-white'
                            }`}
                        >
                            <div className={`h-10 rounded-2xl ${isDark ? 'bg-white/8' : 'bg-white/75'}`} />
                            <div className={`mt-3 h-2.5 w-14 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ThemeSelectionModal({
    isOpen,
    selectedTheme = 'light',
    onSelect,
    closeable = false,
    onClose = () => {},
}) {
    return (
        <Transition appear show={isOpen}>
            <Dialog as="div" className="relative z-[120]" onClose={closeable ? onClose : () => {}}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto px-4 py-8 sm:px-6">
                    <div className="flex min-h-full items-center justify-center">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-5 scale-95"
                            enterTo="opacity-100 translate-y-0 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 scale-100"
                            leaveTo="opacity-0 translate-y-5 scale-95"
                        >
                            <DialogPanel className="theme-modal-shell w-full max-w-5xl p-6 sm:p-8">
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm">
                                                Personalize your visit
                                            </span>
                                            <DialogTitle className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                                                Choose your theme
                                            </DialogTitle>
                                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                                                Pick the look you want for the studio. We’ll save it in this browser and skip this step next time.
                                            </p>
                                        </div>
                                        {closeable && (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900"
                                                aria-label="Close theme selector"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-8 grid gap-4 lg:grid-cols-2">
                                        {options.map((option) => {
                                            const isActive = selectedTheme === option.id;

                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => onSelect(option.id)}
                                                    className={`theme-option-card w-full p-4 text-left sm:p-5 ${
                                                        isActive ? 'theme-option-card-active' : ''
                                                    }`}
                                                >
                                                    <PreviewCard theme={option.id} />
                                                    <div className="mt-5 flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="text-xl font-semibold text-slate-950">
                                                                    {option.label}
                                                                </h3>
                                                                <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                                                    {option.badge}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                {option.description}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`inline-flex min-w-[92px] justify-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                                isActive
                                                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                                                                    : 'bg-slate-900/5 text-slate-700'
                                                            }`}
                                                        >
                                                            {isActive ? 'Selected' : 'Choose'}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
