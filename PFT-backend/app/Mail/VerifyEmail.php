<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $verifyUrl;
    /**
     * Create a new message instance.
     */
    public function __construct(User $user, $verifyUrl)
    {
        $this->user = $user;
        $this->verifyUrl = $verifyUrl;
    }
    public function build()
    {
        return $this->subject('Verify Your Email Address')
        ->view('emails.verify-email')
        ->with([
            'user' => $this->user,
            'verifyUrl' => $this->verifyUrl,
        ]);
    }
}
