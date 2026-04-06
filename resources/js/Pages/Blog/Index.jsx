import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';
import { getLocalizedValue } from '@/lib/i18n';

export default function BlogIndex({ auth, posts, advertisements = [], settings }) {
    const { locale, t } = useLocale();
    const dateLocale = locale === 'fr' ? 'fr-FR' : locale === 'rw' ? 'rw-RW' : 'en-US';
    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleDateString(dateLocale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    const buildExcerpt = (content) => {
        const normalized = (content ?? '').replace(/\s+/g, ' ').trim();

        if (normalized.length <= 150) {
            return normalized;
        }

        return `${normalized.slice(0, 147)}...`;
    };
    const featuredPost = posts.data?.[0] ?? null;
    const remainingPosts = featuredPost ? posts.data.slice(1) : [];

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={t('blog.meta.title')}>
                <meta name="description" content={t('blog.meta.description')} />
                <meta name="keywords" content={t('blog.meta.keywords')} />
            </Head>

            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-10">
                        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)]">
                            {t('blog.title')}
                        </h1>
                        <p className="text-slate-600 mt-3">
                            {t('blog.subtitle')}
                        </p>
                    </div>

                    {featuredPost && (
                        <Link
                            href={route('blog.show', featuredPost.id)}
                            className="surface overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 mb-8 grid lg:grid-cols-[1.2fr,0.8fr]"
                        >
                            {(featuredPost.video || featuredPost.image) && (
                                <MediaPreview
                                    src={featuredPost.video || featuredPost.image}
                                    alt={getLocalizedValue(locale, featuredPost, 'title') || featuredPost.title}
                                    className="h-64 w-full object-cover lg:h-full"
                                    imgProps={{ loading: 'lazy' }}
                                    videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                />
                            )}
                            <div className="p-6 sm:p-8 flex flex-col justify-center">
                                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    <span>{getLocalizedValue(locale, featuredPost, 'category') || featuredPost.category}</span>
                                    {formatDate(featuredPost.created_at) && <span>{formatDate(featuredPost.created_at)}</span>}
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-semibold text-[color:var(--md-text)] mt-3">
                                    {getLocalizedValue(locale, featuredPost, 'title') || featuredPost.title}
                                </h2>
                                <p className="text-slate-600 mt-4 leading-7">
                                    {buildExcerpt(getLocalizedValue(locale, featuredPost, 'content') || featuredPost.content)}
                                </p>
                                <p className="text-[color:var(--md-secondary)] mt-6 font-semibold text-sm">
                                    {t('blog.read_more')}
                                    {' ->'}
                                </p>
                            </div>
                        </Link>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {remainingPosts.map((post) => (
                            <Link key={post.id} href={route('blog.show', post.id)} className="surface overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                {(post.video || post.image) && (
                                    <MediaPreview
                                        src={post.video || post.image}
                                        alt={getLocalizedValue(locale, post, 'title') || post.title}
                                        className="w-full h-48 object-cover"
                                        imgProps={{ loading: 'lazy' }}
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <div className="p-6">
                                    <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
                                        <span>{getLocalizedValue(locale, post, 'category') || post.category}</span>
                                        {formatDate(post.created_at) && <span>{formatDate(post.created_at)}</span>}
                                    </div>
                                    <h3 className="text-lg font-semibold text-[color:var(--md-text)] mt-2">{getLocalizedValue(locale, post, 'title') || post.title}</h3>
                                    <p className="text-sm text-slate-600 mt-3">{buildExcerpt(getLocalizedValue(locale, post, 'content') || post.content)}</p>
                                    <p className="text-[color:var(--md-secondary)] mt-4 font-semibold text-sm">
                                        {t('blog.read_more')}
                                        {' ->'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-center mb-6 text-[color:var(--md-text)]">
                                {t('blog.partners')}
                            </h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
