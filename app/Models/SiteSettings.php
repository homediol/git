<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSettings extends Model
{
    protected $fillable = ['key', 'value'];

    public const PUBLIC_KEYS = [
        'header_bg',
        'main_bg',
        'footer_bg',
        'whatsapp_url',
        'instagram_url',
        'facebook_url',
        'x_url',
        'contact_email',
        'featured_bundle_badge_rw',
        'featured_bundle_badge_en',
        'featured_bundle_badge_fr',
        'featured_bundle_image',
        'featured_bundle_title_rw',
        'featured_bundle_title_en',
        'featured_bundle_title_fr',
        'featured_bundle_description_rw',
        'featured_bundle_description_en',
        'featured_bundle_description_fr',
    ];

    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    public static function set($key, $value)
    {
        return self::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function publicSettings(): array
    {
        $settings = [];

        foreach (self::PUBLIC_KEYS as $key) {
            $settings[$key] = self::get($key);
        }

        return $settings;
    }
}
