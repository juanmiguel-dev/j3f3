'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils'; // We need to create this utility or just use clsx/tailwind-merge directly

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'inicio', href: '/' },
    { name: 'book', href: '/book' },
    { name: 'turnos', href: '/turnos' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-black/50 backdrop-blur-xl border-b border-white/5' 
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block hover:scale-105 transition-transform">
              <Image 
                src="/tattoos/logo.png" 
                alt="J3R3F3 Logo" 
                width={50} 
                height={50} 
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="text-gray-300 hover:text-white text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Social / Extra - Removed */}
          {/* <div className="hidden md:flex items-center space-x-4">
             <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">
                <Instagram className="w-5 h-5" />
             </a>
          </div> */}

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 text-white hover:text-gray-300 focus:outline-none cursor-pointer"
            >
              <span className="sr-only">Abrir menú</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col md:hidden h-[100dvh] w-screen pointer-events-auto"
          >
            {/* Header del menú móvil */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
              <Link 
                href="/" 
                className="block"
                onClick={() => setIsOpen(false)}
              >
                <Image 
                  src="/tattoos/logo.png" 
                  alt="J3R3F3 Logo" 
                  width={40} 
                  height={40} 
                  className="h-8 w-auto"
                />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Links de navegación */}
            <div className="flex-1 flex flex-col justify-center px-6 space-y-0">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border-b border-white/10 last:border-0"
                >
                  <Link 
                    href={link.href} 
                    className="text-white hover:text-zinc-400 block py-6 text-3xl font-black uppercase tracking-tighter transition-all flex justify-between items-center group"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>{link.name}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xl">→</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer del menú móvil */}
            <div className="p-8 border-t border-white/10">
               <div className="flex justify-between items-center text-zinc-500 text-sm font-mono uppercase">
                  <span>© 2026 J3R3F3</span>
                  <div className="flex gap-4">
                    <a href="https://www.instagram.com/j3r3f3/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
                    <a href="https://wa.me/5492233459214" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WHATSAPP</a>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
