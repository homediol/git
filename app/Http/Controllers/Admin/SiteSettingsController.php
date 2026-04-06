<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SiteSettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SiteSettings/Index', [
            'settings' => SiteSettings::publicSettings(),
        ]);
    }

    public function update(Request $request)
    {
        \Log::info('Update request received', ['files' => $request->allFiles()]);
        
        $request->validate([
            'header_bg' => 'nullable|file|max:51200',
            'main_bg' => 'nullable|file|max:51200',
            'footer_bg' => 'nullable|file|max:51200',
            'featured_bundle_image' => 'nullable|image|max:51200',
            'whatsapp_url' => 'nullable|url|max:2048',
            'instagram_url' => 'nullable|url|max:2048',
            'facebook_url' => 'nullable|url|max:2048',
            'x_url' => 'nullable|url|max:2048',
            'contact_email' => 'nullable|email|max:255',
            'featured_bundle_badge_rw' => 'nullable|string|max:255',
            'featured_bundle_badge_en' => 'nullable|string|max:255',
            'featured_bundle_badge_fr' => 'nullable|string|max:255',
            'featured_bundle_title_rw' => 'nullable|string|max:255',
            'featured_bundle_title_en' => 'nullable|string|max:255',
            'featured_bundle_title_fr' => 'nullable|string|max:255',
            'featured_bundle_description_rw' => 'nullable|string|max:1000',
            'featured_bundle_description_en' => 'nullable|string|max:1000',
            'featured_bundle_description_fr' => 'nullable|string|max:1000',
        ]);

        if ($request->hasFile('header_bg')) {
            $this->ensureImageOrVideoUpload($request, 'header_bg');
            $path = $request->file('header_bg')->store('backgrounds', 'public');
            SiteSettings::set('header_bg', $path);
            \Log::info('Header BG saved', ['path' => $path]);
        }

        if ($request->hasFile('main_bg')) {
            $this->ensureImageOrVideoUpload($request, 'main_bg');
            $path = $request->file('main_bg')->store('backgrounds', 'public');
            SiteSettings::set('main_bg', $path);
            \Log::info('Main BG saved', ['path' => $path]);
        }

        if ($request->hasFile('footer_bg')) {
            $this->ensureImageOrVideoUpload($request, 'footer_bg');
            $path = $request->file('footer_bg')->store('backgrounds', 'public');
            SiteSettings::set('footer_bg', $path);
            \Log::info('Footer BG saved', ['path' => $path]);
        }

        if ($request->hasFile('featured_bundle_image')) {
            $path = $request->file('featured_bundle_image')->store('settings', 'public');
            SiteSettings::set('featured_bundle_image', $path);
            \Log::info('Featured bundle image saved', ['path' => $path]);
        }

        foreach ([
            'whatsapp_url',
            'instagram_url',
            'facebook_url',
            'x_url',
            'contact_email',
            'featured_bundle_badge_rw',
            'featured_bundle_badge_en',
            'featured_bundle_badge_fr',
            'featured_bundle_title_rw',
            'featured_bundle_title_en',
            'featured_bundle_title_fr',
            'featured_bundle_description_rw',
            'featured_bundle_description_en',
            'featured_bundle_description_fr',
        ] as $key) {
            if ($request->exists($key)) {
                SiteSettings::set($key, $request->input($key));
            }
        }

        return redirect()->route('admin.settings')->with('success', 'Site settings updated successfully');
    }

    public function delete(Request $request)
    {
        $type = $request->input('type');
        
        if (in_array($type, ['header_bg', 'main_bg', 'footer_bg', 'featured_bundle_image'])) {
            $setting = SiteSettings::where('key', $type)->first();
            if ($setting) {
                $setting->delete();
            }
        }

        return redirect()->route('admin.settings')->with('success', 'Background deleted successfully');
    }

    private function ensureImageOrVideoUpload(Request $request, string $field): void
    {
        if (!$request->hasFile($field)) {
            return;
        }

        $mime = (string) $request->file($field)->getMimeType();

        if (!str_starts_with($mime, 'image/') && !str_starts_with($mime, 'video/')) {
            throw ValidationException::withMessages([
                $field => 'Please upload a valid image or video file.',
            ]);
        }
    }
}
