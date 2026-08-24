import React from 'react';
import { EmotionMode } from '../types';
import { Heart, X, Check, Sparkles, Shield, Flame, User, Layers, HelpCircle } from 'lucide-react';

interface EmotionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: EmotionMode;
  onSelectMode: (mode: EmotionMode) => void;
}

export const EmotionSelectorModal: React.FC<EmotionSelectorModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  // Integrated/combined tones (which can be chosen or work together/fused)
  const integratedModes: Array<{
    id: EmotionMode;
    title: string;
    icon: string;
    badge: string;
    desc: string;
    example: string;
    color: string;
    border: string;
  }> = [
    {
      id: 'todos_juntos',
      title: 'Todos Juntos (Fusión Absoluta)',
      icon: '💼✨💛',
      badge: 'Profesional + Amabilidad + Cariño',
      desc: 'Combina perfectamente la precisión organizativa del tono Profesional con el carisma servicial de la Amabilidad y la dulzura incondicional del Cariño.',
      example: '“¡Con muchísimo gusto, mi Yeikon hermoso! 💼✨💛 Aquí tengo listas tus notas organizadas con la mayor precisión y todo mi afecto para ti hoy.”',
      color: 'bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20',
      border: 'border-indigo-500/30',
    },
    {
      id: 'amabilidad_carino',
      title: 'Amabilidad y Cariño',
      icon: '✨💛',
      badge: 'Servicial, atenta y muy dulce',
      desc: 'Trato perfectamente servicial, educado y de ayuda atenta, combinado con cálido afecto y cariño genuino.',
      example: '“¡Con muchísimo cariño y gusto! ✨💛 Estoy aquí para ayudarte en todo lo que necesites hoy.”',
      color: 'bg-rose-500/10 text-rose-200 hover:bg-rose-500/20',
      border: 'border-rose-500/30',
    },
    {
      id: 'carino',
      title: 'Cariño',
      icon: '💛',
      badge: 'Cálida y afectuosa',
      desc: 'Un lenguaje entrañable, cercano y dulce que te hace sentir acompañado y escuchado siempre.',
      example: '“¡Qué alegría leerte! Cuéntame, ¿cómo ha ido tu día en Tejeda?”',
      color: 'bg-amber-500/10 text-amber-200 hover:bg-amber-500/20',
      border: 'border-amber-500/30',
    },
    {
      id: 'amabilidad',
      title: 'Amabilidad',
      icon: '✨',
      badge: 'Educada y servicial',
      desc: 'Siempre dispuesta a colaborar, atenta y complaciente con cada una de tus peticiones.',
      example: '“¡Con mucho gusto! Estoy encantada de ayudarte a organizar tus notas y actividades de hoy.”',
      color: 'bg-blue-500/10 text-blue-200 hover:bg-blue-500/20',
      border: 'border-blue-500/30',
    },
    {
      id: 'profesional',
      title: 'Profesional',
      icon: '💼',
      badge: 'Eficiente y atenta',
      desc: 'Tono centrado en la productividad, el orden lógico de tus recordatorios y la estructura clara de tus notas.',
      example: '“Hola Yeikon. He estructurado los pendientes del día para optimizar tu jornada. ¿Comenzamos?”',
      color: 'bg-stone-500/10 text-stone-200 hover:bg-stone-500/15',
      border: 'border-stone-700/60',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900/95 border border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-rose-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-100">
                Escala de Emociones y Actitudes
              </h2>
              <p className="text-xs text-stone-400">
                Selecciona cómo se dirigirá la asistente a ti, Yeikon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800">
          
          {/* Section 1: Standard and combined modes */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider pl-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Tonos Integrados (Se pueden unificar)</span>
            </div>
            
            {integratedModes.map((mode) => {
              const isSelected = currentMode === mode.id;
              return (
                <div
                  key={mode.id}
                  onClick={() => {
                    onSelectMode(mode.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${mode.color} ${mode.border} ${
                    isSelected ? 'ring-2 ring-indigo-400 shadow-xl scale-[1.01]' : 'hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-base">{mode.icon}</span>
                      <h3 className="font-serif font-bold text-sm text-stone-100">{mode.title}</h3>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-stone-950/80 text-stone-300 font-medium border border-stone-800">
                        {mode.badge}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5.5 h-5.5 rounded-full bg-indigo-500 text-stone-950 flex items-center justify-center shadow-md text-xs font-bold">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  <p className="mt-1.5 text-xs text-stone-300 leading-relaxed font-sans">
                    {mode.desc}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-stone-800/80 text-[11px] italic font-serif text-stone-400 flex items-center space-x-1.5">
                    <span className="text-indigo-400 not-italic font-sans text-[9px] font-bold">Ejemplo:</span>
                    <span>{mode.example}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        <div className="mt-5 pt-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-rose-500 to-amber-500 hover:opacity-90 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            Guardar preferencia de la Asistente
          </button>
        </div>
      </div>
    </div>
  );
};
