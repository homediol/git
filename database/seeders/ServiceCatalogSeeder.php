<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
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
        $hasTranslations = $this->hasServiceTranslations();

        foreach ($this->catalog() as $serviceData) {
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
                $payload = array_merge(
                    $this->payloadWithTranslations($serviceData, $hasTranslations),
                    ['parent_service_id' => null]
                );

                if ($hasServiceKey && $serviceKey) {
                    $payload['service_key'] = $serviceKey;
                }

                $service = Service::create($payload);
            } else {
                $updates = [];

                if ($hasServiceKey && $serviceKey && $service->service_key !== $serviceKey) {
                    $updates['service_key'] = $serviceKey;
                }

                if (empty($service->description) && !empty($serviceData['description'])) {
                    $updates['description'] = $serviceData['description'];
                }

                if ($this->shouldReplaceImage($service->image)) {
                    $updates['image'] = $serviceData['image'] ?? null;
                }

                $updates = array_merge($updates, $this->missingTranslationUpdates($service, $serviceData, $hasTranslations));

                if (!empty($updates)) {
                    $service->update($updates);
                }
            }

            foreach ($subServices as $subServiceData) {
                $child = $this->syncSubService($service, $subServiceData, $hasTranslations);

                $childUpdates = [];

                if (empty($child->description) && !empty($subServiceData['description'])) {
                    $childUpdates['description'] = $subServiceData['description'];
                }

                if ($this->shouldReplaceImage($child->image)) {
                    $childUpdates['image'] = $subServiceData['image'] ?? null;
                }

                $childUpdates = array_merge($childUpdates, $this->missingTranslationUpdates($child, $subServiceData, $hasTranslations));

                if (!empty($childUpdates)) {
                    $child->update($childUpdates);
                }
            }
        }
    }

    private function hasServiceTranslations(): bool
    {
        return Schema::hasColumn('services', 'title_rw')
            && Schema::hasColumn('services', 'title_en')
            && Schema::hasColumn('services', 'title_fr')
            && Schema::hasColumn('services', 'description_rw')
            && Schema::hasColumn('services', 'description_en')
            && Schema::hasColumn('services', 'description_fr');
    }

    private function payloadWithTranslations(array $data, bool $hasTranslations): array
    {
        $payload = [
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'image' => $data['image'] ?? null,
        ];

        if (!$hasTranslations) {
            return $payload;
        }

        return array_merge($payload, [
            'title_rw' => $data['title_rw'] ?? null,
            'title_en' => $data['title_en'] ?? $data['title'],
            'title_fr' => $data['title_fr'] ?? null,
            'description_rw' => $data['description_rw'] ?? null,
            'description_en' => $data['description_en'] ?? ($data['description'] ?? null),
            'description_fr' => $data['description_fr'] ?? null,
        ]);
    }

    private function missingTranslationUpdates(Service $service, array $data, bool $hasTranslations): array
    {
        if (!$hasTranslations) {
            return [];
        }

        $updates = [];
        $translationMap = [
            'title_rw' => $data['title_rw'] ?? null,
            'title_en' => $data['title_en'] ?? $data['title'] ?? null,
            'title_fr' => $data['title_fr'] ?? null,
            'description_rw' => $data['description_rw'] ?? null,
            'description_en' => $data['description_en'] ?? ($data['description'] ?? null),
            'description_fr' => $data['description_fr'] ?? null,
        ];

        foreach ($translationMap as $field => $value) {
            if (empty($service->{$field}) && !empty($value)) {
                $updates[$field] = $value;
            }
        }

        return $updates;
    }

    private function shouldReplaceImage(?string $image): bool
    {
        if (empty($image)) {
            return true;
        }

        return Str::startsWith($image, '/images/');
    }

    private function syncSubService(Service $service, array $subServiceData, bool $hasTranslations): Service
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
            return Service::create(array_merge(
                $this->payloadWithTranslations($subServiceData, $hasTranslations),
                ['parent_service_id' => $service->id]
            ));
        }

        $updates = [];

        if ($child->title !== $subServiceData['title']) {
            $updates['title'] = $subServiceData['title'];
        }

        $updates = array_merge($updates, $this->missingTranslationUpdates($child, $subServiceData, $hasTranslations));

        if (!empty($updates)) {
            $child->update($updates);
        }

        return $child->fresh();
    }

    private function catalog(): array
    {
        return [
            [
                'key' => 'photography-videography',
                'title' => 'Photography & Videography',
                'title_rw' => 'Ifoto na Videwo',
                'title_en' => 'Photography & Videography',
                'title_fr' => 'Photographie et Videographie',
                'description' => 'Capture weddings, maternity sessions, birthdays, graduations, funerals, live streams, and brand stories with polished visuals and creative storytelling.',
                'description_rw' => 'Dufata amafoto na videwo z\'ubukwe, maternity, amavuko, graduation, ikiriyo, live streaming, n\'inkuru za brand mu buryo bunoze kandi buhanga.',
                'description_en' => 'Capture weddings, maternity sessions, birthdays, graduations, funerals, live streams, and brand stories with polished visuals and creative storytelling.',
                'description_fr' => 'Nous realisons des photos et videos pour mariages, maternite, anniversaires, remises de diplome, funerailles, directs et histoires de marque avec une finition soignee.',
                'image' => 'https://source.unsplash.com/1200x800/?photography,camera',
                'sub_services' => [
                    [
                        'title' => 'Wedding',
                        'title_rw' => 'Ubukwe',
                        'title_en' => 'Wedding',
                        'title_fr' => 'Mariage',
                        'description' => 'Full wedding coverage with photo and video highlights.',
                        'description_rw' => 'Ifoto na videwo byuzuye by\'ubukwe birimo ibihe by\'ingenzi n\'ibisubizo byatoranyijwe neza.',
                        'description_en' => 'Full wedding coverage with photo and video highlights.',
                        'description_fr' => 'Couverture complete du mariage avec photos et meilleurs moments en video.',
                        'image' => 'https://source.unsplash.com/1200x800/?wedding,photography',
                    ],
                    [
                        'title' => 'Maternity Sessions',
                        'title_rw' => 'Ifoto z\'abatwite',
                        'title_en' => 'Maternity Sessions',
                        'title_fr' => 'Seances maternité',
                        'description' => 'Warm and elegant maternity sessions that preserve every milestone beautifully.',
                        'description_rw' => 'Ifoto z\'abatwite zitezwe neza kandi zibika ibihe by\'ingenzi mu buryo bwiza.',
                        'description_en' => 'Warm and elegant maternity sessions that preserve every milestone beautifully.',
                        'description_fr' => 'Seances maternite chaleureuses et elegantes pour conserver chaque etape en beaute.',
                        'image' => 'https://source.unsplash.com/1200x800/?maternity,photography',
                    ],
                    [
                        'title' => 'Birthdays',
                        'aliases' => ['Birthday', 'Birthday Sessions'],
                        'title_rw' => 'Ibirori by\'amavuko',
                        'title_en' => 'Birthdays',
                        'title_fr' => 'Anniversaires',
                        'description' => 'Event photography and highlight videos for birthdays and celebrations.',
                        'description_rw' => 'Ifoto n\'amashusho y\'ibikorwa by\'amavuko n\'indi minsi mikuru.',
                        'description_en' => 'Event photography and highlight videos for birthdays and celebrations.',
                        'description_fr' => 'Photos d\'evenement et videos resumes pour anniversaires et celebrations.',
                        'image' => 'https://source.unsplash.com/1200x800/?birthday,party',
                    ],
                    [
                        'title' => 'Graduation Sessions',
                        'title_rw' => 'Ifoto za graduation',
                        'title_en' => 'Graduation Sessions',
                        'title_fr' => 'Seances de remise de diplome',
                        'description' => 'Graduation portraits and event coverage that celebrate every achievement.',
                        'description_rw' => 'Ifoto za graduation n\'amashusho y\'ibirori byo kwizihiza intambwe wagezeho.',
                        'description_en' => 'Graduation portraits and event coverage that celebrate every achievement.',
                        'description_fr' => 'Portraits et couverture de remise de diplome pour celebrer chaque reussite.',
                        'image' => 'https://source.unsplash.com/1200x800/?graduation,portrait',
                    ],
                    [
                        'title' => 'Save the Date Sessions',
                        'title_rw' => 'Save the Date Sessions',
                        'title_en' => 'Save the Date Sessions',
                        'title_fr' => 'Seances Save the Date',
                        'description' => 'Stylish save the date photo and video sessions for couples and special announcements.',
                        'description_rw' => 'Amafoto na videwo bya save the date ku bakundana no ku matangazo yihariye.',
                        'description_en' => 'Stylish save the date photo and video sessions for couples and special announcements.',
                        'description_fr' => 'Seances photo et video Save the Date elegantes pour couples et annonces speciales.',
                        'image' => 'https://source.unsplash.com/1200x800/?couple,engagement',
                    ],
                    [
                        'title' => 'Adventure Sessions',
                        'title_rw' => 'Adventure Sessions',
                        'title_en' => 'Adventure Sessions',
                        'title_fr' => 'Seances aventure',
                        'description' => 'Outdoor and destination sessions designed for bold stories and scenic memories.',
                        'description_rw' => 'Ifoto zo hanze no ahantu nyaburanga zikwiriye inkuru zidasanzwe n\'ibyo kwibuka.',
                        'description_en' => 'Outdoor and destination sessions designed for bold stories and scenic memories.',
                        'description_fr' => 'Seances en plein air et en destination pour des histoires audacieuses et des souvenirs uniques.',
                        'image' => 'https://source.unsplash.com/1200x800/?adventure,photography',
                    ],
                    [
                        'title' => 'Personal Sessions',
                        'title_rw' => 'Ifoto z\'umuntu ku giti cye',
                        'title_en' => 'Personal Sessions',
                        'title_fr' => 'Seances personnelles',
                        'description' => 'Personal portraits for lifestyle, branding, and individual storytelling.',
                        'description_rw' => 'Ifoto z\'umuntu ku giti cye ku buzima bwa buri munsi, branding, cyangwa inkuru yawe bwite.',
                        'description_en' => 'Personal portraits for lifestyle, branding, and individual storytelling.',
                        'description_fr' => 'Portraits personnels pour style de vie, image de marque et histoire individuelle.',
                        'image' => 'https://source.unsplash.com/1200x800/?portrait,photography',
                    ],
                    [
                        'title' => 'Drone Services',
                        'title_rw' => 'Serivisi za drone',
                        'title_en' => 'Drone Services',
                        'title_fr' => 'Services de drone',
                        'description' => 'Aerial photo and video coverage for events, campaigns, and cinematic reveals.',
                        'description_rw' => 'Ifoto na videwo zo mu kirere ku birori, campaigns, n\'amashusho agaragaza ibintu mu buryo bwagutse.',
                        'description_en' => 'Aerial photo and video coverage for events, campaigns, and cinematic reveals.',
                        'description_fr' => 'Couverture photo et video aerienne pour evenements, campagnes et plans cinematographiques.',
                        'image' => 'https://source.unsplash.com/1200x800/?drone,aerial',
                    ],
                    [
                        'title' => 'Real Estate',
                        'aliases' => ['Real Estate Coverage'],
                        'title_rw' => 'Kwamamaza inzu n\'imitungo',
                        'title_en' => 'Real Estate',
                        'title_fr' => 'Immobilier',
                        'description' => 'Property photography and walkthrough videos for homes, rentals, and developments.',
                        'description_rw' => 'Ifoto n\'amashusho y\'inzu, apartments n\'indi mitungo yo kwamamaza no kwerekana neza.',
                        'description_en' => 'Property photography and walkthrough videos for homes, rentals, and developments.',
                        'description_fr' => 'Photos immobilieres et videos de visite pour maisons, locations et projets.',
                        'image' => 'https://source.unsplash.com/1200x800/?real-estate,interior',
                    ],
                    [
                        'title' => 'Funerals',
                        'aliases' => ['Funeral', 'Funeral Coverage'],
                        'title_rw' => 'Ikiriyo n\'ibyibutso',
                        'title_en' => 'Funerals',
                        'title_fr' => 'Funerailles',
                        'description' => 'Respectful photo and video coverage for funerals and memorial gatherings.',
                        'description_rw' => 'Ifoto na videwo bikorwa mu cyubahiro ku kiriyo no mu bikorwa byo kwibuka.',
                        'description_en' => 'Respectful photo and video coverage for funerals and memorial gatherings.',
                        'description_fr' => 'Couverture photo et video respectueuse pour funerailles et commemorations.',
                        'image' => 'https://source.unsplash.com/1200x800/?memorial,ceremony',
                    ],
                    [
                        'title' => 'Live Streaming',
                        'title_rw' => 'Live Streaming',
                        'title_en' => 'Live Streaming',
                        'title_fr' => 'Diffusion en direct',
                        'description' => 'Multi-camera live streaming for events, ceremonies, and online audiences.',
                        'description_rw' => 'Live streaming y\'ibirori n\'imihango ikoresheje camera nyinshi ku bayirebera online.',
                        'description_en' => 'Multi-camera live streaming for events, ceremonies, and online audiences.',
                        'description_fr' => 'Diffusion en direct multi-camera pour evenements, ceremonies et publics en ligne.',
                        'image' => 'https://source.unsplash.com/1200x800/?livestream,camera',
                    ],
                ],
            ],
            [
                'key' => 'graphics-printing',
                'title' => 'Graphics & Printing Design',
                'title_rw' => 'Igishushanyo n\'Icapiro',
                'title_en' => 'Graphics & Printing Design',
                'title_fr' => 'Design Graphique et Impression',
                'description' => 'Bold visuals for brands, packaging, and premium print materials.',
                'description_rw' => 'Dukora ibishushanyo bikomeye ku brands, packaging, n\'ibikoresho by\'icapiro by\'umwuga.',
                'description_en' => 'Bold visuals for brands, packaging, and premium print materials.',
                'description_fr' => 'Visuels percutants pour marques, emballages et supports d\'impression premium.',
                'image' => 'https://source.unsplash.com/1200x800/?graphic-design,printing',
                'sub_services' => [
                    [
                        'title' => 'Flyers Printing',
                        'title_rw' => 'Kwamamaza ku maflyers',
                        'title_en' => 'Flyers Printing',
                        'title_fr' => 'Impression de flyers',
                        'description' => 'Promotional flyers in multiple sizes and finishes.',
                        'description_rw' => 'Flyers zo kwamamaza mu bunini butandukanye no mu kurangiza kwiza.',
                        'description_en' => 'Promotional flyers in multiple sizes and finishes.',
                        'description_fr' => 'Flyers promotionnels en plusieurs formats et finitions.',
                        'image' => 'https://source.unsplash.com/1200x800/?flyer,print',
                    ],
                    [
                        'title' => 'Invitation Printing',
                        'title_rw' => 'Kwamamaza ku makarita y\'ubutumire',
                        'title_en' => 'Invitation Printing',
                        'title_fr' => 'Impression d\'invitations',
                        'description' => 'Elegant invitations for weddings, events, and celebrations.',
                        'description_rw' => 'Amakarita y\'ubutumire meza ku bukwe, events n\'ibirori bitandukanye.',
                        'description_en' => 'Elegant invitations for weddings, events, and celebrations.',
                        'description_fr' => 'Invitations elegantes pour mariages, evenements et celebrations.',
                        'image' => 'https://source.unsplash.com/1200x800/?invitation,print',
                    ],
                    [
                        'title' => 'Logo Design',
                        'title_rw' => 'Gukora logo',
                        'title_en' => 'Logo Design',
                        'title_fr' => 'Creation de logo',
                        'description' => 'Distinctive logos and brand marks.',
                        'description_rw' => 'Dukora logos n\'ibirango bitandukanya business yawe n\'izindi.',
                        'description_en' => 'Distinctive logos and brand marks.',
                        'description_fr' => 'Logos et signes de marque distinctifs.',
                        'image' => 'https://source.unsplash.com/1200x800/?logo,design',
                    ],
                    [
                        'title' => 'Digital Printing',
                        'title_rw' => 'Icapiro rya digital',
                        'title_en' => 'Digital Printing',
                        'title_fr' => 'Impression numerique',
                        'description' => 'High-quality digital prints for fast turnaround.',
                        'description_rw' => 'Icapiro rya digital rifite quality nziza kandi risohoka vuba.',
                        'description_en' => 'High-quality digital prints for fast turnaround.',
                        'description_fr' => 'Impression numerique de haute qualite avec delai rapide.',
                        'image' => 'https://source.unsplash.com/1200x800/?printing,press',
                    ],
                    [
                        'title' => 'Embroidery',
                        'title_rw' => 'Ubudozi bw\'ibirango',
                        'title_en' => 'Embroidery',
                        'title_fr' => 'Broderie',
                        'description' => 'Custom embroidery for apparel and uniforms.',
                        'description_rw' => 'Ubudozi bw\'ibirango, amazina na designs ku myenda na uniformes.',
                        'description_en' => 'Custom embroidery for apparel and uniforms.',
                        'description_fr' => 'Broderie personnalisee pour vetements et uniformes.',
                        'image' => 'https://source.unsplash.com/1200x800/?embroidery,textile',
                    ],
                    [
                        'title' => 'Banners (All Kinds)',
                        'aliases' => ['Banner Printing'],
                        'title_rw' => 'Banners z\'ubwoko bwose',
                        'title_en' => 'Banners (All Kinds)',
                        'title_fr' => 'Banderoles de tout type',
                        'description' => 'Indoor and outdoor banners for promotions, events, and storefront visibility.',
                        'description_rw' => 'Banners za indoor na outdoor zikoreshwa mu promotions, events no kugaragaza ubucuruzi.',
                        'description_en' => 'Indoor and outdoor banners for promotions, events, and storefront visibility.',
                        'description_fr' => 'Banderoles interieures et exterieures pour promotions, evenements et visibilite commerciale.',
                        'image' => 'https://source.unsplash.com/1200x800/?banner,printing',
                    ],
                    [
                        'title' => 'Billboards',
                        'aliases' => ['Billboard'],
                        'title_rw' => 'Kwamamaza rya billboard',
                        'title_en' => 'Billboards',
                        'title_fr' => 'Panneaux publicitaires',
                        'description' => 'Large-format billboard design and printing for outdoor campaigns and high-traffic visibility.',
                        'description_rw' => 'Kwamamaza rya billboard rinini rigenewe kampanye zo hanze n\'ahantu haca abantu benshi.',
                        'description_en' => 'Large-format billboard design and printing for outdoor campaigns and high-traffic visibility.',
                        'description_fr' => 'Conception et impression de panneaux publicitaires grand format pour campagnes exterieures et zones de fort passage.',
                        'image' => 'https://source.unsplash.com/1200x800/?billboard,advertising',
                    ],
                    [
                        'title' => 'Screen Printing',
                        'title_rw' => 'Icapiro rya screen printing',
                        'title_en' => 'Screen Printing',
                        'title_fr' => 'Serigraphie',
                        'description' => 'Durable screen printing for t-shirts, bags, uniforms, and promotional merchandise.',
                        'description_rw' => 'Icapiro rya screen printing riramba ku myenda, sacs, uniformes n\'ibindi bikoresho byo kwamamaza.',
                        'description_en' => 'Durable screen printing for t-shirts, bags, uniforms, and promotional merchandise.',
                        'description_fr' => 'Serigraphie durable pour t-shirts, sacs, uniformes et objets promotionnels.',
                        'image' => 'https://source.unsplash.com/1200x800/?screen-printing,tshirt',
                    ],
                    [
                        'title' => 'Pull-Up Materials',
                        'aliases' => ['Pull Up Material', 'Roll-Up Materials', 'Roll Up Material'],
                        'title_rw' => 'Pull-up na roll-up',
                        'title_en' => 'Pull-Up Materials',
                        'title_fr' => 'Supports roll-up',
                        'description' => 'Portable pull-up and roll-up displays for conferences, exhibitions, and receptions.',
                        'description_rw' => 'Pull-up na roll-up zoroha gutwara kandi zikoreshwa mu nama, exhibitions no kwakira abashyitsi.',
                        'description_en' => 'Portable pull-up and roll-up displays for conferences, exhibitions, and receptions.',
                        'description_fr' => 'Supports pull-up et roll-up faciles a transporter pour conferences, expositions et accueils.',
                        'image' => 'https://source.unsplash.com/1200x800/?rollup,banner',
                    ],
                    [
                        'title' => 'Backdrops',
                        'aliases' => ['Backdrop'],
                        'title_rw' => 'Backdrops',
                        'title_en' => 'Backdrops',
                        'title_fr' => 'Toiles de fond',
                        'description' => 'Branded backdrops for events, conferences, red carpets, and photo booths.',
                        'description_rw' => 'Backdrops zifite branding ku birori, conferences, red carpet na photo booth.',
                        'description_en' => 'Branded backdrops for events, conferences, red carpets, and photo booths.',
                        'description_fr' => 'Toiles de fond personnalisees pour evenements, conferences, tapis rouges et stands photo.',
                        'image' => 'https://source.unsplash.com/1200x800/?backdrop,event',
                    ],
                    [
                        'title' => 'ID Cards',
                        'aliases' => ['ID Card'],
                        'title_rw' => 'Indangamuntu z\'akazi',
                        'title_en' => 'ID Cards',
                        'title_fr' => 'Cartes d\'identite professionnelles',
                        'description' => 'Professional ID cards for staff, schools, events, and organizations.',
                        'description_rw' => 'ID cards z\'abakozi, abanyeshuri, abitabiriye events n\'ibigo bitandukanye.',
                        'description_en' => 'Professional ID cards for staff, schools, events, and organizations.',
                        'description_fr' => 'Cartes d\'identite professionnelles pour personnel, ecoles, evenements et organisations.',
                        'image' => 'https://source.unsplash.com/1200x800/?id-card,badge',
                    ],
                    [
                        'title' => 'Business Cards',
                        'aliases' => ['Business Card'],
                        'title_rw' => 'Amakarita y\'akazi',
                        'title_en' => 'Business Cards',
                        'title_fr' => 'Cartes de visite',
                        'description' => 'Premium business cards with clean layouts, strong branding, and quality finishes.',
                        'description_rw' => 'Amakarita y\'akazi meza afite layout isukuye, branding ikomeye n\'irangiza ryiza.',
                        'description_en' => 'Premium business cards with clean layouts, strong branding, and quality finishes.',
                        'description_fr' => 'Cartes de visite premium avec mise en page soignee, branding fort et belles finitions.',
                        'image' => 'https://source.unsplash.com/1200x800/?business-card,print',
                    ],
                    [
                        'title' => 'Certificates',
                        'aliases' => ['Certificate'],
                        'title_rw' => 'Impamyabushobozi',
                        'title_en' => 'Certificates',
                        'title_fr' => 'Certificats',
                        'description' => 'Well-designed certificates for trainings, recognition, graduations, and awards.',
                        'description_rw' => 'Certificates ziteguye neza ku mahugurwa, ishimwe, graduation n\'ibihembo.',
                        'description_en' => 'Well-designed certificates for trainings, recognition, graduations, and awards.',
                        'description_fr' => 'Certificats bien concus pour formations, reconnaissance, remises de diplome et prix.',
                        'image' => 'https://source.unsplash.com/1200x800/?certificate,award',
                    ],
                ],
            ],
            [
                'key' => 'make-up',
                'title' => 'Make Up',
                'title_rw' => 'Makeup',
                'title_en' => 'Make Up',
                'title_fr' => 'Maquillage',
                'description' => 'Professional makeup services for events, shoots, and special occasions.',
                'description_rw' => 'Serivisi za makeup z\'umwuga ku birori, amafoto n\'ibihe byihariye.',
                'description_en' => 'Professional makeup services for events, shoots, and special occasions.',
                'description_fr' => 'Services de maquillage professionnels pour evenements, shootings et occasions speciales.',
                'image' => 'https://source.unsplash.com/1200x800/?makeup,beauty',
            ],
            [
                'key' => 'software-development',
                'title' => 'Software Development',
                'title_rw' => 'Gukora software',
                'title_en' => 'Software Development',
                'title_fr' => 'Developpement logiciel',
                'description' => 'Modern web and mobile solutions built for performance and growth.',
                'description_rw' => 'Dukora websites na mobile apps zigezweho, zihuta kandi zifasha ubucuruzi gukura.',
                'description_en' => 'Modern web and mobile solutions built for performance and growth.',
                'description_fr' => 'Solutions web et mobiles modernes concues pour la performance et la croissance.',
                'image' => 'https://source.unsplash.com/1200x800/?software,code',
            ],
            [
                'key' => 'sound-system',
                'title' => 'Sound System',
                'title_rw' => 'Sisitemu y\'amajwi',
                'title_en' => 'Sound System',
                'title_fr' => 'Sonorisation',
                'description' => 'Professional sound setup for weddings, funerals, celebrations, conferences, and live events.',
                'description_rw' => 'Dutegura amajwi y\'umwuga ku bukwe, ikiriyo, ibirori, conferences n\'izindi events.',
                'description_en' => 'Professional sound setup for weddings, funerals, celebrations, conferences, and live events.',
                'description_fr' => 'Installation sonore professionnelle pour mariages, funerailles, celebrations, conferences et evenements live.',
                'image' => 'https://source.unsplash.com/1200x800/?sound-system,event',
            ],
        ];
    }
}
