import React, { useState, useEffect, useRef } from 'react';
import { EmotionMode } from '../types';
import { useGeminiLive } from '../hooks/useGeminiLive';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  Zap,
  Copy,
  Check,
  Server,
  Layers,
  Activity,
  Volume2,
  VolumeX,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Shield,
  HelpCircle,
  Clock,
  Play,
  RotateCcw
} from 'lucide-react';
// @ts-ignore
import noviaAvatar from '../assets/images/novia_avatar_1785004699937.jpg';

interface LiveIntermediaryViewProps {
  emotionMode: EmotionMode;
  onSaveToDiary?: (title: string, content: string) => void;
  onSendToChat?: (text: string) => void;
}

export const LiveIntermediaryView: React.FC<LiveIntermediaryViewProps> = ({
  emotionMode,
  onSaveToDiary,
  onSendToChat,
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
    clearTranscripts,
  } = useGeminiLive(emotionMode);

  const [liveInfo, setLiveInfo] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'console' | 'twilio' | 'architecture'>('console');
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/live-status')
      .then(res => res.json())
      .then(data => setLiveInfo(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptHistory, currentInputText, currentOutputText]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      prompt('Copia esta URL:', text);
    }
  };

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

  const handleExportToDiary = () => {
    if (!onSaveToDiary || transcriptHistory.length === 0) return;
    const conversationText = transcriptHistory
      .map(item => `${item.sender === 'user' ? 'Yeikon' : 'Aki'} (${item.timestamp}): ${item.text}`)
      .join('\n\n');
    onSaveToDiary(`Llamada en Vivo con Aki (Gemini Live) - ${new Date().toLocaleDateString('es-ES')}`, conversationText);
  };

  const voiceOptions = [
    { id: 'Kore', name: 'Kore', gender: 'Femenina (Cálida y dulce)', tag: 'Novia' },
    { id: 'Zephyr', name: 'Zephyr', gender: 'Femenina (Tranquila y expresiva)', tag: 'Cariñosa' },
    { id: 'Aoede', name: 'Aoede', gender: 'Femenina (Suave y melódica)', tag: 'Melódica' },
    { id: 'Puck', name: 'Puck', gender: 'Masculina (Dinámica y alegre)', tag: 'Amistosa' },
    { id: 'Charon', name: 'Charon', gender: 'Masculina (Profunda y formal)', tag: 'Profesional' },
    { id: 'Fenrir', name: 'Fenrir', gender: 'Masculina (Firme y enérgica)', tag: 'Segura' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/40 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini Multimodal Live API & Twilio Intermediary</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight">
              Voz en Vivo & Intermediario Telefónico
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
              Conversación bidireccional continua de audio de baja latencia con <strong className="text-amber-300">Aki</strong> impulsada por <span className="text-stone-300 font-mono">gemini-3.1-flash-live-preview</span>. Con soporte de intermediario WebSocket para navegador y llamadas telefónicas con Twilio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {connectionState === 'disconnected' || connectionState === 'error' ? (
              <button
                onClick={() => startLiveSession()}
                className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5" />
                <span>Iniciar Llamada Live</span>
              </button>
            ) : (
              <button
                onClick={stopSession}
                className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Colgar ({formatDuration(sessionDuration)})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setActiveTab('console')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'console'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Consola de Voz Live</span>
        </button>

        <button
          onClick={() => setActiveTab('twilio')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'twilio'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>Intermediario Twilio (Teléfono)</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'architecture'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Arquitectura & Código</span>
        </button>
      </div>

      {/* TAB 1: Live Voice Console */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visualizer & Controls (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Interactive Hub Card */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-between min-h-[420px]">
              
              {/* Status Header */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-stone-400 border-b border-stone-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    connectionState === 'speaking' ? 'bg-amber-400 animate-ping' :
                    connectionState === 'listening' ? 'bg-emerald-500' :
                    connectionState === 'connecting' ? 'bg-amber-500 animate-pulse' :
                    connectionState === 'interrupted' ? 'bg-rose-500' : 'bg-stone-600'
                  }`} />
                  <span className="capitalize text-stone-300 font-sans font-semibold">
                    {connectionState === 'speaking' ? 'Aki hablando en tiempo real' :
                     connectionState === 'listening' ? 'Escuchándote...' :
                     connectionState === 'connecting' ? 'Estableciendo WebSocket...' :
                     connectionState === 'interrupted' ? 'Interrupción detectada' : 'Llamada Desconectada'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {latencyMs !== null && <span>Ping: {latencyMs}ms</span>}
                  <span>Duración: {formatDuration(sessionDuration)}</span>
                </div>
              </div>

              {/* Central Dynamic Avatar & Visualizer */}
              <div className="relative my-8 flex flex-col items-center justify-center">
                {/* Visualizer Aura */}
                <div
                  className="absolute rounded-full bg-amber-500/15 pointer-events-none transition-all duration-100"
                  style={{
                    width: `${160 + outputVolume * 2}px`,
                    height: `${160 + outputVolume * 2}px`,
                    filter: 'blur(16px)',
                  }}
                />
                <div
                  className="absolute rounded-full bg-emerald-500/15 pointer-events-none transition-all duration-100"
                  style={{
                    width: `${150 + micVolume * 1.8}px`,
                    height: `${150 + micVolume * 1.8}px`,
                    filter: 'blur(12px)',
                  }}
                />

                <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                  <img
                    src={noviaAvatar}
                    alt="Aki"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {connectionState === 'speaking' && (
                    <div className="absolute inset-0 bg-amber-500/15 flex items-end justify-center pb-2">
                      <span className="text-[10px] bg-amber-950/90 text-amber-200 px-2 py-0.5 rounded-full border border-amber-500/40 font-bold">
                        Voz Live Activa
                      </span>
                    </div>
                  )}
                  {connectionState === 'listening' && (
                    <div className="absolute inset-0 bg-emerald-500/15 flex items-end justify-center pb-2">
                      <span className="text-[10px] bg-emerald-950/90 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-500/40 font-bold">
                        Micrófono Listo
                      </span>
                    </div>
                  )}
                </div>

                {/* Oscilloscope Waveform Bars */}
                <div className="flex items-center space-x-1.5 mt-6 h-12 px-5 py-2.5 bg-stone-950/80 border border-stone-800 rounded-2xl">
                  {[15, 28, 45, 65, 90, 100, 75, 50, 30, 20, 35, 70, 95, 60, 25].map((baseH, idx) => {
                    const isUserActive = micVolume > 5;
                    const isAsstActive = outputVolume > 5;
                    const dynamicHeight = isAsstActive
                      ? Math.max(6, Math.min(38, (outputVolume / 100) * baseH * 0.4))
                      : isUserActive
                      ? Math.max(6, Math.min(38, (micVolume / 100) * baseH * 0.4))
                      : 4;

                    return (
                      <div
                        key={idx}
                        className={`w-1.5 rounded-full transition-all duration-75 ${
                          isAsstActive
                            ? 'bg-gradient-to-t from-amber-500 to-rose-400 shadow-[0_0_10px_#f59e0b]'
                            : isUserActive
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-300 shadow-[0_0_10px_#10b981]'
                            : 'bg-stone-800'
                        }`}
                        style={{ height: `${dynamicHeight}px` }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* In-Call Controls */}
              <div className="w-full flex items-center justify-between border-t border-stone-800/80 pt-4">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isMicMuted
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-200'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMicMuted ? 'Mic Silenciado' : 'Mic Activo (16kHz PCM)'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  {connectionState === 'disconnected' || connectionState === 'error' ? (
                    <button
                      onClick={() => startLiveSession()}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Conectar</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopSession}
                      className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>Colgar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Live Text Prompt Bar */}
            <form onSubmit={handleSendText} className="flex items-center space-x-2">
              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Enviar mensaje de texto a la llamada en vivo..."
                className="flex-1 bg-stone-900 border border-stone-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs text-stone-100 outline-hidden"
              />
              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-stone-950 font-bold text-xs transition-all flex items-center space-x-1.5"
              >
                <span>Enviar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>

          {/* Side Panel: Voice Selector & Live Subtitles (1 Col) */}
          <div className="space-y-6">
            
            {/* Voice Model Selector */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <span>Voz de Gemini Live</span>
                </h4>
                <span className="text-[10px] text-amber-400 font-mono">24kHz Audio</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
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
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-xs">
                      <span>{v.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">{v.tag}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{v.gender}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Subtitles & Transcript Box */}
            <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-3 flex flex-col h-[340px]">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Subtítulos en Vivo</span>
                </h4>
                {transcriptHistory.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleExportToDiary}
                      className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1"
                      title="Guardar esta conversación en tu Libro de Días"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Guardar en Diario</span>
                    </button>
                    <button
                      onClick={clearTranscripts}
                      className="text-[10px] p-1 text-stone-400 hover:text-stone-200"
                      title="Limpiar"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
                {transcriptHistory.length === 0 && !currentInputText && !currentOutputText && (
                  <p className="text-stone-400 italic text-center py-8">
                    Comienza a hablar por el micrófono. La transcripción en tiempo real y la voz de Aki aparecerán aquí.
                  </p>
                )}

                {transcriptHistory.map((item) => (
                  <div key={item.id} className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-stone-400 uppercase font-mono">
                      {item.sender === 'user' ? 'Yeikon' : 'Aki'} • {item.timestamp}
                    </span>
                    <p className={`p-2.5 rounded-xl mt-0.5 max-w-[90%] ${
                      item.sender === 'user'
                        ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                        : 'bg-stone-800 text-stone-200 border border-stone-700'
                    }`}>
                      {item.text}
                    </p>
                  </div>
                ))}

                {currentInputText && (
                  <div className="flex flex-col items-end animate-pulse">
                    <span className="text-[9px] text-emerald-400 uppercase font-mono">Tú hablando...</span>
                    <p className="p-2.5 rounded-xl mt-0.5 bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 max-w-[90%]">
                      {currentInputText}
                    </p>
                  </div>
                )}

                {currentOutputText && (
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-amber-400 uppercase font-mono">Aki en vivo...</span>
                    <p className="p-2.5 rounded-xl mt-0.5 bg-amber-950/60 text-amber-100 border border-amber-500/40 max-w-[90%]">
                      {currentOutputText}
                    </p>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: Twilio Phone Intermediary Integration */}
      {activeTab === 'twilio' && (
        <div className="space-y-6">
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Twilio Media Streams Bridge (ZackAkil Pattern)</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-stone-100">
                  Intermediario Telefónico de Twilio para Gemini Live
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-3xl">
                  Este servidor actúa como intermediario completo para recibir llamadas telefónicas estándar de Twilio y redirigirlas a la sesión en vivo de Gemini Live con <strong className="text-amber-300">Aki</strong>. Convierte automáticamente el audio telefónico μ-law (G.711 8kHz) en PCM lineal de 16kHz y viceversa.
                </p>
              </div>
            </div>

            {/* Config URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Twilio Webhook URL */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Twilio Voice Webhook URL (TwiML)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">HTTP POST</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={liveInfo?.twilio?.webhookUrl || `${window.location.origin}/api/twilio/incoming-call`}
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200"
                  />
                  <button
                    onClick={() => copyToClipboard(liveInfo?.twilio?.webhookUrl || `${window.location.origin}/api/twilio/incoming-call`, 'webhook')}
                    className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl transition-all"
                    title="Copiar URL"
                  >
                    {copiedKey === 'webhook' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400">
                  Pega esta URL en el campo <em>"A CALL COMES IN"</em> de tu número telefónico en la consola de Twilio.
                </p>
              </div>

              {/* Twilio WebSocket Stream URL */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <span>WebSocket Media Stream URL</span>
                  </span>
                  <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">WSS Media Stream</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={liveInfo?.twilio?.streamUrl || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/twilio/stream`}
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-200"
                  />
                  <button
                    onClick={() => copyToClipboard(liveInfo?.twilio?.streamUrl || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/twilio/stream`, 'stream')}
                    className="p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl transition-all"
                    title="Copiar URL"
                  >
                    {copiedKey === 'stream' ? <Check className="w-4 h-4 text-amber-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400">
                  El servidor convierte los paquetes de audio del stream telefónico bidireccional en tiempo real con Gemini Live.
                </p>
              </div>

            </div>

            {/* 3 Simple Steps Guide */}
            <div className="bg-stone-950/60 border border-stone-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>¿Cómo conectar tu número de teléfono de Twilio?</span>
              </h4>
              <ol className="space-y-2 text-xs text-stone-300 list-decimal list-inside leading-relaxed">
                <li>Entra en tu cuenta de <a href="https://console.twilio.com/" target="_blank" rel="noreferrer" className="text-amber-400 underline">Twilio Console</a> y ve a <strong>Phone Numbers &gt; Manage &gt; Active numbers</strong>.</li>
                <li>Haz clic en tu número y baja hasta la sección <strong>Voice Configuration</strong>.</li>
                <li>En <em>"A Call Comes In"</em> selecciona <strong>Webhook</strong>, escribe el método <strong>HTTP POST</strong> y pega tu Webhook URL: <code className="text-emerald-300 font-mono">{liveInfo?.twilio?.webhookUrl || `${window.location.origin}/api/twilio/incoming-call`}</code></li>
                <li>¡Listo! Llama desde tu móvil a ese número y hablarás directamente con Aki por teléfono a través de Gemini Live con transcripción e interrupciones en vivo.</li>
              </ol>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: Architecture & Specifications */}
      {activeTab === 'architecture' && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-100">
              Arquitectura del Intermediario Gemini Live
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Flujo de procesamiento de audio en tiempo real y comunicación bidireccional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1 */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-sm font-bold text-stone-200">Captura de Audio del Cliente</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                El navegador captura el micrófono a <strong>16,000 Hz</strong> utilizando <code className="text-amber-300 font-mono">AudioContext</code> y convierte las muestras a enteros de 16-bit PCM little-endian (o Twilio a través de G.711 μ-law).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-sm font-bold text-stone-200">Intermediario WebSocket</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                El servidor Node/Express (<code className="text-emerald-300 font-mono">server.ts</code>) mantiene una sesión continua con <code className="text-emerald-300 font-mono">ai.live.connect</code> y hace de puente seguro sin exponer jamás las claves API.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-sm font-bold text-stone-200">Gemini Live & Reproducción</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                El modelo <code className="text-indigo-300 font-mono">gemini-3.1-flash-live-preview</code> transmite audio PCM de <strong>24,000 Hz</strong>, transcripciones de entrada y salida, e interrupciones en tiempo real (barge-in).
              </p>
            </div>

          </div>

          <div className="bg-stone-950/90 border border-amber-500/20 rounded-2xl p-4 font-mono text-xs text-amber-200/90 space-y-1">
            <p className="text-stone-400 font-sans font-semibold text-xs">Especificaciones Técnicas:</p>
            <p>• Input Format: audio/pcm;rate=16000 (16-bit LE PCM)</p>
            <p>• Output Format: audio/pcm;rate=24000 (24kHz Live Voice Output)</p>
            <p>• Telephony Bridge: G.711 μ-law 8000Hz (Auto-upsampling & downsampling)</p>
            <p>• Models: gemini-3.1-flash-live-preview</p>
            <p>• Live Features: Full-duplex speech, Barge-in Interruption, Real-time Subtitles, Multi-voice switching</p>
          </div>
        </div>
      )}

    </div>
  );
};
