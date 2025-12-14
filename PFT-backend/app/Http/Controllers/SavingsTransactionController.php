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

        if ($validated['type'] === 'deposit') {
            $savings->saved_amount += $validated['amount'];
            $account->balance -= $validated['amount'];
        } elseif ($validated['type'] === 'withdrawal') {
            if ($savings->saved_amount < $validated['amount']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient saved amount for withdrawal.',
                ], 400);
            }
            $savings->saved_amount -= $validated['amount'];
            $account->balance += $validated['amount'];
        }
        $account->save();
        $savings->save();

        $savingsTransaction = SavingsTransaction::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Savings transaction recorded successfully.',
            'data' => $savingsTransaction->load('savings'),
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
