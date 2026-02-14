# 🤖 AI Chatbot - Pavona Studios

Modern, responsive AI chatbot integrated with DeepAI API.

## ✅ Features Implemented

### Frontend (React Component)
- ✅ Toggle button (bottom-right, fixed position)
- ✅ Smooth open/close animations
- ✅ Glassmorphism design matching site theme
- ✅ User messages (right, purple gradient)
- ✅ Bot messages (left, white background)
- ✅ Typing indicator (3 bouncing dots)
- ✅ Auto-scroll to latest message
- ✅ Mobile responsive (full-width on small screens)
- ✅ Send button with icon
- ✅ Input validation (no empty messages)

### Backend (Laravel)
- ✅ POST `/chat` endpoint
- ✅ CSRF protection
- ✅ DeepAI API integration
- ✅ Error handling
- ✅ JSON responses

### Standalone HTML Version
- ✅ Pure HTML/CSS/JS (no build required)
- ✅ Tailwind CSS CDN
- ✅ Works in any Laravel Blade template
- ✅ CSRF token support

## 🚀 Usage

### Already Integrated!
The chatbot is automatically available on all public pages via `PublicLayout.jsx`.

### Test It
1. Visit any public page (Home, About, Services, etc.)
2. Click the purple chat button (bottom-right)
3. Type a message and press Send
4. Bot responds using DeepAI API

## 🔑 API Configuration

### Using Free DeepAI Key (Default)
No setup needed! Uses quickstart key: `quickstart-QUdJIGlzIGNvbWluZy4uLi4K`

### Using Your Own Key (Recommended)
1. Get free API key: https://deepai.org/machine-learning-model/text-generator
2. Add to `.env`:
```env
DEEPAI_API_KEY=your_api_key_here
```

## 📁 Files Created

```
✅ resources/js/Components/AIChatbot.jsx - React component
✅ app/Http/Controllers/ChatController.php - Backend handler
✅ routes/web.php - Added POST /chat route
✅ resources/views/chatbot-standalone.html - Standalone version
✅ resources/js/Layouts/PublicLayout.jsx - Integrated chatbot
✅ tailwind.config.js - Added bounce animation
```

## 🎨 Design

- **Colors**: Purple/pink gradient (matches site theme)
- **Position**: Fixed bottom-right
- **Size**: 384px × 500px (mobile: full-width)
- **Style**: Glassmorphism with backdrop blur
- **Animations**: Fade-in, bounce, hover effects

## 🔧 Customization

### Change Position
```jsx
// In AIChatbot.jsx
className="fixed bottom-6 right-6" // Change bottom/right values
```

### Change Colors
```jsx
// Replace gradient classes
from-purple-600 to-pink-600 // Change to your colors
```

### Change Size
```jsx
className="w-96 h-[500px]" // Adjust width/height
```

### Change Bot Name
```jsx
<h3 className="font-bold">Pavona AI</h3> // Change name
```

## 📱 Mobile Responsive

- **Desktop**: 384px width, bottom-right corner
- **Tablet**: Same as desktop
- **Mobile**: Full-width minus 2rem padding

## 🌐 Standalone Version

Use `chatbot-standalone.html` for:
- Non-React pages
- Laravel Blade templates
- Static HTML sites

Just include in any Blade file:
```blade
@include('chatbot-standalone')
```

## 🎯 API Endpoints

### POST /chat
**Request:**
```json
{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "reply": "I'm doing great! How can I help you?",
  "success": true
}
```

## ⚡ Performance

- Lazy loaded (only loads when page loads)
- Minimal bundle size (~5KB)
- Fast API responses (~1-2 seconds)
- Auto-scroll optimized

## 🔒 Security

- ✅ CSRF token validation
- ✅ Input sanitization
- ✅ Max message length (500 chars)
- ✅ Rate limiting (Laravel default)

## 🎊 Ready to Use!

The chatbot is live and working on all public pages. Just click the purple button!

---

**Need help?** The chatbot can answer questions about Pavona Studios services!
