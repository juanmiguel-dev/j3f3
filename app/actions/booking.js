'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';

/**
 * Genera turnos masivos para un mes (Server Action)
 * Evita duplicados y timeouts.
 */
export async function createBulkTimeSlots(year, month) {
  try {
    const supabase = await createClient();
    
    // Validar sesión
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'No autorizado' };
    }

    // Calcular rango del mes para buscar existentes
    const startMonthStr = String(month + 1).padStart(2, '0');
    const endMonthDate = new Date(year, month + 1, 1);
    const endYear = endMonthDate.getFullYear();
    const endMonthStr = String(endMonthDate.getMonth() + 1).padStart(2, '0');
    
    // Rango ISO con timezone -03:00 (aproximado para filtro)
    const rangeStart = `${year}-${startMonthStr}-01T00:00:00-03:00`;
    const rangeEnd = `${endYear}-${endMonthStr}-01T00:00:00-03:00`;

    // Fetch existing slots to prevent duplicates
    const { data: existingSlots } = await supabase
      .from('time_slots')
      .select('start_time, duration_hours')
      .gte('start_time', rangeStart)
      .lt('start_time', rangeEnd);

    const slotsToInsert = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Helper para añadir slot si no existe
    const addSlot = (dateStr, timeStr, duration, price) => {
      const startTimeISO = new Date(`${dateStr}T${timeStr}:00-03:00`).toISOString();
      
      // Check duplicate: Same start time AND same duration
      const isDuplicate = existingSlots?.some(existing => 
        existing.start_time === startTimeISO && 
        existing.duration_hours === duration
      );

      if (!isDuplicate) {
        slotsToInsert.push({
          start_time: startTimeISO,
          duration_hours: duration,
          price_ars: price,
          status: 'available'
        });
      }
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay(); // 0=Sun, 1=Mon...
      const dateStr = format(dateObj, 'yyyy-MM-dd');

      // Lunes (1) o Miércoles (3)
      if (dayOfWeek === 1 || dayOfWeek === 3) {
        addSlot(dateStr, '15:00', 3, 60000);
        addSlot(dateStr, '18:00', 3, 60000);
        addSlot(dateStr, '15:00', 6, 120000);
      }
      // Martes (2) o Jueves (4)
      else if (dayOfWeek === 2 || dayOfWeek === 4) {
        addSlot(dateStr, '08:30', 3, 60000);
        addSlot(dateStr, '11:30', 3, 60000);
        addSlot(dateStr, '08:30', 6, 120000);
      }
    }

    if (slotsToInsert.length === 0) {
      return { success: true, count: 0, message: 'No se requirieron nuevos turnos (ya existían).' };
    }

    // Insertar en lotes de 50 para no saturar
    const BATCH_SIZE = 50;
    for (let i = 0; i < slotsToInsert.length; i += BATCH_SIZE) {
      const batch = slotsToInsert.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('time_slots').insert(batch);
      if (error) {
        console.error('Error inserting batch:', error);
        throw new Error(error.message);
      }
    }

    revalidatePath('/admin/agenda');
    revalidatePath('/turnos/agendar');
    
    return { success: true, count: slotsToInsert.length };

  } catch (err) {
    console.error('Error in createBulkTimeSlots:', err);
    return { error: err.message };
  }
}

/**
 * Crea un nuevo turno en la base de datos
 */
export async function createTimeSlot(formData) {
  try {
    console.log('createTimeSlot started');
    const supabase = await createClient();
    
    const date = formData.get('date'); // YYYY-MM-DD
    const time = formData.get('time'); // HH:mm
    const duration = parseInt(formData.get('duration'));
    const price = parseInt(formData.get('price'));
    
    console.log('Data:', { date, time, duration, price });

    // Combinar fecha y hora para el timestamp con zona horaria de Argentina (-03:00)
    const startTime = new Date(`${date}T${time}:00-03:00`);
    
    // Validar sesión (solo admin puede crear)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return { error: 'No autorizado' };
    }

    console.log('User authenticated:', user.id);

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
  } catch (err) {
    console.error('CRITICAL ERROR in createTimeSlot:', err);
    return { error: 'Server error: ' + err.message };
  }
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
 * Libera un turno, dejándolo disponible y limpiando datos del cliente (Admin)
 */
