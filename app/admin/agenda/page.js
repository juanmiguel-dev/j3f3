'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createTimeSlot, getAllSlots, deleteTimeSlot, approveBooking, completeBooking, updateTimeSlot, updateSlotStatus } from '@/app/actions/booking';
import { SimpleCalendar as Calendar } from '@/components/ui/simple-calendar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  DollarSign, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  User, 
  LayoutGrid, 
  List,
  Pencil,
  Instagram,
  Mail,
  Phone,
  ChevronDown
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function AgendaContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'list'
  const [date, setDate] = useState(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const newDate = new Date(dateParam + 'T12:00:00'); // Add time to avoid timezone issues
      if (!isNaN(newDate.getTime())) {
        return newDate;
      }
    }
    return new Date();
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [selectedType, setSelectedType] = useState('3'); // '3' or '6'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  const [slotToEdit, setSlotToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Delete state
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  async function fetchSlots() {
    const data = await getAllSlots();
    setSlots(data);
    setLoading(false);
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchSlots();
    };
    loadData();
  }, []);

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

  async function handleApproveSlot(slotId) {
    const result = await approveBooking(slotId);
    if (result.success) {
      await fetchSlots();
    } else {
      alert('Error al aprobar: ' + result.error);
    }
  }

  async function handleCompleteSlot(slotId) {
    const result = await completeBooking(slotId);
    if (result.success) {
      await fetchSlots();
    } else {
      alert('Error al completar: ' + result.error);
    }
  }

  async function handleUpdateSlot(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!slotToEdit) return;

    const formData = new FormData(e.target);
    const result = await updateTimeSlot(slotToEdit.id, formData);
    
    if (result.success) {
      await fetchSlots();
      setIsEditModalOpen(false);
      setSlotToEdit(null);
    } else {
      alert('Error al actualizar: ' + result.error);
    }
    setIsSubmitting(false);
  }

  async function handleStatusUpdate(slotId, newStatus) {
    const result = await updateSlotStatus(slotId, newStatus);
    if (result.success) {
      await fetchSlots();
    } else {
      alert('Error al actualizar estado: ' + result.error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'pending_payment': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Libre';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'pending_payment': return 'Pago Pendiente';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col gap-6 pb-6 border-b border-zinc-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
            
            <div className="flex gap-4 items-center">
              {activeTab === 'calendar' && (
                <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block">Total del Día</span>
                  <span className="text-xl font-bold text-white font-mono">${stats.revenue.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Switcher */}
          <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl w-fit border border-zinc-800/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'calendar' 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Vista Calendario
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'list' 
                  ? 'bg-zinc-800 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <List className="w-4 h-4" />
              Lista de Turnos (v2)
              {slots.filter(s => s.status !== 'available').length > 0 && (
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === 'list' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {slots.filter(s => s.status !== 'available').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar: Calendar & Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-5 space-y-6"
            >
              {/* Calendar Card */}
              <div className="bg-zinc-900/80 border border-zinc-800/50 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                <Calendar
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md w-full"
                  modifiers={{
                    hasSlots: (date) => hasSlots(date),
                  }}
                />
                {/* Leyenda visual para días con slots */}
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
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
                    <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-6 text-base shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
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
            <div className="lg:col-span-7">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <List className="w-5 h-5 text-zinc-500" />
                  Turnos del Día (Admin)
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
                    No hay turnos programados para este día. Utiliza el botón &quot;Crear Nuevo Turno&quot; para abrir agenda.
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
                            : slot.status === 'completed'
                            ? 'bg-zinc-900/80 border-purple-900/30 hover:border-purple-500/50 opacity-75'
                            : 'bg-zinc-900/80 border-yellow-900/30 hover:border-yellow-500/50'
                        }`}
                      >
                        {/* Status Stripe */}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                           slot.status === 'available' ? 'bg-green-500' :
                           slot.status === 'confirmed' ? 'bg-blue-500' : 
                           slot.status === 'completed' ? 'bg-purple-500' : 'bg-yellow-500'
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
                              slot.status === 'completed' ? 'bg-purple-500/10 text-purple-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {slot.status === 'available' ? <CheckCircle2 className="w-3 h-3" /> :
                               slot.status === 'confirmed' ? <User className="w-3 h-3" /> : 
                               slot.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {getStatusLabel(slot.status)}
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
                              
                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                {slot.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 rounded-full hover:bg-green-500/20 text-zinc-500 hover:text-green-500 transition-colors cursor-pointer"
                                    title="Aprobar Turno"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveSlot(slot.id);
                                    }}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                )}
                                {slot.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 rounded-full hover:bg-purple-500/20 text-zinc-500 hover:text-purple-500 transition-colors cursor-pointer"
                                    title="Marcar como Completado"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteSlot(slot.id);
                                    }}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 rounded-full hover:bg-blue-500/20 text-zinc-500 hover:text-blue-500 transition-colors cursor-pointer"
                                  title="Editar Turno"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSlotToEdit(slot);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 rounded-full hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
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
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Fecha y Hora</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Contacto</th>
                    <th className="px-6 py-4">Servicio</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {slots
                    .filter(s => s.status !== 'available') // Only show actual bookings in list? or all? Let's show all but maybe distinguish available
                    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()) // Newest first
                    .map((slot) => (
                    <tr key={slot.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-base">
                            {format(new Date(slot.start_time), "d 'de' MMMM", { locale: es })}
                          </span>
                          <span className="text-zinc-500 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(new Date(slot.start_time).getTime() + slot.duration_hours * 60 * 60 * 1000), 'HH:mm')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {slot.client_name ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{slot.client_name}</span>
                            {slot.client_instagram && (
                              <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <Instagram className="w-3 h-3" /> {slot.client_instagram}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {slot.client_email && (
                            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                              <Mail className="w-3 h-3" /> {slot.client_email}
                            </div>
                          )}
                          {slot.client_phone && (
                            <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                              <Phone className="w-3 h-3" /> {slot.client_phone}
                            </div>
                          )}
                          {!slot.client_email && !slot.client_phone && (
                            <span className="text-zinc-600 text-xs">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {slot.duration_hours} Horas
                          </span>
                          <span className="text-xs text-zinc-500 font-mono">
                            ${slot.price_ars.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 hover:opacity-80 cursor-pointer ${getStatusColor(slot.status)}`}>
                              {getStatusLabel(slot.status)}
                              <ChevronDown className="w-3 h-3 opacity-50" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white">
                            <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(slot.id, 'pending')} className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" /> Pendiente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(slot.id, 'confirmed')} className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" /> Confirmado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(slot.id, 'pending_payment')} className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500" /> Pago Pendiente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(slot.id, 'completed')} className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" /> Completado
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuItem onClick={() => handleStatusUpdate(slot.id, 'available')} className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2 text-zinc-400">
                              <div className="w-2 h-2 rounded-full bg-green-500" /> Liberar (Disponible)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="h-8 w-8 p-0 rounded-full flex items-center justify-center hover:bg-blue-500/20 text-zinc-500 hover:text-blue-500 transition-colors cursor-pointer"
                            title="Editar Turno"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Edit clicked for', slot.id);
                              setSlotToEdit(slot);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="h-8 w-8 p-0 rounded-full flex items-center justify-center hover:bg-red-500/20 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer"
                            title="Eliminar Turno"
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Delete clicked for', slot.id);
                              setSlotToDelete(slot);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {slots.filter(s => s.status !== 'available').length === 0 && (
                <div className="p-12 text-center text-zinc-500">
                  No hay turnos registrados en la lista.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Turno</DialogTitle>
          </DialogHeader>
          
          {slotToEdit && (
            <form onSubmit={handleUpdateSlot} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Fecha</label>
                  <input 
                    type="date" 
                    name="date"
                    defaultValue={format(new Date(slotToEdit.start_time), 'yyyy-MM-dd')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Hora</label>
                  <input 
                    type="time" 
                    name="time"
                    defaultValue={format(new Date(slotToEdit.start_time), 'HH:mm')}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Duración (hs)</label>
                  <input 
                    type="number" 
                    name="duration"
                    defaultValue={slotToEdit.duration_hours}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Precio (ARS)</label>
                  <input 
                    type="number" 
                    name="price"
                    defaultValue={slotToEdit.price_ars}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4 mt-4">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-zinc-500" />
                  Datos del Cliente
                </h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Nombre Completo</label>
                    <input 
                      type="text" 
                      name="client_name"
                      defaultValue={slotToEdit.client_name || ''}
                      placeholder="Nombre del cliente"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Email</label>
                    <div className="relative">
                      <Mail className="w-3 h-3 absolute left-3 top-3 text-zinc-500" />
                      <input 
                        type="email" 
                        name="client_email"
                        defaultValue={slotToEdit.client_email || ''}
                        placeholder="email@ejemplo.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-500">Teléfono</label>
                      <div className="relative">
                        <Phone className="w-3 h-3 absolute left-3 top-3 text-zinc-500" />
                        <input 
                          type="tel" 
                          name="client_phone"
                          defaultValue={slotToEdit.client_phone || ''}
                          placeholder="+54..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-500">Instagram</label>
                      <div className="relative">
                        <Instagram className="w-3 h-3 absolute left-3 top-3 text-zinc-500" />
                        <input 
                          type="text" 
                          name="client_instagram"
                          defaultValue={slotToEdit.client_instagram || ''}
                          placeholder="@usuario"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-sm font-medium text-zinc-400">Estado del Turno</label>
                <Select name="status" defaultValue={slotToEdit.status}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="available" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" /> Disponible
                      </div>
                    </SelectItem>
                    <SelectItem value="pending" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" /> Pendiente
                      </div>
                    </SelectItem>
                    <SelectItem value="pending_payment" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" /> Pago Pendiente
                      </div>
                    </SelectItem>
                    <SelectItem value="confirmed" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" /> Confirmado (Pago OK)
                      </div>
                    </SelectItem>
                    <SelectItem value="completed" className="focus:bg-zinc-800 focus:text-white cursor-pointer py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" /> Completado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-white text-black hover:bg-zinc-200"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

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

export default function AdminAgendaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-400">Cargando agenda...</div>}>
      <AgendaContent />
    </Suspense>
  );
}
