<?php

namespace App\Http\Controllers;

use App\Models\Savings;
use App\Models\SavingsTransaction;
use Illuminate\Http\Request;

class SavingsTransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'savings_id' => 'required|exists:savings,id',
            'type' => 'required|in:deposit,withdrawal',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
        ]);

        $savings = Savings::findOrFail($validated['savings_id']);
        $account = $savings->account;

        // Validate sufficient account balance for deposit
        if ($validated['type'] === 'deposit') {
            if ($account->balance < $validated['amount']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient account balance for this deposit.',
                    'current_balance' => $account->balance,
                    'required_amount' => $validated['amount'],
                    'shortfall' => $validated['amount'] - $account->balance,
                ], 400);
            }

            $savings->saved_amount += $validated['amount'];
            $account->balance -= $validated['amount'];
        }

        // Validate sufficient saved amount for withdrawal
        elseif ($validated['type'] === 'withdrawal') {
            if ($savings->saved_amount < $validated['amount']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient saved amount for withdrawal.',
                    'current_savings' => $savings->saved_amount,
                    'requested_amount' => $validated['amount'],
                    'shortfall' => $validated['amount'] - $savings->saved_amount,
                ], 400);
            }

            $savings->saved_amount -= $validated['amount'];
            $account->balance += $validated['amount'];
        }

        // Save both account and savings
        $account->save();
        $savings->save();

        // Create the transaction record
        $savingsTransaction = SavingsTransaction::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Savings transaction recorded successfully.',
            'data' => $savingsTransaction->load('savings'),
            'new_account_balance' => $account->balance,
            'new_savings_balance' => $savings->saved_amount,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SavingsTransaction $savingsTransaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SavingsTransaction $savingsTransaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SavingsTransaction $savingsTransaction)
    {
        //
    }
}
