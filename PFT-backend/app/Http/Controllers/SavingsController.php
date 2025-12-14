<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Savings;
use Illuminate\Http\Request;

class SavingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $savingsQuery = Savings::where('user_id', $user->id)->with(['account'])->orderBy('created_at', 'desc');

        if ($request->filled("search")) {
            $searchTerm = $request->search;
            $savingsQuery->where('savings_name', 'LIKE', '%' . $searchTerm . '%')
                ->orWhere('description', 'LIKE', '%' . $searchTerm . '%');
        }

        if ($request->filled('account_id')) {
            $savingsQuery->where('account_id', $request->account_id);
        }

        if ($request->filled('status')) {
            $savingsQuery->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $savingsQuery->where('deadline', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $savingsQuery->where('deadline', '<=', $request->date_to);
        }

        // if ($request->filled('min_amount')) {
        //     $savingsQuery->where('target_amount', '>=', $request->min_amount);
        // }

        // if ($request->filled('max_amount')) {
        //     $savingsQuery->where('target_amount', '<=', $request->max_amount);
        // }

        $savings = $savingsQuery->paginate(6);
        $account = Account::get();

        return response()->json([
            'status' => 'success',
            'data' => $savings->items(),
            'account' => $account->load(['currency']),
            'pagination' => [
                'current_page' => $savings->currentPage(),
                'last_page' => $savings->lastPage(),
                'per_page' => $savings->perPage(),
                'total' => $savings->total(),
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
            'savings_name' => 'required|string|max:255|unique:savings,savings_name,NULL,id,account_id,' . $request->account_id,
            'target_amount' => 'required|numeric|min:0',
            'saved_amount' => 'nullable|numeric',
            'status' => 'in:active,paused,reached',
            'deadline' => 'nullable|date',
            'description' => 'nullable|string|max:255',
        ]);

        $account = Account::findOrFail($validated['account_id']);

        if ($account->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.'
            ], 403);
        };

        $validated['user_id'] = $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'active';

        $savings = Savings::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $savings->load('account')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id, Request $request)
    {
        // First, find the savings record
        $savings = Savings::find($id);

        if (!$savings) {
            return response()->json([
                'status' => 'error',
                'message' => 'Savings goal not found.'
            ], 404);
        }

        // Check if the savings belongs to the authenticated user
        if ($savings->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.'
            ], 403);
        }

        $savings->load(['account', 'savingsTransactions']);

        $account = Account::findOrFail($savings->account_id);
        $account->load(['currency']);

        return response()->json([
            'status' => 'success',
            'data' => $savings,
            'account' => $account
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'savings_name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'status' => 'in:active,paused,reached',
            'deadline' => 'required|date',
            'description' => 'nullable|string|max:255',
        ]);

        $savings = Savings::findOrFail($id);

        if ($savings->account->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.'
            ], 403);
        };

        $savings->update($validated);

        return response()->json([
            'status' => 'success',
            $savings->load(['account'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Savings $savings, Request $request)
    {
        if (!$savings->account || $savings->account->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.'
            ], 403);
        };

        $savings->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Savings deleted.'
        ]);
    }
}
