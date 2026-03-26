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
                'description' => 'Capture moments with cinematic visuals, professional editing, and creative storytelling.',
                'image' => 'https://source.unsplash.com/1200x800/?photography,camera',
                'sub_services' => [
                    [
                        'title' => 'Wedding',
                        'description' => 'Full wedding coverage with photo and video highlights.',
                        'image' => 'https://source.unsplash.com/1200x800/?wedding,photography',
                    ],
                    [
                        'title' => 'Live Streaming',
                        'description' => 'Multi-camera live streaming for events and ceremonies.',
                        'image' => 'https://source.unsplash.com/1200x800/?livestream,camera',
                    ],
                    [
                        'title' => 'Production',
                        'description' => 'Commercial and creative production for brands and artists.',
                        'image' => 'https://source.unsplash.com/1200x800/?film,production',
                    ],
                    [
                        'title' => 'Funeral',
                        'description' => 'Respectful coverage and memorial storytelling.',
                        'image' => 'https://source.unsplash.com/1200x800/?memorial,ceremony',
                    ],
                    [
                        'title' => 'Birthday',
                        'description' => 'Event photography and highlight video for birthdays.',
                        'image' => 'https://source.unsplash.com/1200x800/?birthday,party',
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
                $child = Service::firstOrCreate(
                    ['title' => $subServiceData['title'], 'parent_service_id' => $service->id],
                    [
                        'description' => $subServiceData['description'] ?? null,
                        'image' => $subServiceData['image'] ?? null,
                    ]
                );

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
}
