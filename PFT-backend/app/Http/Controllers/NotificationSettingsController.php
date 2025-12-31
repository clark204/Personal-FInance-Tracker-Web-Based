<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationSettingsController extends Controller
{

    // Update current user's notification settings
public function update(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['status' => 'unauthorized'], 401);
    }

    // Validate only the fields the user can update
    $validated = $request->validate([
        'email_notifications' => 'boolean',
        'budget_alerts' => 'boolean',
        'savings_alerts' => 'boolean',
    ]);

    $user->update($validated);

    return response()->json(['status' => 'saved']);
}

}
