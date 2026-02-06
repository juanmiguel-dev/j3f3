'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAvailableSlots } from '@/app/actions/booking';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarClock, 
  ArrowRight, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  Clock,
  Info
} from 'lucide-react';

export default function AgendarPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    async function loadSlots() {
      const data = await getAvailableSlots();
      setSlots(data);
      setLoading(false);
    }
    loadSlots();
  }, []);

  // Filter slots for the selected date
  const selectedDateSlots = slots.filter(slot => {
    const slotDate = new Date(slot.start_time);
    return date && slotDate.toDateString() === date.toDateString();
  });

  // Check if a day has available slots
  const hasAvailableSlots = (day) => {
    return slots.some(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate.toDateString() === day.toDateString();
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter"
          >
            Agenda tu Sesión
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Selecciona una fecha en el calendario y elige el horario que mejor te convenga.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Calendar Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm sticky top-32">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-zinc-400" />
                Selecciona Fecha
              </h2>
              
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md w-full flex justify-center"
                classNames={{
                  head_cell: "text-zinc-500 font-medium text-sm pt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300",
                  day_selected: "bg-white text-black hover:bg-zinc-200 hover:text-black focus:bg-white focus:text-black",
                  day_today: "bg-zinc-800 text-white font-bold",
                }}
                modifiers={{
                  hasSlots: (date) => hasAvailableSlots(date),
                }}
                modifiersStyles={{
                  hasSlots: { 
                    fontWeight: 'bold', 
                    color: '#fff',
                    textDecoration: 'underline',
                    textDecorationColor: '#22c55e', // green-500
                    textUnderlineOffset: '4px'
                  }
                }}
              />

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Fechas Disponibles</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slots Section */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-400" />
                Horarios Disponibles
                {date && <span className="text-zinc-500 font-normal ml-2">para el {format(date, "d 'de' MMMM", { locale: es })}</span>}
              </h2>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-40 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
                  ))}
                </div>
              ) : selectedDateSlots.length === 0 ? (
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarClock className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No hay turnos para esta fecha</h3>
                  <p className="text-zinc-500 max-w-sm mx-auto">
                    Selecciona otro día en el calendario que tenga el indicador verde de disponibilidad.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence>
                    {selectedDateSlots.map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-[1.01]"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                          <div className="flex items-start gap-4">
                            <div className="bg-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center min-w-[90px]">
                              <span className="text-2xl font-black text-white">
                                {format(new Date(slot.start_time), 'HH:mm')}
                              </span>
                              <span className="text-xs font-bold text-zinc-500 uppercase">
                                Horas
                              </span>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">
                                  Sesión de {slot.duration_hours} Horas
                                </h3>
                                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Disponible
                                </span>
                              </div>
                              <p className="text-zinc-400 text-sm mb-3">
                                Ideal para {slot.duration_hours === 3 ? 'piezas medianas o detalles' : 'proyectos grandes o sesiones completas'}.
                              </p>
                              <div className="flex items-center gap-4 text-sm font-medium">
                                <span className="text-white">
                                  ${slot.price_ars.toLocaleString('es-AR')} ARS
                                </span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-500">
                                  Seña requerida: ${(slot.price_ars * 0.5).toLocaleString('es-AR')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Link href={`/reserva/${slot.id}`} className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold py-6 px-8 rounded-xl text-base shadow-lg shadow-white/5">
                              Reservar Ahora <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}