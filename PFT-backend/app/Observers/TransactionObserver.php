<?php

namespace App\Observers;

use App\Models\Transaction;
use Carbon\Carbon;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->updateBudgetOnTransactionChange($transaction);
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        $this->updateBudgetOnTransactionChange($transaction);
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->updateBudgetOnTransactionChange($transaction);
    }

    /**
     * Handle the Transaction "restored" event.
     */
    public function restored(Transaction $transaction): void
    {
        $this->updateBudgetOnTransactionChange($transaction);
    }

    /**
     * Handle the Transaction "force deleted" event.
     */
    public function forceDeleted(Transaction $transaction): void
    {
        $this->updateBudgetOnTransactionChange($transaction);
    }

    public function updateBudgetOnTransactionChange(Transaction $transaction): void
    {
        if (!$transaction->budget) return;

        $budget = $transaction->budget;

        // Always recalc total spent from linked transactions
        $totalSpent = $budget->transactions
            ->where('type', 'Expense')
            ->sum('amount');

        $budget->budget_spent = $totalSpent;

        $today = now();
        $endDate = Carbon::parse($budget->end_date);

        // --- 1. Overbudget ---
        if ($totalSpent > $budget->budget_amount) {
            $budget->status = 'overbudget';
        }

        // --- 2. Completed ---
        else if ($totalSpent == $budget->budget_amount) {
            $budget->status = 'completed';
        }

        // --- 3. Overdue ---
        else if ($today->gt($endDate)) {
            $budget->status = 'overdue';
        }

        // --- 4. Ontrack ---
        else {
            $budget->status = 'ontrack';
        }

        $budget->save();
    }
}
