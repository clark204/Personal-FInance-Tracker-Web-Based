<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Notifications\BudgetThresholdReached;
use Carbon\Carbon;

class TransactionObserver
{
    public function created(Transaction $transaction): void
    {
        $this->updateBudget($transaction);
    }

    public function updated(Transaction $transaction): void
    {
        $this->updateBudget($transaction);
    }

    public function deleted(Transaction $transaction): void
    {
        $this->updateBudget($transaction);
    }

    public function restored(Transaction $transaction): void
    {
        $this->updateBudget($transaction);
    }

    public function forceDeleted(Transaction $transaction): void
    {
        $this->updateBudget($transaction);
    }

    private function updateBudget(Transaction $transaction): void
    {
        if (!$transaction->budget) {
            return;
        }

        $budget = $transaction->budget;

        // Store previous spent BEFORE recalculation
        $previousSpent = $budget->budget_spent ?? 0;

        // Recalculate total spent
        $totalSpent = $budget->transactions()
            ->where('type', 'Expense')
            ->sum('amount');

        $budget->budget_spent = $totalSpent;

        // Update status (still useful for UI)
        $today = now();
        $endDate = Carbon::parse($budget->end_date);

        if ($totalSpent > $budget->budget_amount) {
            $budget->status = 'overbudget';
        } elseif ($totalSpent == $budget->budget_amount) {
            $budget->status = 'completed';
        } elseif ($today->gt($endDate)) {
            $budget->status = 'overdue';
        } else {
            $budget->status = 'ontrack';
        }

        $budget->save();

        // ---- THRESHOLD NOTIFICATION LOGIC ----
        $limit = max($budget->budget_amount, 1);

        $previousPercent = ($previousSpent / $limit) * 100;
        $currentPercent  = ($totalSpent / $limit) * 100;

        $threshold = 80;

        if (
            $previousPercent < $threshold &&
            $currentPercent >= $threshold
        ) {
            $budget->user?->notify(
                new BudgetThresholdReached($budget)
            );
        }
    }
}
