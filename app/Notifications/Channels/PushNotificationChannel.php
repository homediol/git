<?php

namespace App\Notifications\Channels;

use App\Jobs\SendPushNotificationJob;
use App\Models\User;
use App\Notifications\GenericNotification;

class PushNotificationChannel
{
    public function send(object $notifiable, object $notification): void
    {
        if (!$notifiable instanceof User || !$notification instanceof GenericNotification) {
            return;
        }

        SendPushNotificationJob::dispatch(
            $notifiable::class,
            $notifiable->getKey(),
            $notification->toPush($notifiable),
        );
    }
}
