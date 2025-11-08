<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Food & Drinks' => ['Bar, Cafe', 'Groceries', 'Restaurant, Fast-food'],
            'Shopping' => ['Clothes & Shoes', 'Drug-store, Chemist', 'Electronics, Accessories', 'Gifts, Joy'],
            'Housing' => ['Energy, Utilities', 'Maintenance, Repairs', 'Rent', 'Services'],
            'Transportation' => ['Business Trips', 'Long Distance', 'Public Transport'],
            'Vehicle' => ['Fuel', 'Vehicle Maintenance', 'Insurance'],
            'Communication, PC' => ['Internet', 'Phone / Cell Phone', 'Postal Services', 'Software, Apps, Games'],
            'Life & Entertainment' => ['Movies', 'Concerts', 'Sports', 'Hobbies', 'Books', 'Subscriptions'],
        ];

        foreach ($categories as $parent => $subs) {
            // Insert parent category
            $parentId = DB::table('categories')->insertGetId([
                'category_name' => $parent,
                'parent_id' => null,
                'is_global' => true,
                'user_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insert subcategories
            foreach ($subs as $sub) {
                DB::table('categories')->insert([
                    'category_name' => $sub,
                    'parent_id' => $parentId,
                    'is_global' => true,
                    'user_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
