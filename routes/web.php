<?php

/**
 * Web Routes for Pavona Studio
 * 
 * This file defines all HTTP routes for the application.
 * Routes are loaded by RouteServiceProvider within the "web" middleware group.
 */

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\SiteSettingsController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\RewardController as AdminRewardController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\LocaleController;
use App\Models\Advertisement;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==================== PUBLIC ROUTES ====================
// These routes are accessible to everyone

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/services', [HomeController::class, 'services'])->name('services');
Route::get('/services/{service}', [HomeController::class, 'serviceShow'])->name('services.show');
Route::get('/services/{service}/sub-services/{subService}', [HomeController::class, 'subServiceShow'])->name('services.subservices.show');
Route::get('/portfolio', [HomeController::class, 'portfolio'])->name('portfolio');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::post('/contact', [HomeController::class, 'storeContact'])->name('contact.store');
Route::get('/blog', [HomeController::class, 'blog'])->name('blog');
Route::get('/blog/{post}', [HomeController::class, 'blogShow'])->name('blog.show');

// Google OAuth
Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

// AI Chatbot
Route::post('/chat', [ChatController::class, 'chat'])->name('chat');

// ==================== USER DASHBOARD ====================
// Requires authentication

Route::get('/dashboard', function () {
    $user = auth()->user();

    if ($user && $user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ==================== PROFILE ROUTES ====================
// User profile management (requires authentication)

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // User Rewards & Notifications
    Route::get('/rewards', [RewardController::class, 'index'])->name('rewards.index');
    Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.readall');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/{notification}/unread', [NotificationController::class, 'markUnread'])->name('notifications.unread');
});

// ==================== ADMIN PANEL ====================
// Admin routes for managing content (requires authentication)

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    
    // Services Management
    Route::get('/services', [AdminController::class, 'services'])->name('services');
    Route::post('/services', [AdminController::class, 'servicesStore'])->name('services.store');
    Route::put('/services/{service}', [AdminController::class, 'servicesUpdate'])->name('services.update');
    Route::delete('/services/{service}', [AdminController::class, 'servicesDestroy'])->name('services.destroy');
    Route::get('/services/{service}/sub-services', [AdminController::class, 'serviceSubServices'])->name('services.subservices');
    Route::post('/services/{service}/sub-services', [AdminController::class, 'subServicesStore'])->name('services.subservices.store');
    Route::put('/services/{service}/sub-services/{subService}', [AdminController::class, 'subServicesUpdate'])->name('services.subservices.update');
    Route::delete('/services/{service}/sub-services/{subService}', [AdminController::class, 'subServicesDestroy'])->name('services.subservices.destroy');
    
    // Portfolio Management
    Route::get('/portfolios', [AdminController::class, 'portfolios'])->name('portfolios');
    Route::post('/portfolios', [AdminController::class, 'portfoliosStore'])->name('portfolios.store');
    Route::put('/portfolios/{portfolio}', [AdminController::class, 'portfoliosUpdate'])->name('portfolios.update');
    Route::delete('/portfolios/{portfolio}', [AdminController::class, 'portfoliosDestroy'])->name('portfolios.destroy');
    
    // Contact Messages
    Route::get('/contacts', [AdminController::class, 'contacts'])->name('contacts');
    Route::delete('/contacts/{contact}', [AdminController::class, 'contactsDestroy'])->name('contacts.destroy');
    
    // Blog Posts Management
    Route::get('/posts', [AdminController::class, 'posts'])->name('posts');
    Route::post('/posts', [AdminController::class, 'postsStore'])->name('posts.store');
    Route::put('/posts/{post}', [AdminController::class, 'postsUpdate'])->name('posts.update');
    Route::delete('/posts/{post}', [AdminController::class, 'postsDestroy'])->name('posts.destroy');
    
    // Site Settings (Backgrounds)
    Route::get('/settings', [SiteSettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [SiteSettingsController::class, 'update'])->name('settings.update');
    Route::delete('/settings', [SiteSettingsController::class, 'delete'])->name('settings.delete');
    
    // Advertisements Management
    Route::get('/advertisements', [AdminController::class, 'advertisements'])->name('advertisements');
    Route::post('/advertisements', [AdminController::class, 'advertisementsStore'])->name('advertisements.store');
    Route::put('/advertisements/{advertisement}', [AdminController::class, 'advertisementsUpdate'])->name('advertisements.update');
    Route::delete('/advertisements/{advertisement}', [AdminController::class, 'advertisementsDestroy'])->name('advertisements.destroy');

    // Team Management
    Route::get('/teams', [AdminController::class, 'teams'])->name('teams');
    Route::post('/teams', [AdminController::class, 'teamsStore'])->name('teams.store');
    Route::put('/teams/{team}', [AdminController::class, 'teamsUpdate'])->name('teams.update');
    Route::delete('/teams/{team}', [AdminController::class, 'teamsDestroy'])->name('teams.destroy');

    // Promotions Management
    Route::get('/promotions', [PromotionController::class, 'index'])->name('promotions');
    Route::post('/promotions', [PromotionController::class, 'store'])->name('promotions.store');
    Route::put('/promotions/{promotion}', [PromotionController::class, 'update'])->name('promotions.update');
    Route::delete('/promotions/{promotion}', [PromotionController::class, 'destroy'])->name('promotions.destroy');

    // Admin Notifications
    Route::get('/notifications', [AdminNotificationController::class, 'index'])->name('notifications');
    Route::post('/notifications', [AdminNotificationController::class, 'store'])->name('notifications.store');

    // Rewards Management
    Route::get('/rewards', [AdminRewardController::class, 'index'])->name('rewards');
    Route::post('/rewards', [AdminRewardController::class, 'store'])->name('rewards.store');
    Route::put('/rewards/{reward}', [AdminRewardController::class, 'update'])->name('rewards.update');
    Route::delete('/rewards/{reward}', [AdminRewardController::class, 'destroy'])->name('rewards.destroy');
    Route::put('/rewards/user/{userReward}', [AdminRewardController::class, 'updateUserReward'])->name('rewards.user.update');

    // Activity Logs
    Route::get('/activities', [ActivityController::class, 'index'])->name('activities');
});

// ==================== AUTHENTICATION ROUTES ====================
// Login, Register, Password Reset, etc.

require __DIR__.'/auth.php';
