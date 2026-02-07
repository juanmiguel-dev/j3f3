'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { initiateBooking, confirmBookingDetails } from '@/app/actions/booking';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Wallet, Building2, User, Mail, Phone, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function BookingConfirmationPage({ params }) {
  const { slotId } = use(params);
  const router = useRouter();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientConfirmed, setClientConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    async function init() {
      const result = await initiateBooking(slotId);
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        setSlot(result.slot);
        // Check if client info is already there (if we were to persist session)
        if (result.slot.client_name) {
           setClientData({
             name: result.slot.client_name,
             email: result.slot.client_email,
             phone: result.slot.client_phone,
             instagram: result.slot.client_instagram
           });
           setClientConfirmed(true);
        }
        setLoading(false);
      }
    }
    
    init();
  }, [slotId]);

  async function handleClientSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    const result = await confirmBookingDetails(slotId, formData);
    
    if (result.success) {
      setClientData(data);
      setClientConfirmed(true);
    } else {
      alert("Error al guardar datos: " + result.error);
    }
    setIsSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-zinc-950 text-white">
        Procesando tu reserva...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center justify-center bg-zinc-950 text-white text-center">
        <h1 className="text-2xl font-bold mb-4">Lo sentimos</h1>
        <p className="text-zinc-400 mb-8">{error}</p>
        <Link href="/turnos/agendar">
          <Button variant="outline">Volver a intentar</Button>
        </Link>
      </div>
    );
  }

  const date = new Date(slot.start_time);
  const mpLink = process.env.NEXT_PUBLIC_MERCADO_PAGO_LINK;

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Link href="/turnos/agendar" className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>

        {!clientConfirmed ? (
          // Client Info Form
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
             <div className="flex items-center gap-4 mb-8">
              <div className="bg-white/10 p-3 rounded-full">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tus Datos</h1>
                <p className="text-zinc-400">Completa tu información para la reserva</p>
              </div>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Nombre Completo
                </label>
                <input 
                  name="name"
                  type="text" 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Teléfono / WhatsApp
                  </label>
                  <input 
                    name="phone"
                    type="tel" 
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="+54 9 11..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                    <Instagram className="w-4 h-4" /> Instagram (Opcional)
                  </label>
                  <input 
                    name="instagram"
                    type="text" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="@usuario"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-6 text-base mt-4"
              >
                {isSubmitting ? 'Guardando...' : 'Continuar al Pago'}
              </Button>
            </form>
          </div>
        ) : (
          // Payment Options
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-green-500/10 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Casi listo, {clientData?.name.split(' ')[0]}</h1>
                <p className="text-zinc-400">Completa el pago para confirmar tu turno</p>
              </div>
            </div>

            <div className="bg-zinc-950 rounded-lg p-6 mb-8 border border-zinc-800">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Detalles del Turno</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-zinc-500 text-sm">Fecha</p>
                  <p className="text-white font-medium">{format(date, "EEEE d 'de' MMMM", { locale: es })}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Hora</p>
                  <p className="text-white font-medium">{format(date, 'HH:mm')} hs</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Duración</p>
                  <p className="text-white font-medium">{slot.duration_hours} horas</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">Valor Total</p>
                  <p className="text-white font-medium">${slot.price_ars.toLocaleString('es-AR')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white">Métodos de Pago</h3>
              
              {/* Mercado Pago */}
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-white">Mercado Pago</span>
                </div>
                <p className="text-zinc-400 text-sm mb-4">
                  Paga con tarjeta de crédito, débito o dinero en cuenta.
                </p>
                <a 
                  href={mpLink || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Pagar con Mercado Pago
                  </Button>
                </a>
              </div>

              {/* Transferencia */}
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-white">Transferencia Bancaria</span>
                </div>
                <div className="space-y-2 text-sm text-zinc-300 font-mono bg-zinc-900 p-4 rounded border border-zinc-800">
                  <p>Alias: <span className="text-white select-all">{process.env.NEXT_PUBLIC_CBU_ALIAS || 'ALIAS.CBU.J3R3F3'}</span></p>
                  <p>Titular: <span className="text-white">Jeremías Feldman</span></p>
                </div>
                <p className="text-zinc-500 text-xs mt-4">
                  * Por favor envía el comprobante por WhatsApp para confirmar la reserva definitivamente.
                </p>
                {clientData && (
                  <a 
                    href={`https://wa.me/5491100000000?text=Hola,%20soy%20${encodeURIComponent(clientData.name)}.%20Acabo%20de%20reservar%20el%20turno%20del%20${encodeURIComponent(format(date, "d 'de' MMMM", { locale: es }))}.%20Adjunto%20comprobante.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full mt-4 border-green-900 text-green-400 hover:bg-green-900/20 hover:text-green-300">
                      Enviar comprobante por WA
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
