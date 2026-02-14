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
                    <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Blog & News
                    </h1>
                    <p className="text-center text-gray-900 text-2xl font-semibold mb-12 max-w-2xl mx-auto">
                        Stay updated with our latest articles and insights
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        {posts.data.map((post) => (
                            <Link key={post.id} href={route('blog.show', post.id)} className="glass rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all">
                                {post.image && (
                                    <img src={post.image} alt={post.title} loading="lazy" className="w-full h-48 object-cover" />
                                )}
                                <div className="p-6">
                                    <span className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold uppercase">{post.category}</span>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2 mb-3">{post.title}</h3>
                                    <p className="text-lg text-gray-900 font-semibold line-clamp-3">{post.content.substring(0, 150)}...</p>
                                    <p className="text-purple-600 mt-4 font-bold text-lg">Read More →</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {advertisements.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Partners</h2>
                            <AdCircleGrid advertisements={advertisements} />
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
