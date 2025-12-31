<?php

namespace App\Notifications;

use App\Models\Savings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SavingsGoalReached extends Notification implements ShouldQueue
{
    use Queueable;

    public Savings $savings;

    public function __construct(Savings $savings)
    {
        $this->savings = $savings;
    }

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (
            $notifiable->email_notifications &&
            $notifiable->savings_alerts &&
            !empty($notifiable->email)
        ) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL'));

        return (new MailMessage)
            ->subject('🎉 Savings Goal Achieved!')
            ->greeting("Nice work, {$notifiable->name}!")
            ->line("You've reached your savings goal for **{$this->savings->savings_name}**.")
            ->line("Saved: {$this->savings->saved_amount}")
            ->line("Goal: {$this->savings->target_amount}")
            ->action(
                'View Savings',
                "{$frontendUrl}/savings/{$this->savings->id}"
            )
            ->line('Momentum is a powerful thing. Keep going.');
    }


    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'savings',
            'savings_id' => $this->savings->id,
            'name' => $this->savings->savings_name,
            'current' => $this->savings->saved_amount,
            'target' => $this->savings->target_amount,
            'message' => 'Savings goal reached 🎉',
        ];
    }
}
