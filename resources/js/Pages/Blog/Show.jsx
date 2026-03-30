import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import MediaPreview from '@/Components/MediaPreview';
import { useLocale } from '@/Providers/LocaleProvider';

export default function BlogShow({ auth, post, settings }) {
    const { t } = useLocale();

    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={post.title}>
                <meta name="description" content={post.content.substring(0, 160)} />
                <meta name="keywords" content={`${post.category}, blog, article`} />
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
                                alt={post.title}
                                className="w-full h-96 object-cover"
                                imgProps={{ loading: 'lazy' }}
                                videoProps={{ autoPlay: true, loop: true, muted: true, playsInline: true, preload: 'metadata' }}
                            />
                        )}
                        <div className="p-8">
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{post.category}</span>
                            <h1 className="text-3xl sm:text-4xl font-semibold text-[color:var(--md-text)] mt-2 mb-6">{post.title}</h1>
                            <div className="text-slate-600 max-w-none whitespace-pre-wrap">
                                {post.content}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
