'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Crea un nuevo turno en la base de datos
 */
export async function createTimeSlot(formData) {
  const supabase = await createClient();
  
  const date = formData.get('date'); // YYYY-MM-DD
  const time = formData.get('time'); // HH:mm
  const duration = parseInt(formData.get('duration'));
  const price = parseInt(formData.get('price'));
  
  // Combinar fecha y hora para el timestamp
  const startTime = new Date(`${date}T${time}:00`);
  
  // Validar sesión (solo admin puede crear)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'No autorizado' };
  }

  const { data, error } = await supabase
    .from('time_slots')
    .insert([
      {
        start_time: startTime.toISOString(),
        duration_hours: duration,
        price_ars: price,
        status: 'available'
      }
    ]);

  if (error) {
    console.error('Error creating slot:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/turnos/agendar');
  return { success: true };
}

/**
 * Obtiene los turnos disponibles (Server Action)
 */
export async function getAvailableSlots() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('status', 'available')
    .order('start_time', { ascending: true });
    
  if (error) {
    console.error('Error fetching slots:', error);
    return [];
  }
  
  return data;
}

/**
 * Obtiene todos los turnos para el admin (incluyendo no disponibles)
 */
export async function getAllSlots() {
  const supabase = await createClient();
  
  // Validar sesión
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .order('start_time', { ascending: true });
    
  if (error) {
    console.error('Error fetching all slots:', error);
    return [];
  }
  
  return data;
}

/**
 * Inicia el proceso de reserva (bloquea el turno temporalmente)
 */
export async function initiateBooking(slotId) {
  const supabase = await createClient();
  
  // 1. Verificar si sigue disponible
  const { data: slot, error: fetchError } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', slotId)
    .single();
    
  if (fetchError || !slot) {
    return { error: 'Turno no encontrado' };
  }
  
  if (slot.status !== 'available') {
    return { error: 'El turno ya no está disponible' };
  }
  
  // 2. Actualizar estado a pending_payment
  // Nota: En un sistema real, querríamos asignar esto a un usuario o sesión temporal
  // Aquí simplificamos cambiando el estado.
  const { error: updateError } = await supabase
    .from('time_slots')
    .update({ status: 'pending_payment' })
    .eq('id', slotId);
    
  if (updateError) {
    return { error: 'Error al iniciar reserva' };
  }
  
  revalidatePath('/turnos/agendar');
  return { success: true, slot };
}

/**
 * Login action
 */
export async function login(formData) {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
