<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;

class AdminContactController extends Controller
{
    public function index()
    {
        $contacts = Contact::latest()->paginate(20);
        return view('admin.contacts.index', compact('contacts'));
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect()->route('admin.contacts.index')->with('success', 'Contact deleted successfully');
    }
}
