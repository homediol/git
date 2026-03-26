<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SiteSettings;
use Inertia\Inertia;

class RewardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Rewards/Index', [
            'rewards' => $user->userRewards()->with('reward')->latest()->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }
}
