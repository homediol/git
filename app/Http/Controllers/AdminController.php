<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Contact;
use App\Models\Post;
use App\Models\Advertisement;
use App\Models\Team;
use App\Models\Promotion;
use App\Models\Reward;
use App\Models\UserReward;
use App\Models\UserActivity;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * AdminController handles all admin panel operations
 * Routes: /admin/* (requires authentication)
 */
class AdminController extends Controller
{
    /**
     * Display admin dashboard with statistics
     * @return \Inertia\Response
     */
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'services' => Service::count(),
                'portfolios' => Portfolio::count(),
                'contacts' => Contact::count(),
                'posts' => Post::count(),
                'teams' => Team::count(),
                'promotions' => Promotion::count(),
                'rewards' => Reward::count(),
                'userRewards' => UserReward::count(),
                'notifications' => DatabaseNotification::count(),
                'activities' => UserActivity::count(),
            ]
        ]);
    }

    // ==================== SERVICES ====================
    
    /**
     * Display all services for management
     */
    public function services()
    {
        return Inertia::render('Admin/Services/Index', [
            'services' => Service::whereNull('parent_service_id')->latest()->get(),
        ]);
    }

    /**
     * Store a new service
     */
    public function servicesStore(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('services', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $validated['parent_service_id'] = null;
        Service::create($validated);
        return back()->with('success', 'Service created!');
    }

    /**
     * Update existing service
     */
    public function servicesUpdate(Request $request, Service $service)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('services', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $service->update($validated);
        return back()->with('success', 'Service updated!');
    }

    /**
     * Delete service
     */
    public function servicesDestroy(Service $service)
    {
        $service->delete();
        return back()->with('success', 'Service deleted!');
    }

    /**
     * Display sub-services for a service
     */
    public function serviceSubServices(Service $service)
    {
        return Inertia::render('Admin/Services/SubServices', [
            'service' => $service,
            'subServices' => $service->subServices()->latest()->get(),
        ]);
    }

    /**
     * Store a new sub-service
     */
    public function subServicesStore(Request $request, Service $service)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('sub-services', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $validated['parent_service_id'] = $service->id;
        Service::create($validated);
        return back()->with('success', 'Sub-service created!');
    }

    /**
     * Update an existing sub-service
     */
    public function subServicesUpdate(Request $request, Service $service, Service $subService)
    {
        if ($subService->parent_service_id !== $service->id) {
            abort(404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('sub-services', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            unset($validated['image']);
        }

        $subService->update($validated);
        return back()->with('success', 'Sub-service updated!');
    }

    /**
     * Delete a sub-service
     */
    public function subServicesDestroy(Service $service, Service $subService)
    {
        if ($subService->parent_service_id !== $service->id) {
            abort(404);
        }

        $subService->delete();
        return back()->with('success', 'Sub-service deleted!');
    }

    // ==================== PORTFOLIOS ====================
    
    public function portfolios()
    {
        return Inertia::render('Admin/Portfolios/Index', [
            'portfolios' => Portfolio::latest()->get(),
        ]);
    }

    public function portfoliosStore(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('portfolio', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        Portfolio::create($validated);
        return back()->with('success', 'Portfolio created!');
    }

    public function portfoliosUpdate(Request $request, Portfolio $portfolio)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('portfolio', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        $portfolio->update($validated);
        return back()->with('success', 'Portfolio updated!');
    }

    public function portfoliosDestroy(Portfolio $portfolio)
    {
        $portfolio->delete();
        return back()->with('success', 'Portfolio deleted!');
    }

    // ==================== CONTACTS ====================
    
    public function contacts()
    {
        return Inertia::render('Admin/Contacts/Index', [
            'contacts' => Contact::latest()->get(),
        ]);
    }

    public function contactsDestroy(Contact $contact)
    {
        $contact->delete();
        return back()->with('success', 'Contact deleted!');
    }

    // ==================== POSTS ====================
    
    public function posts()
    {
        return Inertia::render('Admin/Posts/Index', [
            'posts' => Post::latest()->get(),
        ]);
    }

    public function postsStore(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'video' => 'nullable|mimes:mp4,mov,avi,wmv|max:5120000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        if ($request->hasFile('video')) {
            $path = $request->file('video')->store('videos', 'public');
            $validated['video'] = '/storage/' . $path;
        }

        Post::create($validated);
        return back()->with('success', 'Post created!');
    }

    public function postsUpdate(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'video' => 'nullable|mimes:mp4,mov,avi,wmv|max:5120000',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        if ($request->hasFile('video')) {
            $path = $request->file('video')->store('videos', 'public');
            $validated['video'] = '/storage/' . $path;
        }

        $post->update($validated);
        return back()->with('success', 'Post updated!');
    }

    public function postsDestroy(Post $post)
    {
        $post->delete();
        return back()->with('success', 'Post deleted!');
    }

    // ==================== ADVERTISEMENTS ====================
    
    public function advertisements()
    {
        return Inertia::render('Admin/Advertisements/Index', [
            'advertisements' => Advertisement::orderBy('order')->get(),
        ]);
    }

    public function advertisementsStore(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'link' => 'nullable|string',
            'media' => 'required|file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,wmv,webm|max:51200',
            'active' => 'boolean',
            'order' => 'integer',
            'duration' => 'integer|min:1|max:60',
        ]);

        $file = $request->file('media');
        $type = in_array($file->extension(), ['mp4', 'mov', 'avi', 'wmv', 'webm']) ? 'video' : 'image';
        $folder = $type === 'video' ? 'media/videos' : 'media/images';
        $path = $file->store($folder, 'public');
        
        $validated['media'] = '/storage/' . $path;
        $validated['type'] = $type;

        Advertisement::create($validated);
        return back()->with('success', 'Advertisement created!');
    }

    public function advertisementsUpdate(Request $request, Advertisement $advertisement)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'link' => 'nullable|string',
            'media' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,wmv,webm|max:51200',
            'active' => 'boolean',
            'order' => 'integer',
            'duration' => 'integer|min:1|max:60',
        ]);

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $type = in_array($file->extension(), ['mp4', 'mov', 'avi', 'wmv', 'webm']) ? 'video' : 'image';
            $folder = $type === 'video' ? 'media/videos' : 'media/images';
            $path = $file->store($folder, 'public');
            $validated['media'] = '/storage/' . $path;
            $validated['type'] = $type;
        } else {
            unset($validated['media']);
        }

        $advertisement->update($validated);
        return back()->with('success', 'Advertisement updated!');
    }

    public function advertisementsDestroy(Advertisement $advertisement)
    {
        $advertisement->delete();
        return back()->with('success', 'Advertisement deleted!');
    }

    // ==================== TEAM ====================
    
    public function teams()
    {
        return Inertia::render('Admin/Teams/Index', [
            'teams' => Team::orderBy('order')->get(),
        ]);
    }

    public function teamsStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('team', 'public');
            $validated['image'] = '/storage/' . $path;
        }

        Team::create($validated);
        return back()->with('success', 'Team member added!');
    }

    public function teamsUpdate(Request $request, Team $team)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:512000',
            'order' => 'integer',
            'delete_image' => 'boolean',
        ]);

        if ($request->has('delete_image') && $request->delete_image) {
            $validated['image'] = null;
        } elseif ($request->hasFile('image')) {
            $path = $request->file('image')->store('team', 'public');
            $validated['image'] = '/storage/' . $path;
        } else {
            unset($validated['image']);
        }
        
        unset($validated['delete_image']);

        $team->update($validated);
        return back()->with('success', 'Team member updated!');
    }

    public function teamsDestroy(Team $team)
    {
        $team->delete();
        return back()->with('success', 'Team member deleted!');
    }
}
