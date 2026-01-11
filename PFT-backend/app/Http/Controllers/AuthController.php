<?php

namespace App\Http\Controllers;

use App\Mail\AccountDeleted;
use App\Mail\VerifyEmail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    //
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|string|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation Error',
                'errors' => $validator->errors(),
            ], HttpResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password)
        ]);
    
        $verifyUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->email)]
        );

        try {
            Mail::to($user->email)->queue(new VerifyEmail($user, $verifyUrl));
        } catch (\Exception $e) {
            Log::error('Mail sending failed: ' . $e->getMessage());
            // Optionally, you can inform the user without throwing 500
            return response()->json([
                'status' => 'success',
                'message' => 'User created, but email could not be sent. Please contact support.',
                'user' => $user,
            ], HttpResponse::HTTP_CREATED);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User Created Successfully. Please check your email for verification link.',
            'user' => $user,
        ], HttpResponse::HTTP_CREATED);
    }

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!URL::hasValidSignature($request)) {
            return response()->view('emails.verification_failed', [
                'message' => 'Invalid or expired verification link.'
            ]);
        }

        if (sha1($user->email) !== $hash) {
            return response()->view('emails.verification_failed', [
                'message' => 'Invalid verification data.'
            ]);
        }

        if ($user->email_verified_at) {
            return redirect()->away(env('FRONTEND_URL') . '/auth?mode=login');
        }

        $user->email_verified_at = now();
        $user->save();

        return redirect()->away(env('FRONTEND_URL') . '/auth?mode=login');
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
                'errors' => $validator->errors()
            ], HttpResponse::HTTP_UNAUTHORIZED);
        }

        $credentials = $request->only('email', 'password');

        $token = Auth::attempt($credentials);

        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalide credentials'
            ], HttpResponse::HTTP_UNAUTHORIZED);
        }

        $user = Auth::user();

        if (is_null($user->email_verified_at)) {
            $cacheKey = 'verification_email_sent_' . $user->id;
            $lastSent = Cache::get($cacheKey);

            if (!$lastSent || now()->diffInMinutes($lastSent) > 5) {
                $verifyUrl = URL::temporarySignedRoute(
                    'verification.verify',
                    Carbon::now()->addMinutes(60),
                    ['id' => $user->id, 'hash' => sha1($user->email)]
                );

                Mail::to($user->email)->queue(new VerifyEmail($user, $verifyUrl));
                Cache::put($cacheKey, now(), now()->addMinutes(5));
            }

            Auth::logout();

            return response()->json([
                'status' => 'error',
                'message' => 'Email not verified. A new verification link has been sent to your email.'
            ], HttpResponse::HTTP_FORBIDDEN);
        }


        return response()->json([
            'status' => 'success',
            'user' => $user,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
                'expires_in' => Auth::factory()->getTTL() * 60
            ]
        ]);
    }

    public function logout()
    {
        Auth::logout();

        return response()->json([
            'status' => 'success',
            'message' => 'Successfully Logout'
        ]);
    }

    public function refresh()
    {
        return response()->json([
            'status' => 'success',
            'user' => Auth::user(),
            'authorization' => [
                'token' => Auth::refresh(),
                'type' => 'bearer',
            ]
        ]);
    }

    public function me()
    {
        return response()->json([
            'status' => 'success',
            'user' => Auth::user()
        ]);
    }

    // app/Http/Controllers/AuthController.php
    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        try {
            DB::beginTransaction();

            // Delete old image if exists
            if ($user->avatar) {
                // Extract filename from path
                $filename = basename($user->avatar);
                $oldPath = 'avatars/' . $filename;

                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Store new image with unique filename
            $path = $request->file('avatar')->store('avatars', 'public');

            $user->avatar = $path;
            $user->save();

            DB::commit();

            // Generate full URL
            $avatarUrl = asset('storage/' . $path);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile picture updated successfully',
                'avatar_url' => $avatarUrl,
                'avatar' => $path
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Profile picture update error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile picture'
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|min:2',
        ]);

        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            $user->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'user' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Profile update error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile'
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ], [
            'current_password.required' => 'Current password is required',
            'new_password.required' => 'New password is required',
            'new_password.min' => 'Password must be at least 8 characters',
            'new_password.confirmed' => 'Password confirmation does not match',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        try {
            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            // Check if new password is different from current
            if (Hash::check($validated['new_password'], $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'New password must be different from current password'
                ], 422);
            }

            // Update password
            $user->password = Hash::make($validated['new_password']);
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Password changed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Password change error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to change password'
            ], 500);
        }
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
            'confirmation' => 'required|string|in:DELETE MY ACCOUNT PERMANENTLY',
        ], [
            'password.required' => 'Password is required for account deletion',
            'confirmation.required' => 'Please type "DELETE MY ACCOUNT PERMANENTLY" to confirm',
            'confirmation.in' => 'Please type exactly "DELETE MY ACCOUNT PERMANENTLY" to confirm',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        try {
            // Verify password
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Password is incorrect'
                ], 422);
            }

            DB::beginTransaction();

            // Store user data for email before deletion
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ];

            // Delete related data (only the relationships that exist)
            $user->accounts()->delete();
            $user->transactions()->delete();
            $user->budgets()->delete();
            $user->savings()->delete();


            // Send confirmation email BEFORE deleting user
            try {
                Mail::to($user->email)->queue(new AccountDeleted($user));

                Log::info('Account deletion email sent', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            } catch (\Exception $emailError) {
                Log::error('Failed to send account deletion email: ' . $emailError->getMessage(), [
                    'user_id' => $user->id,
                ]);
                // Continue with deletion even if email fails
            }

            // Delete the user
            $user->delete();

            DB::commit();

            // Log successful deletion (after transaction)
            Log::info('Account permanently deleted', [
                'user_id' => $userData['id'],
                'email' => $userData['email'],
                'deleted_at' => now(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Account and all associated data have been permanently deleted. A confirmation email has been sent to your email address.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Account deletion error for user ' . $user->id . ': ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete account. Please try again later.',
                'debug' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
}
