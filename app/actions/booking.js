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

  const { error } = await supabase
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
 * Elimina un turno (Admin)
 */
export async function deleteTimeSlot(slotId) {
  const supabase = await createClient();

  // Validar sesión
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'No autorizado' };
  }

  const { error } = await supabase
    .from('time_slots')
    .delete()
    .eq('id', slotId);

  if (error) {
    console.error('Error deleting slot:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/turnos/agendar');
  return { success: true };
}

/**
 * Aprueba un turno pendiente (Admin)
 */
export async function approveBooking(slotId) {
  const supabase = await createClient();

  // Validar sesión
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'No autorizado' };
  }

  const { error } = await supabase
    .from('time_slots')
    .update({ status: 'confirmed' })
    .eq('id', slotId);

  if (error) {
    console.error('Error approving slot:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/turnos/agendar');
  return { success: true };
}

/**
 * Actualiza los detalles de un turno (Admin)
 */
export async function updateTimeSlot(slotId, formData) {
  const supabase = await createClient();

  // Validar sesión
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'No autorizado' };
  }

  const date = formData.get('date'); // YYYY-MM-DD
  const time = formData.get('time'); // HH:mm
  const duration = parseInt(formData.get('duration'));
  const price = parseInt(formData.get('price'));
  const clientName = formData.get('client_name');
  const clientEmail = formData.get('client_email');
  const clientPhone = formData.get('client_phone');
  const clientInstagram = formData.get('client_instagram');
  const status = formData.get('status');

  // Combinar fecha y hora para el timestamp
  const startTime = new Date(`${date}T${time}:00`);

  const updateData = {
    start_time: startTime.toISOString(),
    duration_hours: duration,
    price_ars: price,
    client_name: clientName,
    client_email: clientEmail,
    client_phone: clientPhone,
    client_instagram: clientInstagram
  };

  // Only update status if provided and valid
  const validStatuses = ['available', 'pending', 'confirmed', 'completed', 'pending_payment'];
  if (status && validStatuses.includes(status)) {
    updateData.status = status;
  }

  const { error } = await supabase
    .from('time_slots')
    .update(updateData)
    .eq('id', slotId);

  if (error) {
    console.error('Error updating slot:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/turnos/agendar');
  return { success: true };
}

/**
 * Marca un turno como completado (Admin)
 */
export async function completeBooking(slotId) {
  const supabase = await createClient();

  // Validar sesión
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'No autorizado' };
  }

  const { error } = await supabase
    .from('time_slots')
    .update({ status: 'completed' })
    .eq('id', slotId);

  if (error) {
    console.error('Error completing slot:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/turnos/agendar');
  return { success: true };
}

/**
 * Actualiza el estado de un turno (Admin)
 */
export async function updateSlotStatus(slotId, newStatus) {
  const supabase = await createClient();

  // Validar sesión
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'No autorizado' };
  }

  // Validar status permitido
  const validStatuses = ['available', 'pending', 'confirmed', 'completed', 'pending_payment'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Estado no válido' };
  }

  const { error } = await supabase
    .from('time_slots')
    .update({ status: newStatus })
    .eq('id', slotId);

  if (error) {
    console.error('Error updating status:', error);
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
  console.log('Initiating booking for slotId:', slotId);
  const supabase = await createClient();
  
  // 1. Verificar si sigue disponible
  const { data: slot, error: fetchError } = await supabase
    .from('time_slots')
    .select('*')
    .eq('id', slotId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching slot:', fetchError);
  }
  
  if (fetchError || !slot) {
    console.log('Slot not found or error:', slotId);
    return { error: 'Turno no encontrado' };
  }
  
  // Si ya está en pending_payment, asumimos que es el mismo usuario refrescando
  // o alguien que llegó justo antes. En un sistema real usaríamos sesiones.
  // Por ahora, si es 'available' lo pasamos a 'pending_payment'.
  if (slot.status === 'available') {
      const { error: updateError } = await supabase
        .from('time_slots')
        .update({ status: 'pending_payment' })
        .eq('id', slotId);
        
      if (updateError) {
        return { error: 'Error al iniciar reserva' };
      }
      
      // Fetch updated slot
      const { data: updatedSlot } = await supabase
        .from('time_slots')
        .select('*')
        .eq('id', slotId)
        .single();
        
      revalidatePath('/turnos/agendar');
      return { success: true, slot: updatedSlot };
  } else if (slot.status === 'pending_payment') {
      // Allow viewing if already pending (concurrency issue ignored for simplicity)
      return { success: true, slot };
  } else {
      return { error: 'El turno ya no está disponible' };
  }
}

/**
 * Confirma los detalles del cliente para la reserva
 */
export async function confirmBookingDetails(slotId, formData) {
  const supabase = await createClient();
  
  const clientName = formData.get('name');
  const clientEmail = formData.get('email');
  const clientPhone = formData.get('phone');
  const clientInstagram = formData.get('instagram');

  const { error } = await supabase
    .from('time_slots')
    .update({ 
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_instagram: clientInstagram,
      status: 'pending' // Pending admin approval
    })
    .eq('id', slotId);

  if (error) {
    console.error('Error updating client details:', error);
    return { error: 'Error al guardar datos: ' + error.message };
  }

  return { success: true };
}

/**
 * Login action
 */
export async function login(formData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email')
    const password = formData.get('password')

    console.log('Attempting login for:', email);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error from Supabase:', error);
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    console.error('Unexpected error in login action:', err);
    return { error: 'An unexpected error occurred: ' + err.message };
  }
}


