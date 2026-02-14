<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function index()
    {
        return view('contact');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|max:255',
            'email' => 'required|email',
            'subject' => 'nullable|max:255',
            'message' => 'required'
        ]);

        $contact = Contact::create($validated);

        // Send email notification
        try {
            Mail::to(config('mail.from.address'))->send(new \App\Mail\ContactFormSubmitted($contact));
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::error('Failed to send contact email: ' . $e->getMessage());
        }

        return back()->with('success', 'Thank you for contacting us!');
    }
}
