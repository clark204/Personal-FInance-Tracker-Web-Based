<?php

use App\Http\Controllers\AccountController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\NotificationSettingsController;
use App\Http\Controllers\SavingsController;
use App\Http\Controllers\SavingsTransactionController;
use App\Http\Controllers\TransactionController;

// ----------------------------
// Public Routes
// ----------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

Route::get('/currencies', [CurrencyController::class, 'index']);

Route::get('/queue-status', function () {
    $failed = DB::table('failed_jobs')->count();
    $pending = DB::table('jobs')->count();
    
    return response()->json([
        'failed_jobs' => $failed,
        'pending_jobs' => $pending,
        'message' => 'Queue status retrieved successfully'
    ]);
});

Route::get('/clear-queue', function () {
    Artisan::call('queue:flush');
    DB::table('failed_jobs')->truncate();
    DB::table('jobs')->truncate();
    
    return response()->json([
        'message' => 'All queues cleared! Try registering again.',
        'status' => 'success'
    ]);
});

Route::get('/test-email', function () {
    try {
        \Illuminate\Support\Facades\Mail::raw('Test email from Laravel with Resend!', function ($message) {
            $message->to('clarklagumbay0@gmail.com')
                    ->subject('Test Email - Resend Integration');
        });
        
        return response()->json([
            'message' => 'Test email sent! Check your inbox.',
            'status' => 'success'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error: ' . $e->getMessage(),
            'status' => 'error'
        ], 500);
    }
});

// ----------------------------
// Protected Routes (JWT)
// ----------------------------
Route::middleware('auth:api')->group(function () {

    // USER
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/profile/avatar', [AuthController::class, 'updateProfilePicture']);
    Route::post('/profile', [AuthController::class, 'update']);
    Route::post('/settings/change-password', [AuthController::class, 'changePassword']);
    Route::post('/delete/account', [AuthController::class, 'deleteAccount']);

    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('budgets', BudgetController::class);
    Route::apiResource('savings', SavingsController::class);
    Route::apiResource('savings-transactions', SavingsTransactionController::class);

    Route::get('/export', [ExportController::class, 'export']);

    Route::post('/notification-settings', [NotificationSettingsController::class, 'update']);

    // Notifications
    Route::get('/notifications', function (Request $request) {
        return response()->json([
            'unread_count' => $request->user()->unreadNotifications()->count(),
            'notifications' => $request->user()->notifications()
                ->latest()
                ->take(15)
                ->get(),
        ]);
    });

    Route::post('/notifications/read', function (Request $request) {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['status' => 'ok']);
    });
});
