import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GoogleIcon from '@/Components/GoogleIcon';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useLocale } from '@/Providers/LocaleProvider';

export default function Register() {
    const { t } = useLocale();
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('auth.register.title')} />

            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[color:var(--md-primary)] to-[color:var(--md-danger)] bg-clip-text text-transparent">
                    {t('auth.register.title')}
                </h2>
                <p className="text-slate-600 text-sm mt-2">{t('auth.register.subtitle')}</p>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="username" value={t('auth.fields.username')} className="text-slate-700" />
                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('username', e.target.value)}
                        required
                    />
                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value={t('auth.fields.email')} className="text-slate-700" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="email"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="phone" value={t('auth.fields.phone')} className="text-slate-700" />
                    <TextInput
                        id="phone"
                        type="tel"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        autoComplete="tel"
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value={t('auth.fields.password')} className="text-slate-700" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value={t('auth.fields.password_confirm')} className="text-slate-700" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-6">
                    <PrimaryButton className="w-full" disabled={processing}>
                        {t('auth.register.button')}
                    </PrimaryButton>
                </div>
                <div className="my-4 flex items-center gap-3 text-xs text-gray-500">
                    <span className="h-px flex-1 bg-gray-200"></span>
                    {t('auth.or')}
                    <span className="h-px flex-1 bg-gray-200"></span>
                </div>
                <Link
                    href={route('auth.google')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                        <GoogleIcon className="h-5 w-5" />
                    </span>
                    {t('auth.register.google')}
                </Link>

                <div className="mt-4 text-center text-sm">
                    <Link
                        href={route('login')}
                        className="text-[color:var(--md-secondary)] hover:text-[color:var(--md-text)] underline"
                    >
                        {t('auth.register.login_link')}
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
