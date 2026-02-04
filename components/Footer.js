import { Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white py-8 border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-xl font-bold tracking-tight">J3R3F3</span>
        </div>
        
        <div className="flex space-x-6 mb-4 md:mb-0">
          <a 
            href="https://www.instagram.com/j3r3f3/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-white transition-colors" 
            aria-label="Instagram"
          >
            <Instagram className="h-6 w-6" />
          </a>
          {/* Añadir más redes sociales si es necesario */}
        </div>

        <div className="text-gray-500 text-sm">
          &copy; {currentYear} J3R3F3. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
