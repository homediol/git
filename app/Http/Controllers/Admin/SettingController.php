<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $settings = [
            'cover_background' => Setting::get('cover_background'),
            'header_image' => Setting::get('header_image'),
            'header_color' => Setting::get('header_color', '#0d6efd'),
            'background_image' => Setting::get('background_image'),
            'footer_image' => Setting::get('footer_image'),
            'footer_color' => Setting::get('footer_color', '#1f2937'),
        ];
        
        return view('admin.settings', compact('settings'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'cover_background' => 'nullable|image|max:5120',
            'header_image' => 'nullable|image|max:2048',
            'header_color' => 'nullable|string',
            'background_image' => 'nullable|image|max:2048',
            'footer_image' => 'nullable|image|max:2048',
            'footer_color' => 'nullable|string',
        ]);

        if ($request->hasFile('cover_background')) {
            if (Setting::get('cover_background')) {
                Storage::disk('public')->delete(Setting::get('cover_background'));
            }
            Setting::set('cover_background', $request->file('cover_background')->store('settings', 'public'));
        }

        if ($request->hasFile('header_image')) {
            if (Setting::get('header_image')) {
                Storage::disk('public')->delete(Setting::get('header_image'));
            }
            Setting::set('header_image', $request->file('header_image')->store('settings', 'public'));
        }

        if ($request->hasFile('background_image')) {
            if (Setting::get('background_image')) {
                Storage::disk('public')->delete(Setting::get('background_image'));
            }
            Setting::set('background_image', $request->file('background_image')->store('settings', 'public'));
        }

        if ($request->hasFile('footer_image')) {
            if (Setting::get('footer_image')) {
                Storage::disk('public')->delete(Setting::get('footer_image'));
            }
            Setting::set('footer_image', $request->file('footer_image')->store('settings', 'public'));
        }

        if ($request->filled('header_color')) {
            Setting::set('header_color', $request->header_color);
        }

        if ($request->filled('footer_color')) {
            Setting::set('footer_color', $request->footer_color);
        }

        return back()->with('success', 'Settings updated successfully');
    }

    public function deleteImage($type)
    {
        $image = Setting::get($type);
        if ($image) {
            Storage::disk('public')->delete($image);
            Setting::where('key', $type)->delete();
        }
        return back()->with('success', 'Image deleted successfully');
    }
}
