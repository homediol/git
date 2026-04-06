<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class PortfolioShowcaseSeeder extends Seeder
{
    public function run(): void
    {
        $supportsTranslations = Schema::hasColumn('portfolios', 'title_rw');

        $legacyTitles = collect([
            'pavona production',
            'pavona studio',
            'pavona product',
            'TechStart Logo & Brand Identity',
            'Corporate Event Banners',
            'Restaurant Menu & Brochures',
            'Company Vehicle Branding',
            'Corporate Business Cards',
            'Team Uniform T-Shirts',
            'Product Packaging Stickers',
            'Corporate Award Plaques',
            'Promotional Coffee Mugs',
        ]);

        $legacyPool = Portfolio::query()
            ->whereIn('title', $legacyTitles->all())
            ->orderBy('id')
            ->get()
            ->values();

        foreach ($this->showcaseItems() as $item) {
            $portfolio = Portfolio::query()
                ->where('title', $item['title'])
                ->first();

            if (!$portfolio) {
                $portfolio = $legacyPool->shift() ?? new Portfolio();
            } else {
                $legacyPool = $legacyPool->reject(fn (Portfolio $candidate) => $candidate->id === $portfolio->id)->values();
            }

            $timestamp = CarbonImmutable::parse($item['published_at']);

            $portfolio->title = $item['title'];
            $portfolio->description = $item['description'];
            $portfolio->category = $item['category'];
            $portfolio->image = $item['image'];

            if ($supportsTranslations) {
                $portfolio->title_rw = $item['title_rw'] ?? null;
                $portfolio->title_en = $item['title_en'] ?? $item['title'];
                $portfolio->title_fr = $item['title_fr'] ?? null;
                $portfolio->description_rw = $item['description_rw'] ?? null;
                $portfolio->description_en = $item['description_en'] ?? $item['description'];
                $portfolio->description_fr = $item['description_fr'] ?? null;
                $portfolio->category_rw = $item['category_rw'] ?? null;
                $portfolio->category_en = $item['category_en'] ?? $item['category'];
                $portfolio->category_fr = $item['category_fr'] ?? null;
            }

            $portfolio->save();

            $portfolio->timestamps = false;
            $portfolio->created_at = $timestamp;
            $portfolio->updated_at = $timestamp;
            $portfolio->save();
            $portfolio->timestamps = true;
        }

        if ($legacyPool->isNotEmpty()) {
            Portfolio::query()->whereIn('id', $legacyPool->pluck('id')->all())->delete();
        }
    }

    private function showcaseItems(): array
    {
        return [
            [
                'title' => 'AUCA Graduation Portrait Series',
                'title_rw' => "Serie y'amafoto ya graduation ya AUCA",
                'title_en' => 'AUCA Graduation Portrait Series',
                'title_fr' => "Serie de portraits de graduation d'AUCA",
                'description' => 'Studio graduation portraits prepared for announcement cards, family prints, and polished social sharing with quick delivery for graduates.',
                'description_rw' => "Amafoto ya graduation yo muri studio ateguwe ku makarita y'itangazo, ifoto zo mu muryango, no gusangiza ku mbuga nkoranyambaga mu buryo bunoze kandi bwihuse ku barangije.",
                'description_en' => 'Studio graduation portraits prepared for announcement cards, family prints, and polished social sharing with quick delivery for graduates.',
                'description_fr' => "Des portraits de graduation en studio prepares pour les cartes d'annonce, les impressions familiales et le partage sur les reseaux sociaux avec une livraison rapide pour les diplomes.",
                'category' => 'Graduation',
                'category_rw' => 'Graduation',
                'category_en' => 'Graduation',
                'category_fr' => 'Remise de diplome',
                'image' => '/storage/portfolio/images/ACXRLUeOqqOHqk3uFib2sMCCQy8jPNWYE0uurXHq.jpg',
                'published_at' => '2026-03-23 09:00:00',
            ],
            [
                'title' => 'Graduation Promo Poster Campaign',
                'title_rw' => "Kampanye ya posters zo kwamamaza graduation",
                'title_en' => 'Graduation Promo Poster Campaign',
                'title_fr' => "Campagne d'affiches promotionnelles pour la graduation",
                'description' => 'A bold promotional poster package built for seasonal graduation bookings, mixing strong typography, clear offers, and mobile-first visuals.',
                'description_rw' => "Pakeji ya posters zo kwamamaza graduation yateguwe mu buryo bukomeye, ihuza typography isobanutse, offers zisoma neza, n'amashusho yoroheye mobile.",
                'description_en' => 'A bold promotional poster package built for seasonal graduation bookings, mixing strong typography, clear offers, and mobile-first visuals.',
                'description_fr' => "Un ensemble d'affiches promotionnelles cree pour les reservations de graduation de saison, avec une typographie forte, des offres claires et des visuels penses pour le mobile.",
                'category' => 'Campaign Design',
                'category_rw' => 'Design ya kampanye',
                'category_en' => 'Campaign Design',
                'category_fr' => 'Design de campagne',
                'image' => '/storage/posts/QNuWYyZyNuGa849l4LcZWzmrsDAi34DbuLojZJIN.png',
                'published_at' => '2026-03-24 10:30:00',
            ],
            [
                'title' => 'Luxury Wedding Reception Coverage',
                'title_rw' => "Coverage y'ubukwe bwo ku rwego rwo hejuru",
                'title_en' => 'Luxury Wedding Reception Coverage',
                'title_fr' => "Couverture d'une reception de mariage haut de gamme",
                'description' => 'Event photography coverage focused on couple moments, decor details, and candid guest reactions for premium wedding storytelling.',
                'description_rw' => "Coverage y'amafoto y'ibirori by'ubukwe yibanda ku bihe by'abageni, details z'umutako, n'ibisubizo by'abashyitsi kugira ngo inkuru y'ubukwe igaragare neza.",
                'description_en' => 'Event photography coverage focused on couple moments, decor details, and candid guest reactions for premium wedding storytelling.',
                'description_fr' => "Une couverture photo d'evenement centree sur les moments du couple, les details du decor et les reactions spontanees des invites pour raconter un mariage premium.",
                'category' => 'Wedding Coverage',
                'category_rw' => "Coverage y'ubukwe",
                'category_en' => 'Wedding Coverage',
                'category_fr' => 'Couverture de mariage',
                'image' => '/storage/services/dHwGcTLhGRVivujeY5wPE1bnEiue1Gv9kmlMSEuL.jpg',
                'published_at' => '2026-03-25 14:00:00',
            ],
            [
                'title' => 'Branded Conference Lanyards',
                'title_rw' => "Lanyards z'amakonferanse zifite branding",
                'title_en' => 'Branded Conference Lanyards',
                'title_fr' => 'Tours de cou de conference avec branding',
                'description' => 'Custom lanyard production for conferences and exhibitions with clean logo application, consistent print quality, and fast turnaround.',
                'description_rw' => "Gukora lanyards zihariye ku makonferanse na exhibitions, zifite logo isukuye, quality y'icapiro ihoraho, n'igihe gito cyo gutanga.",
                'description_en' => 'Custom lanyard production for conferences and exhibitions with clean logo application, consistent print quality, and fast turnaround.',
                'description_fr' => "Production de tours de cou personnalises pour conferences et expositions avec une application nette du logo, une qualite d'impression constante et une livraison rapide.",
                'category' => 'Printing & Branding',
                'category_rw' => 'Icapiro na branding',
                'category_en' => 'Printing & Branding',
                'category_fr' => 'Impression et branding',
                'image' => '/storage/portfolio/videos/NLk1NuaJ8DcAQGEytimTskqOiI9jxgvSP1X8ZxZI.mp4',
                'published_at' => '2026-03-26 11:15:00',
            ],
            [
                'title' => 'Studio Interview Set Build',
                'title_rw' => "Gutegura studio y'ibiganiro",
                'title_en' => 'Studio Interview Set Build',
                'title_fr' => "Mise en place d'un plateau d'interview en studio",
                'description' => 'A controlled studio environment arranged for interviews, talking-head videos, and brand explainers with balanced lighting and camera framing.',
                'description_rw' => "Studio igenzurwa neza yateguwe ku biganiro, talking-head videos, n'amavideo asobanura brand ifite urumuri ruringaniye n'imiterere myiza ya camera.",
                'description_en' => 'A controlled studio environment arranged for interviews, talking-head videos, and brand explainers with balanced lighting and camera framing.',
                'description_fr' => "Un environnement de studio controle concu pour les interviews, les videos face camera et les explications de marque avec un eclairage equilibre et un cadrage propre.",
                'category' => 'Studio Production',
                'category_rw' => 'Studio production',
                'category_en' => 'Studio Production',
                'category_fr' => 'Production studio',
                'image' => '/storage/rewards/QYR0P3uoQPafMXucPJ0o6vFEqRnq1xqQkUogbfJx.jpg',
                'published_at' => '2026-03-27 16:45:00',
            ],
            [
                'title' => 'Real Estate Aerial Showcase',
                'title_rw' => "Kwerekana imitungo hakoreshejwe amashusho yo mu kirere",
                'title_en' => 'Real Estate Aerial Showcase',
                'title_fr' => 'Presentation immobiliere par prises de vue aeriennes',
                'description' => 'High-angle property visuals prepared for housing campaigns, investor updates, and social teasers that need a clear sense of scale.',
                'description_rw' => "Amashusho y'imitungo afatiwe hejuru ateguwe ku bukangurambaga bw'amazu, updates zigenewe abashoramari, n'uduce two ku mbuga nkoranyambaga dukeneye kugaragaza neza ingano y'aho hantu.",
                'description_en' => 'High-angle property visuals prepared for housing campaigns, investor updates, and social teasers that need a clear sense of scale.',
                'description_fr' => "Des visuels immobiliers en prise de vue aerienne prepares pour les campagnes de logement, les mises a jour pour investisseurs et les teasers sociaux qui doivent montrer clairement l'echelle du site.",
                'category' => 'Aerial Visuals',
                'category_rw' => 'Amashusho yo mu kirere',
                'category_en' => 'Aerial Visuals',
                'category_fr' => 'Visuels aeriens',
                'image' => '/storage/services/OQfOLO1ydeJgIRgVfzpMFeVCzeOyApyqBWyaWWj1.jpg',
                'published_at' => '2026-03-28 08:20:00',
            ],
        ];
    }
}
