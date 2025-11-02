<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    //
    protected $fillable = ['user_id', 'currency_id' ,'account_name', 'type', 'balance'];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function currency(){
        return $this->belongsTo(Currency::class);
    }

    public function transactions(){
        return $this->hasMany(Transaction::class);
    }

    public function budgets(){
        return $this->hasMany(Budget::class);
    }

    public function savings(){
        return $this->hasMany(Savings::class);
    }
}
