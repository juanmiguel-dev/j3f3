'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createTimeSlot, getAllSlots } from '@/app/actions/booking';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Gestión de Agenda</h1>
          <div className="text-zinc-400">
            {/* User info could go here */}
            Admin
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Calendar Section */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                modifiers={{
                  hasSlots: (date) => hasSlots(date),
                }}
                modifiersStyles={{
                  hasSlots: { fontWeight: 'bold', textDecoration: 'underline', color: '#fff' }
                }}
              />
            </div>
            
            <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {date ? format(date, "EEEE d 'de' MMMM", { locale: es }) : 'Selecciona una fecha'}
              </h3>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" disabled={!date}>
                    Liberar Nuevo Turno
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Liberar Turno para el {date && format(date, "d 'de' MMMM", { locale: es })}</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreateSlot} className="space-y-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Hora de Inicio</label>
                      <input 
                        type="time" 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Tipo de Sesión</label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona duración" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Horas - $60.000</SelectItem>
                          <SelectItem value="6">6 Horas - $120.000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creando...' : 'Confirmar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Slots List Section */}
          <div className="md:col-span-7 lg:col-span-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[500px]">
              <h2 className="text-xl font-bold text-white mb-6">Turnos del Día</h2>
              
              {loading ? (
                <div className="text-zinc-500">Cargando turnos...</div>
              ) : selectedDateSlots.length === 0 ? (
                <div className="text-zinc-500 italic">No hay turnos creados para este día.</div>
              ) : (
                <div className="space-y-4">
                  {selectedDateSlots.map((slot) => (
                    <div 
                      key={slot.id} 
                      className={`border rounded-lg p-4 flex justify-between items-center ${
                        slot.status === 'available' 
                          ? 'border-green-900/50 bg-green-900/10' 
                          : slot.status === 'confirmed'
                          ? 'border-blue-900/50 bg-blue-900/10'
                          : 'border-yellow-900/50 bg-yellow-900/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-white">
                            {format(new Date(slot.start_time), 'HH:mm')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                            slot.status === 'available' ? 'bg-green-500/20 text-green-400' :
                            slot.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {slot.status === 'available' ? 'Disponible' : 
                             slot.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </div>
                        <div className="text-zinc-400 mt-1">
                          {slot.duration_hours} horas • ${slot.price_ars.toLocaleString('es-AR')}
                        </div>
                      </div>
                      
                      {/* Actions could go here (Delete, Edit) */}
                      {slot.status === 'available' && (
                        <div className="text-sm text-zinc-500">
                           Visible en web
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
