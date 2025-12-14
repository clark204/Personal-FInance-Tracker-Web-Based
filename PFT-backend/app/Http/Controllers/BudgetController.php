<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user()->id;

        $budgetQuery = Budget::where('user_id', $user)->with(['user', 'category', 'account', 'transactions']);

        if ($request->filled('account_id')) {
            $budgetQuery->where('account_id', $request->account_id);
        }

        if ($request->filled('category_id')) {
            $budgetQuery->where('category_id', $request->category_id);
        }

        if ($request->filled('status')) {
            $budgetQuery->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $budgetQuery->where('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $budgetQuery->where('end_date', '<=', $request->date_to);
        }

        $budgets = $budgetQuery->paginate(6);

        return response()->json([
            'status' => 'success',
            'data' => $budgets->items(),
            'pagination' => [
                'current_page' => $budgets->currentPage(),
                'last_page' => $budgets->lastPage(),
                'per_page' => $budgets->perPage(),
                'total' => $budgets->total(),
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
            'period_type' => 'required|in:week,month,year,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget_amount' => 'required|numeric|min:0',
        ]);

        $now = now();

        // Auto-generate start and end dates if not "custom"
        switch ($validated['period_type']) {
            case 'week':
                $validated['start_date'] = $now->copy()->startOfWeek();
                $validated['end_date'] = $now->copy()->endOfWeek();
                break;

            case 'month':
                $validated['start_date'] = $now->copy()->startOfMonth();
                $validated['end_date'] = $now->copy()->endOfMonth();
                break;

            case 'year':
                $validated['start_date'] = $now->copy()->startOfYear();
                $validated['end_date'] = $now->copy()->endOfYear();
                break;

            case 'custom':
                // If custom, keep user-provided dates
                if (empty($validated['start_date']) || empty($validated['end_date'])) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Custom period requires start_date and end_date.'
                    ], 422);
                }
                break;
        }

        $budget = Budget::create(array_merge(
            $validated,
            ['user_id' => $request->user()->id]
        ));

        return response()->json([
            'status' => 'success',
            'message' => 'Budget created successfully.',
            'data' => $budget->load(['user', 'category', 'account'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $budget, Request $request)
    {
        if ($budget->user->id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.'
            ], 403);
        };

        return response()->json($budget->load(['user', 'category', 'transactions']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Budget $budget)
    {
        if (!$budget->user || $budget->user->id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $validated = $request->validate([
            'account_id' => 'sometimes|exists:accounts,id',
            'category_id' => 'sometimes|exists:categories,id',
            'budget_amount' => 'sometimes|numeric|min:0',
            'period_type' => 'sometimes|in:week,month,year,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $now = now();

        if (isset($validated['period_type'])) {

            switch ($validated['period_type']) {
                case 'week':
                    $validated['start_date'] = $now->copy()->startOfWeek();
                    $validated['end_date'] = $now->copy()->endOfWeek();
                    break;

                case 'month':
                    $validated['start_date'] = $now->copy()->startOfMonth();
                    $validated['end_date'] = $now->copy()->endOfMonth();
                    break;

                case 'year':
                    $validated['start_date'] = $now->copy()->startOfYear();
                    $validated['end_date'] = $now->copy()->endOfYear();
                    break;

                case 'custom':
                    if (empty($validated['start_date']) || empty($validated['end_date'])) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Custom period requires start_date and end_date.'
                        ], 422);
                    }
                    break;
            }
        }

        $budget->update($validated);

        // propagate account change to all associated transactions
        if (isset($validated['account_id'])) {
            $budget->transaction()->update([
                'account_id' => $validated['account_id']
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $budget->load(['user', 'category'])
        ]);
    }



    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget, Request $request)
    {
        if ($budget->user->id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.'
            ], 403);
        }

        $budget->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Budget deleted.'
        ]);
    }
}
