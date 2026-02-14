# 🎨 Modern SPA with Glassmorphism Design

A beautiful Single Page Application built with Laravel, Inertia.js, React, and Tailwind CSS featuring modern glassmorphism design.

## ✨ Features

### 🚀 Single Page Application
- **No Page Reloads** - Smooth navigation with Inertia.js
- **Fast Performance** - Optimized React components
- **SEO Friendly** - Server-side rendering with Laravel
- **Browser History** - Back/forward buttons work perfectly

### 🎨 Glassmorphism Design
- **Blurred Backgrounds** - Semi-transparent cards with backdrop blur
- **Soft Gradients** - Purple, pink, and blue color scheme
- **Rounded Corners** - Modern, smooth edges
- **Subtle Shadows** - Depth and elevation
- **Hover Animations** - Scale and shadow effects

### 📱 Responsive Design
- **Mobile First** - Optimized for all screen sizes
- **Tablet Support** - Perfect layout for medium screens
- **Desktop Ready** - Full-featured desktop experience
- **Touch Friendly** - Mobile navigation menu

### 🔐 Authentication
- **Login Page** - Beautiful glassmorphism login form
- **Register Page** - Modern registration interface
- **Dashboard** - Feature-rich user dashboard
- **Profile Management** - Update user information
- **Laravel Security** - All authentication features intact

## 🚀 Quick Start

### Option 1: Automated Setup
```bash
./setup-spa.sh
```

### Option 2: Manual Setup
```bash
# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database in .env, then migrate
php artisan migrate

# Build assets
npm run dev

# Start server (in new terminal)
php artisan serve
```

Visit: http://localhost:8000

## 📁 Project Structure

```
pavona-studio/
├── app/
│   └── Http/
│       ├── Controllers/      # Laravel controllers
│       └── Middleware/       # Authentication & Inertia middleware
├── resources/
│   ├── css/
│   │   └── app.css          # Tailwind CSS with glassmorphism
│   ├── js/
│   │   ├── Components/      # Reusable React components
│   │   │   ├── PrimaryButton.jsx
│   │   │   ├── TextInput.jsx
│   │   │   ├── NavLink.jsx
│   │   │   └── ...
│   │   ├── Layouts/         # Page layouts
│   │   │   ├── AuthenticatedLayout.jsx
│   │   │   └── GuestLayout.jsx
│   │   ├── Pages/           # Page components
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Welcome.jsx
│   │   └── app.jsx          # Main entry point
│   └── views/
│       └── app.blade.php    # Root template
├── routes/
│   ├── web.php              # Application routes
│   └── auth.php             # Authentication routes
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite build configuration
└── package.json             # Node dependencies
```

## 🎨 Design System

### Colors
```js
Primary:   Purple (#9333ea - #ec4899)
Secondary: Pink (#ec4899)
Accent:    Blue (#3b82f6)
Background: Gradient (purple-100 → pink-100 → blue-100)
```

### Glassmorphism Classes
```jsx
// Basic glass effect
<div className="glass rounded-2xl p-6">
  Content
</div>

// Glass with hover effect
<div className="glass rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all">
  Content
</div>

// Dark glass variant
<div className="glass-dark rounded-2xl p-6">
  Content
</div>
```

### Components

#### Buttons
```jsx
<PrimaryButton>Click Me</PrimaryButton>
// Gradient button with hover effects
```

#### Inputs
```jsx
<TextInput 
  type="text" 
  className="mt-1 block w-full"
/>
// Glass-style input with blur effect
```

#### Navigation
```jsx
<Link href={route('dashboard')}>
  Dashboard
</Link>
// SPA navigation with Inertia
```

## 🔧 Development

### Run Development Server
```bash
# Terminal 1: Vite dev server (hot reload)
npm run dev

# Terminal 2: Laravel server
php artisan serve
```

### Build for Production
```bash
npm run build
php artisan config:cache
php artisan route:cache
```

## 📱 Pages

### Public Pages
- **/** - Welcome page with feature cards
- **/login** - User login
- **/register** - User registration

### Protected Pages (Requires Authentication)
- **/dashboard** - User dashboard with stats
- **/profile** - Profile management

## 🎯 Key Technologies

- **Laravel 11** - Backend framework
- **Inertia.js 2.0** - SPA adapter
- **React 18** - UI library
- **Tailwind CSS 3** - Utility-first CSS
- **Vite** - Build tool
- **Headless UI** - Unstyled components

## 🔐 Security

All Laravel security features are intact:
- ✅ CSRF Protection
- ✅ Authentication Middleware
- ✅ Form Validation
- ✅ Password Hashing
- ✅ XSS Protection
- ✅ SQL Injection Prevention

## 📚 Documentation

- [SPA Setup Guide](SPA_SETUP_GUIDE.md) - Detailed setup instructions
- [Laravel Docs](https://laravel.com/docs)
- [Inertia.js Docs](https://inertiajs.com)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)

## 💡 Tips

### Adding New Pages
1. Create React component in `resources/js/Pages/`
2. Add route in `routes/web.php`
3. Use Inertia Link for navigation

### Customizing Colors
Edit `tailwind.config.js` and `resources/css/app.css`

### Sharing Data
Use `HandleInertiaRequests` middleware to share data across all pages

## 🐛 Troubleshooting

**Assets not loading?**
```bash
npm run build
php artisan cache:clear
```

**Styles not applying?**
```bash
npm run dev
# Ensure Vite dev server is running
```

**Routes not working?**
```bash
php artisan route:clear
php artisan route:cache
```

## 🎉 What's Included

✅ Modern glassmorphism UI design
✅ Fully functional SPA navigation
✅ Responsive mobile/tablet/desktop layouts
✅ Authentication system (login, register, logout)
✅ User dashboard with feature cards
✅ Profile management
✅ Form validation
✅ Error handling
✅ Loading states
✅ Hover animations
✅ Gradient buttons
✅ Glass-style inputs
✅ Dropdown menus
✅ Navigation components

## 🚀 Next Steps

- [ ] Add dark mode toggle
- [ ] Implement more pages
- [ ] Add animations with Framer Motion
- [ ] Create data tables
- [ ] Add charts and graphs
- [ ] Implement notifications
- [ ] Add file uploads
- [ ] Create admin panel

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

**Built with ❤️ using Laravel, Inertia.js, React & Tailwind CSS**
