import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function BlogShow({ auth, post, settings }) {
    const { locale, t } = useLocale();
    const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'rw' ? 'rw-RW' : 'en-US';
    const localizedTitle = getLocalizedValue(locale, post, 'title') || post.title;
    const localizedContent = getLocalizedValue(locale, post, 'content') || post.content;
    const localizedCategory = getLocalizedValue(locale, post, 'category') || post.category;
    const publishedDate = post.created_at
        ? new Date(post.created_at).toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : '';

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={localizedTitle}>
                <meta name="description" content={localizedContent.substring(0, 160)} />
                <meta name="keywords" content={`${localizedCategory}, blog, article`} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link href={route('blog')} className="text-[color:var(--md-secondary)] hover:underline mb-6 inline-flex font-semibold">
                        {'<- '}
                        {t('blog.back')}
                    </Link>

                    <div className="surface overflow-hidden">
                        {(post.video || post.image) && (
                            <MediaPreview
                                src={post.video || post.image}
                                alt={localizedTitle}
                                className="h-64 w-full object-cover sm:h-80 lg:h-96"
                                imgProps={{ loading: 'lazy' }}
                                videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                            />
                        )}
                        <div className="p-5 sm:p-8">
                            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                                <span>{localizedCategory}</span>
                                {publishedDate && <span>{publishedDate}</span>}
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)] mt-2 mb-6">{localizedTitle}</h1>
                            <div className="text-slate-600 max-w-none whitespace-pre-wrap leading-7">
                                {localizedContent}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
