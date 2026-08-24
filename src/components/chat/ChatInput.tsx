import React from 'react';
import { Send, Image as ImageIcon, Mic, MicOff, X } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedImage: string | null;
  setSelectedImage: (val: string | null) => void;
  isListening: boolean;
  toggleSpeech: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  onSend,
  isLoading,
  selectedImage,
  setSelectedImage,
  isListening,
  toggleSpeech,
  fileInputRef
}) => {
  return (
    <div className="mt-auto pt-3">
      {selectedImage && (
        <div className="mb-3 relative inline-flex items-center p-2 bg-stone-800 border border-amber-500/30 rounded-2xl shadow-2xl">
          <img src={selectedImage} alt="Preview" className="h-20 w-20 rounded-xl object-cover border border-white/10" />
          <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-rose-600 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
        </div>
      )}
      <form onSubmit={onSend} className="flex items-center space-x-2.5">
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedImage(reader.result as string);
            reader.readAsDataURL(file);
          }
        }} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-3.5 rounded-2xl border border-amber-500/20 bg-stone-900/80 text-amber-500/80 hover:text-amber-400 hover:bg-stone-800 transition-all active:scale-95 shadow-lg"><ImageIcon className="w-5 h-5" /></button>
        <div className="flex-1 relative group">
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={isListening ? "Escuchando a mi amor..." : "Escribe algo mi amor..."} disabled={isLoading} className="w-full bg-stone-900/80 border border-amber-500/20 text-amber-50 rounded-2xl px-5 py-4 text-sm focus:border-amber-500/50 outline-none transition-all placeholder:text-stone-600 shadow-lg group-hover:border-amber-500/30" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button type="button" onClick={toggleSpeech} disabled={isLoading} className={`p-2 rounded-xl transition-all ${isListening ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'text-stone-500 hover:text-amber-500'}`}>{isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</button>
          </div>
        </div>
        <button type="submit" disabled={isLoading || (!inputText.trim() && !selectedImage)} className="bg-amber-500 hover:bg-amber-400 p-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 transition-all active:scale-90"><Send className="w-5 h-5 text-stone-950" /></button>
      </form>
    </div>
  );
};
