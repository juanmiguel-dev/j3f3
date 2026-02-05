'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusCircle, CalendarClock, ArrowRight } from 'lucide-react';

export default function TurnosHubPage() {
  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex flex-col items-center">
      <div className="w-full max-w-5xl text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter"
        >
          Agenda tu Próxima Sesión
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          Elige la opción que mejor se adapte a tu necesidad actual para comenzar o continuar tu viaje artístico.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Tarjeta 1: Nuevo Proyecto */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-colors flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
              Nuevo Proyecto de Tatuaje
            </h2>
            
            <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
              Ideal si tienes una nueva idea, un diseño desde cero o es tu primera vez tatuándote conmigo. 
              Completa el formulario para que pueda entender tu visión y darte una cotización.
            </p>
            
            <Link 
              href="/turnos/nuevo"
              className="inline-flex items-center justify-center gap-2 w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-zinc-200 transition-colors uppercase tracking-widest"
            >
              Iniciar Solicitud <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Tarjeta 2: Continuar Trabajo */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-zinc-600 transition-colors flex flex-col h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarClock className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
              Sesión de Continuación
            </h2>
            
            <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
              Perfecto si ya estamos trabajando en una pieza, necesitas un repaso o quieres agendar una sesión 
              para un diseño flash que ya hemos acordado previamente.
            </p>
            
            <Link 
              href="/turnos/agendar"
              className="inline-flex items-center justify-center gap-2 w-full bg-zinc-800 text-white font-bold py-4 rounded-lg hover:bg-zinc-700 transition-colors uppercase tracking-widest"
            >
              Ver Disponibilidad <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
