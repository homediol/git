<?php

namespace App\Services;

use App\Models\Reward;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Notifications\GenericNotification;
use Illuminate\Support\Collection;

class WelcomeOfferService
{
    private const DEFAULT_DISCOUNT_PERCENT = 15;

    public function getConfig(): array
    {
        $selectedRewardIds = $this->selectedRewardIds();
        $rewards = $this->selectedRewards($selectedRewardIds);
        $discountCards = $this->discountCards();
        $primaryCard = $discountCards[0] ?? null;
        $hasDiscount = count($discountCards) > 0;

        return [
            'discount_percent' => $primaryCard['discount_percent'] ?? null,
            'discount_code' => $primaryCard['discount_code'] ?? null,
            'original_price_rwf' => $primaryCard['original_price_rwf'] ?? null,
            'discounted_price_rwf' => $primaryCard['discounted_price_rwf'] ?? null,
            'discount_cards' => $discountCards,
            'discount_card_count' => count($discountCards),
            'selected_reward_ids' => $rewards->pluck('id')->all(),
            'rewards' => $rewards,
            'has_discount' => $hasDiscount,
            'has_free_rewards' => $rewards->isNotEmpty(),
            'has_offer' => $hasDiscount || $rewards->isNotEmpty(),
        ];
    }

    public function forFrontend(?User $user = null): array
    {
        $config = $this->getConfig();

        return [
            'discount_percent' => $config['discount_percent'],
            'discount_code' => $config['discount_code'],
            'original_price_rwf' => $config['original_price_rwf'],
            'discounted_price_rwf' => $config['discounted_price_rwf'],
            'discount_cards' => $config['discount_cards'],
            'discount_card_count' => $config['discount_card_count'],
            'selected_reward_ids' => $config['selected_reward_ids'],
            'selected_reward_count' => count($config['selected_reward_ids']),
            'has_discount' => $config['has_discount'],
            'has_free_rewards' => $config['has_free_rewards'],
            'has_offer' => $config['has_offer'],
            'eligible' => $this->isEligibleForUser($user),
            'rewards' => $config['rewards']->map(function (Reward $reward) {
                return [
                    'id' => $reward->id,
                    'name' => $reward->name,
                    'name_rw' => $reward->name_rw,
                    'name_en' => $reward->name_en,
                    'name_fr' => $reward->name_fr,
                    'description' => $reward->description,
                    'description_rw' => $reward->description_rw,
                    'description_en' => $reward->description_en,
                    'description_fr' => $reward->description_fr,
                    'image' => $reward->image,
                    'slug' => $reward->slug,
                    'service' => $reward->service ? [
                        'id' => $reward->service->id,
                        'title' => $reward->service->title,
                        'title_rw' => $reward->service->title_rw,
                        'title_en' => $reward->service->title_en,
                        'title_fr' => $reward->service->title_fr,
                    ] : null,
                ];
            })->values()->all(),
        ];
    }

    public function isEligibleForUser(?User $user): bool
    {
        if (!$user) {
            return true;
        }

        return !$user->bookings()->exists();
    }

    public function selectedRewards(?array $selectedRewardIds = null): Collection
    {
        $selectedRewardIds = $selectedRewardIds ?? $this->selectedRewardIds();

        if (empty($selectedRewardIds)) {
            return collect();
        }

        $rewards = Reward::query()
            ->with('service')
            ->whereIn('id', $selectedRewardIds)
            ->where('is_active', true)
            ->get()
            ->keyBy('id');

        return collect($selectedRewardIds)
            ->map(fn (int $rewardId) => $rewards->get($rewardId))
            ->filter()
            ->values();
    }

    public function updateConfig(array $payload): array
    {
        $discountCards = collect($payload['discount_cards'] ?? [])
            ->map(fn (array $card) => $this->normalizeDiscountCard($card))
            ->filter(fn (array $card) => $this->cardHasContent($card))
            ->values()
            ->all();

        $primaryCard = $discountCards[0] ?? null;

        Setting::set('welcome_discount_cards', json_encode($discountCards));
        Setting::set('welcome_discount_percent', $this->normalizeScalar($primaryCard['discount_percent'] ?? null));
        Setting::set('welcome_discount_code', $this->normalizeScalar($primaryCard['discount_code'] ?? null));
        Setting::set('welcome_original_price_rwf', $this->normalizeScalar($primaryCard['original_price_rwf'] ?? null));
        Setting::set('welcome_discounted_price_rwf', $this->normalizeScalar($primaryCard['discounted_price_rwf'] ?? null));
        Setting::set(
            'welcome_reward_ids',
            json_encode(
                collect($payload['selected_reward_ids'] ?? [])
                    ->map(fn ($id) => (int) $id)
                    ->filter()
                    ->values()
                    ->all()
            )
        );

        return $this->getConfig();
    }

