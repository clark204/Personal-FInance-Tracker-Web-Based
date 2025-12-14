<?php

namespace App\Console\Commands;

use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateBudgets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'budgets:update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate budget spent and status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = now();

        Budget::with('transactions')->chunk(100, function ($budgets) use ($today) {
            foreach ($budgets as $budget) {

                $totalSpent = $budget->transactions
                    ->where('type', 'Expense')
                    ->sum('amount');

                $budget->budget_spent = $totalSpent;

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
            }
        });
        $this->info('Budgets updated successfully.');
    }
}
