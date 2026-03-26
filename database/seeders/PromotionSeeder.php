<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promotion;

class PromotionSeeder extends Seeder
{
    public function run(): void
    {
        Promotion::firstOrCreate(
            ['title' => 'Impano zo kwakira'],
            [
                'title_rw' => 'Impano zo kwakira',
                'title_en' => 'New User Rewards',
                'title_fr' => 'Recompenses pour nouveaux clients',
                'message' => 'Iyandikishe uyu munsi uhabwe ifoto y\'ubuntu, make up y\'ubuntu, n\'igishushanyo cy\'urubuga ku buntu. Ibi ni impano z\'igihe gito ku bakiriya bashya!',
                'message_rw' => 'Iyandikishe uyu munsi uhabwe ifoto y\'ubuntu, make up y\'ubuntu, n\'igishushanyo cy\'urubuga ku buntu. Ibi ni impano z\'igihe gito ku bakiriya bashya!',
                'message_en' => 'Sign up today and unlock your free Photo Shoot, Make Up session, and Website Design. Limited-time welcome perks for new clients!',
                'message_fr' => 'Inscrivez-vous aujourd\'hui et obtenez une seance photo gratuite, un maquillage gratuit et un design de site web gratuit. Offre de bienvenue a duree limitee.',
                'image' => 'https://source.unsplash.com/1400x900/?studio,creative',
                'cta_text' => 'Fata impano',
                'cta_text_rw' => 'Fata impano',
                'cta_text_en' => 'Claim My Rewards',
                'cta_text_fr' => 'Obtenir mes recompenses',
                'cta_url' => '/rewards',
                'is_active' => true,
            ]
        );
    }
}
