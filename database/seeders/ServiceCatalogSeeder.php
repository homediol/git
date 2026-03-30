<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ServiceCatalogSeeder extends Seeder
{
    /**
     * Seed the service catalog with default services and sub-services.
     */
    public function run(): void
    {
        $hasServiceKey = Schema::hasColumn('services', 'service_key');

        $services = [
            [
                'key' => 'photography-videography',
                'title' => 'Photography & Videography',
                'description' => 'Capture weddings, maternity sessions, birthdays, graduations, funerals, live streams, and brand stories with polished visuals and creative storytelling.',
                'image' => 'https://source.unsplash.com/1200x800/?photography,camera',
                'sub_services' => [
                    [
                        'title' => 'Wedding',
                        'description' => 'Full wedding coverage with photo and video highlights.',
                        'image' => 'https://source.unsplash.com/1200x800/?wedding,photography',
                    ],
                    [
                        'title' => 'Maternity Sessions',
                        'description' => 'Warm and elegant maternity sessions that preserve every milestone beautifully.',
                        'image' => 'https://source.unsplash.com/1200x800/?maternity,photography',
                    ],
                    [
                        'title' => 'Birthdays',
                        'aliases' => ['Birthday', 'Birthday Sessions'],
                        'description' => 'Event photography and highlight videos for birthdays and celebrations.',
                        'image' => 'https://source.unsplash.com/1200x800/?birthday,party',
                    ],
                    [
                        'title' => 'Graduation Sessions',
                        'description' => 'Graduation portraits and event coverage that celebrate every achievement.',
                        'image' => 'https://source.unsplash.com/1200x800/?graduation,portrait',
                    ],
                    [
                        'title' => 'Save the Date Sessions',
                        'description' => 'Stylish save the date photo and video sessions for couples and special announcements.',
                        'image' => 'https://source.unsplash.com/1200x800/?couple,engagement',
                    ],
                    [
                        'title' => 'Adventure Sessions',
                        'description' => 'Outdoor and destination sessions designed for bold stories and scenic memories.',
                        'image' => 'https://source.unsplash.com/1200x800/?adventure,photography',
                    ],
                    [
                        'title' => 'Personal Sessions',
                        'description' => 'Personal portraits for lifestyle, branding, and individual storytelling.',
                        'image' => 'https://source.unsplash.com/1200x800/?portrait,photography',
                    ],
                    [
                        'title' => 'Drone Services',
                        'description' => 'Aerial photo and video coverage for events, campaigns, and cinematic reveals.',
                        'image' => 'https://source.unsplash.com/1200x800/?drone,aerial',
                    ],
                    [
                        'title' => 'Real Estate',
                        'aliases' => ['Real Estate Coverage'],
                        'description' => 'Property photography and walkthrough videos for homes, rentals, and developments.',
                        'image' => 'https://source.unsplash.com/1200x800/?real-estate,interior',
                    ],
                    [
                        'title' => 'Funerals',
                        'aliases' => ['Funeral', 'Funeral Coverage'],
                        'description' => 'Respectful photo and video coverage for funerals and memorial gatherings.',
                        'image' => 'https://source.unsplash.com/1200x800/?memorial,ceremony',
                    ],
                    [
                        'title' => 'Live Streaming',
                        'description' => 'Multi-camera live streaming for events, ceremonies, and online audiences.',
                        'image' => 'https://source.unsplash.com/1200x800/?livestream,camera',
                    ],
                ],
            ],
            [
                'key' => 'graphics-printing',
                'title' => 'Graphics & Printing Design',
                'description' => 'Bold visuals for brands, packaging, and premium print materials.',
                'image' => 'https://source.unsplash.com/1200x800/?graphic-design,printing',
                'sub_services' => [
                    [
                        'title' => 'Flyers Printing',
                        'description' => 'Promotional flyers in multiple sizes and finishes.',
                        'image' => 'https://source.unsplash.com/1200x800/?flyer,print',
                    ],
                    [
                        'title' => 'Invitation Printing',
                        'description' => 'Elegant invitations for weddings, events, and celebrations.',
                        'image' => 'https://source.unsplash.com/1200x800/?invitation,print',
                    ],
                    [
                        'title' => 'Logo Design',
                        'description' => 'Distinctive logos and brand marks.',
                        'image' => 'https://source.unsplash.com/1200x800/?logo,design',
                    ],
                    [
                        'title' => 'Digital Printing',
                        'description' => 'High-quality digital prints for fast turnaround.',
                        'image' => 'https://source.unsplash.com/1200x800/?printing,press',
                    ],
                    [
                        'title' => 'Embroidery',
                        'description' => 'Custom embroidery for apparel and uniforms.',
                        'image' => 'https://source.unsplash.com/1200x800/?embroidery,textile',
                    ],
                    [
                        'title' => 'Banner Printing',
                        'description' => 'Large format banners for indoor and outdoor use.',
                        'image' => 'https://source.unsplash.com/1200x800/?banner,printing',
                    ],
                ],
            ],
            [
                'key' => 'make-up',
                'title' => 'Make Up',
                'description' => 'Professional makeup services for events, shoots, and special occasions.',
                'image' => 'https://source.unsplash.com/1200x800/?makeup,beauty',
            ],
            [
                'key' => 'software-development',
                'title' => 'Software Development',
                'description' => 'Modern web and mobile solutions built for performance and growth.',
                'image' => 'https://source.unsplash.com/1200x800/?software,code',
            ],
            [
                'key' => 'sound-system',
                'title' => 'Sound System',
                'description' => 'Professional sound setup for weddings, funerals, celebrations, conferences, and live events.',
                'image' => 'https://source.unsplash.com/1200x800/?sound-system,event',
            ],
        ];

        foreach ($services as $serviceData) {
            $subServices = $serviceData['sub_services'] ?? [];
            unset($serviceData['sub_services']);

            $serviceKey = $serviceData['key'] ?? null;
            unset($serviceData['key']);

            $service = null;

            if ($hasServiceKey && $serviceKey) {
                $service = Service::whereNull('parent_service_id')
                    ->where('service_key', $serviceKey)
                    ->first();
            }

            if (!$service) {
                $service = Service::whereNull('parent_service_id')
                    ->where('title', $serviceData['title'])
                    ->first();
            }

            if (!$service) {
                $payload = array_merge($serviceData, [
                    'parent_service_id' => null,
                ]);

                if ($hasServiceKey && $serviceKey) {
                    $payload['service_key'] = $serviceKey;
                }

                $service = Service::create($payload);
            } else {
                $updates = [];

                if ($hasServiceKey && $serviceKey && $service->service_key !== $serviceKey) {
                    $updates['service_key'] = $serviceKey;
                }

                if (empty($service->description)) {
                    $updates['description'] = $serviceData['description'];
                }

                if ($this->shouldReplaceImage($service->image)) {
                    $updates['image'] = $serviceData['image'];
                }

                if (!empty($updates)) {
                    $service->update($updates);
                }
            }

            foreach ($subServices as $subServiceData) {
                $child = $this->syncSubService($service, $subServiceData);

                $childUpdates = [];

                if (empty($child->description) && !empty($subServiceData['description'])) {
                    $childUpdates['description'] = $subServiceData['description'];
                }

                if ($this->shouldReplaceImage($child->image)) {
                    $childUpdates['image'] = $subServiceData['image'] ?? null;
                }

                if (!empty($childUpdates)) {
                    $child->update($childUpdates);
                }
            }
        }
    }

    private function shouldReplaceImage(?string $image): bool
    {
        if (empty($image)) {
            return true;
        }

        return Str::startsWith($image, '/images/');
    }

    private function syncSubService(Service $service, array $subServiceData): Service
    {
        $candidateTitles = array_values(array_filter(array_unique([
            $subServiceData['title'] ?? null,
            ...($subServiceData['aliases'] ?? []),
        ])));

        $child = Service::query()
            ->where('parent_service_id', $service->id)
            ->where(function ($query) use ($candidateTitles) {
                foreach ($candidateTitles as $index => $title) {
                    if ($index === 0) {
                        $query->where('title', $title);
                    } else {
                        $query->orWhere('title', $title);
                    }
                }
            })
            ->first();

        if (!$child) {
            return Service::create([
                'title' => $subServiceData['title'],
                'description' => $subServiceData['description'] ?? null,
                'image' => $subServiceData['image'] ?? null,
                'parent_service_id' => $service->id,
            ]);
        }

        if ($child->title !== $subServiceData['title']) {
            $child->update(['title' => $subServiceData['title']]);
        }

        return $child;
    }
}
