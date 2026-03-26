<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GenericNotification extends Notification
{
    use Queueable;

    public function __construct(private array $payload)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->payload['title'] ?? 'Update from Pavona Studios',
            'title_rw' => $this->payload['title_rw'] ?? $this->payload['title'] ?? null,
            'title_en' => $this->payload['title_en'] ?? null,
            'title_fr' => $this->payload['title_fr'] ?? null,
            'message' => $this->payload['message'] ?? '',
            'message_rw' => $this->payload['message_rw'] ?? $this->payload['message'] ?? null,
            'message_en' => $this->payload['message_en'] ?? null,
            'message_fr' => $this->payload['message_fr'] ?? null,
            'action_url' => $this->payload['action_url'] ?? null,
            'action_text' => $this->payload['action_text'] ?? null,
            'action_text_rw' => $this->payload['action_text_rw'] ?? $this->payload['action_text'] ?? null,
            'action_text_en' => $this->payload['action_text_en'] ?? null,
            'action_text_fr' => $this->payload['action_text_fr'] ?? null,
            'type' => $this->payload['type'] ?? 'info',
        ];
    }
}
