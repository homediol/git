import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import AdCircleGrid from '@/Components/AdCircleGrid';

export default function BlogIndex({ auth, posts, advertisements = [], settings }) {
    return (
        <PublicLayout auth={auth} settings={settings}>
            <Head title="Blog & News - Latest Articles">
                <meta name="description" content="Read our latest articles, insights, and news about web development, design, and digital trends" />
                <meta name="keywords" content="blog, articles, news, insights, web development" />
            </Head>
            
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-display text-4xl sm:text-5xl font-semibold text-center mb-4 bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent">
                        Blog & News
                    </h1>
                    <p className="text-center text-white/70 text-base sm:text-lg font-semibold mb-10 max-w-2xl mx-auto">
                        Stay updated with our latest articles and insights
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {posts.data.map((post) => (
                            <Link key={post.id} href={route('blog.show', post.id)} className="glass-dark rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                {post.image && (
                                    <img src={post.image} alt={post.title} loading="lazy" className="w-full h-48 object-cover" />
                                )}
                                <div className="p-6">
                                    <span className="text-sm uppercase tracking-[0.2em] text-sky-200/80 font-semibold">{post.category}</span>
                                    <h3 className="text-2xl font-semibold bg-gradient-to-r from-sky-200 to-indigo-200 bg-clip-text text-transparent mt-2 mb-3">{post.title}</h3>
                                    <p className="text-base sm:text-lg text-white/70 font-semibold line-clamp-3">{post.content.substring(0, 150)}...</p>
                                    <p className="text-sky-200 mt-4 font-semibold text-base sm:text-lg">Read More →</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-center mb-10 text-white/90">Our Partners</h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
