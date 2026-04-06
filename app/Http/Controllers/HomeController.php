<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Team;
use App\Models\Post;
use App\Models\Contact;
use App\Models\SiteSettings;
use App\Models\Advertisement;
use App\Services\WelcomeOfferService;
use Database\Seeders\BlogContentSeeder;
use Database\Seeders\PortfolioShowcaseSeeder;
use Database\Seeders\ServiceCatalogSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * HomeController handles all public-facing pages
 * Routes: /, /about, /services, /portfolio, /contact, /blog
 */
class HomeController extends Controller
{
    private function featuredSubServiceOrder(): array
    {
        return [
            'photography-videography' => [
                'weddings',
                'personal-sessions',
                'save-the-date-sessions',
                'graduation-sessions',
                'birthday-sessions',
                'adventure-sessions',
                'maternity-sessions',
                'festive-sessions',
            ],
            'graphics-printing' => [
                'banner-printing',
                'invitation-printing',
                'digital-printing',
                'billboards',
                'pull-ups-cards',
                'id-cards',
                'business-cards',
                'flyers-printing',
                'embroidery',
                'logo-design',
                'certification',
                'backdrops',
            ],
            'other-services' => [
                'live-streaming',
                'drone-services',
                'real-estate',
                'sound-system',
                'software-development',
                'funerals',
            ],
        ];
    }

    private function featuredServiceKeys(): array
    {
        return [
            'photography-videography',
            'graphics-printing',
            'make-up',
            'other-services',
        ];
    }

