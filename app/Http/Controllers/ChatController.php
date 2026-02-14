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
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

        try {
            // Use HuggingFace free API (no key required)
            $response = Http::timeout(30)->post('https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill', [
                'inputs' => $request->message,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $reply = $data[0]['generated_text'] ?? 'I apologize, I could not generate a response.';
                
                return response()->json([
                    'reply' => $reply,
                    'success' => true
                ]);
            }

            // Fallback response
            return response()->json([
                'reply' => $this->getFallbackResponse($request->message),
                'success' => true
            ]);

        } catch (\Exception $e) {
            \Log::error('Chat Error: ' . $e->getMessage());
            return response()->json([
                'reply' => $this->getFallbackResponse($request->message),
                'success' => true
            ]);
        }
    }

    /**
     * Get fallback response when API fails
     */
    private function getFallbackResponse($message)
    {
        $message = strtolower($message);
        
        if (str_contains($message, 'hello') || str_contains($message, 'hi')) {
            return 'Hello! How can I help you with Pavona Studios services today?';
        }
        if (str_contains($message, 'service')) {
            return 'We offer graphic design, branding, printing, web design, and many more services. Would you like to know more about a specific service?';
        }
        if (str_contains($message, 'price') || str_contains($message, 'cost')) {
            return 'Our pricing varies by project. Please contact us through the contact form for a custom quote!';
        }
        if (str_contains($message, 'contact')) {
            return 'You can reach us via the contact form on our website, or call us directly. We\'re here to help!';
        }
        
        return 'Thank you for your message! For detailed information about our services, please visit our Services page or contact us directly.';
    }
}
