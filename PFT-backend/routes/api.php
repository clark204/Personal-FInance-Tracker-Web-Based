<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// ----------------------------
// Public Routes
// ----------------------------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Email verification route (GET link from email)
Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

// ----------------------------
// Protected Routes (Require JWT Token)
// ----------------------------
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/me', [AuthController::class, 'me']);
});
