'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { tattoos } from '@/data/tattoos';

export default function GalleryGrid() {
  const [selectedId, setSelectedId] = useState(null);

  const selectedTattoo = tattoos.find(t => t.id === selectedId);

  const handleNext = (e) => {
    e.stopPropagation();
    const currentIndex = tattoos.findIndex(t => t.id === selectedId);
    const nextIndex = (currentIndex + 1) % tattoos.length;
    setSelectedId(tattoos[nextIndex].id);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    const currentIndex = tattoos.findIndex(t => t.id === selectedId);
    const prevIndex = (currentIndex - 1 + tattoos.length) % tattoos.length;
    setSelectedId(tattoos[prevIndex].id);
  };

  // Manejo de teclas para navegación
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setSelectedId(null);
    if (e.key === 'ArrowRight') handleNext(e);
    if (e.key === 'ArrowLeft') handlePrev(e);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tattoos.map((tattoo) => (
          <motion.div 
            key={tattoo.id}
            layoutId={`card-${tattoo.id}`}
            onClick={() => setSelectedId(tattoo.id)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-800 cursor-pointer border-2 border-[#222] hover:border-white/80 hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={tattoo.src}
              alt={tattoo.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay sutil solo para indicar interactividad, sin texto */}
            <div className="absolute inset-0 bg-transparent transition-colors duration-300" />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setSelectedId(null)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <button
              onClick={() => setSelectedId(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-[110] cursor-pointer"
            >
              <X size={32} />
            </button>

            {/* Navegación Izquierda */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-[110] hidden sm:block cursor-pointer"
            >
              <ChevronLeft size={40} />
            </button>

            {/* Navegación Derecha */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors z-[110] hidden sm:block cursor-pointer"
            >
              <ChevronRight size={40} />
            </button>

            <motion.div
              layoutId={`card-${selectedId}`}
              className="relative w-full max-w-5xl aspect-[3/4] md:aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedTattoo && (
                <Image
                  src={selectedTattoo.src}
                  alt={selectedTattoo.alt}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
