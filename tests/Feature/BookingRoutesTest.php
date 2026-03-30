<?php

namespace Tests\Feature;

use Tests\TestCase;

class BookingRoutesTest extends TestCase
{
    public function test_guest_is_redirected_from_bookings_page(): void
    {
        $response = $this->get(route('bookings.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_guest_is_redirected_when_posting_a_booking(): void
    {
        $response = $this->post(route('bookings.store'), [
            'service_id' => 1,
            'booking_date' => now()->addDay()->toDateString(),
            'booking_time' => '10:00',
        ]);

        $response->assertRedirect(route('login'));
    }
}
