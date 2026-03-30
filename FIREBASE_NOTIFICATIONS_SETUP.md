# Pavona Studio Notification System

This project now includes a hybrid notification system for both admins and users:

- In-app notifications in the website bell
- Push notifications with Firebase Cloud Messaging (FCM)
- Database storage with read/unread tracking
- Real-time sync using polling plus push-triggered refresh

## What is included

### In-app notifications

- Notification bell with unread count
- Dropdown list for admins and users
- Mark one as read / unread
- Mark all as read
- Database-backed storage using Laravel notifications

### Push notifications

- Browser permission prompt
- Device token registration per user
- Firebase service worker
- Foreground and background push handling
- Support for:
  - Chat messages
  - Booking updates
  - Promotions
  - Rewards

### Two-way notification flow

- User actions notify admins
  - New customer chat messages
  - New guest chat messages
  - New booking requests
- Admin actions notify users
  - Chat replies
  - Booking approvals / rejections
  - Reward updates
  - Promotion broadcasts

## Database schema

### Existing Laravel notifications table

Used for in-app notification storage and read/unread tracking.

### New user fields

Added by:

- [2026_03_29_100000_add_notification_preferences_and_fcm_tokens.php](/home/diolo/git/database/migrations/2026_03_29_100000_add_notification_preferences_and_fcm_tokens.php)

Fields:

- `in_app_notifications_enabled`
- `push_notifications_enabled`
- `notification_preferences` JSON

### New FCM tokens table

Table: `fcm_tokens`

Fields:

- `user_id`
- `token`
- `platform`
- `browser`
- `device_name`
- `user_agent`
- `last_used_at`


Customer Inbox
Reply to live user conversations

Bookings
Approve or reject client requests

Contact Messages
Review client inquiries## Firebase setup

### 1. Create a Firebase project

In Firebase Console:

1. Create or open your Firebase project
2. Open `Project settings`
3. Add a `Web App`
4. Copy the web app config values

### 2. Enable Cloud Messaging

In Firebase Console:

1. Open `Cloud Messaging`
2. Enable Firebase Cloud Messaging if needed
3. Generate a `Web Push certificate key pair`
4. Copy the `VAPID key`

### 3. Create a service account

In Firebase Console:

1. Open `Project settings`
2. Go to `Service accounts`
3. Generate a new private key
4. Use these values from the JSON:
   - `project_id`
   - `client_email`
   - `private_key`

### 4. Fill environment variables

Update your `.env` with:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_API_KEY=your-web-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
FIREBASE_VAPID_KEY=your-web-push-vapid-key
FIREBASE_WEB_SDK_VERSION=10.13.2
```

Important:

- Keep the `\n` characters inside `FIREBASE_PRIVATE_KEY`
- Use HTTPS in production, because push notifications require secure context

## Laravel setup

Run:

```bash
php artisan migrate
php artisan config:clear
```

## Queue worker

Push sending is queued.

Run a worker:

```bash
php artisan queue:work
```

For development, your existing `composer dev` command already starts a queue listener.

## Frontend flow

### Push manager

Main frontend files:

- [PushNotificationManager.jsx](/home/diolo/git/resources/js/Components/PushNotificationManager.jsx)
- [pushNotifications.js](/home/diolo/git/resources/js/lib/pushNotifications.js)
- [firebase-messaging-sw.blade.php](/home/diolo/git/resources/views/firebase-messaging-sw.blade.php)

Flow:

1. Authenticated user opens Pavona
2. Browser asks for notification permission
3. FCM token is generated
4. Token is saved via:
   - `notifications.push.store`
5. Future notifications are:
   - saved in database
   - shown in bell
   - pushed to registered devices

## User controls

Notification settings are available in:

- [Edit.jsx](/home/diolo/git/resources/js/Pages/Profile/Edit.jsx)
- [UpdateNotificationSettingsForm.jsx](/home/diolo/git/resources/js/Pages/Profile/Partials/UpdateNotificationSettingsForm.jsx)

Users and admins can control:

- In-app notifications
- Push notifications
- Per-category preferences for:
  - general
  - chat
  - booking
  - promotion
  - reward

## Key backend files

- [GenericNotification.php](/home/diolo/git/app/Notifications/GenericNotification.php)
- [PushNotificationChannel.php](/home/diolo/git/app/Notifications/Channels/PushNotificationChannel.php)
- [FirebasePushService.php](/home/diolo/git/app/Services/FirebasePushService.php)
- [SendPushNotificationJob.php](/home/diolo/git/app/Jobs/SendPushNotificationJob.php)
- [PushNotificationController.php](/home/diolo/git/app/Http/Controllers/PushNotificationController.php)

## Key frontend files

- [NotificationBell.jsx](/home/diolo/git/resources/js/Components/NotificationBell.jsx)
- [PushNotificationManager.jsx](/home/diolo/git/resources/js/Components/PushNotificationManager.jsx)
- [pushNotifications.js](/home/diolo/git/resources/js/lib/pushNotifications.js)
- [AuthenticatedLayout.jsx](/home/diolo/git/resources/js/Layouts/AuthenticatedLayout.jsx)
- [PublicLayout.jsx](/home/diolo/git/resources/js/Layouts/PublicLayout.jsx)

## Current real-time strategy

The system currently uses:

- polling for in-app bell refresh
- push-triggered refresh for faster updates when FCM arrives

This means it already supports real-time sync without requiring Laravel WebSockets.

