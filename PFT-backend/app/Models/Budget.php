<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    //
    protected $fillable = [
        'user_id',
        'category_id',
        'period_type',
        'start_date',
        'end_date',
        'status',
        'budget_amount',
        'budget_spent',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function category(){
        return $this->belongsTo(Category::class);
    }
}
