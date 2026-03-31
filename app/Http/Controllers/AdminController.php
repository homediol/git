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
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'services');
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
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'services');
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
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');

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
            'description' => 'nullable|string',
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');

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
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'portfolio');
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
            'image' => 'nullable|file|max:512000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'portfolio');
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
            'content' => 'required|string',
            'category' => 'required|string',
            'image' => 'nullable|file|max:512000',
            'video' => 'nullable|file|max:5120000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $this->ensureVideoUpload($request, 'video');

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'posts');
        }

        if ($request->hasFile('video')) {
            $validated['video'] = $this->storeMediaFile($request, 'video', 'posts');
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
            'image' => 'nullable|file|max:512000',
            'video' => 'nullable|file|max:5120000',
        ]);

        $this->ensureImageOrVideoUpload($request, 'image');
        $this->ensureVideoUpload($request, 'video');

        if ($request->hasFile('image')) {
            $validated['image'] = $this->storeMediaFile($request, 'image', 'posts');
        }

        if ($request->hasFile('video')) {
            $validated['video'] = $this->storeMediaFile($request, 'video', 'posts');
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
