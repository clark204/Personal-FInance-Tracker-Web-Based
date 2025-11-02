<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $transactionQuery = Transaction::where('user_id', $user->id)->with(['account', 'category']);

        if ($request->filled('account_id')) {
            $transactionQuery->where('account_id', $request->account_id);
        }

        if ($request->filled('category_id')) {
            $transactionQuery->where('category_id', $request->category_id);
        }

        if ($request->filled('type')) {
            $transactionQuery->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $transactionQuery->where('date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $transactionQuery->where('date', '<=', $request->date_to);
        }

        if ($request->filled('min_amount')) {
            $transactionQuery->where('amount', '>=', $request->min_amount);
        }

        if ($request->filled('max_amount')) {
            $transactionQuery->where('amount', '<=', $request->max_amount);
        }

        $transactions = $transactionQuery->paginate(8);

        // Add "editable" flag for each transaction
        $transactions->getCollection()->transform(function ($transaction) {
            $now = Carbon::now();
            $diffInHours = $transaction->created_at->diffInHours($now);

            // You can change 48 to 2 if you want only 2 hours instead of 2 days
            $transaction->editable = $diffInHours < 48;

            return $transaction;
        });

        return response()->json([
            'status' => 'success',
            'data' => $transactions->items(),
            'pagination' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,account_id',
            'category_id' => 'required|exists:categories,category_id',
            'source' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'date' => 'required|date'
        ]);

        $user = $request->user();
        $account = Account::findOrFail($validated['account_id']);

        if ($account->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'error' => 'Unauthorized Account!'
            ], 403);
        }

        if ($validated['type'] === 'income') {
            $account->balance += $validated['amount'];
        } else if ($validated['type'] === 'expense') {
            if ($account->balance < $validated['amount']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient funds for this expense!'
                ], 400);
            }
            $account->balance -= $validated['amount'];

            Budget::where('user_id', $user->id)
                ->where('category_id', $validated['category_id'])
                ->whereDate('start_date', '<=', $validated['date'])
                ->whereDate('end_date', '>=', $validated['date'])
                ->increment('budget_spent', $validated['amount']);
        }

        $account->save();

        $transaction = Transaction::create([
            ...$validated,
            'user_id' => $user->id
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction recorded successfully.',
            'data' => [
                'transaction' => $transaction,
                'account' => $account->fresh()
            ]
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(transaction $transaction, Request $request)
    {
        if ($transaction->account->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json($transaction->load(['account', 'category']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, transaction $transaction)
    {
        $user = $request->user();

        if ($transaction->account->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        if ($transaction->created_at->diffInHours(now()) > 48) {
            return response()->json([
                'status' => 'error',
                'message' => 'This transaction can no longer be edited (time limit exceeded).'
            ], 403);
        }

        $validated = $request->validate([
            'account_id' => 'sometimes|exists:accounts,account_id',
            'category_id' => 'sometimes|exists:categories,category_id',
            'type' => 'sometimes|in:income,expense',
            'amount' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'date' => 'sometimes|date'
        ]);

        if ($transaction->type === 'income') {
            $transaction->account->balance -= $transaction->amount;
        } else if ($transaction->type === 'expense') {
            $transaction->account->balance += $transaction->amount;
        }

        $type = $validated['type'] ?? $transaction->type;
        $amount = $validated['amount'] ?? $transaction->amount;

        if ($type === 'income') {
            $transaction->account->balance += $amount;
        } else if ($type === 'expense') {
            if ($transaction->account->balance < $amount) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient funds for this expense!'
                ], 400);
            }
            $transaction->account->balance -= $amount;

            $budget = Budget::where('user_id', $user->id)
                ->where('category_id', $validated['category_id'] ?? $transaction->category_id)
                ->whereDate('start_date', '<=', $validated['date'] ?? $transaction->date)
                ->whereDate('end_date', '>=', $validated['date'] ?? $transaction->date)
                ->first();

            if ($budget) {
                $budget->budget_spent -= $transaction->amount;
                $budget->budget_spent += $amount;
                $budget->save();
            }
        }

        $transaction->account->save();

        $transaction->update($validated);

        return response()->json(
            $transaction->load(['account', 'category'])
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(transaction $transaction, Request $request)
    {
        if ($transaction->account->user_id !== $request->user()->id);

        $transaction->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction deleted.'
        ]);
    }
}
