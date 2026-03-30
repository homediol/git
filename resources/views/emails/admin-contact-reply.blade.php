<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $replySubject }}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #fff7ed; color: #1f2937; }
        .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; }
        .card { background: #ffffff; border: 1px solid #fed7aa; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(194, 65, 12, 0.12); }
        .header { background: linear-gradient(135deg, #ea580c 0%, #fb923c 55%, #f97316 100%); color: #ffffff; padding: 28px 32px; }
        .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.86; margin: 0 0 10px; }
        .title { font-size: 28px; font-weight: 800; line-height: 1.2; margin: 0; }
        .content { padding: 32px; }
        .message { white-space: pre-line; font-size: 15px; line-height: 1.7; color: #374151; }
        .meta { margin-top: 24px; padding: 18px 20px; border-radius: 16px; background: #fff7ed; border: 1px solid #fdba74; }
        .meta p { margin: 0 0 8px; font-size: 14px; color: #7c2d12; }
        .meta p:last-child { margin-bottom: 0; }
        .footer { padding: 0 32px 28px; font-size: 13px; color: #9a3412; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="header">
                <p class="eyebrow">Pavona Studio</p>
                <h1 class="title">{{ $replySubject }}</h1>
            </div>
            <div class="content">
                <p>Hello {{ $contact->name }},</p>
                <div class="message">{{ $replyMessage }}</div>

                <div class="meta">
                    <p><strong>Original subject:</strong> {{ $contact->subject ?: 'Contact message' }}</p>
                    <p><strong>Reply from:</strong> {{ $admin->name }} ({{ $admin->email }})</p>
                    <p><strong>Your email:</strong> {{ $contact->email }}</p>
                    @if($contact->phone)
                    <p><strong>Your phone:</strong> {{ $contact->phone }}</p>
                    @endif
                </div>
            </div>
            <div class="footer">
                You can reply directly to this email if you need anything else from Pavona Studio.
            </div>
        </div>
    </div>
</body>
</html>
