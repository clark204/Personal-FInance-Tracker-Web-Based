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

        $transactionQuery = Transaction::where('user_id', $user->id)->with(['account.currency', 'category'])->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $transactionQuery->where(function ($query) use ($searchTerm) {
                $query->where('description', 'LIKE', '%' . $searchTerm . '%')
                    ->orWhere('amount', 'LIKE', '%' . $searchTerm . '%');
            });
        }

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
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'required|exists:categories,id',
            'type'       => 'required|in:Income,Expense',
            'amount'     => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
            'date'       => 'required|date'
        ]);

        $user = $request->user();
        $account = Account::findOrFail($validated['account_id']);

        if ($account->user_id !== $user->id) {
            return response()->json(['status' => 'error', 'error' => 'Unauthorized Account!'], 403);
        }

        if ($validated['type'] === 'Income') {
            $account->balance += $validated['amount'];
        } else {
            if ($account->balance < $validated['amount']) {
                return response()->json(['status' => 'error', 'message' => 'Insufficient balance!'], 400);
            }
            $account->balance -= $validated['amount'];
        }

        $account->save();

        // Create the transaction
        $transaction = Transaction::create([
            ...$validated,
            'user_id' => $user->id
        ]);

        // Attach transaction to matching budget
        $budget = Budget::where('user_id', $user->id)
            ->where('category_id', $validated['category_id'])
            ->where('account_id', $validated['account_id'])
            ->whereDate('start_date', '<=', $validated['date'])
            ->whereDate('end_date', '>=', $validated['date'])
            ->first();

        if ($budget) {
            $transaction->budget_id = $budget->id;
            $transaction->save();

            if ($transaction->type === 'Expense') {
                $budget->increment('budget_spent', $transaction->amount);
            }
        }

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
    public function update(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        if ($transaction->account->user_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 403);
        }

        if ($transaction->created_at->diffInHours(now()) > 48) {
            return response()->json(['status' => 'error', 'message' => 'This transaction can no longer be edited.'], 403);
        }

        $validated = $request->validate([
            'account_id'  => 'sometimes|exists:accounts,id',
            'category_id' => 'sometimes|exists:categories,id',
            'type'        => 'sometimes|in:Income,Expense',
            'amount'      => 'sometimes|numeric|min:0',
            'description' => 'nullable|string|max:255',
        ]);

        $oldType = $transaction->type;
        $oldAmount = $transaction->amount;
        $oldAccount = $transaction->account;
        $oldBudget = $transaction->budget;

        // Reverse old account balance impact
        if ($oldType === 'Income') {
            $oldAccount->balance -= $oldAmount;
        } else {
            $oldAccount->balance += $oldAmount;
        }
        $oldAccount->save();

        // Reverse old budget impact
        if ($oldBudget && $oldType === 'Expense') {
            $oldBudget->budget_spent -= $oldAmount;
            $oldBudget->save();
        }

        // Apply new values
        $transaction->update($validated);
        $transaction->refresh();

        $newType = $transaction->type;
        $newAmount = $transaction->amount;

        $newAccount = Account::find($transaction->account_id);

        // Apply new account balance
        if ($newType === 'Income') {
            $newAccount->balance += $newAmount;
        } else {
            if ($newAccount->balance < $newAmount) {
                return response()->json(['status' => 'error', 'message' => 'Insufficient funds!'], 400);
            }
            $newAccount->balance -= $newAmount;
        }
        $newAccount->save();

        // Attach to new budget
        $newBudget = Budget::where('user_id', $user->id)
            ->where('category_id', $transaction->category_id)
            ->where('account_id', $transaction->account_id)
            ->whereDate('start_date', '<=', $transaction->date)
            ->whereDate('end_date', '>=', $transaction->date)
            ->first();

        if ($newBudget) {
            $transaction->budget_id = $newBudget->id;
            $transaction->save();

            if ($newType === 'Expense') {
                $newBudget->budget_spent += $newAmount;
                $newBudget->save();
            }
        }

        return response()->json($transaction->load(['account', 'category']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(transaction $transaction, Request $request)
    {
        if ($transaction->account->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized action.'
            ], 403);
        };

        // Reverse budget impact
        $budget = $transaction->budget;
        if ($budget && $transaction->type === 'Expense') {
            $budget->budget_spent -= $transaction->amount;
            $budget->save();
        }
        // Reverse account balance impact
        $account = $transaction->account;
        if ($transaction->type === 'Income') {
            $account->balance -= $transaction->amount;
        } else {
            $account->balance += $transaction->amount;
        }
        $account->save();

        $transaction->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Transaction deleted.'
        ]);
    }
}
