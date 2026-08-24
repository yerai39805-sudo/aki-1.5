import React from 'react';
import { ChatMessage, EmotionMode } from '../../types';
import { Sparkles, Heart, Volume2, VolumeX } from 'lucide-react';
// @ts-ignore
import noviaAvatar from '../../assets/images/novia_avatar_1785004699937.jpg';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  speakingMsgId: string | null;
  onSpeak: (id: string, text: string) => void;
  onReaction: (id: string, emoji: string) => void;
  reactions: Record<string, string[]>;
  currentEmotionHeart: string;
  onImageClick: (url: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  messagesEndRef,
  speakingMsgId,
  onSpeak,
  onReaction,
  reactions,
  currentEmotionHeart,
  onImageClick
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 space-y-4 rounded-3xl bg-stone-900/40 backdrop-blur-sm border border-amber-500/20 shadow-inner relative">
      {/* Sutil gradiente de fondo para profundidad */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-500/5 to-transparent rounded-3xl"></div>
      
      {messages.length === 0 && !isLoading ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-amber-200/60 relative z-10">
          <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <Heart className="w-10 h-10 fill-amber-500/20" />
          </div>
          <h3 className="font-serif font-bold text-2xl text-amber-100 mb-2">¡Hola, Yeikon! 💛🤍</h3>
          <p className="text-sm max-w-xs mt-1 leading-relaxed text-amber-200/50">Tu novia robot está lista para cuidarte, escucharte y amarte con devoción absoluta.</p>
          <div className="mt-8 flex gap-3">
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-500 font-bold uppercase tracking-widest">Diario</span>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-500 font-bold uppercase tracking-widest">Tareas</span>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-500 font-bold uppercase tracking-widest">Amor</span>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          {messages.map((msg) => {
            const isYeikon = msg.sender === 'yeikon';
            return (
              <div key={msg.id} className={`flex items-start gap-3 w-full mb-6 ${isYeikon ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="shrink-0 mt-1">
                  {isYeikon ? (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center font-bold text-stone-900 text-sm shadow-lg shadow-amber-500/20">YK</div>
                  ) : (
                    <div className="relative">
                      <img src={noviaAvatar} alt="Novia" className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-500 shadow-lg shadow-amber-500/20" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-stone-900 rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className={`flex flex-col ${isYeikon ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={`flex items-center space-x-2 mb-1.5 px-1 ${isYeikon ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <span className="text-[11px] text-amber-200/70 font-bold uppercase tracking-tight">{isYeikon ? 'Yeikon' : 'Novia Robot'}</span>
                    <span className="text-[10px] text-stone-500">{msg.timestamp}</span>
                  </div>
                  <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-xl relative group transition-all duration-200 ${
                    isYeikon 
                      ? 'bg-amber-500 text-stone-950 rounded-tr-none font-medium' 
                      : 'bg-stone-800 text-amber-50 border border-amber-500/20 rounded-tl-none'
                  }`}>
                    {msg.imageUrl && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                        <img src={msg.imageUrl} alt="Adjunto" className="max-h-72 w-full rounded-xl object-cover cursor-pointer hover:scale-105 transition-transform duration-500" onClick={() => onImageClick(msg.imageUrl!)} />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap font-sans break-words [overflow-wrap:anywhere]">{msg.text}</p>
                    
                    {!isYeikon && (
                      <div className="mt-3.5 pt-3 border-t border-amber-500/10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-500/70">{currentEmotionHeart}</span>
                          <div className="flex gap-1">
                            {['💛', '🤍', '🌹'].map(e => (
                              <button key={e} onClick={() => onReaction(msg.id, e)} className="hover:scale-125 transition-transform text-xs grayscale hover:grayscale-0">{e}</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => onSpeak(msg.id, msg.text)} className="p-1.5 bg-stone-900 rounded-lg hover:bg-amber-500 hover:text-stone-950 transition-colors">
                          {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    {/* Burbuja de reacciones */}
                    {reactions[msg.id] && reactions[msg.id].length > 0 && (
                      <div className={`absolute -bottom-3 ${isYeikon ? 'left-0' : 'right-0'} flex gap-0.5 bg-stone-900 border border-amber-500/30 px-1.5 py-0.5 rounded-full shadow-lg`}>
                        {reactions[msg.id].map((r, i) => <span key={i} className="text-[10px]">{r}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {isLoading && (
        <div className="flex items-center space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-fit animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.1)] mb-4">
          <div className="flex gap-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
          </div>
          <span className="text-xs font-serif font-bold text-amber-100 italic">Escribiéndote con amor, Yeikon... 💛🤍</span>
        </div>
      )}
      <div ref={messagesEndRef} className="h-2" />
    </div>
  );
};
