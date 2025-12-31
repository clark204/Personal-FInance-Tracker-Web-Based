<?php

use App\Console\Commands\CheckGoals;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

app()->booted(function () {
    $schedule = app(Schedule::class);

    $schedule->command('budgets:update')->everyFiveMinutes();
    $schedule->command('check:goals')->everyMinute();
    // or ->everyFiveMinutes()
});