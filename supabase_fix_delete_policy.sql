-- Fix: Agregar política para permitir eliminar turnos a usuarios autenticados (Admin)
-- Actualmente falta esta política, por lo que el borrado falla por RLS.

create policy "Enable delete for authenticated users only" on time_slots for delete using (auth.role() = 'authenticated');

-- Verificación:
-- Después de ejecutar esto, intenta borrar un turno nuevamente.
