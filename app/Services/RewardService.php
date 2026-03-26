<?php

namespace App\Services;

use App\Models\Reward;
use App\Models\User;
use App\Models\UserReward;
use App\Models\UserActivity;
use App\Notifications\GenericNotification;
use Illuminate\Support\Collection;

class RewardService
{
    public function assignWelcomeRewards(User $user): Collection
    {
        $rewards = $this->ensureDefaultRewards();

        $assigned = collect();

        foreach ($rewards as $reward) {
            $userReward = UserReward::firstOrCreate(
                ['user_id' => $user->id, 'reward_id' => $reward->id],
                [
                    'status' => 'unused',
                    'assigned_at' => now(),
                    'expires_at' => now()->addDays($reward->expires_after_days),
                ]
            );

            if ($userReward->wasRecentlyCreated) {
                $assigned->push($reward);
            }
        }

        if ($assigned->isNotEmpty()) {
            $namesRw = $assigned->pluck('name_rw')->filter()->implode(', ') ?: $assigned->pluck('name')->implode(', ');
            $namesEn = $assigned->pluck('name_en')->filter()->implode(', ') ?: $assigned->pluck('name')->implode(', ');
            $namesFr = $assigned->pluck('name_fr')->filter()->implode(', ') ?: $assigned->pluck('name')->implode(', ');

            UserActivity::create([
                'user_id' => $user->id,
                'action' => 'reward_assigned',
                'meta' => [
                    'rewards' => $assigned->pluck('name')->all(),
                ],
            ]);

            $user->notify(new GenericNotification([
                'title' => 'Impano zo kwakira zafunguwe!',
                'title_rw' => 'Impano zo kwakira zafunguwe!',
                'title_en' => 'Welcome Rewards Unlocked!',
                'title_fr' => 'Recompenses de bienvenue debloquees!',
                'message' => 'Wabonye serivisi z\'ubuntu: ' . $namesRw . '.',
                'message_rw' => 'Wabonye serivisi z\'ubuntu: ' . $namesRw . '.',
                'message_en' => 'You just received free services: ' . $namesEn . '.',
                'message_fr' => 'Vous avez recu des services gratuits : ' . $namesFr . '.',
                'action_url' => route('rewards.index'),
                'action_text' => 'Reba impano',
                'action_text_rw' => 'Reba impano',
                'action_text_en' => 'View Rewards',
                'action_text_fr' => 'Voir les recompenses',
                'type' => 'success',
            ]));
        }

        return $rewards;
    }

    public function ensureDefaultRewards(): Collection
    {
        $defaults = [
            [
                'name' => 'Gufotora ku buntu',
                'name_rw' => 'Gufotora ku buntu',
                'name_en' => 'Free Photo Shoot',
                'name_fr' => 'Seance photo gratuite',
                'slug' => 'free-photo-shoot',
                'description' => 'Isesiyo y\'ifoto y\'ubuntu igufasha gufata amafoto meza.',
                'description_rw' => 'Isesiyo y\'ifoto y\'ubuntu igufasha gufata amafoto meza.',
                'description_en' => 'A complimentary photo session to capture your best moments.',
                'description_fr' => 'Seance photo gratuite pour capturer vos meilleurs moments.',
                'image' => 'https://source.unsplash.com/1200x800/?photoshoot,portrait',
                'expires_after_days' => 45,
            ],
            [
                'name' => 'Make up ku buntu',
                'name_rw' => 'Make up ku buntu',
                'name_en' => 'Free Make Up',
                'name_fr' => 'Maquillage gratuit',
                'slug' => 'free-make-up',
                'description' => 'Gutunganya mu maso k\'umwuga ku birori cyangwa studio.',
                'description_rw' => 'Gutunganya mu maso k\'umwuga ku birori cyangwa studio.',
                'description_en' => 'Professional makeup session for special events or studio work.',
                'description_fr' => 'Seance de maquillage professionnelle pour evenements speciaux.',
                'image' => 'https://source.unsplash.com/1200x800/?makeup,artist',
                'expires_after_days' => 45,
            ],
            [
                'name' => 'Gushushanya urubuga ku buntu',
                'name_rw' => 'Gushushanya urubuga ku buntu',
                'name_en' => 'Free Website Design',
                'name_fr' => 'Conception de site gratuite',
                'slug' => 'free-website-design',
                'description' => 'Igishushanyo cy\'urubuga kigenewe ikirango cyangwa ibirori byawe.',
                'description_rw' => 'Igishushanyo cy\'urubuga kigenewe ikirango cyangwa ibirori byawe.',
                'description_en' => 'Landing page design tailored for your brand or event.',
                'description_fr' => 'Conception gratuite d\'une page web adaptee a votre marque.',
                'image' => 'https://source.unsplash.com/1200x800/?webdesign,workspace',
                'expires_after_days' => 60,
            ],
        ];

        return collect($defaults)->map(function (array $rewardData) {
            $reward = Reward::firstOrCreate(
                ['slug' => $rewardData['slug']],
                $rewardData
            );

            if (empty($reward->description) || empty($reward->image)) {
                $reward->update([
                    'description' => $reward->description ?: $rewardData['description'],
                    'image' => $reward->image ?: $rewardData['image'],
                    'expires_after_days' => $reward->expires_after_days ?: $rewardData['expires_after_days'],
                ]);
            }

            return $reward;
        });
    }
}
