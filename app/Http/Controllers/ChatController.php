<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    /**
     * Handle chat message and get AI response
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
            'locale' => 'nullable|in:rw,en,fr',
        ]);

        $locale = $validated['locale'] ?? $request->user()?->language ?? 'rw';

        try {
            // Use HuggingFace free API (no key required)
            $response = Http::timeout(30)->post('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', [
                'inputs' => $validated['message'],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data[0]['generated_text'] ?? $this->getFallbackResponse($validated['message'], $locale);
                
                return response()->json([
                    'reply' => $reply,
                    'success' => true
                ]);
            }

            // Fallback response
            return response()->json([
                'reply' => $this->getFallbackResponse($validated['message'], $locale),
                'success' => true
            ]);

        } catch (\Exception $e) {
            \Log::error('Chat Error: ' . $e->getMessage());
            return response()->json([
                'reply' => $this->getFallbackResponse($validated['message'], $locale),
                'success' => true
            ]);
        }
    }

    /**
     * Get fallback response when API fails
     */
    private function getFallbackResponse($message, $locale = 'rw')
    {
        $message = strtolower($message);

        if ($this->containsAny($message, ['hello', 'hi', 'hey', 'bonjour', 'salut', 'amakuru', 'muraho'])) {
            return match ($locale) {
                'fr' => 'Bonjour ! Comment puis-je vous aider aujourd\'hui avec les services de Pavona Studios ?',
                'en' => 'Hello! How can I help you with Pavona Studios services today?',
                default => 'Muraho! Nagufasha iki uyu munsi kuri serivisi za Pavona Studios?',
            };
        }

        if ($this->containsAny($message, ['service', 'services', 'serivisi'])) {
            return match ($locale) {
                'fr' => 'Nous proposons le graphic design, le branding, l\'impression, le web design et bien d\'autres services. Souhaitez-vous des details sur un service precis ?',
                'en' => 'We offer graphic design, branding, printing, web design, and many more services. Would you like to know more about a specific service?',
                default => 'Dutanga graphic design, branding, printing, web design n\'izindi serivisi nyinshi. Ushaka kumenya byinshi kuri serivisi runaka?',
            };
        }

        if ($this->containsAny($message, ['price', 'cost', 'pricing', 'prix', 'tarif', 'igiciro', 'ibiciro'])) {
            return match ($locale) {
                'fr' => 'Nos prix varient selon le projet. Veuillez nous contacter via le formulaire de contact pour recevoir un devis adapte.',
                'en' => 'Our pricing varies by project. Please contact us through the contact form for a custom quote!',
                default => 'Ibiciro byacu biterwa n\'umushinga. Nyamuneka twandikire ukoresheje contact form kugira ngo tuguhe quote ijyanye n\'ibyo ushaka.',
            };
        }

        if ($this->containsAny($message, ['contact', 'call', 'email', 'telephone', 'phone', 'twandikire', 'hamagara'])) {
            return match ($locale) {
                'fr' => 'Vous pouvez nous joindre via le formulaire de contact du site ou par telephone. Nous sommes la pour vous aider !',
                'en' => 'You can reach us via the contact form on our website, or call us directly. We\'re here to help!',
                default => 'Ushobora kutwandikira ukoresheje contact form yo kuri website cyangwa ugahamagara nimero yacu. Turi hano kugira ngo tugufashe!',
            };
        }

        return match ($locale) {
            'fr' => 'Merci pour votre message ! Pour des informations detaillees sur nos services, consultez la page Services ou contactez-nous directement.',
            'en' => 'Thank you for your message! For detailed information about our services, please visit our Services page or contact us directly.',
            default => 'Murakoze ku butumwa bwawe! Ushaka amakuru arambuye kuri serivisi zacu, sura page ya Services cyangwa utwandikire directly.',
        };
    }

    private function containsAny(string $message, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($message, $needle)) {
                return true;
            }
        }

        return false;
    }
}
