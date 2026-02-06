-- Agrega columnas para información del cliente en la tabla time_slots

ALTER TABLE time_slots 
ADD COLUMN IF NOT EXISTS client_name text,
ADD COLUMN IF NOT EXISTS client_email text,
ADD COLUMN IF NOT EXISTS client_phone text,
ADD COLUMN IF NOT EXISTS client_instagram text;
