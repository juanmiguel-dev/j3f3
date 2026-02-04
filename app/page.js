'use client';

import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import SacredGeometryBackground from '@/components/SacredGeometryBackground';

function CrazyVideo() {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef(null);
  
  // Mouse interaction for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });
  
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-3deg", "3deg"]);
  
  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      style={{
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full relative z-20 group"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full relative aspect-square"
      >
        {/* Abstract Background Shapes */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-red-600/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse" 
             style={{ transform: "translateZ(-20px)" }} 
        />
        
        {/* Main Video Container */}
        <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden border-2 border-zinc-700/50 relative shadow-2xl"
             style={{ transform: "translateZ(0px)" }}>
          
          {/* Glitch Overlay Effect */}
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-10"></div>
          
          <video 
            ref={videoRef}
            autoPlay 
            loop 
            muted 
            playsInline
            className={`w-full h-full object-cover transition-all duration-700 ${isMuted ? 'grayscale contrast-125' : 'grayscale-0 contrast-100'}`}
          >
            <source src="/tattoos/porque-tatuo.mp4" type="video/mp4" />
          </video>

          {/* Volume Control - Floating "Crazy" Button */}
          <motion.button
            whileHover={{ scale: 1.2, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="absolute bottom-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </motion.button>
          
          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 z-20 mix-blend-difference text-white text-xs font-mono tracking-widest border border-white/30 px-2 py-1">
            REC ●
          </div>
          
          <div className="absolute inset-0 border-[1px] border-white/10 m-2 rounded-lg pointer-events-none z-20" />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={containerRef} className="relative bg-black">
      {/* HERO SECTION */}
      <section className="relative h-[70vh] w-full overflow-hidden flex items-center justify-center">
        {/* Parallax Background */}
        <motion.div 
          style={{ y }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
            style={{ 
              backgroundImage: "url('/hero-bg.jpg')",
              backgroundColor: "#18181b" 
            }}
          />
          <SacredGeometryBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-[0.5em] text-gray-400 uppercase mb-4">
              IMAGENES CON ESPÍRITU
            </h2>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-none eternal-chrome-text">
              J3R3F3
            </h1>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        </motion.div>
      </section>

      {/* BIO SECTION WITH VIDEO */}
      <section className="relative min-h-screen w-full overflow-hidden flex items-center bg-zinc-950">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-20 grayscale"
          >
            <source src="/tattoos/porque-tatuo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/[0.74] backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="hidden md:block"
        >
          <CrazyVideo />
        </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-left flex flex-col gap-8"
          >
            <div>
              <h2 className="text-sm font-bold tracking-[0.3em] text-red-500 uppercase mb-2">
                LA PREGUNTA
              </h2>
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                ¿POR QUÉ TATUÁS?
              </h3>
            </div>

            <div className="space-y-6">
              <motion.blockquote 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="border-l-4 border-white pl-6 py-2"
              >
                <p className="text-2xl md:text-3xl font-bold text-gray-200 leading-tight">
                  "Me parece un <span className="text-white bg-red-600/20 px-1">acto de rebeldía</span>."
                </p>
              </motion.blockquote>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-gray-400 text-lg md:text-xl font-light"
              >
                Es la prueba de que una persona puede tomar una decisión por el resto de su vida.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="bg-white/5 p-6 rounded-lg backdrop-blur-md border border-white/10"
              >
                <p className="text-gray-300 italic font-serif text-xl">
                  "Lo único que me hace estar en paz con mi cerebro es dibujar. 
                  No recuerdo no hacerlo."
                </p>
                <p className="text-right text-sm font-bold text-gray-500 mt-4 uppercase tracking-widest">
                  — Jeremías
                </p>
              </motion.div>
            </div>
            
            <Link 
              href="/reservar" 
              className="inline-flex items-center gap-2 text-white font-bold tracking-widest uppercase group hover:text-red-500 transition-colors mt-4"
            >
              TURNOS <ArrowRight className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section Removed */}
    </div>
  );
}
