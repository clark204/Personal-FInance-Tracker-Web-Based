<?php

namespace App\Http\Controllers;

use App\Mail\VerifyEmail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            'password' => 'required|string|min:6|confirmed'
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
            Mail::to($user->email)->send(new VerifyEmail($user, $verifyUrl));
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

        if (! URL::hasValidSignature($request)) {
            return response()->json(['message' => 'Invalid or expired verification link.'], 400);
        }

        if (sha1($user->email) !== $hash) {
            return response()->json(['message' => 'Invalid verification data.'], 400);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        $user->email_verified_at = now();
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Email verified successfully! You can now log in.',
            'user' => $user
        ]);
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
                'message' => 'Unauthorized'
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

                Mail::to($user->email)->send(new VerifyEmail($user, $verifyUrl));
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
}
