<?php

namespace App\Console\Commands;

use App\Models\Budget;
use App\Notifications\BudgetThresholdReached;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateBudgets extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'budgets:update';

    /**
     * The console command description.
     */
    protected $description = 'Recalculate budget spent, status, and trigger threshold alerts';

    public function handle()
    {
        $today = now();

        Budget::with('transactions')->chunk(100, function ($budgets) use ($today) {
            foreach ($budgets as $budget) {

                $previousSpent = $budget->budget_spent ?? 0;

                // Recalculate total spent
                $totalSpent = $budget->transactions
                    ->where('type', 'Expense')
                    ->sum('amount');

                $budget->budget_spent = $totalSpent;

                // Update status
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

                // ---- THRESHOLD NOTIFICATION ----
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
        });

        $this->info('Budgets updated successfully.');
    }
}
