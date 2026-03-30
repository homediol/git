<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $content['title'] }}</title>
</head>
<body style="margin:0;padding:32px;background:#fff7ed;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #fed7aa;border-radius:24px;overflow:hidden;">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#7c2d12,#ea580c,#fb923c);color:#ffffff;">
            <p style="margin:0;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;opacity:0.8;">Pavona Studio</p>
            <h1 style="margin:14px 0 0;font-size:28px;line-height:1.25;">{{ $content['title'] }}</h1>
        </div>
        <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">{{ $content['message'] }}</p>

            @if(!empty($content['action_url']) && !empty($content['action_text']))
                <p style="margin:28px 0 0;">
                    <a
                        href="{{ $content['action_url'] }}"
                        style="display:inline-block;padding:14px 20px;border-radius:999px;background:#ea580c;color:#ffffff;text-decoration:none;font-weight:700;"
                    >
                        {{ $content['action_text'] }}
                    </a>
                </p>
            @endif

            <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                {{ $user->name }}, this update was sent from Pavona Studio campaign management.
            </p>
        </div>
    </div>
</body>
</html>
