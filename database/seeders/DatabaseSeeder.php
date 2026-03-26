<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Portfolio;
use App\Models\Post;
use App\Models\Team;
use Illuminate\Database\Seeder;
use Database\Seeders\ServiceCatalogSeeder;
use Database\Seeders\PromotionSeeder;
use Database\Seeders\RewardSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with sample data.
     * Run: php artisan db:seed
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@pavonastudios.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create regular user
        User::create([
            'name' => 'John Doe',
            'email' => 'user@pavonastudios.com',
            'password' => bcrypt('password'),
        ]);

        // Seed default services and sub-services
        $this->call(ServiceCatalogSeeder::class);
        $this->call(RewardSeeder::class);
        $this->call(PromotionSeeder::class);

        // Seed Portfolio Items - Pavona Studios Work
        $portfolios = [
            [
                'title' => 'TechStart Logo & Brand Identity',
                'description' => 'Complete brand identity package including logo design, color palette, typography, and brand guidelines for a tech startup.',
                'category' => 'Branding',
                'image' => 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
            ],
            [
                'title' => 'Corporate Event Banners',
                'description' => 'Large format roll-up banners and signage for annual corporate conference with bold graphics and clear messaging.',
                'category' => 'Large Format',
                'image' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            ],
            [
                'title' => 'Restaurant Menu & Brochures',
                'description' => 'Premium menu design and promotional brochures for upscale restaurant with elegant typography and food photography.',
                'category' => 'Print Materials',
                'image' => 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
            ],
            [
                'title' => 'Company Vehicle Branding',
                'description' => 'Full vehicle wrap design and installation for delivery fleet, transforming vans into mobile advertisements.',
                'category' => 'Vehicle Wraps',
                'image' => 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
            ],
            [
                'title' => 'Corporate Business Cards',
                'description' => 'Luxury business cards with spot UV finish and embossing for executive team, making lasting impressions.',
                'category' => 'Business Cards',
                'image' => 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
            ],
            [
                'title' => 'Team Uniform T-Shirts',
                'description' => 'Custom printed t-shirts for sports team with vibrant colors and durable prints that withstand frequent washing.',
                'category' => 'Apparel',
                'image' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
            ],
            [
                'title' => 'Product Packaging Stickers',
                'description' => 'Custom die-cut stickers for product packaging with waterproof finish and vibrant brand colors.',
                'category' => 'Stickers',
                'image' => 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800',
            ],
            [
                'title' => 'Corporate Award Plaques',
                'description' => 'Elegant award plaques with laser engraving for employee recognition program at annual company gala.',
                'category' => 'Awards',
                'image' => 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800',
            ],
            [
                'title' => 'Promotional Coffee Mugs',
                'description' => 'Custom branded ceramic mugs for corporate gifts with full-color printing and dishwasher-safe finish.',
                'category' => 'Promotional Items',
                'image' => 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800',
            ],
        ];

        foreach ($portfolios as $portfolio) {
            Portfolio::create($portfolio);
        }

        // Seed Blog Posts
        $posts = [
            [
                'title' => 'The Future of Web Development in 2024',
                'content' => "Web development continues to evolve at a rapid pace. In 2024, we're seeing exciting trends like AI-powered development tools, serverless architectures, and progressive web apps becoming mainstream.\n\nKey trends to watch:\n\n1. AI Integration: ChatGPT and similar tools are revolutionizing how we write code and solve problems.\n\n2. WebAssembly: Bringing near-native performance to web applications.\n\n3. Edge Computing: Faster response times by processing data closer to users.\n\n4. Jamstack Architecture: Static site generators combined with APIs for better performance.\n\n5. Web3 and Blockchain: Decentralized applications are gaining traction.\n\nStay ahead by continuously learning and adapting to these new technologies.",
                'category' => 'Web Development',
                'image' => 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
            ],
            [
                'title' => 'Best Practices for Mobile App Design',
                'content' => "Creating a successful mobile app requires more than just good looks. Here are essential design principles:\n\n1. Simplicity First: Keep interfaces clean and intuitive. Users should understand your app within seconds.\n\n2. Consistent Navigation: Use familiar patterns that users already know.\n\n3. Touch-Friendly Design: Buttons should be at least 44x44 pixels for easy tapping.\n\n4. Performance Matters: Optimize images and minimize loading times.\n\n5. Accessibility: Design for all users, including those with disabilities.\n\n6. Feedback: Provide visual feedback for all user actions.\n\n7. Offline Functionality: Allow users to access key features without internet.\n\nRemember, great design is invisible - it just works.",
                'category' => 'Design',
                'image' => 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
            ],
            [
                'title' => 'Laravel 11: What\'s New and Exciting',
                'content' => "Laravel 11 brings significant improvements to the framework we love:\n\n1. Streamlined Application Structure: Cleaner, more minimal default structure.\n\n2. Per-Second Rate Limiting: More granular control over API rate limits.\n\n3. Health Routing: Built-in health check endpoints for monitoring.\n\n4. Improved Queue Management: Better job batching and failure handling.\n\n5. Enhanced Testing: New testing helpers and improved assertions.\n\n6. Model Casts Improvements: More flexible attribute casting.\n\n7. Better Performance: Optimizations across the framework.\n\nUpgrading is straightforward, and the benefits are worth it. Check the official documentation for migration guides.",
                'category' => 'Laravel',
                'image' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
            ],
            [
                'title' => 'Building Scalable APIs with Laravel',
                'content' => "APIs are the backbone of modern applications. Here's how to build scalable APIs with Laravel:\n\n1. Use API Resources: Transform your models into consistent JSON responses.\n\n2. Implement Caching: Redis or Memcached for frequently accessed data.\n\n3. Rate Limiting: Protect your API from abuse.\n\n4. Versioning: Plan for API evolution from day one.\n\n5. Documentation: Use tools like Swagger or Scribe.\n\n6. Authentication: Laravel Sanctum for SPA and mobile apps.\n\n7. Testing: Comprehensive API tests ensure reliability.\n\n8. Monitoring: Track performance and errors in production.\n\nA well-designed API is a joy to use and maintain.",
                'category' => 'Laravel',
                'image' => 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
            ],
            [
                'title' => 'React vs Vue: Choosing the Right Framework',
                'content' => "Both React and Vue are excellent choices, but which one is right for your project?\n\nReact Advantages:\n- Larger ecosystem and community\n- More job opportunities\n- Backed by Facebook\n- Great for large-scale applications\n\nVue Advantages:\n- Easier learning curve\n- Better documentation\n- More opinionated (less decision fatigue)\n- Excellent for rapid development\n\nThe truth? Both are capable of building amazing applications. Choose based on:\n- Team expertise\n- Project requirements\n- Community support needs\n- Long-term maintenance considerations\n\nDon't overthink it - pick one and master it.",
                'category' => 'JavaScript',
                'image' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
            ],
            [
                'title' => 'SEO Optimization for Modern Web Apps',
                'content' => "SEO isn't just for traditional websites. Here's how to optimize your web app:\n\n1. Server-Side Rendering: Use Next.js or Nuxt.js for better crawlability.\n\n2. Meta Tags: Dynamic titles, descriptions, and Open Graph tags.\n\n3. Structured Data: Help search engines understand your content.\n\n4. Performance: Fast loading times improve rankings.\n\n5. Mobile-First: Google prioritizes mobile-friendly sites.\n\n6. Quality Content: Still the most important ranking factor.\n\n7. Internal Linking: Help search engines discover all your pages.\n\n8. XML Sitemap: Make it easy for search engines to index your site.\n\nSEO is an ongoing process, not a one-time task.",
                'category' => 'SEO',
                'image' => 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800',
            ],
        ];

        foreach ($posts as $post) {
            Post::create($post);
        }

        // Seed Team Members - Pavona Studios Team
        $teamMembers = [
            [
                'name' => 'Sarah Johnson',
                'position' => 'Creative Director',
                'bio' => 'Award-winning designer with 15+ years in graphic design and branding. Passionate about creating memorable brand identities.',
                'email' => 'sarah@pavonastudios.com',
                'phone' => '+1 (555) 123-4567',
                'image' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                'order' => 1,
            ],
            [
                'name' => 'Michael Chen',
                'position' => 'Print Production Manager',
                'bio' => 'Expert in large format printing and production management. Ensures every project meets the highest quality standards.',
                'email' => 'michael@pavonastudios.com',
                'phone' => '+1 (555) 123-4568',
                'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                'order' => 2,
            ],
            [
                'name' => 'Emily Rodriguez',
                'position' => 'Senior Graphic Designer',
                'bio' => 'Specialist in brand identity and visual communication. Creates designs that tell compelling brand stories.',
                'email' => 'emily@pavonastudios.com',
                'phone' => '+1 (555) 123-4569',
                'image' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
                'order' => 3,
            ],
            [
                'name' => 'David Kim',
                'position' => 'Vehicle Wrap Specialist',
                'bio' => 'Master of vehicle branding and wraps. Transforms vehicles into stunning mobile advertisements.',
                'email' => 'david@pavonastudios.com',
                'phone' => '+1 (555) 123-4570',
                'image' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                'order' => 4,
            ],
            [
                'name' => 'Lisa Anderson',
                'position' => 'Client Relations Manager',
                'bio' => 'Dedicated to ensuring client satisfaction and project success. Your main point of contact for all projects.',
                'email' => 'lisa@pavonastudios.com',
                'phone' => '+1 (555) 123-4571',
                'image' => 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
                'order' => 5,
            ],
            [
                'name' => 'James Wilson',
                'position' => 'Quality Control Specialist',
                'bio' => 'Meticulous attention to detail ensuring every print meets our premium quality standards.',
                'email' => 'james@pavonastudios.com',
                'phone' => '+1 (555) 123-4572',
                'image' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                'order' => 6,
            ],
        ];

        foreach ($teamMembers as $member) {
            Team::create($member);
        }

        echo "\n✅ Database seeded successfully!\n";
        echo "📧 Admin: admin@pavonastudios.com | Password: password\n";
        echo "👤 User: user@pavonastudios.com | Password: password\n\n";
    }
}
