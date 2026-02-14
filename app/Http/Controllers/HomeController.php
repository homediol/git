<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Team;
use App\Models\Post;
use App\Models\Contact;
use App\Models\SiteSettings;
use App\Models\Advertisement;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * HomeController handles all public-facing pages
 * Routes: /, /about, /services, /portfolio, /contact, /blog
 */
class HomeController extends Controller
{
    /**
     * Display the homepage with featured services and portfolio items
     * @return \Inertia\Response
     */
    public function index()
    {
        return Inertia::render('Home', [
            'services' => Service::take(6)->get(),
            'portfolios' => Portfolio::take(6)->get(),
            'teams' => Team::orderBy('order')->get(),
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display about page with team members
     * @return \Inertia\Response
     */
    public function about()
    {
        return Inertia::render('About', [
            'teamMembers' => Team::orderBy('order')->get(),
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display all services
     * @return \Inertia\Response
     */
    public function services()
    {
        return Inertia::render('Services', [
            'services' => Service::all(),
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display portfolio with optional category filtering
     * @param Request $request
     * @return \Inertia\Response
     */
    public function portfolio(Request $request)
    {
        $query = Portfolio::query();
        
        // Filter by category if provided
        if ($request->category) {
            $query->where('category', $request->category);
        }
        
        return Inertia::render('Portfolio', [
            'portfolios' => $query->get(),
            'categories' => Portfolio::distinct()->pluck('category'),
            'selectedCategory' => $request->category,
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display contact form
     * @return \Inertia\Response
     */
    public function contact()
    {
        return Inertia::render('Contact', [
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Store contact form submission and send email notification
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeContact(Request $request)
    {
        // Validate form data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Save to database
        $contact = Contact::create($validated);

        // Send email notification to admin
        try {
            \Mail::to(config('mail.from.address'))->send(new \App\Mail\ContactFormMail($contact));
        } catch (\Exception $e) {
            \Log::error('Contact email failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Message sent successfully!');
    }

    /**
     * Display blog posts with pagination
     * @return \Inertia\Response
     */
    public function blog()
    {
        return Inertia::render('Blog/Index', [
            'posts' => Post::latest()->paginate(9),
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display individual blog post
     * @param Post $post
     * @return \Inertia\Response
     */
    public function blogShow(Post $post)
    {
        return Inertia::render('Blog/Show', [
            'post' => $post->load('comments'),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }
}
