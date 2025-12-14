<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavingsTransaction extends Model
{
    protected $fillable = [
        'savings_id',
        'type',
        'amount',
        'transaction_date',
    ];

    public function savings()
    {
        return $this->belongsTo(Savings::class);
    }
}
