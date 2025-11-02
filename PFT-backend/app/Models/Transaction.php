<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    //
    protected $fillable = ['account_id', 'category_id', 'type', 'source', 'amount', 'description', 'date'];
    
    public function account(){
        $this->belongsTo(Account::class);
    }

    public function category(){
        $this->belongsTo(Category::class);
    }
}
