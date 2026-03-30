<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\UserActivity;
use App\Notifications\GenericNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $bookings = Booking::with(['user', 'service', 'userReward.reward'])
            ->latest()
            ->get();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'stats' => [
                'total' => $bookings->count(),
                'pending' => $bookings->where('status', 'pending')->count(),
                'approved' => $bookings->where('status', 'approved')->count(),
                'rejected' => $bookings->where('status', 'rejected')->count(),
            ],
        ]);
    }

    public function approve(Booking $booking): RedirectResponse
    {
        DB::transaction(function () use ($booking) {
            if ($booking->userReward && $booking->userReward->status !== 'used') {
                $booking->userReward->update([
                    'status' => 'used',
                    'used_at' => now(),
                ]);
            }

            $booking->update([
                'status' => 'approved',
                'status_updated_at' => now(),
                'approved_at' => now(),
                'rejected_at' => null,
            ]);

            UserActivity::create([
                'user_id' => $booking->user_id,
                'action' => 'booking_approved',
                'meta' => [
                    'booking_id' => $booking->id,
                    'service' => $booking->service?->title,
                ],
            ]);
        });

        $booking->refresh()->load(['user', 'service', 'userReward.reward']);
        $this->notifyUser($booking, 'approved');

        return back()->with('success', 'Booking approved.');
    }

    public function reject(Booking $booking): RedirectResponse
    {
        DB::transaction(function () use ($booking) {
            if ($booking->userReward && $booking->userReward->status === 'used') {
                $booking->userReward->update([
                    'status' => 'unused',
                    'used_at' => null,
                ]);
            }

            $booking->update([
                'status' => 'rejected',
                'status_updated_at' => now(),
                'approved_at' => null,
                'rejected_at' => now(),
            ]);

            UserActivity::create([
                'user_id' => $booking->user_id,
                'action' => 'booking_rejected',
                'meta' => [
                    'booking_id' => $booking->id,
                    'service' => $booking->service?->title,
                    'reward_restored' => (bool) $booking->user_reward_id,
                ],
            ]);
        });

        $booking->refresh()->load(['user', 'service', 'userReward.reward']);
        $this->notifyUser($booking, 'rejected');

        return back()->with('success', 'Booking rejected.');
    }

    private function notifyUser(Booking $booking, string $status): void
    {
        $serviceTitle = $booking->service?->title ?? 'your booking';

        $message = match ($status) {
            'approved' => [
                'title' => 'Booking approved',
                'title_rw' => 'Booking yemejwe',
                'title_en' => 'Booking approved',
                'title_fr' => 'Reservation approuvee',
                'message' => "Your {$serviceTitle} booking has been approved. Our team will contact you with the next steps.",
                'message_rw' => "Booking yawe ya {$serviceTitle} yemejwe. Itsinda ryacu riza kukugezaho intambwe ikurikira.",
                'message_en' => "Your {$serviceTitle} booking has been approved. Our team will contact you with the next steps.",
                'message_fr' => "Votre reservation {$serviceTitle} a ete approuvee. Notre equipe vous contactera pour la suite.",
                'type' => 'success',
            ],
            default => [
                'title' => 'Booking rejected',
                'title_rw' => 'Booking yanze',
                'title_en' => 'Booking rejected',
                'title_fr' => 'Reservation refusee',
                'message' => "Your {$serviceTitle} booking was not approved. You can send another request whenever you are ready.",
                'message_rw' => "Booking yawe ya {$serviceTitle} ntiyemejwe. Ushobora kongera kohereza indi request igihe ushakiye.",
                'message_en' => "Your {$serviceTitle} booking was not approved. You can send another request whenever you are ready.",
                'message_fr' => "Votre reservation {$serviceTitle} n'a pas ete approuvee. Vous pouvez envoyer une nouvelle demande quand vous voulez.",
                'type' => 'warning',
            ],
        };

        $booking->user?->notify(new GenericNotification([
            ...$message,
            'action_url' => route('bookings.index'),
            'action_text' => 'Open bookings',
            'action_text_rw' => 'Fungura bookings',
            'action_text_en' => 'Open bookings',
            'action_text_fr' => 'Ouvrir les reservations',
            'notification_type' => 'booking',
        ]));
    }
}
