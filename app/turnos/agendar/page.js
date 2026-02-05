'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAvailableSlots } from '@/app/actions/booking';
import { Button } from '@/components/ui/button';
import { CalendarClock, ArrowRight } from 'lucide-react';

export default function AgendarPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlots() {
      const data = await getAvailableSlots();
      setSlots(data);
      setLoading(false);
    }
    loadSlots();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">
          Elige tu Próximo Turno
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Selecciona una de las fechas disponibles para continuar tu proyecto. 
          Los turnos se confirman mediante el pago de una seña.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        {loading ? (
          <div className="text-center text-zinc-500 py-12">Cargando disponibilidad...</div>
        ) : slots.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <CalendarClock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No hay turnos disponibles</h3>
            <p className="text-zinc-400">
              En este momento no hay fechas liberadas. Por favor revisa más tarde o contacta directamente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {slots.map((slot) => {
              const date = new Date(slot.start_time);
              return (
                <div 
                  key={slot.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-zinc-600 transition-colors group"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                    <div className="bg-zinc-800 rounded-lg p-3 min-w-[80px] flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase">
                        {format(date, 'MMM', { locale: es })}
                      </span>
                      <span className="text-2xl font-bold text-white">
                        {format(date, 'd')}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                        <h3 className="text-xl font-bold text-white">
                          {format(date, 'EEEE', { locale: es })}
                        </h3>
                        <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono">
                          {format(date, 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Sesión de {slot.duration_hours} horas • ${slot.price_ars.toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>

                  <Link href={`/reserva/${slot.id}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-wide">
                      Reservar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
