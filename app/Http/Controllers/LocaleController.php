<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|in:rw,en,fr',
        ]);

        if ($request->user()) {
            $request->user()->update(['language' => $validated['locale']]);
        }

        return response()->json(['status' => 'ok']);
    }
}
