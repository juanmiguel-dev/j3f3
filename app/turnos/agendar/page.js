'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAvailableSlots } from '@/app/actions/booking';
import { Button, buttonVariants } from '@/components/ui/button';
import { SimpleCalendar as Calendar } from '@/components/ui/simple-calendar';
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
  const [date, setDate] = useState(undefined);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    async function loadSlots() {
      try {
        const data = await getAvailableSlots();
        setSlots(data || []);
        
        // Auto-select first available date if exists
        if (data && data.length > 0) {
          const sortedSlots = [...data].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
          const firstSlot = sortedSlots[0];
          const firstDate = new Date(firstSlot.start_time);
          
          setDate(firstDate);
          setCalendarMonth(firstDate);
        } else {
          setDate(new Date());
        }
      } catch (error) {
        console.error("Error loading slots:", error);
        setSlots([]);
        setDate(new Date());
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, []);

  // Filter slots for the selected date and sort for layout (3h first, then 6h)
  const selectedDateSlots = slots
    .filter(slot => {
      const slotDate = new Date(slot.start_time);
      return date && slotDate.toDateString() === date.toDateString();
    })
    .sort((a, b) => {
      // Sort by duration ascending (smaller slots first to fit in grid)
      const durA = a.duration_hours || 0;
      const durB = b.duration_hours || 0;
      if (durA !== durB) return durA - durB;
      // Then by start time
      return new Date(a.start_time) - new Date(b.start_time);
    });

  // Check if a day has available slots
  const hasAvailableSlots = (day) => {
    return slots.some(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate.toDateString() === day.toDateString();
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 selection:bg-white/20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[500px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none" />
          
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

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-start max-w-7xl mx-auto">
          {/* Calendar Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full flex justify-center lg:justify-end"
          >
            <div className="sticky top-32 group w-full">
              <div className="absolute -inset-1 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl blur opacity-70 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-zinc-950 border border-zinc-800/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    Calendario
                  </h2>
                </div>
                
                <div className="w-full">
                  <Calendar
            selected={date}
            onSelect={setDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            className="p-0"
            modifiers={{
              hasSlots: (date) => hasAvailableSlots(date),
            }}
          />
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-900">
                  <p className="text-center text-xs text-zinc-500 font-medium">
                    Horarios en tu zona local
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Slots Section */}
          <div className="w-full">
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
                      No hay turnos para esta fecha.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {selectedDateSlots.map((slot, index) => {
                      const startTime = new Date(slot.start_time);
                      const endTime = slot.end_time 
                        ? new Date(slot.end_time) 
                        : new Date(startTime.getTime() + (slot.duration_hours || 1) * 60 * 60 * 1000);
                      
                      // Validate dates to prevent hydration errors
                      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return null;

                      return (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group relative overflow-hidden bg-zinc-900/80 border border-zinc-800 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] hover:border-green-500/30 ${
                          (slot.duration_hours || 0) >= 6 ? 'md:col-span-2' : ''
                        }`}
                      >
                        {/* Status Stripe */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />

                        <div className="p-6 pl-8">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                              <span className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                                {format(startTime, 'HH:mm')}
                                <span className="text-sm font-medium text-zinc-500 uppercase tracking-normal mt-1.5">Hs</span>
                              </span>
                              <span className="text-sm text-zinc-400 font-medium mt-1">
                                Duración: {slot.duration_hours || 3} Horas
                              </span>
                            </div>
                            
                            <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              LIBRE
                            </div>
                          </div>

                          <div className="border-t border-zinc-800/50 my-4 pt-4">
                            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                              <div>
                                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Valor Sesión</p>
                                <p className="text-lg font-bold text-white font-mono">
                                  ${(slot.price_ars || 0).toLocaleString('es-AR')}
                                </p>
                              </div>
                              
                              <Link 
                                href={`/reserva/${slot.id}`} 
                                className={cn(
                                  buttonVariants({ variant: "default" }),
                                  "w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-10 px-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300"
                                )}
                              >
                                Reservar
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )})}
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
