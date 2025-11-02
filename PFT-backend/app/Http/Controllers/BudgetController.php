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

        $budgetQuery = Budget::where('user_id', $user)->with(['user', 'category']);

        if ($request->filled('category_id')) {
            $budgetQuery->where('category_id', $request->category_id);
        }

        if ($request->filled('date_from')) {
            $budgetQuery->where('start_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $budgetQuery->where('end_date', '<=', $request->date_to);
        }

        if ($request->filled('min_amount')) {
            $budgetQuery->where('budget_amount', '>=', $request->min_amount);
        }

        if ($request->filled('max_amount')) {
            $budgetQuery->where('budget_amount', '<=', $request->max_amount);
        }

        $budgets = $budgetQuery->paginate(8);

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
            'data' => $budget->load(['user', 'category'])
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

        return response()->json($budget->load(['user', 'category']));
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
            'category_id' => 'sometimes|exists:categories,id',
            'budget_amount' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
        ]);

        $budget->update($validated);

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
