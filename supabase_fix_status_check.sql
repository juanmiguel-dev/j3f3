-- Eliminar la restricción actual
ALTER TABLE time_slots DROP CONSTRAINT IF EXISTS time_slots_status_check;

-- Agregar la nueva restricción incluyendo el estado 'pending'
ALTER TABLE time_slots ADD CONSTRAINT time_slots_status_check 
CHECK (status IN ('available', 'pending_payment', 'confirmed', 'pending'));