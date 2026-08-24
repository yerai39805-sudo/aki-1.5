import React from 'react';
import { EmotionMode } from '../types';
import { Heart, BookOpen, MessageSquare, Bell, Compass, Sparkles, Smile, CloudSun, Calendar, Globe, Bus, Search, Send, Phone } from 'lucide-react';
// @ts-ignore
import noviaAvatar from '../assets/images/novia_avatar_1785004699937.jpg';

interface NavbarProps {
  activeTab: 'chat' | 'diary' | 'reminders' | 'weatherMap' | 'calendar' | 'workspace' | 'titsaBus' | 'webSearch' | 'whatsapp' | 'geminiLive';
  setActiveTab: (tab: 'chat' | 'diary' | 'reminders' | 'weatherMap' | 'calendar' | 'workspace' | 'titsaBus' | 'webSearch' | 'whatsapp' | 'geminiLive') => void;
  emotionMode: EmotionMode;
  onOpenEmotionModal: () => void;
  entriesCount: number;
  pendingRemindersCount: number;
  contactsCount?: number;
  onOpenLiveModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  emotionMode,
  onOpenEmotionModal,
  entriesCount,
  pendingRemindersCount,
  contactsCount = 0,
  onOpenLiveModal,
}) => {
  const emotionLabels: Record<EmotionMode, { text: string; bg: string; textCol: string; icon: string }> = {
    profesional: { text: 'Profesional', bg: 'bg-stone-500/10 border-stone-500/30', textCol: 'text-stone-300', icon: '💼' },
    amabilidad: { text: 'Amabilidad', bg: 'bg-blue-500/10 border-blue-500/30', textCol: 'text-blue-300', icon: '✨' },
    carino: { text: 'Cariño', bg: 'bg-amber-500/10 border-amber-500/30', textCol: 'text-amber-300', icon: '💛' },
    amabilidad_carino: { text: 'Amabilidad y Cariño', bg: 'bg-rose-500/10 border-rose-500/30', textCol: 'text-rose-300', icon: '✨💛' },
    todos_juntos: { text: 'Todos Juntos', bg: 'bg-indigo-500/10 border-indigo-500/30', textCol: 'text-indigo-300', icon: '💼✨💛' },
  };

  const currentEmotion = emotionLabels[emotionMode] || emotionLabels.profesional;

  return (
    <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-xl border-b border-stone-800/80 shadow-lg shadow-black/30 transition-colors">
      <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-600/20 border-b border-amber-500/20 px-4 py-1 text-center text-xs font-semibold tracking-wider text-amber-200 flex items-center justify-center space-x-2">
        <span>✨ Aki ✨</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & User Greeting */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-bold text-lg">
              Y
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-serif font-bold text-stone-100 tracking-tight flex items-center space-x-1.5">
                  <span>YEIKON</span>
                  <span className="text-amber-400 font-sans text-xs px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">Propietario y Creador</span>
                </h1>
              </div>
              <p className="text-xs text-stone-400 font-sans hidden sm:block">
                Asistente personal fiel, WhatsApp de amigos y panel de guaguas TITSA (Tenerife)
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-stone-950/60 p-1.5 rounded-2xl border border-stone-800/80 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Asistente</span>
              <Sparkles className="w-3 h-3 text-amber-200" />
            </button>

            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'whatsapp'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Amigos & WhatsApp</span>
              {contactsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'whatsapp' ? 'bg-emerald-950 text-emerald-200' : 'bg-stone-800 text-emerald-300 border border-stone-700'
                }`}>
                  {contactsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('diary')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'diary'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Libro de Días</span>
              {entriesCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'diary' ? 'bg-amber-950/80 text-amber-200' : 'bg-stone-800 text-amber-300 border border-stone-700'
                }`}>
                  {entriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'reminders'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Recordatorios</span>
              {pendingRemindersCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                  {pendingRemindersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendario</span>
            </button>

            <button
              onClick={() => setActiveTab('weatherMap')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'weatherMap'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <CloudSun className="w-4 h-4" />
              <span>Radar Tiempo</span>
            </button>

            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'workspace'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Google</span>
            </button>

            <button
              onClick={() => setActiveTab('titsaBus')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'titsaBus'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Bus className="w-4 h-4 text-blue-400" />
              <span>TITSA</span>
            </button>

            <button
              onClick={() => setActiveTab('geminiLive')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'geminiLive'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Gemini Live & Twilio</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab('webSearch')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'webSearch'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Buscador</span>
            </button>
          </nav>

          {/* Quick Action & Emotion Mode Badge */}
          <div className="flex items-center space-x-2">
            {onOpenLiveModal && (
              <button
                onClick={onOpenLiveModal}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Llamada de Voz Live con Aki"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span>Llamar Aki</span>
              </button>
            )}

            <button
              onClick={onOpenEmotionModal}
              title="Haz clic para cambiar la actitud y tono emocional de la asistente"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-xs ${currentEmotion.bg} ${currentEmotion.textCol} hover:scale-105`}
            >
              <span>{currentEmotion.icon}</span>
              <span className="font-semibold">{currentEmotion.text}</span>
              <Smile className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 border-t border-stone-800 backdrop-blur-xl px-1 py-1.5 overflow-x-auto">
        <div className="flex items-center justify-between min-w-full gap-0.5 px-0.5">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'chat' ? 'text-amber-400 bg-amber-500/10' : 'text-stone-400'
            }`}
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('geminiLive')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'geminiLive' ? 'text-emerald-400 bg-emerald-500/10' : 'text-stone-400'
            }`}
          >
            <Phone className="w-4 h-4 mb-0.5 text-emerald-400 animate-pulse" />
            <span className="text-[8.5px]">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'whatsapp' ? 'text-emerald-400 bg-emerald-500/10' : 'text-stone-400'
            }`}
          >
            <Send className="w-4 h-4 mb-0.5 text-emerald-400" />
            <span className="text-[8.5px]">WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('diary')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium relative transition-colors ${
              activeTab === 'diary' ? 'text-amber-400 bg-amber-500/10' : 'text-stone-400'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">Diario</span>
            {entriesCount > 0 && (
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium relative transition-colors ${
              activeTab === 'reminders' ? 'text-amber-400 bg-amber-500/10' : 'text-stone-400'
            }`}
          >
            <Bell className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">Notas</span>
            {pendingRemindersCount > 0 && (
              <span className="absolute top-1 right-1 px-1 text-[8px] bg-rose-500 text-white rounded-full font-bold">
                {pendingRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'calendar' ? 'text-amber-400 bg-amber-500/10' : 'text-stone-400'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">Agenda</span>
          </button>

          <button
            onClick={() => setActiveTab('weatherMap')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'weatherMap' ? 'text-amber-400 bg-amber-500/10' : 'text-stone-400'
            }`}
          >
            <CloudSun className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">Clima</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'workspace' ? 'text-amber-400 bg-amber-500/10' : 'text-stone-400'
            }`}
          >
            <Globe className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">Google</span>
          </button>

          <button
            onClick={() => setActiveTab('titsaBus')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'titsaBus' ? 'text-amber-400 bg-amber-500/10' : 'text-stone-400'
            }`}
          >
            <Bus className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">TITSA</span>
          </button>

          <button
            onClick={() => setActiveTab('webSearch')}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'webSearch' ? 'text-cyan-400 bg-cyan-500/10' : 'text-stone-400'
            }`}
          >
            <Search className="w-4 h-4 mb-0.5" />
            <span className="text-[8.5px]">Buscar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
