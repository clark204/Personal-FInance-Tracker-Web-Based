<?php

use App\Http\Controllers\AccountController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\TransactionController;

// ----------------------------
// Public Routes
// ----------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Email verification route (GET link from email)
Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');
Route::get('currencies', [CurrencyController::class, 'index']);

// ----------------------------
// Protected Routes (Require JWT Token)
// ----------------------------
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('accounts', AccountController::class);
});
