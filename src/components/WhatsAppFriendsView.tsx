import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Send,
  Sparkles,
  Star,
  Edit2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Users,
  Zap,
  BookOpen,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  Heart,
  Coffee,
  Bus,
  Smile,
  X,
} from 'lucide-react';
import { FriendContact, ContactCategory, EmotionMode } from '../types';
import {
  COUNTRY_CODES,
  cleanPhoneNumber,
  buildWhatsAppUrl,
} from '../hooks/useContacts';

interface WhatsAppFriendsViewProps {
  contacts: FriendContact[];
  onAddContact: (contact: Omit<FriendContact, 'id' | 'createdAt'>) => void;
  onUpdateContact: (id: string, updatedFields: Partial<FriendContact>) => void;
  onDeleteContact: (id: string) => void;
  onToggleStarContact: (id: string) => void;
  onResetContacts: () => void;
  emotionMode: EmotionMode;
  onAskAssistantInChat?: (message: string) => void;
}

const TEMPLATES = [
  {
    id: 't-saludo',
    title: 'Saludo amistoso',
    category: 'Saludo',
    icon: '👋',
    text: '¡Hola! ¿Cómo estás? Hace tiempo que no hablamos, a ver si nos vemos pronto y nos ponemos al día ☕✨',
  },
  {
    id: 't-quedada-canarias',
    title: 'Quedar en Tenerife',
    category: 'Quedada',
    icon: '🌋',
    text: '¡Hola! ¿Qué tal todo? ¿Te apetece quedar este fin de semana para tomar un café o picar algo por aquí? 🏖️🍻',
  },
  {
    id: 't-guaguas-titsa',
    title: 'Horario Guaguas TITSA',
    category: 'Canarias',
    icon: '🚌',
    text: '¡Buenas! Te paso el dato de las guaguas de TITSA para cuando nos movamos entre Tejina, La Laguna y Santa Cruz 🚌🕒',
  },
  {
    id: 't-recordatorio',
    title: 'Recordatorio amable',
    category: 'Recordatorio',
    icon: '📝',
    text: '¡Hola! Te escribo para recordarte lo que hablamos el otro día. Cuando tengas un ratito libre me comentas 👍',
  },
  {
    id: 't-carino',
    title: 'Mensaje de cariño',
    category: 'Cariño',
    icon: '💖',
    text: '¡Hola! Solo quería pasar por aquí para saludarte y desearte un día maravilloso y lleno de buenas noticias 🌸🤍',
  },
  {
    id: 't-canario-puro',
    title: 'Estilo Canario (Mi niño/a)',
    category: 'Canarias',
    icon: '🌴',
    text: '¡Qué pasa mi gente! ¿Cómo va todo? A ver si cuadramos un enyesque o nos echamos unas risas pronto 🌋✨',
  },
];

