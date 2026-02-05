'use client';
import { InlineWidget } from "react-calendly";

export default function AgendarPage() {
  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex flex-col items-center">
      <div className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">
          Elige tu Próximo Turno
        </h1>
        <p className="text-zinc-400 text-lg">
          Selecciona el día y la hora que mejor te venga. Recuerda que esta opción es para continuar trabajos ya empezados.
        </p>
      </div>

      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl h-[700px]">
        <InlineWidget 
          url="https://calendly.com/jeremiasfeldman/30min"
          styles={{
            height: '100%',
            width: '100%',
            minWidth: '320px',
          }}
          pageSettings={{
            backgroundColor: '18181b',
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
            primaryColor: 'ffffff',
            textColor: 'ffffff'
          }}
        />
      </div>
    </div>
  );
}
