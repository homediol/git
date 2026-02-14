import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function BlogShow({ auth, post, settings }) {
    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title={post.title}>
                <meta name="description" content={post.content.substring(0, 160)} />
                <meta name="keywords" content={`${post.category}, blog, article`} />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link href={route('blog')} className="text-purple-600 hover:text-purple-800 mb-6 inline-block">
                        ← Back to Blog
                    </Link>

                    <div className="glass rounded-2xl overflow-hidden">
                        {post.image && (
                            <img src={post.image} alt={post.title} loading="lazy" className="w-full h-96 object-cover" />
                        )}
                        <div className="p-8">
                            <span className="text-sm text-purple-600 font-semibold uppercase">{post.category}</span>
                            <h1 className="text-4xl font-bold text-gray-800 mt-2 mb-6">{post.title}</h1>
                            <div className="text-gray-700 prose max-w-none whitespace-pre-wrap">
                                {post.content}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
