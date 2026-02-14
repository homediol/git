<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPostController extends Controller
{
    public function index()
    {
        $posts = Post::latest()->get();
        return view('admin.posts.index', compact('posts'));
    }

    public function create()
    {
        return view('admin.posts.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'category' => 'required|max:255',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('posts', 'public');
        }

        Post::create($validated);
        return redirect()->route('admin.posts.index')->with('success', 'Post created successfully');
    }

    public function edit(Post $post)
    {
        return view('admin.posts.edit', compact('post'));
    }

    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'category' => 'required|max:255',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            if ($post->image) Storage::disk('public')->delete($post->image);
            $validated['image'] = $request->file('image')->store('posts', 'public');
        }

        $post->update($validated);
        return redirect()->route('admin.posts.index')->with('success', 'Post updated successfully');
    }

    public function destroy(Post $post)
    {
        if ($post->image) Storage::disk('public')->delete($post->image);
        $post->delete();
        return redirect()->route('admin.posts.index')->with('success', 'Post deleted successfully');
    }
}
