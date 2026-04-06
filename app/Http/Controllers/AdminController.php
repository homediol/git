<?php

namespace App\Http\Controllers;

use App\Mail\AdminContactReplyMail;
use App\Models\Booking;
use App\Models\ChatMessage;
use App\Models\ChatThread;
use App\Models\Service;
use App\Models\Portfolio;
use App\Models\Contact;
use App\Models\Post;
use App\Models\Advertisement;
use App\Models\Team;
use App\Models\Promotion;
use App\Models\Reward;
use App\Models\User;
use App\Models\UserReward;
use App\Models\UserActivity;
use App\Services\SupportChatService;
use Database\Seeders\ServiceCatalogSeeder;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
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
        $admin = auth()->user();
        $bookingTableExists = Schema::hasTable('bookings');
        $recentNotifications = $admin
            ? $admin->notifications()->latest()->take(6)->get()->map(function (DatabaseNotification $notification) {
                return [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Update',
                    'message' => $notification->data['message'] ?? '',
                    'type' => $notification->data['type'] ?? 'info',
                    'created_at' => $notification->created_at,
                ];
            })->all()
            : [];

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
                'bookings' => $bookingTableExists ? Booking::count() : 0,
                'pendingBookings' => $bookingTableExists ? Booking::where('status', 'pending')->count() : 0,
                'chatThreads' => Schema::hasTable('chat_threads') ? ChatThread::count() : 0,
                'unreadChatMessages' => Schema::hasTable('chat_messages')
                    ? ChatMessage::query()
                        ->whereNull('read_at')
                        ->where(function ($query) {
                            $query->whereNull('sender_id')
                                ->orWhereHas('sender', function ($senderQuery) {
                                    $senderQuery->whereNull('role')->orWhere('role', '!=', 'admin');
                                });
                        })
                        ->count()
                    : 0,
            ],
            'recentNotifications' => $recentNotifications,
        ]);
    }

    // ==================== SERVICES ====================
    
    /**
     * Display all services for management
     */
    public function services()
    {
        (new ServiceCatalogSeeder())->run();

        $services = Service::query()
            ->whereNull('parent_service_id')
            ->withCount('subServices')
            ->get()
            ->sortBy(fn (Service $service) => $this->serviceDisplayOrder($service))
            ->values()
            ->map(function (Service $service) {
                $payload = $service->toArray();
                $payload['is_fixed'] = $this->isFixedTopLevelService($service);

                return $payload;
            });

        return Inertia::render('Admin/Services/Index', [
            'services' => $services,
        ]);
    }

    /**
     * Store a new service
     */
    public function servicesStore(Request $request)
    {
        throw ValidationException::withMessages([
            'title' => 'Top-level service cards are fixed. Add items inside the four default service categories instead.',
        ]);
    }

    /**
     * Update existing service
     */
    public function servicesUpdate(Request $request, Service $service)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_rw' => 'nullable|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'description' => 'required|string',
            'description_rw' => 'nullable|string',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $validated = $this->normalizeServiceTranslations($validated);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'services');
        }

        if ($this->isFixedTopLevelService($service)) {
            $validated = array_merge($validated, $this->lockedTopLevelTitles($service));
        }

        $service->update($validated);
        return back()->with('success', 'Service updated!');
    }

    /**
     * Delete service
     */
    public function servicesDestroy(Service $service)
    {
        if ($this->isFixedTopLevelService($service)) {
            return back()->with('error', 'Default top-level service cards cannot be deleted.');
        }

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
            'subServices' => $this->orderedSubServices($service),
        ]);
    }

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

    /**
     * Store a new sub-service
     */
    public function subServicesStore(Request $request, Service $service)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_rw' => 'nullable|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_rw' => 'nullable|string',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $validated = $this->normalizeServiceTranslations($validated);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'sub-services');
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
            'title_rw' => 'nullable|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_rw' => 'nullable|string',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $validated = $this->normalizeServiceTranslations($validated);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'sub-services');
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

    private function normalizeServiceTranslations(array $validated): array
    {
        if (!Schema::hasColumn('services', 'title_rw')) {
            return $validated;
        }

        $validated['title_rw'] = filled($validated['title_rw'] ?? null) ? $validated['title_rw'] : null;
        $validated['title_en'] = filled($validated['title_en'] ?? null) ? $validated['title_en'] : $validated['title'];
        $validated['title_fr'] = filled($validated['title_fr'] ?? null) ? $validated['title_fr'] : null;
        $validated['description_rw'] = filled($validated['description_rw'] ?? null) ? $validated['description_rw'] : null;
        $validated['description_en'] = filled($validated['description_en'] ?? null)
            ? $validated['description_en']
            : ($validated['description'] ?? null);
        $validated['description_fr'] = filled($validated['description_fr'] ?? null) ? $validated['description_fr'] : null;

        return $validated;
    }

    private function fixedTopLevelCatalog(): array
    {
        return [
            'photography-videography' => [
                'title' => 'Photography & Videography',
                'title_rw' => 'Ifoto na Videwo',
                'title_en' => 'Photography & Videography',
                'title_fr' => 'Photographie et Videographie',
            ],
            'graphics-printing' => [
                'title' => 'Graphics & Printing Design',
                'title_rw' => 'Igishushanyo n\'Icapiro',
                'title_en' => 'Graphics & Printing Design',
                'title_fr' => 'Design Graphique et Impression',
            ],
            'make-up' => [
                'title' => 'Make Up',
                'title_rw' => 'Makeup',
                'title_en' => 'Make Up',
                'title_fr' => 'Maquillage',
            ],
            'other-services' => [
                'title' => 'Other Services',
                'title_rw' => 'Izindi Serivisi',
                'title_en' => 'Other Services',
                'title_fr' => 'Autres services',
            ],
        ];
    }

    private function fixedTopLevelKey(Service $service): ?string
    {
        if ($service->parent_service_id !== null) {
            return null;
        }

        $catalog = $this->fixedTopLevelCatalog();

        if (!empty($service->service_key) && array_key_exists($service->service_key, $catalog)) {
            return $service->service_key;
        }

        return collect($catalog)->search(fn (array $item) => $item['title'] === $service->title) ?: null;
    }

    private function isFixedTopLevelService(Service $service): bool
    {
        return $this->fixedTopLevelKey($service) !== null;
    }

    private function lockedTopLevelTitles(Service $service): array
    {
        $key = $this->fixedTopLevelKey($service);

        if (!$key) {
            return [];
        }

        return $this->fixedTopLevelCatalog()[$key];
    }

    private function serviceDisplayOrder(Service $service): int
    {
        $order = array_flip(array_keys($this->fixedTopLevelCatalog()));
        $key = $this->fixedTopLevelKey($service);

        if ($key !== null && array_key_exists($key, $order)) {
            return $order[$key];
        }

        return 999 + (int) $service->id;
    }

    private function normalizePortfolioTranslations(array $validated): array
    {
        if (!Schema::hasColumn('portfolios', 'title_rw')) {
            return $validated;
        }

        $validated['title_rw'] = filled($validated['title_rw'] ?? null) ? $validated['title_rw'] : null;
        $validated['title_en'] = filled($validated['title_en'] ?? null) ? $validated['title_en'] : $validated['title'];
        $validated['title_fr'] = filled($validated['title_fr'] ?? null) ? $validated['title_fr'] : null;
        $validated['description_rw'] = filled($validated['description_rw'] ?? null) ? $validated['description_rw'] : null;
        $validated['description_en'] = filled($validated['description_en'] ?? null)
            ? $validated['description_en']
            : ($validated['description'] ?? null);
        $validated['description_fr'] = filled($validated['description_fr'] ?? null) ? $validated['description_fr'] : null;
        $validated['category_rw'] = filled($validated['category_rw'] ?? null) ? $validated['category_rw'] : null;
        $validated['category_en'] = filled($validated['category_en'] ?? null) ? $validated['category_en'] : $validated['category'];
        $validated['category_fr'] = filled($validated['category_fr'] ?? null) ? $validated['category_fr'] : null;

        return $validated;
    }

    private function normalizePostTranslations(array $validated): array
    {
        if (!Schema::hasColumn('posts', 'title_rw')) {
            return $validated;
        }

        $validated['title_rw'] = filled($validated['title_rw'] ?? null) ? $validated['title_rw'] : null;
        $validated['title_en'] = filled($validated['title_en'] ?? null) ? $validated['title_en'] : $validated['title'];
        $validated['title_fr'] = filled($validated['title_fr'] ?? null) ? $validated['title_fr'] : null;
        $validated['content_rw'] = filled($validated['content_rw'] ?? null) ? $validated['content_rw'] : null;
        $validated['content_en'] = filled($validated['content_en'] ?? null)
            ? $validated['content_en']
            : ($validated['content'] ?? null);
        $validated['content_fr'] = filled($validated['content_fr'] ?? null) ? $validated['content_fr'] : null;
        $validated['category_rw'] = filled($validated['category_rw'] ?? null) ? $validated['category_rw'] : null;
        $validated['category_en'] = filled($validated['category_en'] ?? null) ? $validated['category_en'] : $validated['category'];
        $validated['category_fr'] = filled($validated['category_fr'] ?? null) ? $validated['category_fr'] : null;

        return $validated;
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
            'title_rw' => 'nullable|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'description' => 'required|string',
            'description_rw' => 'nullable|string',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'category' => 'required|string',
            'category_rw' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'category_fr' => 'nullable|string|max:255',
            'image' => 'nullable|file|max:512000',
            'delete_image' => 'boolean',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $validated = $this->normalizePortfolioTranslations($validated);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'portfolio');
        } else {
            $validated['image'] = '';
        }

        unset($validated['delete_image']);
        Portfolio::create($validated);
        return back()->with('success', 'Portfolio created!');
    }

    public function portfoliosUpdate(Request $request, Portfolio $portfolio)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_rw' => 'nullable|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'description' => 'required|string',
            'description_rw' => 'nullable|string',
            'description_en' => 'nullable|string',
            'description_fr' => 'nullable|string',
            'category' => 'required|string',
            'category_rw' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'category_fr' => 'nullable|string|max:255',
            'image' => 'nullable|file|max:512000',
            'delete_image' => 'boolean',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $validated = $this->normalizePortfolioTranslations($validated);

        if ($request->boolean('delete_image')) {
            $validated['image'] = '';
        } elseif ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'portfolio');
        } else {
            unset($validated['image']);
        }

        unset($validated['delete_image']);
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
        $contacts = Contact::query()->latest()->get();
        $emails = $contacts
            ->pluck('email')
            ->filter()
            ->map(fn ($email) => trim((string) $email))
            ->unique()
            ->values();
        $phones = $contacts
            ->pluck('phone')
            ->filter()
            ->map(fn ($phone) => trim((string) $phone))
            ->unique()
            ->values();

        $usersByEmail = $emails->isEmpty()
            ? collect()
            : User::query()
                ->whereIn('email', $emails->all())
                ->get()
                ->keyBy(fn (User $user) => strtolower((string) $user->email));

        $threads = ($emails->isEmpty() && $phones->isEmpty())
            ? collect()
            : ChatThread::query()
                ->with(['user', 'assignedAdmin', 'latestMessage.sender'])
                ->where(function ($query) use ($emails, $phones) {
                    if ($emails->isNotEmpty()) {
                        $query->whereIn('guest_email', $emails->all())
                            ->orWhereHas('user', function ($userQuery) use ($emails) {
                                $userQuery->whereIn('email', $emails->all());
                            });
                    }

                    if ($phones->isNotEmpty()) {
                        $phonesArray = $phones->all();

                        if ($emails->isNotEmpty()) {
                            $query->orWhereIn('guest_phone', $phonesArray)
                                ->orWhereHas('user', function ($userQuery) use ($phonesArray) {
                                    $userQuery->whereIn('phone', $phonesArray);
                                });
                        } else {
                            $query->whereIn('guest_phone', $phonesArray)
                                ->orWhereHas('user', function ($userQuery) use ($phonesArray) {
                                    $userQuery->whereIn('phone', $phonesArray);
                                });
                        }
                    }
                })
                ->orderByDesc('last_message_at')
                ->orderByDesc('updated_at')
                ->get();

        $threadsByUserId = $threads
            ->filter(fn (ChatThread $thread) => $thread->user_id)
            ->groupBy('user_id')
            ->map(fn ($group) => $group->first());

        $threadsByEmail = $threads
            ->filter(fn (ChatThread $thread) => filled($thread->guest_email))
            ->groupBy(fn (ChatThread $thread) => strtolower((string) $thread->guest_email))
            ->map(fn ($group) => $group->first());

        $threadsByPhone = $threads
            ->filter(fn (ChatThread $thread) => filled($thread->guest_phone))
            ->groupBy(fn (ChatThread $thread) => trim((string) $thread->guest_phone))
            ->map(fn ($group) => $group->first());

        return Inertia::render('Admin/Contacts/Index', [
            'contacts' => $contacts->map(function (Contact $contact) use ($usersByEmail, $threadsByUserId, $threadsByEmail, $threadsByPhone) {
                $emailKey = strtolower(trim((string) $contact->email));
                $phoneKey = trim((string) ($contact->phone ?? ''));
                $matchedUser = $emailKey !== '' ? $usersByEmail->get($emailKey) : null;
                $matchedThread = $matchedUser && $threadsByUserId->has($matchedUser->id)
                    ? $threadsByUserId->get($matchedUser->id)
                    : ($emailKey !== '' && $threadsByEmail->has($emailKey)
                        ? $threadsByEmail->get($emailKey)
                        : ($phoneKey !== '' ? $threadsByPhone->get($phoneKey) : null));

                return [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'phone' => $contact->phone,
                    'subject' => $contact->subject,
                    'message' => $contact->message,
                    'created_at' => $contact->created_at,
                    'matched_user' => $matchedUser ? [
                        'id' => $matchedUser->id,
                        'name' => $matchedUser->name,
                        'username' => $matchedUser->username,
                        'email' => $matchedUser->email,
                        'phone' => $matchedUser->phone,
                        'role' => $matchedUser->role,
                        'created_at' => $matchedUser->created_at,
                    ] : null,
                    'matched_thread' => $matchedThread ? [
                        'id' => $matchedThread->id,
                        'last_message_at' => $matchedThread->last_message_at,
                        'assigned_admin' => $matchedThread->assignedAdmin?->name,
                        'latest_message' => $matchedThread->latestMessage?->body,
                    ] : null,
                    'reply_subject' => $contact->subject
                        ? 'Re: ' . $contact->subject
                        : 'Reply from Pavona Studio',
                    'chat_available' => (bool) $matchedThread || (bool) $matchedUser,
                ];
            })->values(),
        ]);
    }

    public function contactsReply(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        try {
            Mail::to($contact->email)->send(
                new AdminContactReplyMail(
                    $contact,
                    $request->user(),
                    $validated['subject'],
                    $validated['message'],
                )
            );
        } catch (\Throwable $exception) {
            report($exception);

            return back()->with('error', 'Reply could not be sent right now. Please check your mail setup and try again.');
        }

        return back()->with('success', 'Reply sent successfully!');
    }

    public function contactsChat(Contact $contact, SupportChatService $chatService)
    {
        $matchedUser = User::query()->where('email', $contact->email)->first();

        if ($matchedUser) {
            $thread = $chatService->getOrCreateThreadForUser($matchedUser);

            return redirect()->route('admin.messages', ['thread' => $thread->id]);
        }

        $thread = ChatThread::query()
            ->where(function ($query) use ($contact) {
                if (filled($contact->email)) {
                    $query->where('guest_email', $contact->email);
                }

                if (filled($contact->phone)) {
                    $query->orWhere('guest_phone', $contact->phone);
                }
            })
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->first();

        if ($thread) {
            return redirect()->route('admin.messages', ['thread' => $thread->id]);
        }

        return back()->with('error', 'No live chat thread is available for this contact yet.');
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
            'title_rw' => 'nullable|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'content' => 'required|string',
            'content_rw' => 'nullable|string',
            'content_en' => 'nullable|string',
            'content_fr' => 'nullable|string',
            'category' => 'required|string',
            'category_rw' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'category_fr' => 'nullable|string|max:255',
            'image' => 'nullable|file|max:512000',
            'video' => 'nullable|file|max:5120000',
            'delete_image' => 'boolean',
            'delete_video' => 'boolean',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $this->ensureVideoUpload($request, 'video');
        $validated = $this->normalizePostTranslations($validated);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'posts');
        }

        if ($request->hasFile('video')) {
            $validated['video'] = $this->storeMediaFile($request, 'video', 'posts');
        }

        unset($validated['delete_image'], $validated['delete_video']);
        Post::create($validated);
        return back()->with('success', 'Post created!');
    }

    public function postsUpdate(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_rw' => 'nullable|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'title_fr' => 'nullable|string|max:255',
            'content' => 'required|string',
            'content_rw' => 'nullable|string',
            'content_en' => 'nullable|string',
            'content_fr' => 'nullable|string',
            'category' => 'required|string',
            'category_rw' => 'nullable|string|max:255',
            'category_en' => 'nullable|string|max:255',
            'category_fr' => 'nullable|string|max:255',
            'image' => 'nullable|file|max:512000',
            'video' => 'nullable|file|max:5120000',
            'delete_image' => 'boolean',
            'delete_video' => 'boolean',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $this->ensureVideoUpload($request, 'video');
        $validated = $this->normalizePostTranslations($validated);

        if ($request->boolean('delete_image')) {
            $validated['image'] = null;
        } elseif ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'posts');
        } else {
            unset($validated['image']);
        }

        if ($request->boolean('delete_video')) {
            $validated['video'] = null;
        } elseif ($request->hasFile('video')) {
            $validated['video'] = $this->storeMediaFile($request, 'video', 'posts');
        } else {
            unset($validated['video']);
        }

        unset($validated['delete_image'], $validated['delete_video']);
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
            'media' => 'required|file|max:51200',
            'active' => 'boolean',
            'order' => 'integer',
            'duration' => 'integer|min:1|max:60',
        ]);

        $this->ensureImageOrVideoUpload($request, 'media');

        $file = $request->file('media');
        $mime = (string) $file->getMimeType();
        $type = str_starts_with($mime, 'video/') ? 'video' : 'image';
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
            'media' => 'nullable|file|max:51200',
            'active' => 'boolean',
            'order' => 'integer',
            'duration' => 'integer|min:1|max:60',
        ]);

        if ($request->hasFile('media')) {
            $this->ensureImageOrVideoUpload($request, 'media');
            $file = $request->file('media');
            $mime = (string) $file->getMimeType();
            $type = str_starts_with($mime, 'video/') ? 'video' : 'image';
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
            'image' => 'nullable|file|max:512000',
            'order' => 'integer',
        ]);

        if ($request->hasFile('image')) {
            $this->ensureImageUpload($request, 'image');
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
            'image' => 'nullable|file|max:512000',
            'order' => 'integer',
            'delete_image' => 'boolean',
        ]);

        if ($request->has('delete_image') && $request->delete_image) {
            $validated['image'] = null;
        } elseif ($request->hasFile('image')) {
            $this->ensureImageUpload($request, 'image');
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

    private function ensureImageUpload(Request $request, string $field): void
    {
        if (!$request->hasFile($field)) {
            return;
        }

        $mime = (string) $request->file($field)->getMimeType();

        if (!str_starts_with($mime, 'image/')) {
            throw ValidationException::withMessages([
                $field => 'Please upload a valid image file.',
            ]);
        }
    }

    private function ensureImageOrVideoUpload(Request $request, string $field): void
    {
        if (!$request->hasFile($field)) {
            return;
        }

        $mime = (string) $request->file($field)->getMimeType();

        if (!str_starts_with($mime, 'image/') && !str_starts_with($mime, 'video/')) {
            throw ValidationException::withMessages([
                $field => 'Please upload an image or video file.',
            ]);
        }
    }

    private function ensureVideoUpload(Request $request, string $field): void
    {
        if (!$request->hasFile($field)) {
            return;
        }

        $mime = (string) $request->file($field)->getMimeType();

        if (!str_starts_with($mime, 'video/')) {
            throw ValidationException::withMessages([
                $field => 'Please upload a valid video file.',
            ]);
        }
    }

    private function storeMediaFile(Request $request, string $field, string $directory): string
    {
        $file = $request->file($field);
        $mime = (string) $file->getMimeType();
        $subDirectory = str_starts_with($mime, 'video/')
            ? $directory.'/videos'
            : $directory.'/images';

        return '/storage/'.$file->store($subDirectory, 'public');
    }
}
