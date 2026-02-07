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
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 px-2">
        {tattoos.map((tattoo, index) => {
          // Deterministic random aspect ratio for masonry feel
          // Cycles through: 3/4 (portrait), 1/1 (square), 4/3 (landscape), 9/16 (tall)
          const aspectRatios = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[2/3]'];
          const aspectClass = aspectRatios[index % aspectRatios.length];
          
          return (
            <motion.div 
              key={tattoo.id}
              layoutId={`card-${tattoo.id}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              onClick={() => setSelectedId(tattoo.id)}
              className={`group relative break-inside-avoid mb-4 overflow-hidden rounded-xl bg-zinc-900 cursor-pointer border border-zinc-800 hover:border-white/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] ${aspectClass}`}
            >
              <Image
                src={tattoo.src}
                alt={tattoo.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          );
        })}
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
