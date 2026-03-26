<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\RewardService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        if (empty($googleUser->email)) {
            return redirect()->route('login')->with('error', 'Unable to authenticate with Google.');
        }

        $user = User::where('email', $googleUser->email)->first();
        $isNew = false;

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->name ?? $googleUser->nickname ?? 'Google User',
                'email' => $googleUser->email,
                'password' => bcrypt(Str::random(32)),
            ]);
            $isNew = true;
        }

        Auth::login($user, true);

        if ($isNew) {
            app(RewardService::class)->assignWelcomeRewards($user);
        }

        return redirect()->intended(route('dashboard', absolute: false))->with('show_promo', true);
    }
}