    private function featuredServiceTitles(): array
    {
        return [
            'Photography & Videography',
            'Graphics & Printing Design',
            'Make Up',
            'Other Services',
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

        $photoService = $featuredServices->firstWhere('service_key', 'photography-videography');
        $graphicsService = $featuredServices->firstWhere('service_key', 'graphics-printing');
        $otherServices = $featuredServices->firstWhere('service_key', 'other-services');

        if (!$photoService || !$graphicsService || !$otherServices) {
            return true;
        }

        if ($otherServices->subServices()->count() < count($this->featuredSubServiceOrder()['other-services'])) {
            return true;
        }

        foreach ($this->featuredSubServiceOrder() as $serviceKey => $expectedSubServiceKeys) {
            $service = $featuredServices->firstWhere('service_key', $serviceKey);

            if (!$service) {
                return true;
            }

            $existingKeys = $service->subServices()->pluck('service_key')->filter()->all();

            if (!empty(array_diff($expectedSubServiceKeys, $existingKeys))) {
                return true;
            }
        }

        if ($photoService->subServices()->count() < count($this->featuredSubServiceOrder()['photography-videography'])) {
            return true;
        }

        if ($graphicsService->subServices()->count() < count($this->featuredSubServiceOrder()['graphics-printing'])) {
            return true;
        }

        if ($otherServices->subServices()->count() < count($this->featuredSubServiceOrder()['other-services'])) {
            return true;
        }

        if (!Schema::hasColumn('services', 'title_rw')) {
            return false;
        }

        if ($photoService->subServices()
            ->where(function ($query) {
                $query->whereNull('title_rw')
                    ->orWhereNull('description_rw');
            })
            ->exists()) {
            return true;
        }

        if ($graphicsService->subServices()
            ->where(function ($query) {
                $query->whereNull('title_rw')
                    ->orWhereNull('description_rw');
            })
            ->exists()) {
            return true;
        }

        return $otherServices->subServices()
            ->where(function ($query) {
                $query->whereNull('title_rw')
                    ->orWhereNull('description_rw');
            })
            ->exists();
    }

    private function orderedSubServices(Service $service)
    {
        $subServices = $service->subServices()->get();

        if (!Schema::hasColumn('services', 'service_key')) {
            return $subServices->sortBy('title')->values();
        }

        $order = array_flip($this->featuredSubServiceOrder()[$service->service_key] ?? []);

        if ($order === []) {
            return $subServices->sortBy('title')->values();
        }

        return $subServices->sortBy(function (Service $subService) use ($order) {
            $position = $order[$subService->service_key] ?? 999;

            return sprintf('%04d::%s', $position, $subService->title);
        })->values();
    }

    private function seedDefaultPortfolioIfMissing(): void
    {
        $portfolioCount = Portfolio::count();
        $titles = Portfolio::query()->pluck('title');
        $hasPlaceholderTitles = $titles->contains(fn ($title) => in_array(Str::lower(trim((string) $title)), [
            'pavona production',
            'pavona studio',
            'pavona product',
        ], true));
        $hasLegacySampleTitles = $titles->contains(fn ($title) => in_array((string) $title, [
            'TechStart Logo & Brand Identity',
            'Corporate Event Banners',
            'Restaurant Menu & Brochures',
            'Company Vehicle Branding',
            'Corporate Business Cards',
            'Team Uniform T-Shirts',
            'Product Packaging Stickers',
            'Corporate Award Plaques',
            'Promotional Coffee Mugs',
        ], true));

        if ($portfolioCount < 6 || $hasPlaceholderTitles || $hasLegacySampleTitles) {
            (new PortfolioShowcaseSeeder())->run();
        }
    }

    private function seedDefaultBlogIfMissing(): void
    {
        $postCount = Post::count();
        $titles = Post::query()->pluck('title');
        $hasPlaceholderTitle = $titles->contains(fn ($title) => Str::contains(Str::lower((string) $title), 'grgraphic'));
        $hasLegacySampleTitles = $titles->contains(fn ($title) => in_array((string) $title, [
            'The Future of Web Development in 2024',
            'Best Practices for Mobile App Design',
            'Laravel 11: What\'s New and Exciting',
            'Building Scalable APIs with Laravel',
            'React vs Vue: Choosing the Right Framework',
            'SEO Optimization for Modern Web Apps',
        ], true));

        if ($postCount < 4 || $hasPlaceholderTitle || $hasLegacySampleTitles) {
            (new BlogContentSeeder())->run();
        }
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
        $this->seedDefaultPortfolioIfMissing();
        $this->seedDefaultBlogIfMissing();
        $featuredServices = $this->getFeaturedServices();

        if ($featuredServices->isEmpty()) {
            (new ServiceCatalogSeeder())->run();
            $featuredServices = $this->getFeaturedServices();
        }

        $welcomeOffer = app(WelcomeOfferService::class)->forFrontend(auth()->user());
        $promoRewards = collect($welcomeOffer['rewards'] ?? [])->values();

        return Inertia::render('Home', [
            'services' => $featuredServices,
            'portfolios' => Portfolio::latest()->take(6)->get(),
            'advertisements' => Advertisement::where('active', true)->orderBy('order')->get(),
            'promoRewards' => $promoRewards,
            'welcomeOffer' => $welcomeOffer,
            'settings' => [
                'header_bg' => SiteSettings::get('header_bg'),
                'main_bg' => SiteSettings::get('main_bg'),
                'footer_bg' => SiteSettings::get('footer_bg'),
            ],
        ]);
    }

    /**
     * Display about page with studio highlights
     * @return \Inertia\Response
     */
    public function about()
    {
        $this->seedDefaultServicesIfMissing();
        $this->seedDefaultPortfolioIfMissing();

        $teamCount = Team::count();

        return Inertia::render('About', [
            'featuredWork' => Portfolio::latest()->take(4)->get(),
            'studioStats' => [
                'projects' => Portfolio::count(),
                'services' => Service::whereNull('parent_service_id')->count(),
                'team' => $teamCount,
            ],
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
            'welcomeOffer' => app(WelcomeOfferService::class)->forFrontend(auth()->user()),
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
            'subServices' => $this->orderedSubServices($service),
            'welcomeOffer' => app(WelcomeOfferService::class)->forFrontend(auth()->user()),
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
            'welcomeOffer' => app(WelcomeOfferService::class)->forFrontend(auth()->user()),
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
        $this->seedDefaultPortfolioIfMissing();

        $query = Portfolio::query()->latest();
        
        // Filter by category if provided
        if ($request->category) {
            $query->where('category', $request->category);
        }
        
        return Inertia::render('Portfolio', [
            'portfolios' => $query->get(),
            'categories' => Portfolio::query()
                ->select('category', 'category_rw', 'category_en', 'category_fr')
                ->orderBy('category')
                ->get()
                ->unique('category')
                ->values(),
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
        $this->seedDefaultBlogIfMissing();

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
