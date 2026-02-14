<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Post;
use App\Models\Contact;
use App\Models\Comment;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'services' => Service::count(),
            'portfolios' => Portfolio::count(),
            'posts' => Post::count(),
            'contacts' => Contact::count(),
            'pending_comments' => Comment::where('approved', false)->count(),
        ];
        
        return view('admin.dashboard', compact('stats'));
    }
}
