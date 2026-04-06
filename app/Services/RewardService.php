<?php

namespace App\Services;

use App\Models\Reward;
use App\Models\Service;
use App\Models\User;
use App\Models\UserReward;
use App\Models\UserActivity;
use App\Notifications\GenericNotification;
use Illuminate\Support\Collection;

class RewardService
{
    public function assignWelcomeRewards(User $user): Collection
    {
        $rewards = app(WelcomeOfferService::class)->selectedRewards();

        if ($rewards->isEmpty()) {
            return collect();
        }

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
                'title' => 'Free services zatoranyijwe kuri konti yawe',
                'title_rw' => 'Free services zatoranyijwe kuri konti yawe',
                'title_en' => 'Admin-selected free services for your account',
                'title_fr' => 'Services gratuits choisis pour votre compte',
                'message' => '🎉 Mwakiriye free services zatoranyijwe: ' . $namesRw . '.',
                'message_rw' => '🎉 Mwakiriye free services zatoranyijwe: ' . $namesRw . '.',
                'message_en' => '🎉 Congratulations! You received admin-selected free services: ' . $namesEn . '.',
                'message_fr' => '🎉 Felicitations ! Vous avez recu les services gratuits choisis : ' . $namesFr . '.',
                'action_url' => route('rewards.index'),
                'action_text' => 'Reba impano',
                'action_text_rw' => 'Reba impano',
                'action_text_en' => 'View Rewards',
                'action_text_fr' => 'Voir les recompenses',
                'type' => 'success',
                'notification_type' => 'reward',
            ]));

            $this->notifyAdmins($user, $assigned);
        }

        return $rewards;
    }

    public function ensureDefaultRewards(): Collection
    {
        $graphicsVideoPath = '/media/rewards/graphics-printing.mp4';
        $graphicsVideoFullPath = public_path(ltrim($graphicsVideoPath, '/'));
        $graphicsVideoAvailable = file_exists($graphicsVideoFullPath);
        $serviceMap = $this->defaultRewardServiceMap();

        $defaults = [
            [
                'name' => 'Ifoto na videwo ku buntu',
                'name_rw' => 'Ifoto na videwo ku buntu',
                'name_en' => 'Photography & Videography',
                'name_fr' => 'Photographie et videographie',
                'slug' => 'photography-videography',
                'description' => 'Ifoto na videwo by\'ubuntu byongera ingufu ku bikorwa byawe.',
                'description_rw' => 'Ifoto na videwo by\'ubuntu byongera ingufu ku bikorwa byawe.',
                'description_en' => 'Free photography and videography session to elevate your brand story.',
                'description_fr' => 'Seance photo et video gratuite pour sublimer votre marque.',
                'service_id' => $serviceMap['photography-videography'] ?? null,
                'image' => 'https://source.unsplash.com/1200x800/?photography,videography',
                'expires_after_days' => 45,
            ],
            [
                'name' => 'Igishushanyo n\'icapiro ku buntu',
                'name_rw' => 'Igishushanyo n\'icapiro ku buntu',
                'name_en' => 'Graphics & Printing Design',
                'name_fr' => 'Design graphique et impression',
                'slug' => 'graphics-printing-design',
                'description' => 'Igishushanyo cy\'ubuntu n\'igerageza ry\'icapiro ku mushinga wawe.',
                'description_rw' => 'Igishushanyo cy\'ubuntu n\'igerageza ry\'icapiro ku mushinga wawe.',
                'description_en' => 'Free graphic design and print-ready layout for your campaign.',
                'description_fr' => 'Design graphique gratuit et preparation a l\'impression.',
                'service_id' => $serviceMap['graphics-printing'] ?? null,
                'image' => $graphicsVideoAvailable
                    ? $graphicsVideoPath
                    : 'https://source.unsplash.com/1200x800/?graphic-design,printing',
                'expires_after_days' => 45,
            ],
            [
                'name' => 'Make up ku buntu',
                'name_rw' => 'Make up ku buntu',
                'name_en' => 'Make Up',
                'name_fr' => 'Maquillage',
                'slug' => 'make-up',
                'description' => 'Gutunganya mu maso k\'umwuga ku mafoto cyangwa ibirori.',
                'description_rw' => 'Gutunganya mu maso k\'umwuga ku mafoto cyangwa ibirori.',
                'description_en' => 'Professional makeup session for shoots and events.',
                'description_fr' => 'Seance de maquillage professionnelle pour shootings et evenements.',
                'service_id' => $serviceMap['make-up'] ?? null,
                'image' => 'https://source.unsplash.com/1200x800/?makeup,artist',
                'expires_after_days' => 45,
            ],
            [
                'name' => 'Software development ku buntu',
                'name_rw' => 'Software development ku buntu',
                'name_en' => 'Software Development',
                'name_fr' => 'Developpement logiciel',
                'slug' => 'software-development',
                'description' => 'Igenamigambi ry\'ubuntu rya software igufasha gutangiza igitekerezo.',
                'description_rw' => 'Igenamigambi ry\'ubuntu rya software igufasha gutangiza igitekerezo.',
                'description_en' => 'Free software discovery session and product roadmap.',
                'description_fr' => 'Session gratuite de decouverte et feuille de route logicielle.',
                'service_id' => $serviceMap['software-development'] ?? null,
                'image' => 'https://source.unsplash.com/1200x800/?software,development',
                'expires_after_days' => 60,
            ],
        ];

        return collect($defaults)->map(function (array $rewardData) use ($graphicsVideoAvailable, $graphicsVideoPath) {
            $reward = Reward::firstOrCreate(
                ['slug' => $rewardData['slug']],
                $rewardData
            );

            $updates = [];
            foreach (['name', 'name_rw', 'name_en', 'name_fr', 'description', 'description_rw', 'description_en', 'description_fr'] as $field) {
                if (empty($reward->{$field}) && !empty($rewardData[$field])) {
                    $updates[$field] = $rewardData[$field];
                }
            }

            if (empty($reward->service_id) && !empty($rewardData['service_id'])) {
                $updates['service_id'] = $rewardData['service_id'];
            }

            if ($reward->slug === 'graphics-printing-design' && $graphicsVideoAvailable && $reward->image !== $graphicsVideoPath) {
                $updates['image'] = $graphicsVideoPath;
            } elseif (empty($reward->image) && !empty($rewardData['image'])) {
                $updates['image'] = $rewardData['image'];
            }

            if (empty($reward->expires_after_days) && !empty($rewardData['expires_after_days'])) {
                $updates['expires_after_days'] = $rewardData['expires_after_days'];
            }

            if (!empty($updates)) {
                $reward->update($updates);
            }

            return $reward;
        });
    }

    private function defaultRewardServiceMap(): array
    {
        return Service::query()
            ->where(function ($query) {
                $query->whereNull('parent_service_id')
                    ->orWhereHas('parentService');
            })
            ->get(['id', 'title', 'service_key'])
            ->reduce(function (array $carry, Service $service) {
                if (!empty($service->service_key)) {
                    $carry[$service->service_key] = $service->id;
                }

                $titleKey = match ($service->title) {
                    'Photography & Videography' => 'photography-videography',
                    'Graphics & Printing Design' => 'graphics-printing',
                    'Make Up' => 'make-up',
                    'Other Services' => 'other-services',
                    'Software Development' => 'software-development',
                    'Website Development' => 'software-development',
                    'Sound System' => 'sound-system',
                    'Funerals' => 'funerals',
                    'Live Streaming' => 'live-streaming',
                    'Drone Services' => 'drone-services',
                    'Real Estate Services' => 'real-estate',
                    default => null,
                };

                if ($titleKey) {
                    $carry[$titleKey] = $service->id;
                }

                return $carry;
            }, []);
    }

    private function notifyAdmins(User $user, Collection $assigned): void
    {
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            return;
        }

        $namesRw = $assigned->pluck('name_rw')->filter()->implode(', ') ?: $assigned->pluck('name')->implode(', ');
        $namesEn = $assigned->pluck('name_en')->filter()->implode(', ') ?: $assigned->pluck('name')->implode(', ');
        $namesFr = $assigned->pluck('name_fr')->filter()->implode(', ') ?: $assigned->pluck('name')->implode(', ');

        $phone = $user->phone ?: 'N/A';

        foreach ($admins as $admin) {
            $admin->notify(new GenericNotification([
                'title' => 'Umukiriya mushya yakiriye impano',
                'title_rw' => 'Umukiriya mushya yakiriye impano',
                'title_en' => 'New user received rewards',
                'title_fr' => 'Nouveau client : recompenses attribuees',
                'message' => "Umukiriya {$user->name} ({$user->email}, {$phone}) yakiriye: {$namesRw}.",
                'message_rw' => "Umukiriya {$user->name} ({$user->email}, {$phone}) yakiriye: {$namesRw}.",
                'message_en' => "User {$user->name} ({$user->email}, {$phone}) received: {$namesEn}.",
                'message_fr' => "Client {$user->name} ({$user->email}, {$phone}) a recu : {$namesFr}.",
                'action_url' => route('admin.rewards'),
                'action_text' => 'Reba impano',
                'action_text_rw' => 'Reba impano',
                'action_text_en' => 'View Rewards',
                'action_text_fr' => 'Voir les recompenses',
                'type' => 'info',
                'notification_type' => 'reward',
            ]));
        }
    }
}
