'use client';

import { motion } from 'framer-motion';

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => {
    const delay = i * 0.5;
    return {
      pathLength: 1,
      opacity: [0.3, 0.8, 0.3], // Efecto de respiración en opacidad
      transition: {
        pathLength: {
          delay,
          type: "spring",
          duration: 6, // Duración del dibujado
          bounce: 0,
          repeat: Infinity, // Repetir infinitamente
          repeatType: "reverse", // Dibujar y desdibujar
          ease: "easeInOut"
        },
        opacity: {
          delay,
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      }
    };
  }
};

export default function SacredGeometryBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30 mix-blend-overlay">
      <motion.svg
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
        className="w-full h-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <motion.g
          initial="hidden"
          animate="visible"
          className="stroke-white"
        >
          {/* Chakana Central (Cruz Andina Estilizada) */}
          <motion.path
            custom={0}
            variants={draw}
            d="M500,200 L600,200 L600,300 L700,300 L700,400 L800,400 L800,600 L700,600 L700,700 L600,700 L600,800 L400,800 L400,700 L300,700 L300,600 L200,600 L200,400 L300,400 L300,300 L400,300 L400,200 Z"
          />
          
          {/* Centro Chakana (Agujero) */}
          <motion.path
            custom={1}
            variants={draw}
            d="M450,450 L550,450 L550,550 L450,550 Z"
          />

          {/* Líneas de energía radiantes (Estilo Ayahuasca/Kené) */}
          {[...Array(8)].map((_, i) => (
             <motion.path
                key={`ray-${i}`}
                custom={2 + i * 0.1}
                variants={draw}
                d={`M500,500 L${500 + 600 * Math.cos(i * Math.PI / 4)},${500 + 600 * Math.sin(i * Math.PI / 4)}`}
                strokeDasharray="5, 10"
             />
          ))}

          {/* Rombos concéntricos (Ojos de Dios / Geometría Sagrada) */}
          <motion.path
            custom={3}
            variants={draw}
            d="M500,100 L900,500 L500,900 L100,500 Z"
          />
           <motion.path
            custom={3.5}
            variants={draw}
            d="M500,50 L950,500 L500,950 L50,500 Z"
            strokeOpacity="0.5"
          />

          {/* Patrones de serpiente/escalera (Shipibo style waves) */}
          <motion.path
            custom={4}
            variants={draw}
            d="M0,100 Q100,200 200,100 T400,100 T600,100 T800,100 T1000,100"
          />
          <motion.path
            custom={4.5}
            variants={draw}
            d="M0,900 Q100,800 200,900 T400,900 T600,900 T800,900 T1000,900"
          />
          
          {/* Círculos ceremoniales */}
          <motion.circle
            custom={5}
            variants={draw}
            cx="500"
            cy="500"
            r="300"
            strokeDasharray="20, 10"
          />
          <motion.circle
            custom={6}
            variants={draw}
            cx="500"
            cy="500"
            r="400"
            strokeWidth="0.5"
          />
        </motion.g>
      </motion.svg>
      
      {/* Efecto de resplandor sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent animate-pulse" />
    </div>
  );
}