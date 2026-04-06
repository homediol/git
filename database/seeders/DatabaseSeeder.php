<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Team;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with sample data.
     * Run: php artisan db:seed
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@pavonastudios.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'phone' => '+250788000000',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        // Create regular user
        User::updateOrCreate(
            ['email' => 'user@pavonastudios.com'],
            [
                'name' => 'John Doe',
                'username' => 'johndoe',
                'phone' => '+250788111111',
                'password' => bcrypt('password'),
            ]
        );

        // Seed default services and sub-services
        $this->call(ServiceCatalogSeeder::class);
        $this->call(RewardSeeder::class);
        $this->call(PromotionSeeder::class);
        $this->call(PromotionCampaignDemoSeeder::class);
        $this->call(PortfolioShowcaseSeeder::class);
        $this->call(BlogContentSeeder::class);

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
            Team::updateOrCreate(
                ['email' => $member['email']],
                $member
            );
        }

        echo "\n✅ Database seeded successfully!\n";
        echo "📧 Admin: admin@pavonastudios.com | Password: password\n";
        echo "👤 User: user@pavonastudios.com | Password: password\n\n";
    }
}
