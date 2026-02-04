import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "J3R3F3 | Arte en la Piel",
  description: "Book profesional de tatuajes y reservas de J3R3F3.",
  icons: {
    icon: [
      { url: '/tattoos/favicon.ico', sizes: 'any' },
      { url: '/tattoos/favicon-32x32.png', type: 'image/png' },
    ],
    apple: [
      { url: '/tattoos/apple-touch-icon.png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-zinc-900 text-white min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