    public function notifyDiscount(User $user): void
    {
        $config = $this->getConfig();

        if (!$config['has_discount'] || !$this->isEligibleForUser($user)) {
            return;
        }

        $rewardNamesRw = $config['rewards']->pluck('name_rw')->filter()->implode(', ')
            ?: $config['rewards']->pluck('name')->implode(', ');
        $rewardNamesEn = $config['rewards']->pluck('name_en')->filter()->implode(', ')
            ?: $config['rewards']->pluck('name')->implode(', ');
        $rewardNamesFr = $config['rewards']->pluck('name_fr')->filter()->implode(', ')
            ?: $config['rewards']->pluck('name')->implode(', ');

        $rewardSummaryRw = $rewardNamesRw !== '' ? ' Free services zatoranyijwe: ' . $rewardNamesRw . '.' : '';
        $rewardSummaryEn = $rewardNamesEn !== '' ? ' Admin-selected free services: ' . $rewardNamesEn . '.' : '';
        $rewardSummaryFr = $rewardNamesFr !== '' ? ' Services gratuits choisis par l admin : ' . $rewardNamesFr . '.' : '';

        $discountMessageRw = $this->buildDiscountMessage('rw', $config['discount_cards']);
        $discountMessageEn = $this->buildDiscountMessage('en', $config['discount_cards']);
        $discountMessageFr = $this->buildDiscountMessage('fr', $config['discount_cards']);

        $user->notify(new GenericNotification([
            'title' => 'Discount ku bakiriya bashya',
            'title_rw' => 'Discount ku bakiriya bashya',
            'title_en' => 'Welcome discount for new customers',
            'title_fr' => 'Remise de bienvenue pour nouveaux clients',
            'message' => $discountMessageRw . $rewardSummaryRw,
            'message_rw' => $discountMessageRw . $rewardSummaryRw,
            'message_en' => $discountMessageEn . $rewardSummaryEn,
            'message_fr' => $discountMessageFr . $rewardSummaryFr,
            'action_url' => route('rewards.index'),
            'action_text' => 'Reba offer',
            'action_text_rw' => 'Reba offer',
            'action_text_en' => 'View offer',
            'action_text_fr' => 'Voir l offre',
            'type' => 'success',
            'notification_type' => 'promotion',
        ]));
    }

    private function buildDiscountMessage(string $locale, array $discountCards): string
    {
        if (empty($discountCards)) {
            return match ($locale) {
                'fr' => 'Votre remise de bienvenue est prete.',
                'en' => 'Your welcome discount is ready.',
                default => 'Welcome discount yawe yiteguye.',
            };
        }

        $intro = count($discountCards) === 1
            ? match ($locale) {
                'fr' => 'Vous avez une remise de bienvenue sur votre premiere reservation.',
                'en' => 'You have a welcome discount on your first booking.',
                default => 'Ufite welcome discount ku booking yawe ya mbere.',
            }
            : match ($locale) {
                'fr' => 'Vous avez plusieurs cartes de remise de bienvenue sur votre premiere reservation.',
                'en' => 'You have multiple welcome discount cards for your first booking.',
                default => 'Ufite welcome discount cards zitandukanye ku booking yawe ya mbere.',
            };

        $cardSummaries = collect($discountCards)
            ->map(fn (array $card) => $this->buildDiscountCardMessage($locale, $card))
            ->filter()
            ->implode(' ');

        return trim($intro . ' ' . $cardSummaries);
    }

    private function buildDiscountCardMessage(string $locale, array $card): string
    {
        $title = $this->localizedCardTitle($locale, $card);
        $discountLabel = $card['discount_percent'] !== null
            ? $card['discount_percent'] . '%'
            : match ($locale) {
                'fr' => 'speciale',
                'en' => 'special',
                default => 'idasanzwe',
            };

        $priceMessage = '';

        if ($card['original_price_rwf'] !== null && $card['discounted_price_rwf'] !== null) {
            $originalPrice = number_format($card['original_price_rwf']) . ' FRW';
            $discountedPrice = number_format($card['discounted_price_rwf']) . ' FRW';

            $priceMessage = match ($locale) {
                'fr' => ' Prix : ' . $originalPrice . ' -> ' . $discountedPrice . '.',
                'en' => ' Price: ' . $originalPrice . ' -> ' . $discountedPrice . '.',
                default => ' Igiciro: ' . $originalPrice . ' -> ' . $discountedPrice . '.',
            };
        }

        $codeMessage = $card['discount_code']
            ? match ($locale) {
                'fr' => ' Code : ' . $card['discount_code'] . '.',
                default => ' Code: ' . $card['discount_code'] . '.',
            }
            : '';

        return match ($locale) {
            'fr' => $title . ' : remise ' . $discountLabel . '.' . $priceMessage . $codeMessage,
            'en' => $title . ': ' . $discountLabel . ' off.' . $priceMessage . $codeMessage,
            default => $title . ': discount ya ' . $discountLabel . '.' . $priceMessage . $codeMessage,
        };
    }

    private function discountPercent(): ?int
    {
        $value = Setting::get('welcome_discount_percent');

        if ($value === null) {
            return self::DEFAULT_DISCOUNT_PERCENT;
        }

        return $this->nullableInt($value);
    }

