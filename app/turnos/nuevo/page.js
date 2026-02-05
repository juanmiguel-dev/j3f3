'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineWidget } from "react-calendly";
import { ArrowLeft, ArrowRight, Upload, Check, Calendar, X, Image as ImageIcon } from 'lucide-react';

const TATTOO_STYLES = [
  { id: 'fineline', label: 'Fine line' },
  { id: 'blackwork', label: 'Blackwork' },
  { id: 'lettering', label: 'Lettering' },
  { id: 'blackgrey', label: 'Black & Grey' },
  { id: 'coverup', label: 'Cover up' },
];

export default function NewProjectPage() {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [formData, setFormData] = useState({
    styles: [],
    color: 'bn',
    location: '',
    size: '',
    idea: '',
    file: null
  });

  const toggleStyle = (styleId) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(styleId) 
        ? prev.styles.filter(s => s !== styleId)
        : [...prev.styles, styleId]
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor sube solo archivos de imagen.');
        return;
      }
      
      setFormData(prev => ({ ...prev, file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, file: null }));
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    // Basic validation could go here
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-zinc-950 flex flex-col items-center">
      
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 1 ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>1</span>
            <span className={`${step >= 1 ? 'text-white' : 'text-zinc-500'} font-medium`}>Proyecto</span>
          </div>
          <div className={`flex-1 h-[1px] mx-4 transition-colors ${step >= 2 ? 'bg-white' : 'bg-zinc-800'}`} />
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${step >= 2 ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>2</span>
            <span className={`${step >= 2 ? 'text-white' : 'text-zinc-500'} font-medium`}>Agenda</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 shadow-2xl"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Cuéntame sobre tu tattoo</h1>
                <p className="text-zinc-400">¡La mejor parte! Dame los detalles para crear algo único.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Styles */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-4">
                      Seleccioná estilos y técnicas (puede ser más de una):
                    </label>
                    <div className="space-y-3">
                      {TATTOO_STYLES.map((style) => (
                        <label key={style.id} className="flex items-center gap-3 cursor-pointer group">
                          <div 
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                              formData.styles.includes(style.id) 
                                ? 'bg-white border-white' 
                                : 'bg-transparent border-zinc-600 group-hover:border-zinc-400'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleStyle(style.id);
                            }}
                          >
                            {formData.styles.includes(style.id) && <Check className="w-3.5 h-3.5 text-black" />}
                          </div>
                          <span className="text-zinc-300 group-hover:text-white transition-colors">{style.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Color Preference */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-4">
                      Preferencia de color:
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            formData.color === 'color' 
                              ? 'border-white' 
                              : 'border-zinc-600 group-hover:border-zinc-400'
                          }`}
                          onClick={() => setFormData({...formData, color: 'color'})}
                        >
                          {formData.color === 'color' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-zinc-300 group-hover:text-white transition-colors">Color</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div 
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            formData.color === 'bn' 
                              ? 'border-white' 
                              : 'border-zinc-600 group-hover:border-zinc-400'
                          }`}
                          onClick={() => setFormData({...formData, color: 'bn'})}
                        >
                          {formData.color === 'bn' && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-zinc-300 group-hover:text-white transition-colors">B&N</span>
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Contanos tu idea de tatuaje:
                    </label>
                    <textarea 
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all h-32 resize-none"
                      placeholder="Describe tu idea, elementos, significado..."
                      value={formData.idea}
                      onChange={(e) => setFormData({...formData, idea: e.target.value})}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Ubicación del tatuaje:
                    </label>
                    <p className="text-xs text-zinc-500 mb-2">Sé lo más específico posible. Ej: pantorrilla derecha, antebrazo interno.</p>
                    <textarea 
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all h-24 resize-none"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tamaño aproximado (cm):
                    </label>
                    <input 
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                      placeholder="Ej: 15x10 cm"
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                    />
                  </div>

                  {/* Reference Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Imagen de referencia:
                    </label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    
                    {!previewUrl ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-700 rounded-lg p-6 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer bg-zinc-950/50 group h-48"
                      >
                        <div className="bg-zinc-900 p-3 rounded-full mb-3 group-hover:bg-zinc-800 transition-colors">
                          <Upload className="w-6 h-6 text-zinc-400 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-medium">Click para subir imagen</span>
                        <span className="text-xs mt-1 text-zinc-600">JPG, PNG, WEBP (Max 5MB)</span>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden border border-zinc-700 h-48 bg-black flex items-center justify-center group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={previewUrl} 
                          alt="Vista previa" 
                          className="h-full w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                        />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                            title="Cambiar imagen"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={removeFile}
                            className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                            title="Eliminar imagen"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white truncate max-w-[80%] backdrop-blur-sm">
                          {formData.file?.name}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-12 pt-6 border-t border-zinc-800">
                <button
                  onClick={handleNext}
                  className="bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                  SIGUIENTE <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-6">
                 <button
                  onClick={() => setStep(1)}
                  className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" /> Volver a detalles
                </button>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-white">Elige tu horario</h2>
                  <p className="text-zinc-500 text-sm">Reserva tu consulta de 30 min</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <InlineWidget 
                  url="https://calendly.com/jeremiasfeldman/30min"
                  styles={{
                    height: '700px',
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
