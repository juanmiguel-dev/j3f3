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
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 selection:bg-white/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs uppercase tracking-widest font-medium mb-6"
          >
            <Sparkles className="w-3 h-3 text-yellow-500" />
            Agenda Online
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter relative z-10"
          >
            Reserva tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Sesión</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto relative z-10 font-light"
          >
            Selecciona el día perfecto para tu próximo tatuaje.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Calendar Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-32 group">
              <div className="absolute -inset-1 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl blur opacity-70 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-zinc-950 border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    Calendario
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Turnos disponibles
                  </div>
                </div>
                
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={es}
                  className="w-full flex justify-center p-0"
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-6 w-full",
                    caption: "flex justify-center pt-2 relative items-center mb-6",
                    caption_label: "text-lg font-black text-white capitalize tracking-wide",
                    nav: "space-x-1 flex items-center absolute right-0",
                    nav_button: "h-8 w-8 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all",
                    nav_button_previous: "absolute left-0",
                    nav_button_next: "absolute right-0",
                    table: "w-full border-collapse",
                    head_row: "flex justify-between mb-4",
                    head_cell: "text-zinc-500 font-bold text-xs uppercase tracking-widest w-10 h-10 flex items-center justify-center",
                    row: "flex w-full mt-2 justify-between",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    day: cn(
                      "relative h-10 w-10 p-0 font-medium text-zinc-400 rounded-xl transition-all hover:bg-zinc-900 hover:text-white",
                      "data-[selected]:bg-white data-[selected]:text-black data-[selected]:font-bold data-[selected]:shadow-lg data-[selected]:shadow-white/20 data-[selected]:scale-110",
                      "data-[today]:bg-zinc-900 data-[today]:text-white data-[today]:border data-[today]:border-zinc-800"
                    ),
                    day_selected: "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black",
                    day_today: "bg-zinc-900 text-white",
                    day_outside: "text-zinc-700 opacity-50",
                    day_disabled: "text-zinc-700 opacity-50",
                    day_hidden: "invisible",
                  }}
                  modifiers={{
                    hasSlots: (date) => hasAvailableSlots(date),
                  }}
                  modifiersClassNames={{
                    hasSlots: "after:content-[''] after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full after:shadow-[0_0_8px_rgba(16,185,129,0.5)] font-bold text-white"
                  }}
                />

                <div className="mt-8 pt-6 border-t border-zinc-900">
                  <p className="text-center text-xs text-zinc-500 font-medium">
                    Los horarios están mostrados en tu zona horaria local.
                  </p>
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
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                Disponibilidad
                {date && <span className="text-zinc-500 font-normal ml-2 text-sm md:text-base capitalize border-l border-zinc-800 pl-4">{format(date, "EEEE d 'de' MMMM", { locale: es })}</span>}
              </h2>

              {loading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800" />
                  ))}
                </div>
              ) : selectedDateSlots.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-900/20 border border-zinc-800/50 rounded-3xl p-12 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900/20 pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-zinc-800">
                      <CalendarClock className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Sin disponibilidad</h3>
                    <p className="text-zinc-500 max-w-sm mx-auto">
                      No hay turnos programados para esta fecha. Busca los días marcados con un <span className="text-emerald-500 font-bold">punto verde</span>.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <AnimatePresence mode="popLayout">
                    {selectedDateSlots.map((slot, index) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-zinc-950 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-[1.01] overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                           <ArrowRight className="w-24 h-24 -mr-8 -mt-8 text-white rotate-45" />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                          <div className="flex items-start gap-5">
                            <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[100px] border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                              <span className="text-3xl font-black text-white tracking-tighter">
                                {format(new Date(slot.start_time), 'HH:mm')}
                              </span>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                Hora
                              </span>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">
                                  Sesión {slot.duration_hours === 3 ? 'Media' : 'Completa'}
                                </h3>
                                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 border border-emerald-500/20">
                                  {slot.duration_hours} Horas
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm font-medium text-zinc-400">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                  Total: <span className="text-white">${slot.price_ars.toLocaleString('es-AR')}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                  Seña: <span className="text-white">${(slot.price_ars * 0.5).toLocaleString('es-AR')}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <Link href={`/reserva/${slot.id}`} className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold py-6 px-8 rounded-xl text-base shadow-lg shadow-white/5 transition-transform active:scale-95">
                              Reservar <ChevronRight className="w-4 h-4 ml-1" />
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
