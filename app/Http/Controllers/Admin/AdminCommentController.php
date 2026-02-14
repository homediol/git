<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;

class AdminCommentController extends Controller
{
    /**
     * Display all comments for moderation
     */
    public function index()
    {
        $comments = Comment::with('post')->latest()->paginate(20);
        return view('admin.comments.index', compact('comments'));
    }

    /**
     * Approve a comment
     */
    public function approve(Comment $comment)
    {
        $comment->update(['approved' => true]);
        return back()->with('success', 'Comment approved successfully');
    }

    /**
     * Reject/unapprove a comment
     */
    public function reject(Comment $comment)
    {
        $comment->update(['approved' => false]);
        return back()->with('success', 'Comment rejected successfully');
    }

    /**
     * Delete a comment
     */
    public function destroy(Comment $comment)
    {
        $comment->delete();
        return back()->with('success', 'Comment deleted successfully');
    }
}
