<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Team;
use App\Models\Post;
use App\Models\Contact;
use App\Models\SiteSettings;
use App\Models\Advertisement;
use App\Services\RewardService;
use Database\Seeders\ServiceCatalogSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

/**
 * HomeController handles all public-facing pages
 * Routes: /, /about, /services, /portfolio, /contact, /blog
 */
class HomeController extends Controller
{
    private function featuredServiceKeys(): array
    {
        return [
            'photography-videography',
            'graphics-printing',
            'make-up',
            'software-development',
            'sound-system',
        ];
    }

    private function featuredServiceTitles(): array
    {
        return [
            'Photography & Videography',
            'Graphics & Printing Design',
            'Make Up',
            'Software Development',
            'Sound System',
        ];
    }

    private function seedDefaultServicesIfMissing(): void
    {
        if (Schema::hasColumn('services', 'service_key')) {
            $requiredKeys = $this->featuredServiceKeys();
            $existing = Service::whereNull('parent_service_id')
                ->whereIn('service_key', $requiredKeys)
                ->pluck('service_key')
                ->all();
            $missing = array_diff($requiredKeys, $existing);

            if (!empty($missing)) {
                (new ServiceCatalogSeeder())->run();
                return;
            }

            if ($this->defaultCatalogNeedsRefresh()) {
                (new ServiceCatalogSeeder())->run();
            }

            return;
        }

        $requiredTitles = $this->featuredServiceTitles();
        $existing = Service::whereNull('parent_service_id')
            ->whereIn('title', $requiredTitles)
            ->pluck('title')
            ->all();
        $missing = array_diff($requiredTitles, $existing);

        if (!empty($missing)) {
            (new ServiceCatalogSeeder())->run();
        }
    }

    private function defaultCatalogNeedsRefresh(): bool
    {
        $featuredServices = Service::whereNull('parent_service_id')
            ->whereIn('service_key', $this->featuredServiceKeys())
            ->get();

        if ($featuredServices->count() !== count($this->featuredServiceKeys())) {
            return true;
        }

        if (Schema::hasColumn('services', 'title_rw')) {
            $missingFeaturedTranslations = $featuredServices->contains(function (Service $service) {
                return empty($service->title_rw) || empty($service->description_rw);
            });

            if ($missingFeaturedTranslations) {
                return true;
            }
        }

        $graphicsService = $featuredServices->firstWhere('service_key', 'graphics-printing');

        if (!$graphicsService) {
            return true;
        }

        if ($graphicsService->subServices()->count() < 13) {
            return true;
        }

        if (!Schema::hasColumn('services', 'title_rw')) {
            return false;
        }

        return $graphicsService->subServices()
            ->where(function ($query) {
                $query->whereNull('title_rw')
                    ->orWhereNull('description_rw');
            })
            ->exists();
    }

    private function getFeaturedServices()
    {
        if (Schema::hasColumn('services', 'service_key')) {
            $featuredKeys = $this->featuredServiceKeys();
            $order = array_flip($featuredKeys);

            return Service::whereNull('parent_service_id')
                ->whereIn('service_key', $featuredKeys)
                ->get()
                ->sortBy(function ($service) use ($order) {
                    return $order[$service->service_key] ?? 999;
                })
                ->values();
        }

        $featuredTitles = $this->featuredServiceTitles();
        $order = array_flip($featuredTitles);

        return Service::whereNull('parent_service_id')
            ->whereIn('title', $featuredTitles)
            ->get()
            ->sortBy(function ($service) use ($order) {
                return $order[$service->title] ?? 999;
            })
            ->values();
    }

    /**
     * Display the homepage with featured services and portfolio items
     * @return \Inertia\Response
     */
    public function index()
    {
        $this->seedDefaultServicesIfMissing();
        $featuredServices = $this->getFeaturedServices();

        if ($featuredServices->isEmpty()) {
            (new ServiceCatalogSeeder())->run();
            $featuredServices = $this->getFeaturedServices();
        }

        $promoRewards = app(RewardService::class)->ensureDefaultRewards()->map(function ($reward) {
            return [
                'id' => $reward->id,
                'name' => $reward->name,
                'name_rw' => $reward->name_rw,
                'name_en' => $reward->name_en,
                'name_fr' => $reward->name_fr,
                'description' => $reward->description,
                'description_rw' => $reward->description_rw,
                'description_en' => $reward->description_en,
                'description_fr' => $reward->description_fr,
                'image' => $reward->image,
                'slug' => $reward->slug,
            ];
        })->values();

        return Inertia::render('Home', [
            'services' => $featuredServices,
            'portfolios' => Portfolio::take(6)->get(),
            'teams' => Team::orderBy('order')->get(),
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'promoRewards' => $promoRewards,
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
        $this->seedDefaultServicesIfMissing();

        $services = Service::whereNull('parent_service_id')->get();

        if (Schema::hasColumn('services', 'service_key')) {
            $featuredKeys = $this->featuredServiceKeys();
            $order = array_flip($featuredKeys);
            $services = $services->sortBy(function ($service) use ($order) {
                return $order[$service->service_key] ?? 999;
            })->values();
        } else {
            $featuredTitles = $this->featuredServiceTitles();
            $order = array_flip($featuredTitles);
            $services = $services->sortBy(function ($service) use ($order) {
                return $order[$service->title] ?? 999;
            })->values();
        }

        if ($services->isEmpty()) {
            (new ServiceCatalogSeeder())->run();
            $services = Service::whereNull('parent_service_id')->get();

            if (Schema::hasColumn('services', 'service_key')) {
                $featuredKeys = $this->featuredServiceKeys();
                $order = array_flip($featuredKeys);
                $services = $services->sortBy(function ($service) use ($order) {
                    return $order[$service->service_key] ?? 999;
                })->values();
            } else {
                $featuredTitles = $this->featuredServiceTitles();
                $order = array_flip($featuredTitles);
                $services = $services->sortBy(function ($service) use ($order) {
                    return $order[$service->title] ?? 999;
                })->values();
            }
        }

        return Inertia::render('Services', [
            'services' => $services,
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display a single service with its sub-services
     */
    public function serviceShow(Service $service)
    {
        $this->seedDefaultServicesIfMissing();

        return Inertia::render('Services/Show', [
            'service' => $service,
            'subServices' => $service->subServices()->latest()->get(),
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display a single sub-service with its parent service context
     */
    public function subServiceShow(Service $service, Service $subService)
    {
        $this->seedDefaultServicesIfMissing();

        if ($subService->parent_service_id !== $service->id) {
            abort(404);
        }

        return Inertia::render('Services/SubServiceShow', [
            'service' => $service,
            'subService' => $subService,
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
            'phone' => 'nullable|string|max:255',
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
