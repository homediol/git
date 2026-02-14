<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteSettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SiteSettings/Index', [
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ]
        ]);
    }

    public function update(Request $request)
    {
        \Log::info('Update request received', ['files' => $request->allFiles()]);
        
        $request->validate([
            'header_bg' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp,mp4,webm,avi,mov|max:51200',
            'main_bg' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp,mp4,webm,avi,mov|max:51200',
            'footer_bg' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp,mp4,webm,avi,mov|max:51200',
        ]);

        if ($request->hasFile('header_bg')) {
            $path = $request->file('header_bg')->store('backgrounds', 'public');
            SiteSettings::set('header_bg', $path);
            \Log::info('Header BG saved', ['path' => $path]);
        }

        if ($request->hasFile('main_bg')) {
            $path = $request->file('main_bg')->store('backgrounds', 'public');
            SiteSettings::set('main_bg', $path);
            \Log::info('Main BG saved', ['path' => $path]);
        }

        if ($request->hasFile('footer_bg')) {
            $path = $request->file('footer_bg')->store('backgrounds', 'public');
            SiteSettings::set('footer_bg', $path);
            \Log::info('Footer BG saved', ['path' => $path]);
        }

        return redirect()->route('admin.settings')->with('success', 'Backgrounds updated successfully');
    }

    public function delete(Request $request)
    {
        $type = $request->input('type');
        
        if (in_array($type, ['header_bg', 'main_bg', 'footer_bg'])) {
            $setting = SiteSettings::where('key', $type)->first();
            if ($setting) {
                $setting->delete();
            }
        }

        return redirect()->route('admin.settings')->with('success', 'Background deleted successfully');
    }
}
