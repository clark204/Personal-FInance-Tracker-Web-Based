<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Savings;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function export(Request $request)
    {
        $type = $request->type ?? 'both';

        return match ($type) {
            'income', 'expense', 'both' => $this->exportTransactions($request, $type),
            'budgets' => $this->exportBudgets($request),
            'savings' => $this->exportSavings($request),
            default => response()->json([], 400),
        };
    }

    private function exportTransactions(Request $request, string $type)
    {
        $query = Transaction::query();

        if ($request->account_id) {
            $query->where('account_id', $request->account_id);
        }

        if ($type !== 'both') {
            $query->where('type', $type);
        }

        if ($request->date_from) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        return response()->json(
            $query->orderBy('date', 'desc')
                ->with(['account.currency', 'category', 'budget'])
                ->get()
                ->map(function ($t) {
                    return [
                        'Date' => Carbon::parse($t->date)->format('M d, Y'),
                        'Type' => ucfirst($t->type),
                        'Category' => $t->category?->category_name ?? 'Uncategorized',
                        'Amount' => $t->account->currency->symbol . number_format($t->amount, 2),
                        'Description' => $t->description ?? '-',
                        'Account' => $t->account->account_name,
                        'Account_Type' => $t->account->type,
                        'Linked_Budget' => $t->budget ? 'Yes' : 'No',
                    ];
                })
        );
    }

    private function exportBudgets(Request $request)
    {
        $query = Budget::query();

        if ($request->account_id) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->date_from) {
            $query->whereDate('start_date', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('end_date', '<=', $request->date_to);
        }

        $budgets = $query->orderBy('start_date', 'desc')
            ->with(['account.currency', 'category', 'transactions'])
            ->get();

        $budgetSheet = $budgets->map(function ($b) {
            return [
                'Budget_ID' => $b->id,
                'Account' => $b->account->account_name,
                'Account_Type' => $b->account->type,
                'Category' => $b->category->category_name,
                'Status' => ucfirst($b->status),
                'Budget_Amount' => $b->account->currency->symbol . number_format($b->budget_amount, 2),
                'Budget_Spent' => $b->account->currency->symbol . number_format($b->budget_spent, 2),
                'Start_Date' => Carbon::parse($b->start_date)->format('M d, Y'),
                'End_Date' => Carbon::parse($b->end_date)->format('M d, Y'),
                'Linked_Transactions' => $b->transactions->count(),
            ];
        });

        $transactionSheet = $budgets->flatMap(function ($b) {
            $currency = $b->account->currency;

            return $b->transactions->map(function ($t) use ($b, $currency) {
                return [
                    'Budget_ID' => $b->id,
                    'Budget_Category' => $b->category->category_name,
                    'Account' => $b->account->account_name,
                    'Transaction_Date' => Carbon::parse($t->date)->format('M d, Y'),
                    'Type' => $t->type,
                    'Amount' => $currency->symbol . number_format($t->amount, 2),
                    'Description' => $t->description ?? '-',
                ];
            });
        });

        return response()->json([
            'budgets' => $budgetSheet,
            'budget_transactions' => $transactionSheet,
        ]);
    }

    public function exportSavings(Request $request)
    {
        $query = Savings::query();

        if ($request->account_id) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $savingsSheet = $query->orderBy('created_at', 'desc')
            ->with(['account.currency'])
            ->get()
            ->map(function ($savings) {
                return [
                    'Savings_ID' => $savings->id,
                    'Savings_Name' => $savings->savings_name,
                    'Account' => $savings->account->account_name,
                    'Account_Type' => $savings->account->type,
                    'Target_Amount' => $savings->account->currency->symbol . number_format($savings->target_amount, 2),
                    'Saved_Amount' => $savings->account->currency->symbol . number_format($savings->saved_amount, 2),
                    'Start_Date' => Carbon::parse($savings->created_at)->format('M d, Y'),
                    'Deadline' => Carbon::parse($savings->deadline)->format('M d, Y'),
                    'Description' => $savings->description ?? '-',
                    'Status' => ucfirst($savings->status),
                ];
            });

        $transactionSheet = $query->with(['savingsTransactions', 'account.currency'])
            ->get()
            ->flatMap(function ($savings) {
                return $savings->savingsTransactions->map(function ($transaction) use ($savings) {
                    return [
                        'Savings_ID' => $savings->id,
                        'Transaction_Date' => Carbon::parse($transaction->transaction_date)->format('M d, Y'),
                        'Type' => $transaction->type,
                        'Amount' => $savings->account->currency->symbol . number_format($transaction->amount, 2),
                    ];
                });
            });

        return response()->json([
            'savings' => $savingsSheet,
            'savings_transactions' => $transactionSheet,
        ]);
    }
}
