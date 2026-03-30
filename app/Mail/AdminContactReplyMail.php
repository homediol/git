<?php

namespace App\Mail;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminContactReplyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Contact $contact,
        public User $admin,
        public string $replySubject,
        public string $replyMessage,
    ) {
    }

    public function build()
    {
        return $this->subject($this->replySubject)
            ->replyTo($this->admin->email, $this->admin->name)
            ->view('emails.admin-contact-reply');
    }
}