    private function discountCards(): array
    {
        $stored = Setting::get('welcome_discount_cards');

        if ($stored !== null) {
            $decoded = json_decode((string) $stored, true);

            if (!is_array($decoded)) {
                return [];
            }

            $cards = collect($decoded)
                ->map(fn ($card) => $this->normalizeDiscountCard(is_array($card) ? $card : []))
                ->filter(fn (array $card) => $this->cardHasContent($card))
                ->values()
                ->all();

            return $this->attachDiscountCardServices($cards);
        }

        return $this->attachDiscountCardServices($this->legacyDiscountCards());
    }

    private function legacyDiscountCards(): array
    {
        $legacyCard = $this->normalizeDiscountCard([
            'title_rw' => 'Welcome discount',
            'title_en' => 'Welcome discount',
            'title_fr' => 'Remise de bienvenue',
            'discount_percent' => $this->discountPercent(),
            'discount_code' => $this->settingString('welcome_discount_code'),
            'original_price_rwf' => $this->settingInt('welcome_original_price_rwf'),
            'discounted_price_rwf' => $this->settingInt('welcome_discounted_price_rwf'),
        ]);

        return $this->cardHasContent($legacyCard) ? [$legacyCard] : [];
    }

    private function selectedRewardIds(): array
    {
        $stored = Setting::get('welcome_reward_ids', '[]');
        $decoded = json_decode((string) $stored, true);

        if (!is_array($decoded)) {
            return [];
        }

        return collect($decoded)
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values()
            ->all();
    }

    private function localizedCardTitle(string $locale, array $card): string
    {
        return match ($locale) {
            'fr' => $card['title_fr'] ?? $card['title_en'] ?? $card['title_rw'] ?? $card['title'] ?? 'Offre',
            'en' => $card['title_en'] ?? $card['title_rw'] ?? $card['title_fr'] ?? $card['title'] ?? 'Offer',
            default => $card['title_rw'] ?? $card['title_en'] ?? $card['title_fr'] ?? $card['title'] ?? 'Offer',
        };
    }

    private function normalizeDiscountCard(array $card): array
    {
        $titleRw = $this->normalizeNullableString($card['title_rw'] ?? $card['title'] ?? null);
        $titleEn = $this->normalizeNullableString($card['title_en'] ?? null);
        $titleFr = $this->normalizeNullableString($card['title_fr'] ?? null);
        $serviceId = $this->nullableInt($card['service_id'] ?? null);
        $service = $card['service'] ?? null;

        return [
            'title' => $titleRw ?? $titleEn ?? $titleFr,
            'title_rw' => $titleRw,
            'title_en' => $titleEn,
            'title_fr' => $titleFr,
            'service_id' => $serviceId,
            'service' => is_array($service) ? $service : null,
            'discount_percent' => $this->nullableInt($card['discount_percent'] ?? null),
            'discount_code' => $this->normalizeNullableString($card['discount_code'] ?? null),
            'original_price_rwf' => $this->nullableInt($card['original_price_rwf'] ?? null),
            'discounted_price_rwf' => $this->nullableInt($card['discounted_price_rwf'] ?? null),
        ];
    }

    private function attachDiscountCardServices(array $cards): array
    {
        $serviceIds = collect($cards)
            ->pluck('service_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->all();

        if ($serviceIds === []) {
            return $cards;
        }

        $services = Service::query()
            ->whereIn('id', $serviceIds)
            ->get(['id', 'title', 'title_rw', 'title_en', 'title_fr'])
            ->keyBy('id');

        return collect($cards)
            ->map(function (array $card) use ($services) {
                $serviceId = $card['service_id'] ?? null;

                if (!$serviceId) {
                    $card['service'] = null;

                    return $card;
                }

                /** @var \App\Models\Service|null $service */
                $service = $services->get((int) $serviceId);
                $card['service'] = $this->servicePayload($service);

                if ($card['service'] === null) {
                    $card['service_id'] = null;
                }

                return $card;
            })
            ->values()
            ->all();
    }

    private function servicePayload(?Service $service): ?array
    {
        if (!$service) {
            return null;
        }

        return [
            'id' => $service->id,
            'title' => $service->title,
            'title_rw' => $service->title_rw,
            'title_en' => $service->title_en,
            'title_fr' => $service->title_fr,
        ];
    }

    private function cardHasContent(array $card): bool
    {
        return $card['title_rw'] !== null
            || $card['title_en'] !== null
            || $card['title_fr'] !== null
            || $card['discount_percent'] !== null
            || $card['discount_code'] !== null
            || $card['original_price_rwf'] !== null
            || $card['discounted_price_rwf'] !== null;
    }

    private function settingString(string $key): ?string
    {
        $value = Setting::get($key);

        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed !== '' ? $trimmed : null;
    }

    private function settingInt(string $key): ?int
    {
        return $this->nullableInt(Setting::get($key));
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (int) $value : null;
    }

    private function normalizeScalar(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return '';
        }

        return (string) $value;
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim((string) $value);

        return $trimmed !== '' ? $trimmed : null;
    }
}
