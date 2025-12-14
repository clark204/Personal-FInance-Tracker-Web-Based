<?php

namespace App\Providers;

use App\Models\Savings;
use App\Models\SavingsTransaction;
use App\Models\Transaction;
use App\Observers\SavingsTransactionObserver;
use App\Observers\TransactionObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Transaction::observe(TransactionObserver::class);
        SavingsTransaction::observe(SavingsTransactionObserver::class);
    }
}
