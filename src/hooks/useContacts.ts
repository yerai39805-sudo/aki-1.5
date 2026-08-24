import { useLocalStorage } from './useLocalStorage';
import { FriendContact } from '../types';

export const INITIAL_CONTACTS: FriendContact[] = [
  {
    id: 'c1',
    name: 'Carlos Santana',
    nickname: 'Carlitos',
    phone: '612345678',
    countryCode: '+34',
    category: 'Amigos',
    notes: 'Amigo de Tenerife. Quedamos a veces para café en La Laguna o Bajamar.',
    starred: true,
    avatarColor: 'from-emerald-500 to-teal-600',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'c2',
    name: 'Laura Martín',
    nickname: 'Lau',
    phone: '654987321',
    countryCode: '+34',
    category: 'Amigos',
    notes: 'Compañera de proyectos y salidas. Le gusta la tecnología y la fotografía.',
    starred: true,
    avatarColor: 'from-amber-500 to-orange-600',
    createdAt: Date.now() - 800000,
  },
  {
    id: 'c3',
    name: 'Juan José Pérez',
    nickname: 'Juanjo',
    phone: '678123456',
    countryCode: '+34',
    category: 'Canarias',
    notes: 'Vecino de Tejina. Sabe mucho de rutas por Anaga y las guaguas de TITSA.',
    starred: false,
    avatarColor: 'from-blue-500 to-indigo-600',
    createdAt: Date.now() - 600000,
  },
];

export const COUNTRY_CODES = [
  { code: '+34', name: 'España / Canarias (+34)', flag: '🇪🇸' },
  { code: '+1', name: 'EE.UU. / Canadá (+1)', flag: '🇺🇸' },
  { code: '+52', name: 'México (+52)', flag: '🇲🇽' },
  { code: '+54', name: 'Argentina (+54)', flag: '🇦🇷' },
  { code: '+57', name: 'Colombia (+57)', flag: '🇨🇴' },
  { code: '+56', name: 'Chile (+56)', flag: '🇨🇱' },
  { code: '+58', name: 'Venezuela (+58)', flag: '🇻🇪' },
  { code: '+51', name: 'Perú (+51)', flag: '🇵🇪' },
  { code: '+44', name: 'Reino Unido (+44)', flag: '🇬🇧' },
  { code: '+49', name: 'Alemania (+49)', flag: '🇩🇪' },
  { code: '+33', name: 'Francia (+33)', flag: '🇫🇷' },
  { code: '+39', name: 'Italia (+39)', flag: '🇮🇹' },
  { code: '+81', name: 'Japón (+81)', flag: '🇯🇵' },
];

export function cleanPhoneNumber(phone: string, countryCode: string = '+34'): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
    return cleaned;
  }
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
    return cleaned;
  }
  const cleanCode = countryCode.replace('+', '');
  if (cleaned.startsWith(cleanCode)) {
    return cleaned;
  }
  return `${cleanCode}${cleaned}`;
}

export function buildWhatsAppUrl(phone: string, text: string = '', countryCode: string = '+34'): string {
  const cleanPhone = cleanPhoneNumber(phone, countryCode);
  if (!cleanPhone) return '';
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (!text.trim()) return baseUrl;
  return `${baseUrl}?text=${encodeURIComponent(text.trim())}`;
}

export function useContacts() {
  const [contacts, setContacts] = useLocalStorage<FriendContact[]>('yeikon_friends_contacts', INITIAL_CONTACTS);

  const addContact = (contact: Omit<FriendContact, 'id' | 'createdAt'>) => {
    const avatarGradients = [
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600',
    ];
    const randomAvatar = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

    const newContact: FriendContact = {
      ...contact,
      id: `contact-${Date.now()}`,
      avatarColor: contact.avatarColor || randomAvatar,
      createdAt: Date.now(),
    };
    setContacts((prev) => [newContact, ...prev]);
    return newContact;
  };

  const updateContact = (id: string, updatedFields: Partial<FriendContact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleStarContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c))
    );
  };

  const resetToDefaultContacts = () => {
    setContacts(INITIAL_CONTACTS);
  };

  return {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    toggleStarContact,
    resetToDefaultContacts,
  };
}
