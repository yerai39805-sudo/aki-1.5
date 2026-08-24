export type EmotionMode = 'amabilidad' | 'carino' | 'amabilidad_carino' | 'profesional' | 'todos_juntos';

export type EntryCategory = 'Reflexión' | 'Actividad' | 'Plan' | 'Nota' | 'Especial';
export type EntryMood = 'Tranquilo' | 'Alegre' | 'Inspirado' | 'Cansado' | 'Agradecido' | 'Nostálgico';

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string;
  category: EntryCategory;
  mood: EntryMood;
  location?: string;
  tags: string[];
  starred: boolean;
  reflectionByAssistant?: string;
  createdAt: number;
}

export type ReminderCategory = 'General' | 'Telde' | 'Tejeda' | 'Tejina' | 'Valle de Guerra' | 'Bajamar' | 'La Punta' | 'Tacoronte' | 'Telde/Tejeda' | 'Personal' | 'Trabajo' | 'Salud';
export type PriorityLevel = 'Alta' | 'Media' | 'Baja';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  time?: string;
  category: ReminderCategory;
  priority: PriorityLevel;
  completed: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'yeikon' | 'asistente';
  text: string;
  imageUrl?: string;
  timestamp: string;
  emotionMode: EmotionMode;
  provider?: 'chatgpt' | 'gemini' | 'minimax' | 'fallback';
}

export interface CanariasPlace {
  id: string;
  name: string;
  zone: 'Telde' | 'Tejeda' | 'Gran Canaria' | 'Otras Islas';
  category: 'Historia' | 'Naturaleza' | 'Playa' | 'Gastronomía' | 'Cultura';
  shortDesc: string;
  fullDesc: string;
  highlights: string[];
  tips: string;
  imageUrl: string;
  badge?: string;
}

export type ContactCategory = 'Amigos' | 'Familia' | 'Trabajo' | 'Canarias' | 'Otros';

export interface FriendContact {
  id: string;
  name: string;
  phone: string;
  countryCode: string; // e.g. "+34"
  category: ContactCategory;
  nickname?: string;
  notes?: string;
  starred?: boolean;
  avatarColor?: string;
  createdAt: number;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  text: string;
  category: 'Saludo' | 'Quedada' | 'Recordatorio' | 'Cariño' | 'Canarias' | 'Rapido';
}
