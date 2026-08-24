import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EmotionMode, DiaryEntry, Reminder } from '../types';
import { X, Cpu, Wrench, Sparkles } from 'lucide-react';
import { ChatHeader } from './chat/ChatHeader';
import { MessageList } from './chat/MessageList';
import { ChatInput } from './chat/ChatInput';

interface AssistantChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageUrl?: string) => Promise<void>;
  isLoading: boolean;
  emotionMode: EmotionMode;
  onOpenEmotionModal: () => void;
  diaryEntries: DiaryEntry[];
  reminders: Reminder[];
  onClearChat: () => void;
  isAnonymous: boolean;
  setIsAnonymous: (val: boolean) => void;
  onClearAnonymousChat: () => void;
  isFastMode: boolean;
  setIsFastMode: (val: boolean) => void;
  onOpenLiveCall?: () => void;
}

export const AssistantChat: React.FC<AssistantChatProps> = (props) => {
  const [inputText, setInputText] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairStep, setRepairStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [props.messages, props.isLoading]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || props.isLoading) return;
    const text = inputText;
    const img = selectedImage;
    setInputText('');
    setSelectedImage(null);
    props.onSendMessage(text, img || undefined);
  };

  const handleRepair = () => {
    setIsRepairing(true);
    setRepairStep(1);
    let step = 1;
    const interval = setInterval(() => {
      step++;
      setRepairStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setIsRepairing(false);
        setIsMenuOpen(false);
        props.onSendMessage('🤖🔧 ¡Mi amor, he verificado y reparado mi sistema por completo! Todo funciona al 100% para ti.');
      }
    }, 1000);
  };

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert('¡URL copiada al portapapeles! 🔗✨');
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('¡URL copiada con éxito! 🔗✨');
      }
    } catch (err) {
      prompt('Copia esta URL para compartir tu app:', window.location.href);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setReactions(p => {
      const existing = p[msgId] || [];
      return { ...p, [msgId]: existing.includes(emoji) ? existing.filter(e => e !== emoji) : [...existing, emoji] };
    });
  };

  const speak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*#_~`\[\]()]/g, ' '));
    u.lang = 'es-ES';
    u.onend = () => setSpeakingMsgId(null);
    setSpeakingMsgId(id);
    window.speechSynthesis.speak(u);
  };

  const toggleSpeech = () => {
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) return;
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const r = new Speech();
    r.lang = 'es-ES';
    r.onstart = () => setIsListening(true);
    r.onresult = (e: any) => setInputText(p => p + ' ' + e.results[0][0].transcript);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
  };

  const emotions: Record<EmotionMode, any> = {
    profesional: { badge: 'Profesional', color: 'bg-stone-100 text-stone-700', heart: '💼' },
    amabilidad: { badge: 'Amabilidad', color: 'bg-blue-50 text-blue-700', heart: '✨' },
    carino: { badge: 'Cariño', color: 'bg-amber-100 text-amber-800', heart: '💛' },
    amabilidad_carino: { badge: 'Amor', color: 'bg-rose-50 text-rose-700', heart: '💕' },
    todos_juntos: { badge: 'Fusión', color: 'bg-amber-100 text-amber-900', heart: '💼✨💛' }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto p-2 sm:p-4 relative">
      <ChatHeader
        isAnonymous={props.isAnonymous}
        onOpenEmotionModal={props.onOpenEmotionModal}
        diaryEntries={props.diaryEntries}
        reminders={props.reminders}
        currentEmotion={emotions[props.emotionMode]}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onOpenLiveCall={props.onOpenLiveCall}
      />

      {isMenuOpen && (
        <div className="absolute top-20 right-4 left-4 sm:left-auto sm:w-80 bg-stone-900/95 backdrop-blur-xl border-2 border-amber-500/50 rounded-3xl p-4 shadow-[0_0_50px_rgba(245,158,11,0.2)] z-50 grid grid-cols-2 gap-3 animate-in fade-in zoom-in duration-200">
          {props.onOpenLiveCall && (
            <button onClick={() => { props.onOpenLiveCall?.(); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/50 rounded-2xl transition-all col-span-2">
              <span className="text-xl mb-1">📞</span>
              <span className="text-xs font-bold text-emerald-300">Llamada de Voz Gemini Live</span>
              <span className="text-[9px] text-emerald-400/80">Tiempo real • 24kHz • Interrupción</span>
            </button>
          )}
          <button onClick={() => { props.onClearChat(); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl transition-all">
            <span className="text-xl mb-1">➕</span>
            <span className="text-[10px] font-bold text-amber-200">Nuevo Chat</span>
          </button>
          <button onClick={handleRepair} className="flex flex-col items-center justify-center p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-2xl transition-all">
            <span className="text-xl mb-1">🔧</span>
            <span className="text-[10px] font-bold text-blue-200">Reparar lo que te dije</span>
          </button>
          <button onClick={handleCopyLink} className="flex flex-col items-center justify-center p-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-2xl transition-all">
            <span className="text-xl mb-1">🔗</span>
            <span className="text-[10px] font-bold text-indigo-200">Copiar URL</span>
          </button>
          <button onClick={() => { props.setIsAnonymous(!props.isAnonymous); setIsMenuOpen(false); }} className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all ${props.isAnonymous ? 'bg-purple-500/20 border-purple-500/50' : 'bg-stone-800 border-stone-700'}`}>
            <span className="text-xl mb-1">🕵️</span>
            <span className="text-[10px] font-bold text-purple-200">{props.isAnonymous ? 'Modo Normal' : 'Modo Anónimo'}</span>
          </button>
          <button onClick={() => { props.setIsFastMode(!props.isFastMode); setIsMenuOpen(false); }} className={`flex flex-col items-center justify-center p-3 border rounded-2xl transition-all ${props.isFastMode ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-stone-800 border-stone-700'}`}>
            <span className="text-xl mb-1">⚡</span>
            <span className="text-[10px] font-bold text-emerald-200">Modo Fast: {props.isFastMode ? 'ON' : 'OFF'}</span>
          </button>
          <button onClick={() => { props.onOpenEmotionModal(); setIsMenuOpen(false); }} className="flex flex-col items-center justify-center p-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-2xl transition-all col-span-2">
            <span className="text-xl mb-1">{emotions[props.emotionMode].heart}</span>
            <span className="text-[10px] font-bold text-rose-200">Cambiar Emoción: {emotions[props.emotionMode].badge}</span>
          </button>
        </div>
      )}

      {isRepairing ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-stone-900/40 rounded-3xl border border-amber-500/20 backdrop-blur-sm">
          <Cpu className="w-16 h-16 animate-spin text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          <div className="text-center">
            <p className="text-lg font-serif font-bold text-amber-100 mb-2">Restaurando Núcleos de Amor...</p>
            <div className="w-64 h-2 bg-stone-800 rounded-full overflow-hidden mx-auto border border-amber-900/50">
              <div className="h-full bg-amber-500 transition-all duration-500 shadow-[0_0_10px_#f59e0b]" style={{ width: `${repairStep * 20}%` }}></div>
            </div>
            <p className="text-xs text-amber-500/70 mt-3 font-mono">Yeikon Protocol: {repairStep * 20}% completed</p>
          </div>
        </div>
      ) : (
        <MessageList
          messages={props.messages}
          isLoading={props.isLoading}
          messagesEndRef={messagesEndRef}
          speakingMsgId={speakingMsgId}
          onSpeak={speak}
          onReaction={toggleReaction}
          reactions={reactions}
          currentEmotionHeart={emotions[props.emotionMode].heart}
          onImageClick={setPreviewImage}
        />
      )}

      <ChatInput
        inputText={inputText}
        setInputText={setInputText}
        onSend={handleSendMessage}
        isLoading={props.isLoading}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        isListening={isListening}
        toggleSpeech={toggleSpeech}
        fileInputRef={fileInputRef}
      />

      {previewImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-full max-h-full">
            <img src={previewImage} alt="Full" className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10" />
            <button className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-all">
              <X className="w-6 h-6" /> Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
