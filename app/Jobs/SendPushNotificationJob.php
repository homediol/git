<?php

namespace App\Jobs;

use App\Services\FirebasePushService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPushNotificationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $notifiableClass,
        public int|string $notifiableId,
        public array $payload,
    ) {
    }

    public function handle(FirebasePushService $firebasePushService): void
    {
        if (!class_exists($this->notifiableClass)) {
            return;
        }

        $notifiable = $this->notifiableClass::find($this->notifiableId);

        if (!$notifiable) {
            return;
        }

        $firebasePushService->sendToUser($notifiable, $this->payload);
    }
}
