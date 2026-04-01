<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Service;
use App\Models\SiteSettings;
use App\Models\User;
use App\Models\UserActivity;
use App\Models\UserReward;
use App\Notifications\GenericNotification;
use Database\Seeders\ServiceCatalogSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $services = $this->bookingServices();
        $user = $request->user();

        $availableRewards = $user->userRewards()
            ->with('reward')
            ->latest()
            ->get()
            ->filter(fn (UserReward $userReward) => $this->rewardIsAvailable($userReward))
            ->values();

        $prefillReward = $availableRewards->firstWhere('id', $request->integer('reward'));
        $prefillService = $services->firstWhere('id', $request->integer('service'));

        if (!$prefillService && $prefillReward) {
            $prefillService = $services->first(fn (Service $service) => $this->rewardMatchesService($prefillReward, $service));
        }

        return Inertia::render('Bookings/Index', [
            'services' => $services->values(),
            'bookings' => $user->bookings()
                ->with(['service', 'userReward.reward'])
                ->latest()
                ->get(),
            'availableRewards' => $availableRewards,
            'prefill' => [
                'service_id' => $prefillService?->id,
                'user_reward_id' => $prefillReward?->id,
            ],
            'settings' => $this->settings(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $services = $this->bookingServices();
        $capturedAt = now();

        $validated = $request->validate([
            'service_id' => ['required', 'integer'],
            'description' => ['nullable', 'string', 'max:2000'],
            'use_reward' => ['nullable', 'boolean'],
            'user_reward_id' => ['nullable', 'integer'],
        ]);

        $service = $services->firstWhere('id', (int) $validated['service_id']);

        if (!$service) {
            return back()
                ->withErrors(['service_id' => 'Please choose one of the available booking services.'])
                ->withInput();
        }

        $user = $request->user();
        $useReward = $request->boolean('use_reward');
        $userReward = null;

        if ($useReward) {
            if (empty($validated['user_reward_id'])) {
                return back()
                    ->withErrors(['user_reward_id' => 'Select a free reward to use for this booking.'])
                    ->withInput();
            }

            $userReward = $user->userRewards()
                ->with('reward')
                ->find($validated['user_reward_id']);

            if (
                !$userReward ||
                !$this->rewardIsAvailable($userReward) ||
                !$this->rewardMatchesService($userReward, $service)
            ) {
                return back()
                    ->withErrors(['user_reward_id' => 'The selected reward cannot be used for this service.'])
                    ->withInput();
            }
        }

        $booking = DB::transaction(function () use ($user, $service, $validated, $userReward, $useReward, $capturedAt) {
            if ($useReward && $userReward) {
                $userReward->update([
                    'status' => 'used',
                    'used_at' => now(),
                ]);
            }

            $booking = Booking::create([
                'user_id' => $user->id,
                'service_id' => $service->id,
                'user_reward_id' => $useReward ? $userReward?->id : null,
                'status' => 'pending',
                'booking_date' => $capturedAt->toDateString(),
                'booking_time' => $capturedAt->format('H:i:s'),
                'description' => $validated['description'] ?? null,
                'status_updated_at' => $capturedAt,
            ]);

            UserActivity::create([
                'user_id' => $user->id,
                'action' => 'booking_created',
                'meta' => [
                    'booking_id' => $booking->id,
                    'service' => $service->title,
                    'submitted_at' => $capturedAt->toIso8601String(),
                    'used_reward' => $useReward,
                    'reward_id' => $userReward?->reward_id,
                ],
            ]);

            return $booking->load(['user', 'service', 'userReward.reward']);
        });

        $this->notifyUser($booking);
        $this->notifyAdmins($booking);

        return redirect()
            ->route('bookings.index')
            ->with('success', 'Booking received successfully.');
    }

    private function bookingServices(): Collection
    {
        $this->ensureBookingServicesExist();

        $services = Service::query()->whereNull('parent_service_id')->get();

        if (Schema::hasColumn('services', 'service_key')) {
            $keys = $this->bookingServiceKeys();
            $order = array_flip($keys);

            return $services
                ->whereIn('service_key', $keys)
                ->sortBy(fn (Service $service) => $order[$service->service_key] ?? 999)
                ->values();
        }

        $titles = $this->bookingServiceTitles();
        $order = array_flip($titles);

        return $services
            ->whereIn('title', $titles)
            ->sortBy(fn (Service $service) => $order[$service->title] ?? 999)
            ->values();
    }

    private function ensureBookingServicesExist(): void
    {
        if (Schema::hasColumn('services', 'service_key')) {
            $requiredKeys = $this->bookingServiceKeys();
            $services = Service::whereNull('parent_service_id')
                ->whereIn('service_key', $requiredKeys)
                ->get();

            if ($services->count() !== count($requiredKeys)) {
                (new ServiceCatalogSeeder())->run();
                return;
            }

            if (
                Schema::hasColumn('services', 'title_rw')
                && $services->contains(fn (Service $service) => empty($service->title_rw) || empty($service->description_rw))
            ) {
                (new ServiceCatalogSeeder())->run();
            }

            return;
        }

        $requiredTitles = $this->bookingServiceTitles();
        $existingTitles = Service::whereNull('parent_service_id')
            ->whereIn('title', $requiredTitles)
            ->pluck('title')
            ->all();

        if (count($existingTitles) !== count($requiredTitles)) {
            (new ServiceCatalogSeeder())->run();
        }
    }

    private function bookingServiceKeys(): array
    {
        return [
            'photography-videography',
            'graphics-printing',
            'make-up',
            'software-development',
            'sound-system',
        ];
    }

    private function bookingServiceTitles(): array
    {
        return [
            'Photography & Videography',
            'Graphics & Printing Design',
            'Make Up',
            'Software Development',
            'Sound System',
        ];
    }

    private function rewardIsAvailable(UserReward $userReward): bool
    {
        if ($userReward->status === 'used') {
            return false;
        }

        if ($userReward->expires_at && $userReward->expires_at->isPast()) {
            return false;
        }

        return (bool) $userReward->reward;
    }

    private function rewardMatchesService(UserReward $userReward, Service $service): bool
    {
        $reward = $userReward->reward;

        if (!$reward) {
            return false;
        }

        $serviceKey = $this->normalizedServiceKey($service);
        $allowedRewardSlugs = match ($serviceKey) {
            'graphics-printing' => ['graphics-printing-design', 'graphics-printing'],
            default => [$serviceKey],
        };

        if (!empty($reward->slug) && in_array($reward->slug, $allowedRewardSlugs, true)) {
            return true;
        }

        $serviceTitle = Str::slug($service->title);
        $rewardTitles = array_filter([
            $reward->name,
            $reward->name_rw,
            $reward->name_en,
            $reward->name_fr,
        ]);

        foreach ($rewardTitles as $title) {
            if (Str::contains(Str::slug($title), $serviceTitle)) {
                return true;
            }
        }

        return false;
    }

    private function normalizedServiceKey(Service $service): string
    {
        if (!empty($service->service_key)) {
            return $service->service_key;
        }

        return match (Str::lower(trim($service->title))) {
            'photography & videography' => 'photography-videography',
            'graphics & printing design' => 'graphics-printing',
            'make up' => 'make-up',
            'software development' => 'software-development',
            default => Str::slug($service->title),
        };
    }

    private function notifyUser(Booking $booking): void
    {
        $serviceTitle = $booking->service?->title ?? 'your selected service';

        $booking->user?->notify(new GenericNotification([
            'title' => 'Booking received',
            'title_rw' => 'Booking yakiriwe',
            'title_en' => 'Booking received',
            'title_fr' => 'Reservation recue',
            'message' => "We received your booking for {$serviceTitle}. Our team will confirm the next steps with you soon.",
            'message_rw' => "Twakiriye booking yawe ya {$serviceTitle}. Itsinda ryacu riza kugusubiza vuba ku ntambwe ikurikira.",
            'message_en' => "We received your booking for {$serviceTitle}. Our team will confirm the next steps with you soon.",
            'message_fr' => "Nous avons recu votre reservation pour {$serviceTitle}. Notre equipe vous contactera bientot pour la suite.",
            'action_url' => route('bookings.index'),
            'action_text' => 'View booking',
            'action_text_rw' => 'Reba booking',
            'action_text_en' => 'View booking',
            'action_text_fr' => 'Voir la reservation',
            'type' => 'success',
            'notification_type' => 'booking',
        ]));
    }

    private function notifyAdmins(Booking $booking): void
    {
        $serviceTitle = $booking->service?->title ?? 'Unknown service';
        $user = $booking->user;

        $message = sprintf(
            '%s (%s%s) requested %s. Review the booking and follow up with the client to confirm timing.',
            $user?->name ?? 'A user',
            $user?->email ?? 'no-email',
            $user?->phone ? ', '.$user->phone : '',
            $serviceTitle
        );

        User::where('role', 'admin')
            ->get()
            ->each(function (User $admin) use ($message) {
                $admin->notify(new GenericNotification([
                    'title' => 'New booking request',
                    'title_rw' => 'Booking nshya yinjiye',
                    'title_en' => 'New booking request',
                    'title_fr' => 'Nouvelle demande de reservation',
                    'message' => $message,
                    'message_rw' => $message,
                    'message_en' => $message,
                    'message_fr' => $message,
                    'action_url' => route('admin.bookings'),
                    'action_text' => 'Review booking',
                    'action_text_rw' => 'Suzuma booking',
                    'action_text_en' => 'Review booking',
                    'action_text_fr' => 'Verifier la reservation',
                    'type' => 'info',
                    'notification_type' => 'booking',
                ]));
            });
    }

    private function settings(): array
    {
        return [
            'header_bg' => SiteSettings::get('header_bg'),
            'main_bg' => SiteSettings::get('main_bg'),
            'footer_bg' => SiteSettings::get('footer_bg'),
        ];
    }
}
