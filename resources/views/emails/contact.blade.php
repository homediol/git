<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #7c7676ff; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 10px; }
        .content { background: #f9fafb; padding: 20px; border-radius: 10px; margin-top: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">{{ $name ?? ($contact->name ?? '-') }}</div>
            </div>
            <div class="field">
                <div class="label">Email:</div>
                <div class="value">{{ $email ?? ($contact->email ?? '-') }}</div>
            </div>
            @if(($phone ?? ($contact->phone ?? null)))
            <div class="field">
                <div class="label">Phone:</div>
                <div class="value">{{ $phone ?? ($contact->phone ?? '-') }}</div>
            </div>
            @endif
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">{{ $subject ?? ($contact->subject ?? '-') }}</div>
            </div>
            <div class="field">
                <div class="label">Message:</div>
                <div class="value">{{ $messageContent ?? ($contact->message ?? '-') }}</div>
            </div>
        </div>
    </div>
</body>
</html>
