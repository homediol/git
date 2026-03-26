<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserActivity;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Activities/Index', [
            'activities' => UserActivity::with('user')->latest()->take(250)->get(),
        ]);
    }
}
