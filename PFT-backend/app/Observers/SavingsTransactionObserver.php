<?php

namespace App\Observers;

use App\Models\SavingsTransaction;

class SavingsTransactionObserver
{
    /**
     * Handle the SavingsTransaction "created" event.
     */
    public function created(SavingsTransaction $savingsTransaction): void
    {
        $this->recalculate($savingsTransaction);
    }

    /**
     * Handle the SavingsTransaction "updated" event.
     */
    public function updated(SavingsTransaction $savingsTransaction): void
    {
        //
    }

    /**
     * Handle the SavingsTransaction "deleted" event.
     */
    public function deleted(SavingsTransaction $savingsTransaction): void
    {
        //
    }

    /**
     * Handle the SavingsTransaction "restored" event.
     */
    public function restored(SavingsTransaction $savingsTransaction): void
    {
        //
    }

    /**
     * Handle the SavingsTransaction "force deleted" event.
     */
    public function forceDeleted(SavingsTransaction $savingsTransaction): void
    {
        //
    }

    private function recalculate(SavingsTransaction $transaction): void
    {
        $savings = $transaction->savings;

        if (!$savings) return;

        // ---- STATUS LOGIC ----
        if ($savings->status !== 'paused') {
            if ($savings->saved_amount >= $savings->target_amount) {
                $savings->status = 'reached';
            } else {
                $savings->status = 'active';
            }
        }

        $savings->save();
    }
}
