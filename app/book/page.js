import GalleryGrid from '@/components/GalleryGrid';

export const metadata = {
  title: "BOOK | J3R3F3",
  description: "Explora la colección de tatuajes realizados por J3R3F3.",
};

export default function BookPage() {
  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 selection:bg-white/20">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-white/5 blur-[120px] rounded-full opacity-50" />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-block">
            <h1 className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-800 tracking-tighter select-none">
              PORTFOLIO
            </h1>
          </div>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Una colección curada de tinta y piel. <br className="hidden md:block" />
            Cada pieza narra una historia única diseñada a medida.
          </p>
        </div>

        <GalleryGrid />
      </div>
    </div>
  );
}
