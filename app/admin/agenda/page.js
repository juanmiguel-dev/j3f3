'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createTimeSlot, getAllSlots, deleteTimeSlot } from '@/app/actions/booking';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  DollarSign, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical,
  Trash2,
  User,
  LayoutGrid,
  List
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminAgendaPage() {
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [selectedType, setSelectedType] = useState('3'); // '3' or '6'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete state
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    const data = await getAllSlots();
    setSlots(data);
    setLoading(false);
  }

  async function handleCreateSlot(e) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('date', format(date, 'yyyy-MM-dd'));
    formData.append('time', selectedTime);
    formData.append('duration', selectedType);
    
    // Set price based on type
    const price = selectedType === '3' ? '60000' : '120000';
    formData.append('price', price);

    const result = await createTimeSlot(formData);
    
    if (result.success) {
      await fetchSlots();
      setIsModalOpen(false);
      // Reset defaults
      setSelectedTime('14:00');
    } else {
      alert('Error al crear el turno: ' + result.error);
    }
    setIsSubmitting(false);
  }

  async function handleDeleteSlot() {
    if (!slotToDelete) return;
    
    const result = await deleteTimeSlot(slotToDelete.id);
    
    if (result.success) {
      await fetchSlots();
      setIsDeleteModalOpen(false);
      setSlotToDelete(null);
    } else {
      alert('Error al eliminar: ' + result.error);
    }
  }

  // Helper to check if a day has slots
  const hasSlots = (day) => {
    return slots.some(slot => {
      const slotDate = new Date(slot.start_time);
      return slotDate.toDateString() === day.toDateString();
    });
  };

  // Get slots for selected date
  const selectedDateSlots = slots.filter(slot => {
    const slotDate = new Date(slot.start_time);
    return date && slotDate.toDateString() === date.toDateString();
  });

  // Stats for the day
  const stats = {
    total: selectedDateSlots.length,
    available: selectedDateSlots.filter(s => s.status === 'available').length,
    confirmed: selectedDateSlots.filter(s => s.status === 'confirmed').length,
    revenue: selectedDateSlots
      .filter(s => s.status === 'confirmed')
      .reduce((acc, curr) => acc + curr.price_ars, 0)
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-white tracking-tight mb-2"
            >
              Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Gestión de Agenda y Turnos
            </motion.p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block">Total del Día</span>
              <span className="text-xl font-bold text-white font-mono">${stats.revenue.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar: Calendar & Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Calendar Card */}
            <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md w-full flex justify-center"
                classNames={{
                  head_cell: "text-zinc-500 font-medium text-sm pt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-800 rounded-md transition-colors text-zinc-300",
                  day_selected: "bg-white text-black hover:bg-zinc-200 hover:text-black focus:bg-white focus:text-black",
                  day_today: "bg-zinc-800 text-white font-bold",
                }}
                modifiers={{
                  hasSlots: (date) => hasSlots(date),
                }}
                modifiersStyles={{
                  hasSlots: { 
                    fontWeight: 'bold', 
                    color: '#fff',
                    position: 'relative'
                  }
                }}
              />
              {/* Leyenda visual para días con slots */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span>Días con turnos activos</span>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-white/10" />
              
              <h3 className="text-lg font-bold text-white mb-2 relative z-10">
                {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona fecha'}
              </h3>
              <p className="text-zinc-400 text-sm mb-6 relative z-10">
                {selectedDateSlots.length > 0 
                  ? `${selectedDateSlots.length} turnos programados para este día` 
                  : 'No hay turnos programados aún'}
              </p>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-6 text-base shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Nuevo Turno
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Nuevo Turno</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateSlot} className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Hora de Inicio
                      </label>
                      <input 
                        type="time" 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Tipo de Sesión
                      </label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white py-6">
                          <SelectValue placeholder="Selecciona duración" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                          <SelectItem value="3" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-3">
                            <div className="flex flex-col text-left">
                              <span className="font-bold">Sesión Corta (3 Horas)</span>
                              <span className="text-xs text-zinc-400">$60.000 ARS</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="6" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-3">
                            <div className="flex flex-col text-left">
                              <span className="font-bold">Sesión Larga (6 Horas)</span>
                              <span className="text-xs text-zinc-400">$120.000 ARS</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-900"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-white text-black hover:bg-zinc-200"
                      >
                        {isSubmitting ? 'Creando...' : 'Confirmar Creación'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Main Content: Slots Grid */}
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <List className="w-5 h-5 text-zinc-500" />
                Turnos del Día
              </h2>
              {/* Optional: Filter/Sort controls could go here */}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/50" />
                ))}
              </div>
            ) : selectedDateSlots.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                  <CalendarIcon className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Día Libre</h3>
                <p className="text-zinc-500 max-w-xs mx-auto">
                  No hay turnos programados para este día. Utiliza el botón "Crear Nuevo Turno" para abrir agenda.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <AnimatePresence>
                  {selectedDateSlots.map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${
                        slot.status === 'available' 
                          ? 'bg-zinc-900/80 border-zinc-800 hover:border-green-500/30' 
                          : slot.status === 'confirmed'
                          ? 'bg-zinc-900/80 border-blue-900/30 hover:border-blue-500/50'
                          : 'bg-zinc-900/80 border-yellow-900/30 hover:border-yellow-500/50'
                      }`}
                    >
                      {/* Status Stripe */}
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                         slot.status === 'available' ? 'bg-green-500' :
                         slot.status === 'confirmed' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />

                      <div className="p-6 pl-8">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                            <span className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                              {format(new Date(slot.start_time), 'HH:mm')}
                              <span className="text-sm font-medium text-zinc-500 uppercase tracking-normal mt-1.5">Hs</span>
                            </span>
                            <span className="text-sm text-zinc-400 font-medium mt-1">
                              Duración: {slot.duration_hours} Horas
                            </span>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            slot.status === 'available' ? 'bg-green-500/10 text-green-400' :
                            slot.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {slot.status === 'available' ? <CheckCircle2 className="w-3 h-3" /> :
                             slot.status === 'confirmed' ? <User className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {slot.status === 'available' ? 'Libre' : 
                             slot.status === 'confirmed' ? 'Ocupado' : 'Pendiente'}
                          </div>
                        </div>

                        <div className="border-t border-zinc-800/50 my-4 pt-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Valor Sesión</p>
                              <p className="text-lg font-bold text-white font-mono">
                                ${slot.price_ars.toLocaleString('es-AR')}
                              </p>
                            </div>
                            
                            {/* Action Button */}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 rounded-full hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSlotToDelete(slot);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar Turno?</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Esta acción no se puede deshacer. El turno será eliminado permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-900">Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteSlot} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
