<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\BudgetThresholdReached;
use App\Notifications\SavingsGoalReached;
use Illuminate\Console\Command;

class CheckGoals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:goals';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::with(['savings', 'budgets'])->get();

        foreach ($users as $user) {
            foreach ($user->savings as $savings) {
                if ($savings->saved_amount >= $savings->target_amount) {
                    $user->notify(new SavingsGoalReached($savings));
                }
            }

            foreach ($user->budgets as $budget) {
                $percent = ($budget->budget_spent / max($budget->budget_amount, 1)) * 100;
                if ($percent >= 90) {
                    $user->notify(new BudgetThresholdReached($budget));
                }
            }
        }
    }
}
