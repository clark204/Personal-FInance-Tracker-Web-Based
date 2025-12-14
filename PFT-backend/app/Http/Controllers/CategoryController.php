<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::with('children')
            ->where(function ($query) {
                $query->where('is_global', true)
                    ->orWhere('user_id', auth('api')->id());
            })
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name'      => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category = Category::create([
            'category_name'      => $validated['category_name'],
            'parent_id' => $validated['parent_id'] ?? null,
            'is_global' => false,
            'user_id'   => auth('api')->id(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category created successfully',
            'data'    => $category,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $category = Category::with('children')
            ->where(function ($query) {
                $query->where('is_global', true)
                    ->orWhere('user_id', auth('api')->id());
            })
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data'   => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $category = Category::where('user_id', auth('api')->id())
            ->findOrFail($id);

        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'parent_id' => 'nullable|exists:categories,category_id',
        ]);

        $category->update($validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Category updated successfully',
            'data'    => $category,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $category = Category::where('user_id', auth('api')->id())
            ->findOrFail($id);

        $category->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Category deleted successfully',
        ]);
    }
}
