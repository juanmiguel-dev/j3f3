-- Script SQL para crear la tabla de turnos en Supabase

create table time_slots (
  id uuid default gen_random_uuid() primary key,
  start_time timestamp with time zone not null,
  duration_hours integer not null check (duration_hours in (3, 6)),
  price_ars integer not null,
  status text not null check (status in ('available', 'pending_payment', 'confirmed')) default 'available',
  created_at timestamp with time zone default now()
);

-- Políticas de seguridad RLS (Row Level Security) opcionales pero recomendadas
alter table time_slots enable row level security;

-- Permitir lectura a todos (para que los clientes vean los turnos disponibles)
create policy "Enable read access for all users" on time_slots for select using (true);

-- Permitir escritura solo a usuarios autenticados (el administrador)
create policy "Enable insert for authenticated users only" on time_slots for insert with check (auth.role() = 'authenticated');

-- Permitir actualización solo a usuarios autenticados (el administrador o el sistema via server action)
-- Nota: En Supabase SSR con Server Actions y Service Role, las policies a veces se pueden bypassear, 
-- pero es buena práctica tenerlas.
create policy "Enable update for authenticated users only" on time_slots for update using (auth.role() = 'authenticated');

-- Crear índice para búsquedas por fecha
create index time_slots_start_time_idx on time_slots (start_time);
