import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles, X, Radio, MessageSquare, RefreshCw, Send, Settings, ShieldCheck, Heart, Zap } from 'lucide-react';
import { EmotionMode } from '../types';
import { useGeminiLive, LiveConnectionState } from '../hooks/useGeminiLive';
// @ts-ignore
import noviaAvatar from '../assets/images/novia_avatar_1785004699937.jpg';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  emotionMode: EmotionMode;
  onOpenEmotionModal?: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  emotionMode,
  onOpenEmotionModal,
}) => {
  const {
    connectionState,
    errorMessage,
    selectedVoice,
    setSelectedVoice,
    isMicMuted,
    setIsMicMuted,
    micVolume,
    outputVolume,
    currentInputText,
    currentOutputText,
    transcriptHistory,
    sessionDuration,
    latencyMs,
    startLiveSession,
    stopSession,
    sendLiveText,
  } = useGeminiLive(emotionMode);

  const [typedMessage, setTypedMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'call' | 'transcripts'>('call');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const voiceOptions = [
    { id: 'Kore', name: 'Kore', gender: 'Femenina (Cálida, dulce y natural)', badge: 'Recomendada' },
    { id: 'Zephyr', name: 'Zephyr', gender: 'Femenina (Tranquila y expresiva)', badge: 'Cariñosa' },
    { id: 'Aoede', name: 'Aoede', gender: 'Femenina (Suave y melódica)', badge: 'Novia' },
    { id: 'Puck', name: 'Puck', gender: 'Masculina (Dinámica y alegre)', badge: 'Amistosa' },
    { id: 'Charon', name: 'Charon', gender: 'Masculina (Profunda y formal)', badge: 'Profesional' },
    { id: 'Fenrir', name: 'Fenrir', gender: 'Masculina (Firme y enérgica)', badge: 'Segura' },
  ];

  // Auto-start when modal opens if disconnected
  useEffect(() => {
    if (isOpen && connectionState === 'disconnected') {
      startLiveSession();
    }
  }, [isOpen]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptHistory, currentInputText, currentOutputText]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    sendLiveText(typedMessage);
    setTypedMessage('');
  };

  const handleClose = () => {
    stopSession();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-950/95 border border-amber-500/30 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-stone-900/90 via-stone-900 to-amber-950/40 border-b border-stone-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={noviaAvatar}
                alt="Aki"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-500/80 shadow-md shadow-amber-500/20"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-stone-950 ${
                connectionState === 'speaking' ? 'bg-amber-400 animate-ping' :
                connectionState === 'listening' ? 'bg-emerald-500' :
                connectionState === 'connecting' ? 'bg-amber-500 animate-pulse' :
                connectionState === 'interrupted' ? 'bg-rose-500' : 'bg-stone-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-stone-100 text-sm sm:text-base flex items-center gap-1.5">
                  <span>Llamada Gemini Live</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-sans font-semibold">
                    Intermediario Real-Time
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-stone-400 flex items-center gap-2 font-mono">
                <span>{formatDuration(sessionDuration)}</span>
                <span>•</span>
                <span className="text-amber-400 capitalize">{connectionState === 'speaking' ? 'Aki hablando...' : connectionState === 'listening' ? 'Escuchando tu voz...' : connectionState === 'connecting' ? 'Conectando...' : connectionState}</span>
                {latencyMs !== null && <span>• {latencyMs}ms</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-all ${
                showSettings ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title="Configuración de voz y modelo"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-between space-y-4">
          
          {/* Settings Panel Toggle */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-stone-900/90 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-400" /> Voz de Gemini Live:
                </span>
                <span className="text-[10px] text-amber-400/80">Modelo: gemini-3.1-flash-live-preview</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {voiceOptions.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVoice(v.id);
                      if (connectionState === 'listening' || connectionState === 'speaking') {
                        startLiveSession(v.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedVoice === v.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-sm'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>{v.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">{v.badge}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{v.gender}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Central Visualizer & Avatar */}
          <div className="relative flex flex-col items-center justify-center my-4">
            
            {/* Pulsing Ripple Rings */}
            <div className="relative flex items-center justify-center">
              {/* Output Audio Wave Aura (Aki speaking) */}
              <div
                className="absolute rounded-full bg-amber-500/20 transition-all duration-100 pointer-events-none"
                style={{
                  width: `${140 + outputVolume * 1.5}px`,
                  height: `${140 + outputVolume * 1.5}px`,
                  filter: 'blur(12px)',
                }}
              />
              {/* Mic Input Wave Aura (Yeikon speaking) */}
              <div
                className="absolute rounded-full bg-emerald-500/20 transition-all duration-100 pointer-events-none"
                style={{
                  width: `${130 + micVolume * 1.4}px`,
                  height: `${130 + micVolume * 1.4}px`,
                  filter: 'blur(8px)',
                }}
              />

              {/* Main Novia Avatar Image */}
              <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-3 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <img
                  src={noviaAvatar}
                  alt="Aki Novia Virtual"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {connectionState === 'speaking' && (
                  <div className="absolute inset-0 bg-amber-500/10 backdrop-brightness-110 flex items-end justify-center pb-2">
                    <span className="text-[10px] bg-amber-950/80 text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/40 font-semibold shadow-xs">
                      Hablando...
                    </span>
                  </div>
                )}
                {connectionState === 'listening' && (
                  <div className="absolute inset-0 bg-emerald-500/10 flex items-end justify-center pb-2">
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/40 font-semibold shadow-xs">
                      Escuchando...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Audio Frequency Oscilloscope Bars */}
            <div className="flex items-center space-x-1.5 mt-6 h-10 px-4 py-2 bg-stone-900/80 border border-stone-800 rounded-2xl">
              {[12, 24, 38, 55, 75, 90, 60, 40, 25, 15, 30, 65, 80, 50, 20].map((baseH, idx) => {
                const isUserActive = micVolume > 5;
                const isAsstActive = outputVolume > 5;
                const dynamicHeight = isAsstActive
                  ? Math.max(6, Math.min(32, (outputVolume / 100) * baseH))
                  : isUserActive
                  ? Math.max(6, Math.min(32, (micVolume / 100) * baseH))
                  : 4;

                return (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isAsstActive
                        ? 'bg-gradient-to-t from-amber-500 to-rose-400 shadow-[0_0_8px_#f59e0b]'
                        : isUserActive
                        ? 'bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_8px_#10b981]'
                        : 'bg-stone-700/60'
                    }`}
                    style={{ height: `${dynamicHeight}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Subtitles & Real-Time Live Transcripts Box */}
          <div className="w-full bg-stone-900/60 border border-stone-800/90 rounded-2xl p-3.5 sm:p-4 text-xs space-y-2 min-h-[90px] max-h-44 overflow-y-auto">
            {transcriptHistory.length === 0 && !currentInputText && !currentOutputText && connectionState === 'listening' && (
              <p className="text-stone-400 italic text-center py-2">
                Di algo como: <span className="text-amber-300">"Hola mi amor", "¿Qué hora es?", "¿A qué hora pasa la guagua 050?", "Cuéntame algo de Japón"</span>
              </p>
            )}

            {/* Previous Turn History */}
            {transcriptHistory.slice(-4).map((item) => (
              <div key={item.id} className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">
                  {item.sender === 'user' ? 'Yeikon' : 'Aki'} • {item.timestamp}
                </span>
                <p className={`p-2 rounded-xl mt-0.5 max-w-[85%] ${
                  item.sender === 'user' ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30' : 'bg-stone-800 text-stone-200 border border-stone-700'
                }`}>
                  {item.text}
                </p>
              </div>
            ))}

            {/* Current Real-time Input Streaming */}
            {currentInputText && (
              <div className="flex flex-col items-end animate-pulse">
                <span className="text-[9px] text-emerald-400 uppercase font-semibold">Tú hablando...</span>
                <p className="p-2 rounded-xl mt-0.5 bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 max-w-[85%]">
                  {currentInputText}
                </p>
              </div>
            )}

            {/* Current Real-time Output Streaming */}
            {currentOutputText && (
              <div className="flex flex-col items-start">
                <span className="text-[9px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Aki respondiendo en vivo...
                </span>
                <p className="p-2 rounded-xl mt-0.5 bg-amber-950/60 text-amber-100 border border-amber-500/40 max-w-[85%]">
                  {currentOutputText}
                </p>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="w-full p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs text-center">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Quick Text in Live Input */}
          <form onSubmit={handleSendText} className="w-full flex items-center space-x-2">
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="O escribe algo mientras hablas en vivo..."
              className="flex-1 bg-stone-900/90 border border-stone-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-stone-100 outline-hidden"
            />
            <button
              type="submit"
              disabled={!typedMessage.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 font-bold transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Bottom Control Bar */}
        <div className="bg-stone-900/90 border-t border-stone-800/80 px-6 py-4 flex items-center justify-between">
          
          {/* Mute Mic Button */}
          <button
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-semibold text-xs border transition-all ${
              isMicMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
            }`}
          >
            {isMicMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            <span>{isMicMuted ? 'Micrófono Silenciado' : 'Mic Activo'}</span>
          </button>

          {/* Reconnect / Action Button */}
          {connectionState === 'disconnected' || connectionState === 'error' ? (
            <button
              onClick={() => startLiveSession()}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <Phone className="w-5 h-5" />
              <span>Conectar Llamada</span>
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-500/30 transition-all active:scale-95"
            >
              <PhoneOff className="w-5 h-5" />
              <span>Colgar Llamada</span>
            </button>
          )}

          {/* Intermediary Badge */}
          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-stone-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Full Duplex</span>
          </div>

        </div>

      </div>
    </div>
  );
};
