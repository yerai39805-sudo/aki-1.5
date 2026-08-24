import { useState, useCallback } from 'react';
import { ChatMessage, EmotionMode, DiaryEntry, Reminder } from '../types';
import { useLocalStorage } from './useLocalStorage';

export function useChat(emotionMode: EmotionMode, diaryEntries: DiaryEntry[], reminders: Reminder[]) {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('yeikon_chat_messages', [
    {
      id: 'welcome-1',
      sender: 'asistente',
      text: 'Hola Yeikon. Es un placer saludarte en nuestro espacio de organización personal. Estoy lista para asistirte de manera profesional, ayudarte a estructurar tus tareas, registrar tus reflexiones y memorias de Canarias en tu diario, y acompañarte de forma útil. ¿En qué te gustaría que colaboremos hoy? 💼✨',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotionMode: 'profesional',
    },
  ]);

  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isFastMode, setIsFastMode] = useState<boolean>(false);
  const [anonymousMessages, setAnonymousMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-anon',
      sender: 'asistente',
      text: '🕵️ ¡Modo Anónimo Activado, Yeikon! Esta conversación es completamente privada, secreta y temporal. Las palabras que compartas aquí no se guardarán en tu historial ni se registrarán en tu memoria local. Al desactivar este modo, este chat desaparecerá por completo. Siéntete libre de expresarte sin filtros. 🤍🔒',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emotionMode: 'profesional',
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const formatContext = useCallback(() => ({
    diaryContext: diaryEntries.length ? diaryEntries.slice(0, 5).map(e => `- [${e.date}] ${e.title}: ${e.content}`).join('\n') : 'Vacío.',
    remindersContext: reminders.filter(r => !r.completed).length ? reminders.filter(r => !r.completed).map(r => `- [${r.dueDate}] ${r.title}`).join('\n') : 'Ninguno.'
  }), [diaryEntries, reminders]);

  const handleSendMessage = async (text: string, imageUrl?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { 
      id: `msg-${Date.now()}`, 
      sender: 'yeikon', 
      text: text || (imageUrl ? '📷 Imagen' : ''), 
      imageUrl, 
      timestamp, 
      emotionMode 
    };

    if (isAnonymous) setAnonymousMessages(p => [...p, userMsg]);
    else setMessages(p => [...p, userMsg]);
    
    setIsLoading(true);
    try {
      const { diaryContext, remindersContext } = formatContext();
      const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || (imageUrl ? 'Te he enviado una foto' : ''),
          imageUrl,
          emotionMode,
          history: (isAnonymous ? anonymousMessages : messages).slice(-15),
          diaryContext,
          remindersContext,
          isFastMode,
          userTime,
          userDate,
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'asistente',
        text: data.reply || 'Aquí estoy contigo, Yeikon.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotionMode,
        provider: data.provider,
      };

      if (isAnonymous) setAnonymousMessages(p => [...p, assistantMsg]);
      else setMessages(p => [...p, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { id: `msg-${Date.now() + 1}`, sender: 'asistente', text: 'Ocurrió un error, pero sigo aquí para ti.', timestamp, emotionMode };
      if (isAnonymous) setAnonymousMessages(p => [...p, errorMsg]);
      else setMessages(p => [...p, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'asistente',
        text: '¡Conversación restablecida, Yeikon! Estoy aquí lista para continuar asistiéndote en la organización de tus tareas, notas y recuerdos con la máxima eficiencia.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotionMode,
      },
    ]);
  };

  const handleClearAnonymousChat = () => {
    setAnonymousMessages([
      {
        id: `welcome-anon-${Date.now()}`,
        sender: 'asistente',
        text: '🕵️ Conversación anónima reiniciada. Tus secretos temporales siguen estando a salvo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        emotionMode,
      }
    ]);
  };

  return {
    messages: isAnonymous ? anonymousMessages : messages,
    isLoading,
    isAnonymous,
    setIsAnonymous,
    isFastMode,
    setIsFastMode,
    handleSendMessage,
    handleClearChat,
    handleClearAnonymousChat
  };
}
