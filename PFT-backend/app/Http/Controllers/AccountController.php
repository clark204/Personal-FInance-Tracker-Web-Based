<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
        $account = Account::where('user_id', Auth::id())->with('currency')->get();

        return response()->json([
            'status' => 'success',
            'account' => $account
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated = $request->validate([
            'account_name' => [
                'string',
                'max:255',
                'required',
                function ($attribute, $value, $fail) {
                    $exist = Account::where('account_name', $value)->exists();
                    if ($exist) {
                        $fail("You already have an Account Name '{$value}'. Please choose another name.");
                    }
                },
            ],

            'currency_id' => 'required|exists:currencies,id',
            'type' => 'string|in:Cash,General,Credit Card',
            'balance' => 'numeric|min:0',
        ]);

        $account = Account::create([
            'user_id' => Auth::id(),
            'currency_id' => $validated['currency_id'],
            'account_name' => $validated['account_name'],
            'type' => $validated['type'],
            'balance' => $validated['balance'] ?? 0,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Account Created Successfully',
            'data' => $account
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($account_id)
    {
        $account = Account::where('user_id', Auth::id())
            ->with(['currency', 'transactions', 'budgets', 'savings'])
            ->findOrFail($account_id);

        return response()->json([
            'status' => 'success',
            'data' => $account
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $account_id)
    {
        $account = Account::where('user_id', Auth::id())->findOrFail($account_id);

        $validated = $request->validate([
            'account_name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:cash,credit card,general'
        ]);

        $account->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Account Updated Successfully',
            'data' => $account
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($account_id)
    {
        $account = Account::where('user_id', Auth::id())->findOrFail($account_id);

        $account->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Account Deleted Successfully'
        ]);
    }

    // // activate account
    // public function activate($account_id)
    // {
    //     // deactivate all account
    //     Account::where('user_id', Auth::id())->update(['is_active' => false]);

    //     // activate only one account
    //     $account = Account::where('user_id', Auth::id())->findOrFail($account_id);
    //     $account->update(['is_active' => true]);

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Account Activate.'
    //     ]);
    // }

    // // 
    // public function deactivate($account_id)
    // {
    //     $account = Account::where('user_id', Auth::id())->findOrFail($account_id);

    //     $account->update(['is_active' => false]);

    //     return response()->json([
    //         'status' => 'success',
    //         'message' => 'Account Deactivate.'
    //     ]);
    // }
}