export const WhatsAppFriendsView: React.FC<WhatsAppFriendsViewProps> = ({
  contacts,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onToggleStarContact,
  onResetContacts,
  emotionMode,
  onAskAssistantInChat,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<FriendContact | null>(() => contacts[0] || null);

  // Quick Direct Messaging (to any number)
  const [directPhone, setDirectPhone] = useState('');
  const [directCountryCode, setDirectCountryCode] = useState('+34');
  const [directName, setDirectName] = useState('');
  const [directSaveAsContact, setDirectSaveAsContact] = useState(false);

  // Message composer
  const [messageText, setMessageText] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // AI Generator state
  const [aiTone, setAiTone] = useState<'amistoso' | 'divertido' | 'canario' | 'carinoso' | 'formal' | 'directo'>('amistoso');
  const [aiIntention, setAiIntention] = useState<'saludo' | 'quedada' | 'recordatorio' | 'canario' | 'carinoso'>('saludo');
  const [aiCustomDetail, setAiCustomDetail] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Modal for Add / Edit contact
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<FriendContact | null>(null);
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountryCode, setFormCountryCode] = useState('+34');
  const [formCategory, setFormCategory] = useState<ContactCategory>('Amigos');
  const [formNotes, setFormNotes] = useState('');
  const [formStarred, setFormStarred] = useState(false);
  const [formError, setFormError] = useState('');

  // Filtering contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nickname && c.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'starred') return c.starred;
    return c.category === selectedCategory;
  });

  // Open modal for new contact
  const handleOpenAddModal = () => {
    setEditingContact(null);
    setFormName('');
    setFormNickname('');
    setFormPhone('');
    setFormCountryCode('+34');
    setFormCategory('Amigos');
    setFormNotes('');
    setFormStarred(false);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (contact: FriendContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormNickname(contact.nickname || '');
    setFormPhone(contact.phone);
    setFormCountryCode(contact.countryCode || '+34');
    setFormCategory(contact.category);
    setFormNotes(contact.notes || '');
    setFormStarred(!!contact.starred);
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Contact form
  const handleSaveContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Por favor escribe el nombre del amigo o contacto.');
      return;
    }
    if (!formPhone.trim()) {
      setFormError('Por favor introduce el número de teléfono.');
      return;
    }

    if (editingContact) {
      onUpdateContact(editingContact.id, {
        name: formName.trim(),
        nickname: formNickname.trim() || undefined,
        phone: formPhone.trim(),
        countryCode: formCountryCode,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        starred: formStarred,
      });
      if (selectedContact?.id === editingContact.id) {
        setSelectedContact({
          ...editingContact,
          name: formName.trim(),
          nickname: formNickname.trim() || undefined,
          phone: formPhone.trim(),
          countryCode: formCountryCode,
          category: formCategory,
          notes: formNotes.trim() || undefined,
          starred: formStarred,
        });
      }
    } else {
      const newContact = {
        name: formName.trim(),
        nickname: formNickname.trim() || undefined,
        phone: formPhone.trim(),
        countryCode: formCountryCode,
        category: formCategory,
        notes: formNotes.trim() || undefined,
        starred: formStarred,
      };
      onAddContact(newContact);
    }

    setIsModalOpen(false);
  };

  // Send WhatsApp message to selected friend or direct number
  const handleSendWhatsApp = (phone: string, countryCode: string = '+34', text: string = '') => {
    const url = buildWhatsAppUrl(phone, text, countryCode);
    if (!url) {
      alert('Por favor introduce un número de teléfono válido.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Copy text to clipboard
  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Copy wa.me link
  const handleCopyLink = (phone: string, countryCode: string, text: string) => {
    const url = buildWhatsAppUrl(phone, text, countryCode);
    if (!url) return;
    navigator.clipboard.writeText(url);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  // AI Message Generator via backend
  const handleGenerateAiMessage = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-wa-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: selectedContact ? selectedContact.name : directName || 'amigo',
          contactCategory: selectedContact ? selectedContact.category : 'Amigos',
          tone: aiTone,
          intention: aiIntention,
          customPrompt: aiCustomDetail,
          emotionMode,
        }),
      });
      const data = await res.json();
      if (data?.message) {
        setMessageText(data.message);
      }
    } catch (err) {
      console.error('Error generating AI WhatsApp message:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Active target phone and country code
  const currentTargetPhone = selectedContact ? selectedContact.phone : directPhone;
  const currentTargetCountryCode = selectedContact ? selectedContact.countryCode || '+34' : directCountryCode;
  const currentTargetName = selectedContact ? selectedContact.name : (directName || 'Número Directo');
  const cleanNumberPreview = cleanPhoneNumber(currentTargetPhone, currentTargetCountryCode);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900/90 to-emerald-950/40 border border-emerald-500/20 p-5 sm:p-7 shadow-xl shadow-black/40">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-10 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
                <Send className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight flex items-center space-x-2">
                <span>Amigos y WhatsApp</span>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  wa.me Directo
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
              Guarda los números de teléfono de tus amigos, redacta mensajes personalizados con la ayuda de Aki y envíalos directamente a WhatsApp con un solo clic.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-medium shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Añadir Amigo / Número</span>
            </button>
            <button
              onClick={() => {
                setSelectedContact(null);
                setDirectPhone('');
                setDirectName('');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                !selectedContact
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700/80'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Número Rápido</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Friends List & Direct input) / Right Column (Message Composer & AI & WhatsApp Send) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Contacts Directory (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-800 p-4 space-y-3 shadow-lg">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, apodo o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'Todos', count: contacts.length },
                { id: 'starred', label: '⭐ Favoritos', count: contacts.filter((c) => c.starred).length },
                { id: 'Amigos', label: 'Amigos' },
                { id: 'Familia', label: 'Familia' },
                { id: 'Canarias', label: 'Tenerife' },
                { id: 'Trabajo', label: 'Trabajo' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedCategory(filter.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer text-[11px] ${
                    selectedCategory === filter.id
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'bg-stone-950/60 border border-stone-800/80 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {filter.label} {filter.count !== undefined ? `(${filter.count})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Direct Number Option Card */}
          <div
            onClick={() => {
              setSelectedContact(null);
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              !selectedContact
                ? 'bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-stone-900 border-amber-500/40 shadow-md shadow-amber-500/10'
                : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-stone-200">Escribir a Cualquier Número</h4>
                <p className="text-[11px] text-stone-400">Sin necesidad de guardar el contacto</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Rápido
            </span>
          </div>

          {/* Contacts List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredContacts.length === 0 ? (
              <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/80 space-y-3">
                <Users className="w-8 h-8 mx-auto text-stone-600" />
                <p className="text-xs text-stone-400">No se encontraron amigos con ese criterio.</p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-600/50 cursor-pointer"
                >
                  + Añadir nuevo amigo
                </button>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`group p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-950/40 via-stone-900 to-stone-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-stone-900/70 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div
                          className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${
                            contact.avatarColor || 'from-emerald-500 to-teal-600'
                          } flex items-center justify-center text-white font-bold text-sm shadow-md`}
                        >
                          {contact.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="text-xs font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                              {contact.name}
                            </h4>
                            {contact.nickname && (
                              <span className="text-[10px] text-stone-400 italic">
                                ({contact.nickname})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-stone-400">
                            <span className="font-mono text-emerald-400/90 font-medium">
                              {contact.countryCode || '+34'} {contact.phone}
                            </span>
                            <span>•</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-800 text-stone-300 border border-stone-700/60">
                              {contact.category}
                            </span>
                          </div>
                          {contact.notes && (
                            <p className="text-[10px] text-stone-500 truncate max-w-[200px]">
                              {contact.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Icons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStarContact(contact.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            contact.starred ? 'text-amber-400 hover:text-amber-300' : 'text-stone-600 hover:text-stone-400'
                          }`}
                          title="Favorito"
                        >
                          <Star className={`w-3.5 h-3.5 ${contact.starred ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(contact);
                          }}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                          title="Editar contacto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WhatsApp Message Composer & AI Assistant (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target Contact Header / Direct Input Card */}
          <div className="bg-stone-900/90 backdrop-blur-md rounded-2xl border border-stone-800 p-4.5 space-y-4 shadow-xl">
            {selectedContact ? (
              /* Selected Friend Banner */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${
                      selectedContact.avatarColor || 'from-emerald-500 to-teal-600'
                    } flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/15`}
                  >
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm sm:text-base font-bold text-stone-100">
                        {selectedContact.name}
                      </h3>
                      {selectedContact.nickname && (
                        <span className="text-xs text-amber-300 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                          {selectedContact.nickname}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {selectedContact.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {selectedContact.countryCode || '+34'} {selectedContact.phone}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        (WhatsApp ID: {cleanPhoneNumber(selectedContact.phone, selectedContact.countryCode || '+34')})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEditModal(selectedContact)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar a ${selectedContact.name} de tus amigos?`)) {
                        onDeleteContact(selectedContact.id);
                        setSelectedContact(contacts.find((c) => c.id !== selectedContact.id) || null);
                      }
                    }}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Eliminar amigo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Direct Phone Input Form */
              <div className="space-y-3 pb-3 border-b border-stone-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-stone-100">Mensaje Rápido a Cualquier Número</h3>
                  </div>
                  <span className="text-[10px] text-stone-400">Escribe el número y envía al instante</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] text-stone-400 mb-1">Nombre o referencia (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej. Antonio"
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-stone-400 mb-1">Prefijo País</label>
                    <select
                      value={directCountryCode}
                      onChange={(e) => setDirectCountryCode(e.target.value)}
                      className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] text-stone-400 mb-1">Número de Teléfono *</label>
                    <input
                      type="tel"
                      placeholder="Ej. 612345678"
                      value={directPhone}
                      onChange={(e) => setDirectPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 font-mono focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                {directPhone && (
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-stone-400">
                      Destino WhatsApp: <span className="font-mono text-emerald-400 font-bold">{cleanPhoneNumber(directPhone, directCountryCode)}</span>
                    </span>
                    <button
                      onClick={() => {
                        if (!directPhone) return;
                        onAddContact({
                          name: directName || 'Nuevo Amigo',
                          phone: directPhone,
                          countryCode: directCountryCode,
                          category: 'Amigos',
                        });
                        alert('¡Contacto guardado en tu lista de amigos!');
                      }}
                      className="text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      + Guardar en mi lista de amigos
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Message Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-200 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mensaje de WhatsApp a redactar:</span>
                </label>
                <span className="text-[10px] text-stone-500 font-mono">
                  {messageText.length} caracteres
                </span>
              </div>

              <textarea
                rows={4}
                placeholder={`Escribe aquí el mensaje para ${currentTargetName}... (Ej: ¡Hola! ¿Qué tal estás? A ver si nos vemos pronto por Tenerife ☕✨)`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full p-3.5 bg-stone-950 border border-stone-800 rounded-2xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
              />

              {/* Formatting Helper Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-stone-400">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-stone-500">Formato WhatsApp:</span>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => `${prev} *negrita*`)}
                    className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold cursor-pointer"
                    title="Negrita"
                  >
                    *B*
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => `${prev} _cursiva_`)}
                    className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 italic cursor-pointer"
                    title="Cursiva"
                  >
                    _I_
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => `${prev} ~tachado~`)}
                    className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 line-through cursor-pointer"
                    title="Tachado"
                  >
                    ~S~
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => `${prev} ☕`)}
                    className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 cursor-pointer"
                  >
                    ☕
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => `${prev} 🌋`)}
                    className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 cursor-pointer"
                  >
                    🌋
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageText((prev) => `${prev} 💖`)}
                    className="px-1.5 py-0.5 rounded bg-stone-800 hover:bg-stone-700 cursor-pointer"
                  >
                    💖
                  </button>
                </div>

                {messageText && (
                  <button
                    onClick={() => setMessageText('')}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Limpiar texto
                  </button>
                )}
              </div>
            </div>

            {/* SEND WHATSAPP PRIMARY BUTTON & COPY ACTIONS */}
            <div className="pt-2 space-y-2.5">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => handleSendWhatsApp(currentTargetPhone, currentTargetCountryCode, messageText)}
                  disabled={!currentTargetPhone}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar Mensaje por WhatsApp</span>
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </button>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleCopyText(messageText)}
                    disabled={!messageText}
                    title="Copiar texto del mensaje"
                    className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(currentTargetPhone, currentTargetCountryCode, messageText)}
                    disabled={!currentTargetPhone}
                    title="Copiar enlace directo wa.me"
                    className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLinkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <ExternalLink className="w-4 h-4" />}
                    <span>{isLinkCopied ? '¡Enlace listo!' : 'Copiar Enlace'}</span>
                  </button>
                </div>
              </div>

              {/* URL Preview */}
              {currentTargetPhone && (
                <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] flex items-center justify-between text-stone-400">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-emerald-400 font-semibold">Enlace generado:</span>
                    <span className="font-mono text-stone-300 truncate">
                      https://wa.me/{cleanNumberPreview}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Listo para abrir
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI ASSISTANT & QUICK TEMPLATES ACCORDION / BOX */}
          <div className="bg-stone-900/70 backdrop-blur-md rounded-2xl border border-stone-800 p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-100 flex items-center space-x-1.5">
                    <span>Asistente Aki: Redactar Mensaje WhatsApp con IA</span>
                  </h4>
                  <p className="text-[10px] text-stone-400">
                    Aki redacta el mensaje ideal para tu amigo según el tono que elijas
                  </p>
                </div>
              </div>
            </div>

            {/* AI Generator Controls */}
            <div className="space-y-3 bg-stone-950/60 p-3.5 rounded-xl border border-stone-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Tone */}
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Tono del mensaje:</label>
                  <select
                    value={aiTone}
                    onChange={(e: any) => setAiTone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="amistoso">✨ Amistoso y Cercano</option>
                    <option value="canario">🌋 Modo Canario (Tenerife / Islas)</option>
                    <option value="divertido">😄 Alegre y Divertido</option>
                    <option value="carinoso">💖 Cariñoso y Afectuoso</option>
                    <option value="formal">💼 Educado y Formal</option>
                    <option value="directo">⚡ Breve y Directo</option>
                  </select>
                </div>

                {/* Intention */}
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">Motivo / Intención:</label>
                  <select
                    value={aiIntention}
                    onChange={(e: any) => setAiIntention(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="saludo">👋 Saludo general / Saber cómo está</option>
                    <option value="quedada">☕ Quedar para tomar un café o picar algo</option>
                    <option value="canario">🌴 Saludo canario / Enyesque / Risa</option>
                    <option value="recordatorio">📝 Recordatorio de un asunto o plan</option>
                    <option value="carinoso">💖 Darle ánimos / Mensaje de cariño</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 mb-1">Detalle extra que quieras añadir (opcional):</label>
                <input
                  type="text"
                  placeholder="Ej. 'Dile que estuve en Bajamar' o 'Pregúntale si libra el sábado'..."
                  value={aiCustomDetail}
                  onChange={(e) => setAiCustomDetail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAiMessage}
                disabled={isGeneratingAi}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-medium text-xs shadow-md shadow-amber-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isGeneratingAi
                    ? 'Aki está redactando el mensaje...'
                    : `✨ Redactar Mensaje para ${currentTargetName}`}
                </span>
              </button>
            </div>

            {/* Quick Pre-made Templates */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-stone-300">
                O elige una plantilla rápida (1-clic para rellenar):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      const customized = tpl.text.replace('¡Hola!', `¡Hola ${currentTargetName !== 'Número Directo' ? currentTargetName : ''}!`);
                      setMessageText(customized);
                    }}
                    className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/80 hover:border-emerald-500/40 hover:bg-stone-900 text-left transition-all cursor-pointer space-y-1 group"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-200 group-hover:text-emerald-300">
                      <span>{tpl.icon}</span>
                      <span>{tpl.title}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-2">
                      {tpl.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT CONTACT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-100">
                  {editingContact ? 'Editar Contacto' : 'Añadir Amigo / Contacto'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveContactForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Santana"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Apodo / Alias (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Carlitos"
                    value={formNickname}
                    onChange={(e) => setFormNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-stone-300 font-medium mb-1">País / Prefijo</label>
                  <select
                    value={formCountryCode}
                    onChange={(e) => setFormCountryCode(e.target.value)}
                    className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500/50"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-7">
                  <label className="block text-stone-300 font-medium mb-1">Número de Teléfono *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 612345678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Amigos">👥 Amigos</option>
                    <option value="Familia">🏡 Familia</option>
                    <option value="Canarias">🌋 Tenerife / Canarias</option>
                    <option value="Trabajo">💼 Trabajo</option>
                    <option value="Otros">✨ Otros</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer text-stone-300">
                    <input
                      type="checkbox"
                      checked={formStarred}
                      onChange={(e) => setFormStarred(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>⭐ Marcar como Favorito</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-medium mb-1">Notas / Detalles (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Amigo de Tejina, quedamos para pasear o café..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
                >
                  {editingContact ? 'Guardar Cambios' : 'Añadir Amigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
