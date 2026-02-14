export default function PavonaLogo({ className = "w-12 h-12" }) {
    return (
        <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Sun Rays */}
            <g opacity="0.6">
                <line x1="100" y1="0" x2="100" y2="15" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
                <line x1="100" y1="185" x2="100" y2="200" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
                <line x1="0" y1="100" x2="15" y2="100" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
                <line x1="185" y1="100" x2="200" y2="100" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
                <line x1="25" y1="25" x2="35" y2="35" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
                <line x1="165" y1="165" x2="175" y2="175" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
                <line x1="165" y1="25" x2="175" y2="35" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
                <line x1="25" y1="165" x2="35" y2="175" stroke="#FFD700" strokeWidth="3" strokeLinecap="round"/>
            </g>
            
            {/* Outer Glow */}
            <circle cx="100" cy="100" r="98" fill="url(#glow)" opacity="0.5"/>
            
            {/* Main Circle */}
            <circle cx="100" cy="100" r="90" fill="url(#gradient1)" />
            
            {/* Letter P */}
            <path d="M35 40 L35 160 M35 40 L85 40 C110 40 125 55 125 80 C125 105 110 120 85 120 L35 120" 
                  stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            
            {/* Letter S */}
            <path d="M165 65 C155 60 145 65 145 77 C145 89 155 92 165 95 C175 98 185 101 185 113 C185 125 175 130 165 135" 
                  stroke="#FFD700" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            
            {/* Gradients */}
            <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9333EA" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <radialGradient id="glow">
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#FFD700" stopOpacity="0"/>
                </radialGradient>
            </defs>
        </svg>
    );
}