export async function liberateTimeSlot(slotId) {
  const supabase = await createClient();

  // Validar sesión
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'No autorizado' };
  }

  const { error } = await supabase
    .from('time_slots')
    .update({ 
      status: 'available',
      client_name: null,
      client_email: null,
      client_phone: null,
      client_instagram: null
    })
    .eq('id', slotId);

  if (error) {
    console.error('Error liberating slot:', error);
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

  // Combinar fecha y hora para el timestamp con zona horaria de Argentina (-03:00)
  const startTime = new Date(`${date}T${time}:00-03:00`);

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
  const validStatuses = ['available', 'pending', 'confirmed', 'completed', 'pending_payment', 'blocked'];
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
  const validStatuses = ['available', 'pending', 'confirmed', 'completed', 'pending_payment', 'blocked'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Estado no válido' };
  }

  // If new status is 'available', we should probably clear client data too,
  // but let's keep this function simple and use liberateTimeSlot for that specific intent.
  // However, if called from generic update, it might leave data.
  // For safety, if status is becoming available, let's clear data.
  
  let updateData = { status: newStatus };
  
  if (newStatus === 'available') {
     updateData = {
       status: newStatus,
       client_name: null,
       client_email: null,
       client_phone: null,
       client_instagram: null
     };
  }

  const { error } = await supabase
    .from('time_slots')
    .update(updateData)
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
  
  // Filter for slots from today onwards (in user's timezone perspective, or at least UTC now)
  // To be safe, we can filter from yesterday to avoid timezone edge cases excluding today's slots
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    // .eq('status', 'available') // Allow all statuses to be visible in frontend
    .gte('start_time', now.toISOString())
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
  
  if (slot.status !== 'available') {
    console.log('Slot not available:', slot.status);
    return { error: 'El turno ya no está disponible' };
  }

  // 2. Marcar como pendiente de pago
  const { error: updateError } = await supabase
    .from('time_slots')
    .update({ status: 'pending_payment' })
    .eq('id', slotId);
    
  if (updateError) {
    console.error('Error updating status:', updateError);
    return { error: 'Error al iniciar reserva' };
  }
  
  revalidatePath('/turnos/agendar');
  revalidatePath('/admin/agenda');
  
  return { success: true };
}

/**
 * Confirma los detalles del cliente para una reserva (Público)
 */
export async function confirmBookingDetails(slotId, formData) {
  const supabase = await createClient();

  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const instagram = formData.get('instagram');

  if (!name || !email || !phone) {
    return { error: 'Faltan datos obligatorios' };
  }

  // Verificar estado del turno
  const { data: slot, error: fetchError } = await supabase
    .from('time_slots')
    .select('status')
    .eq('id', slotId)
    .single();

  if (fetchError || !slot) {
    return { error: 'Turno no encontrado' };
  }

  // Permitir actualización si está disponible o pendiente de pago
  // (Disponible puede pasar si initiateBooking falló o se saltó, pero idealmente debe ser pending_payment)
  if (slot.status !== 'pending_payment' && slot.status !== 'available') {
    return { error: 'El turno no está disponible para reserva' };
  }

  const { error } = await supabase
    .from('time_slots')
    .update({
      client_name: name,
      client_email: email,
      client_phone: phone,
      client_instagram: instagram,
      // No cambiamos el status aquí, sigue en pending_payment hasta que pague/confirme pago
      // O podríamos pasarlo a 'pending' (esperando aprobación/pago)
      status: 'pending' 
    })
    .eq('id', slotId);

  if (error) {
    console.error('Error confirming booking details:', error);
    return { error: error.message };
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/turnos/agendar'); // Opcional
  return { success: true };
}

/**
 * Elimina todos los turnos de un mes específico (Admin)
 */
export async function deleteMonthSlots(year, month) {
  try {
    const supabase = await createClient();
    
    // Validar sesión
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: 'No autorizado' };
    }

    // Calcular rango del mes
    const startMonthStr = String(month + 1).padStart(2, '0');
    const endMonthDate = new Date(year, month + 1, 1);
    const endYear = endMonthDate.getFullYear();
    const endMonthStr = String(endMonthDate.getMonth() + 1).padStart(2, '0');
    
    // Rango ISO con timezone -03:00 (aproximado para filtro)
    const rangeStart = `${year}-${startMonthStr}-01T00:00:00-03:00`;
    const rangeEnd = `${endYear}-${endMonthStr}-01T00:00:00-03:00`;

    const { error } = await supabase
      .from('time_slots')
      .delete()
      .gte('start_time', rangeStart)
      .lt('start_time', rangeEnd);

    if (error) {
      console.error('Error deleting month slots:', error);
      throw new Error(error.message);
    }

    revalidatePath('/admin/agenda');
    revalidatePath('/turnos/agendar');
    
    return { success: true };

  } catch (err) {
    console.error('Error in deleteMonthSlots:', err);
    return { error: err.message };
  }
}

/**
 * Login de administrador
 */
export async function login(formData) {
  const supabase = await createClient();
  
  const email = formData.get('email');
  const password = formData.get('password');

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'Credenciales inválidas' };
  }

  revalidatePath('/admin/agenda');
  return { success: true };
}
