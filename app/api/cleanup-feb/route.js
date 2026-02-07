
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  // Borrar todos los turnos de Febrero 2026 para regenerarlos correctamente
  const start = '2026-02-01T00:00:00-03:00';
  const end = '2026-03-01T00:00:00-03:00';

  const { error } = await supabase
    .from('time_slots')
    .delete()
    .gte('start_time', start)
    .lt('start_time', end);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Turnos de febrero eliminados' });
}
