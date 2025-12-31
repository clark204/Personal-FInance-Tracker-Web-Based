<?php

namespace App\Notifications;

use App\Models\Budget;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BudgetThresholdReached extends Notification implements ShouldQueue
{
    use Queueable;

    public Budget $budget;

    /**
     * Create a new notification instance.
     */
    public function __construct(Budget $budget)
    {
        $this->budget = $budget;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // Optional: user preference flags
        if (
            $notifiable->email_notifications &&
            $notifiable->budget_alerts &&
            !empty($notifiable->email)
        ) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $percent = round(
            ($this->budget->budget_spent / max($this->budget->budget_amount, 1)) * 100
        );

        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL'));

        return (new MailMessage)
            ->subject('⚠️ Budget Alert')
            ->greeting("Hi {$notifiable->name},")
            ->line("Your **{$this->budget->category->name}** budget is now {$percent}% used.")
            ->line("Spent: {$this->budget->budget_spent}")
            ->line("Limit: {$this->budget->budget_amount}")
            ->action(
                'View Budget',
                "{$frontendUrl}/budgets/{$this->budget->id}"
            )
            ->line('This alert was sent both in-app and via email.');
    }


    /**
     * Get the array representation of the notification (database).
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'budget',
            'budget_id' => $this->budget->id,
            'category' => $this->budget->category->name,
            'spent' => $this->budget->budget_spent,
            'limit' => $this->budget->budget_amount,
            'percent' => round(
                ($this->budget->budget_spent / max($this->budget->budget_amount, 1)) * 100
            ),
            'message' => 'You are close to exceeding your budget.',
        ];
    }
}
