<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PromotionCampaignMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public array $payload,
        public User $user,
    ) {
    }

    public function build(): self
    {
        $content = $this->resolveContent();

        return $this->subject($content['title'])
            ->view('emails.promotion-campaign', [
                'content' => $content,
                'user' => $this->user,
            ]);
    }

    private function resolveContent(): array
    {
        $language = $this->user->language ?: 'rw';

        return [
            'title' => $this->payload["title_{$language}"] ?? $this->payload['title'] ?? 'Pavona Studio Update',
            'message' => $this->payload["message_{$language}"] ?? $this->payload['message'] ?? '',
            'action_text' => $this->payload["action_text_{$language}"] ?? $this->payload['action_text'] ?? null,
            'action_url' => $this->payload['action_url'] ?? null,
        ];
    }
}
