import React from 'react';
import { Lock, EyeOff, Menu, ChevronDown, ChevronUp, Phone, Sparkles } from 'lucide-react';
import { EmotionMode, DiaryEntry, Reminder } from '../../types';
// @ts-ignore
import noviaAvatar from '../../assets/images/novia_avatar_1785004699937.jpg';

interface ChatHeaderProps {
  isAnonymous: boolean;
  onOpenEmotionModal: () => void;
  diaryEntries: DiaryEntry[];
  reminders: Reminder[];
  currentEmotion: { badge: string; color: string; heart: string };
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
  onOpenLiveCall?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  isAnonymous,
  onOpenEmotionModal,
  diaryEntries,
  reminders,
  currentEmotion,
  isMenuOpen,
  setIsMenuOpen,
  onOpenLiveCall
}) => {
  return (
    <div className="bg-stone-900/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-3 mb-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-between shrink-0 relative z-30">
      <div className="flex items-center space-x-3">
        <div className="relative cursor-pointer" onClick={onOpenLiveCall} title="Llamar en vivo con Gemini Live">
          <img src={noviaAvatar} alt="Novia" referrerPolicy="no-referrer" className="w-11 h-11 rounded-xl object-cover border-2 border-amber-500 shadow-md shadow-amber-500/20 hover:scale-105 transition-all" />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-stone-900 rounded-full animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-serif font-bold text-amber-50 text-base flex items-center gap-1.5">
              Aki
              {isAnonymous && <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Anon</span>}
            </h2>
            <button onClick={onOpenEmotionModal} className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${currentEmotion.color} shadow-lg border border-white/5`}>
              <span>{currentEmotion.heart}</span>
              <span className="hidden sm:inline ml-1">{currentEmotion.badge}</span>
            </button>
          </div>
          <p className="text-[10px] text-stone-400 font-medium">
            {isAnonymous ? <span className="text-purple-400 flex items-center gap-1 uppercase tracking-widest"><EyeOff className="w-3 h-3" /> Modo Secreto</span> : 
            <span className="uppercase tracking-widest opacity-80">{diaryEntries.length} Diarios • {reminders.filter(r=>!r.completed).length} Tareas</span>}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {onOpenLiveCall && (
          <button
            onClick={onOpenLiveCall}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            title="Llamada de Voz en Vivo con Gemini Live"
          >
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden sm:inline">Llamada Live</span>
          </button>
        )}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer">
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline">Menú</span>
          {isMenuOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
