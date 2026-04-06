<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RewardService;
use App\Services\WelcomeOfferService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        if (!class_exists(\Laravel\Socialite\Facades\Socialite::class)) {
            return redirect()
                ->route('login')
                ->with('error', 'Google login is not available. Please use email and password.');
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        if (!class_exists(\Laravel\Socialite\Facades\Socialite::class)) {
            return redirect()
                ->route('login')
                ->with('error', 'Google login is not available. Please use email and password.');
        }

        $googleUser = Socialite::driver('google')->stateless()->user();

        if (empty($googleUser->email)) {
            return redirect()->route('login')->with('error', 'Unable to authenticate with Google.');
        }

        $user = User::where('email', $googleUser->email)->first();
        $isNew = false;

        if (!$user) {
            $baseUsername = Str::slug($googleUser->nickname ?: Str::before($googleUser->email, '@') ?: 'user');
            $baseUsername = $baseUsername !== '' ? $baseUsername : 'user';
            $username = $baseUsername;
            $suffix = 1;

            while (User::where('username', $username)->exists()) {
                $username = $baseUsername . '-' . $suffix;
                $suffix++;
            }

            $user = User::create([
                'name' => $googleUser->name ?? $googleUser->nickname ?? 'Google User',
                'username' => $username,
                'email' => $googleUser->email,
                'phone' => null,
                'password' => bcrypt(Str::random(32)),
            ]);
            $isNew = true;
        }

        Auth::login($user, true);

        if ($isNew) {
            app(RewardService::class)->assignWelcomeRewards($user);
            app(WelcomeOfferService::class)->notifyDiscount($user);
        }

        return redirect()->intended(route('dashboard', absolute: false))->with('show_promo', true);
    }
}
