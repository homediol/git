import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';

export default function BlogIndex({ auth, posts, advertisements = [], settings }) {
    const { t } = useLocale();

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

                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {posts.data.map((post) => (
                            <Link key={post.id} href={route('blog.show', post.id)} className="surface overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                                {(post.video || post.image) && (
                                    <MediaPreview
                                        src={post.video || post.image}
                                        alt={post.title}
                                        className="w-full h-48 object-cover"
                                        imgProps={{ loading: 'lazy' }}
                                        videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                                    />
                                )}
                                <div className="p-6">
                                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{post.category}</span>
                                    <h3 className="text-lg font-semibold text-[color:var(--md-text)] mt-2">{post.title}</h3>
                                    <p className="text-sm text-slate-600 mt-3">{post.content.substring(0, 140)}...</p>
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
