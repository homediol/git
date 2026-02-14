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
use App\Http\Controllers\ChatController;
use App\Models\Advertisement;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ==================== PUBLIC ROUTES ====================
// These routes are accessible to everyone

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/services', [HomeController::class, 'services'])->name('services');
Route::get('/portfolio', [HomeController::class, 'portfolio'])->name('portfolio');
Route::get('/contact', [HomeController::class, 'contact'])->name('contact');
Route::post('/contact', [HomeController::class, 'storeContact'])->name('contact.store');
Route::get('/blog', [HomeController::class, 'blog'])->name('blog');
Route::get('/blog/{post}', [HomeController::class, 'blogShow'])->name('blog.show');

// AI Chatbot
Route::post('/chat', [ChatController::class, 'chat'])->name('chat');

// ==================== USER DASHBOARD ====================
// Requires authentication

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ==================== PROFILE ROUTES ====================
// User profile management (requires authentication)

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ==================== ADMIN PANEL ====================
// Admin routes for managing content (requires authentication)

Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    
    // Services Management
    Route::get('/services', [AdminController::class, 'services'])->name('services');
    Route::post('/services', [AdminController::class, 'servicesStore'])->name('services.store');
    Route::put('/services/{service}', [AdminController::class, 'servicesUpdate'])->name('services.update');
    Route::delete('/services/{service}', [AdminController::class, 'servicesDestroy'])->name('services.destroy');
    
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
});

// ==================== AUTHENTICATION ROUTES ====================
// Login, Register, Password Reset, etc.

require __DIR__.'/auth.php';
