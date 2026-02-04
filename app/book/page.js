import GalleryGrid from '@/components/GalleryGrid';

export const metadata = {
  title: "BOOK | J3R3F3",
  description: "Explora la colección de tatuajes realizados por J3R3F3.",
};

export default function BookPage() {
  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-widest">BOOK</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Una selección de mis trabajos más recientes. Cada pieza es única y diseñada específicamente para cada cliente.
          </p>
        </div>

        <GalleryGrid />
      </div>
    </div>
  );
}
