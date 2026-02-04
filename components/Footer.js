import { Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-12 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-center gap-6">
        
        {/* Redes Sociales */}
        <div className="flex items-center gap-8">
          <a 
            href="https://www.instagram.com/j3r3f3/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300" 
            aria-label="Instagram"
          >
            <Instagram className="h-6 w-6" />
          </a>
          
          <a 
            href="https://wa.me/5491112345678" /* Reemplazar con número real si se tiene */
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300" 
            aria-label="WhatsApp"
          >
            {/* WhatsApp SVG Icon since Lucide doesn't have it */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6"
            >
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
            </svg>
          </a>
        </div>

        {/* J3R3F3 Chrome Effect */}
        <div className="mt-2">
          <span className="text-xl font-black tracking-widest eternal-chrome-text">
            J3R3F3
          </span>
        </div>
        
        {/* Copyright simple */}
        <div className="text-zinc-600 text-[10px] uppercase tracking-widest">
          © {currentYear}
        </div>

      </div>
    </footer>
  );
}
