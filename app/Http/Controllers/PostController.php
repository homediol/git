<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::query();
        
        if ($request->has('category') && $request->category != 'all') {
            $query->where('category', $request->category);
        }
        
        $posts = $query->latest()->paginate(10);
        $categories = Post::distinct()->pluck('category');
        
        return view('blog.index', compact('posts', 'categories'));
    }

    public function show($id)
    {
        $post = Post::with(['comments' => function($query) {
            $query->where('approved', true)->latest();
        }])->findOrFail($id);
        return view('blog.show', compact('post'));
    }

    public function storeComment(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email',
            'comment' => 'required'
        ]);

        $validated['post_id'] = $id;
        Comment::create($validated);

        return back()->with('success', 'Comment posted successfully!');
    }
}
