<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Savings extends Model
{
    //
    protected $fillable = [
        'user_id',
        'account_id',
        'savings_name',
        'status',
        'target_amount',
        'saved_amount',
        'deadline',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
