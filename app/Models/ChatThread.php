<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatThread extends Model
{
    protected $fillable = [
        'user_id',
        'guest_session_key',
        'guest_name',
        'guest_email',
        'guest_phone',
        'assigned_admin_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedAdmin()
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'thread_id');
    }

    public function latestMessage()
    {
        return $this->hasOne(ChatMessage::class, 'thread_id')->latestOfMany();
    }
}
