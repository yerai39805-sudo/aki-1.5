import React, { useState } from 'react';
import { DiaryEntry, EntryCategory, EntryMood, EmotionMode } from '../types';
import { BookOpen, Plus, Search, Star, Tag, MapPin, Calendar, Sparkles, Filter, Trash2, Heart, Volume2, ChevronRight, X, Edit2, HelpCircle, Lightbulb } from 'lucide-react';
import { YEIKON_CURIOSITIES, Curiosity } from '../data/curiosities';
// @ts-ignore
import diaryBanner from '../assets/images/diary_banner_1785004712905.jpg';

interface DiaryBookProps {
  entries: DiaryEntry[];
  onAddEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteEntry: (id: string) => void;
  onToggleStar: (id: string) => void;
  onAskAssistantAboutEntry: (entry: DiaryEntry) => void;
  emotionMode: EmotionMode;
}

export const DiaryBook: React.FC<DiaryBookProps> = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  onToggleStar,
  onAskAssistantAboutEntry,
  emotionMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'book'>('cards');
  const [diarySubTab, setDiarySubTab] = useState<'recuerdos' | 'curiosidades'>('recuerdos');
  const [curiosityCategory, setCuriosityCategory] = useState<string>('all');
  const [revealedCuriosities, setRevealedCuriosities] = useState<Record<string, boolean>>({});

  // Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);

  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<EntryCategory>('Reflexión');
  const [newMood, setNewMood] = useState<EntryMood>('Tranquilo');
  const [newLocation, setNewLocation] = useState('Telde');
  const [newTags, setNewTags] = useState('Telde, Recuerdos');
  const [newStarred, setNewStarred] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);

  const categories: EntryCategory[] = ['Reflexión', 'Actividad', 'Plan', 'Nota', 'Especial'];
  const moods: EntryMood[] = ['Tranquilo', 'Alegre', 'Inspirado', 'Cansado', 'Agradecido', 'Nostálgico'];

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.location && entry.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    const matchesStar = !onlyStarred || entry.starred;

    return matchesSearch && matchesCategory && matchesMood && matchesStar;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsGeneratingReflection(true);
    let reflectionText = '';

    try {
      const res = await fetch('/api/generate-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteTitle: newTitle,
          noteContent: newContent,
          emotionMode,
        }),
      });
      const data = await res.json();
      reflectionText = data.reflection;
    } catch (err) {
      reflectionText = `¡Un día muy hermoso guardado en tu libro, Yeikon! Me encanta acompañarte.`;
    } finally {
      setIsGeneratingReflection(false);
    }

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await onAddEntry({
      date: newDate,
      title: newTitle,
      content: newContent,
      category: newCategory,
      mood: newMood,
      location: newLocation,
      tags: tagsArray,
      starred: newStarred,
      reflectionByAssistant: reflectionText,
    });

    // Reset form
    setNewTitle('');
    setNewContent('');
    setIsNewModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 pb-24 md:pb-8">
      {/* Decorative Panoramic Cover Banner */}
      <div className="w-full h-40 sm:h-52 rounded-3xl overflow-hidden mb-6 border border-stone-800/80 shadow-2xl relative group">
        <img
          src={diaryBanner}
          alt="Libro de Días"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent flex items-end p-5 sm:p-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 backdrop-blur-md">
              Gran Canaria 🏝️
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 backdrop-blur-md">
              Telde y Tejeda
            </span>
          </div>
        </div>
      </div>

      {/* Subtab Selector: Recuerdos vs Curiosidades */}
      <div className="flex space-x-2 bg-stone-900/60 p-1.5 rounded-2xl border border-stone-800/80 mb-6 max-w-md">
        <button
          onClick={() => setDiarySubTab('recuerdos')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer ${
            diarySubTab === 'recuerdos'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>MIS RECUERDOS</span>
        </button>
        <button
          onClick={() => setDiarySubTab('curiosidades')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer ${
            diarySubTab === 'curiosidades'
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-300" />
          <span>CURIOSIDADES ({YEIKON_CURIOSITIES.length})</span>
        </button>
      </div>

      {diarySubTab === 'recuerdos' ? (
        <>
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 backdrop-blur-xl p-5 rounded-3xl border border-stone-800/80 mb-6 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-100">
                  Tu Libro de Días
                </h2>
                <p className="text-xs text-stone-400 font-sans">
                  Cada página guarda tus vivencias, notas y reflexiones cariñosas
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'book' : 'cards')}
                className="px-3.5 py-2.5 rounded-xl text-xs font-medium bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-700/80 transition-all cursor-pointer"
              >
                {viewMode === 'cards' ? '📖 Modo Libro de Páginas' : '🗂️ Modo Tarjetas'}
              </button>

              <button
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-amber-500/10 transition-all hover:scale-105 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Recuerdo</span>
              </button>
            </div>
          </div>

          {/* Search & Filters bar */}
          <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-2xl border border-stone-800/80 mb-6 shadow-xl space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por palabra, lugar (Telde, Tejeda...) o etiqueta..."
                  className="w-full bg-stone-950/60 border border-stone-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-stone-950/60 border border-stone-800/80 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                  className="bg-stone-950/60 border border-stone-800/80 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="all">Todos los Ánimos</option>
                  {moods.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setOnlyStarred(!onlyStarred)}
                  className={`flex items-center space-x-1 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    onlyStarred
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                      : 'bg-stone-950/60 text-stone-300 border-stone-800/80 hover:bg-stone-800/50'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>Favoritos</span>
                </button>
              </div>
            </div>
          </div>

          {/* Entry Cards / Book View */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 bg-stone-900/60 backdrop-blur-xl rounded-3xl border border-stone-800/80 p-8">
              <BookOpen className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-stone-300 text-lg">
                No se encontraron recuerdos con estos filtros
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Prueba a borrar la búsqueda o haz clic en "Nuevo Recuerdo" para guardar un día especial.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-stone-900/60 backdrop-blur-xl rounded-2xl border border-stone-800/80 p-5 shadow-xl hover:border-stone-700/80 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium">
                          {entry.category}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700/60 text-stone-300">
                          {entry.mood}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onToggleStar(entry.id)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-4 h-4 ${entry.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="p-1 text-stone-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3
                      onClick={() => setViewingEntry(entry)}
                      className="font-serif font-bold text-base text-stone-100 cursor-pointer hover:text-amber-400 transition-colors"
                    >
                      {entry.title}
                    </h3>

                    <div className="flex items-center space-x-3 text-xs text-stone-400 mt-1 mb-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>{entry.date}</span>
                      </span>
                      {entry.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>{entry.location}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed font-sans mb-3">
                      {entry.content}
                    </p>

                    {entry.reflectionByAssistant && (
                      <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800/80 text-xs text-stone-300 italic font-serif flex items-start space-x-2">
                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">"{entry.reflectionByAssistant}"</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-stone-800/80 text-stone-400 border border-stone-700/50 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => onAskAssistantAboutEntry(entry)}
                      className="text-xs text-amber-400 hover:underline font-medium flex items-center space-x-1"
                    >
                      <span>Platicar sobre este día</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Interactive Book Layout */
            <div className="space-y-6">
              {filteredEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="bg-stone-900/80 backdrop-blur-xl border-2 border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden font-serif"
                >
                  {/* Decorative Book Page Binding */}
                  <div className="absolute top-0 bottom-0 left-0 w-3 bg-amber-500/20 border-r border-stone-800" />

                  <div className="pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs uppercase font-sans tracking-widest text-amber-400 font-semibold">
                        Página {idx + 1} — {entry.date}
                      </span>
                      <button
                        onClick={() => onToggleStar(entry.id)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${entry.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mb-2">
                      {entry.title}
                    </h2>

                    {entry.location && (
                      <p className="text-xs font-sans text-rose-400 flex items-center space-x-1 mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Lugar: {entry.location}</span>
                      </p>
                    )}

                    <div className="text-sm sm:text-base leading-relaxed text-stone-200 whitespace-pre-wrap font-sans my-4 bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
                      {entry.content}
                    </div>

                    {entry.reflectionByAssistant && (
                      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-xs sm:text-sm text-stone-200 italic font-serif my-3 flex items-start space-x-3">
                        <Heart className="w-5 h-5 text-rose-400 fill-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold font-sans text-rose-300 not-italic mb-0.5">
                            Reflexión de tu Asistente:
                          </p>
                          <p>"{entry.reflectionByAssistant}"</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between text-xs font-sans">
                      <div className="flex gap-1">
                        {entry.tags.map((t, i) => (
                          <span key={i} className="bg-stone-800 text-amber-300 border border-stone-700/60 px-2 py-0.5 rounded-md text-[11px]">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => onAskAssistantAboutEntry(entry)}
                        className="text-amber-400 font-medium hover:underline flex items-center space-x-1"
                      >
                        <span>Preguntar a la Asistente sobre este recuerdo</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Curiosidades Tab */
        <div className="space-y-6">
          {/* Curiosidades Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/60 backdrop-blur-xl p-5 rounded-3xl border border-stone-800/80 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 relative overflow-hidden">
                <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-100 flex items-center space-x-2">
                  <span>Sabías Que...</span>
                  <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                    Preguntas de Yeikon
                  </span>
                </h2>
                <p className="text-xs text-stone-400 font-sans">
                  Las curiosidades sobre el espacio, animales, ciencia y el cuerpo humano que has preguntado.
                </p>
              </div>
            </div>

            {/* Fun gamification metric! */}
            <div className="bg-stone-950/60 border border-stone-800/80 px-4 py-2.5 rounded-2xl flex items-center space-x-3 self-start sm:self-auto">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-stone-500 font-bold font-mono">Curiosidades Reveladas</p>
                <p className="text-sm font-bold text-amber-300 font-mono">
                  {Object.keys(revealedCuriosities).length} / {YEIKON_CURIOSITIES.length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters & Search for Curiosidades */}
          <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-2xl border border-stone-800/80 shadow-xl space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar preguntas o respuestas (ej: pulpo, estrellas, nubes...)"
                  className="w-full bg-stone-950/60 border border-stone-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Category Quick Selectors */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'Espacio', label: '🌌 Espacio' },
                  { id: 'Animales', label: '🐾 Animales' },
                  { id: 'Cuerpo', label: '🧠 Cuerpo' },
                  { id: 'Ciencia', label: '🌍 Ciencia' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCuriosityCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      curiosityCategory === cat.id
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-stone-950/40 border-stone-800/60 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {YEIKON_CURIOSITIES.filter((cur) => {
              const matchesCategory = curiosityCategory === 'all' || cur.category === curiosityCategory;
              const matchesSearch = cur.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    cur.detail.toLowerCase().includes(searchTerm.toLowerCase());
              return matchesCategory && matchesSearch;
            }).map((cur) => {
              const isRevealed = !!revealedCuriosities[cur.id];
              return (
                <div
                  key={cur.id}
                  onClick={() => {
                    if (!isRevealed) {
                      setRevealedCuriosities(prev => ({ ...prev, [cur.id]: true }));
                    }
                  }}
                  className={`rounded-2xl border p-5 shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    isRevealed
                      ? 'bg-stone-900/80 border-amber-500/30 hover:border-amber-500/40'
                      : 'bg-stone-900/40 border-stone-800/80 hover:border-stone-700/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700/60 text-stone-300 font-medium">
                        {cur.category === 'Espacio' ? '🌌 Espacio' :
                         cur.category === 'Animales' ? '🐾 Animales' :
                         cur.category === 'Cuerpo' ? '🧠 Cuerpo' : '🌍 Ciencia'}
                      </span>
                      <span className="text-lg">{cur.emoji}</span>
                    </div>

                    <h3 className="font-serif font-bold text-stone-100 text-sm leading-snug">
                      {cur.question}
                    </h3>

                    {/* Answer Reveal Section */}
                    <div className="mt-4">
                      {isRevealed ? (
                        <div className="bg-stone-950/60 p-4 rounded-xl border border-amber-500/10 text-xs text-stone-300 leading-relaxed font-sans animate-in fade-in zoom-in-95 duration-300">
                          <p className="font-bold text-amber-400 font-sans text-[11px] mb-1 uppercase tracking-wider">La respuesta de Laia:</p>
                          {cur.detail}
                        </div>
                      ) : (
                        <div className="bg-stone-950/30 p-4 rounded-xl border border-stone-800/60 text-xs text-stone-500 text-center font-sans select-none flex flex-col items-center justify-center py-6 hover:bg-stone-950/55 transition-colors">
                          <HelpCircle className="w-5 h-5 text-stone-600 mb-1.5 hover:text-amber-500/70 transition-colors animate-bounce" />
                          <span className="text-stone-400 font-medium text-[11px]">Toca aquí para revelar el secreto</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  {isRevealed && (
                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskAssistantAboutEntry({
                            id: cur.id,
                            title: cur.question,
                            content: cur.detail,
                            date: new Date().toISOString().split('T')[0],
                            category: 'Especial',
                            mood: 'Inspirado',
                            location: 'Conocimiento de la Naturaleza',
                            tags: ['Curiosidades', cur.category],
                            starred: false,
                            reflectionByAssistant: ''
                          });
                        }}
                        className="text-xs text-amber-400 hover:underline font-medium flex items-center space-x-1.5 ml-auto"
                      >
                        <span>Preguntar a Laia</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-lg text-stone-100">
                  Nuevo Recuerdo en tu Libro
                </h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Título del Recuerdo
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Tarde maravillosa en San Francisco, Telde"
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EntryCategory)}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Estado de Ánimo
                  </label>
                  <select
                    value={newMood}
                    onChange={(e) => setNewMood(e.target.value as EntryMood)}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100"
                  >
                    {moods.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Ubicación / Lugar
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Ej: Telde, Tejeda, En casa..."
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Escribe tu Vivencia o Nota
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Escribe lo que has vivido hoy, tus pensamientos o tus planes para guardarlo para siempre..."
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="starred"
                    checked={newStarred}
                    onChange={(e) => setNewStarred(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 bg-stone-950 border-stone-800"
                  />
                  <label htmlFor="starred" className="text-xs text-stone-300 font-medium">
                    Marcar como momento favorito ⭐
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:bg-stone-800 text-xs font-medium"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isGeneratingReflection}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-medium shadow-lg hover:from-amber-600 transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingReflection ? 'Guardando...' : 'Guardar en el Libro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Entry Detail Modal */}
      {viewingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingEntry(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                {viewingEntry.category}
              </span>
              <span className="text-xs text-stone-500">{viewingEntry.date}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mb-3">
              {viewingEntry.title}
            </h2>

            {viewingEntry.location && (
              <p className="text-xs text-rose-400 flex items-center space-x-1 mb-4 font-sans">
                <MapPin className="w-4 h-4" />
                <span>Ubicación: {viewingEntry.location}</span>
              </p>
            )}

            <div className="bg-stone-950/80 p-5 rounded-2xl border border-stone-800 text-sm text-stone-100 leading-relaxed whitespace-pre-wrap font-sans my-4">
              {viewingEntry.content}
            </div>

            {viewingEntry.reflectionByAssistant && (
              <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 text-xs sm:text-sm text-stone-200 font-serif italic flex items-start space-x-2">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold not-italic text-rose-300 font-sans mb-1">
                    Reflexión cariñosa de la Asistente:
                  </p>
                  <p>"{viewingEntry.reflectionByAssistant}"</p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-stone-800 flex justify-between items-center">
              <button
                onClick={() => {
                  const entryToAsk = viewingEntry;
                  setViewingEntry(null);
                  onAskAssistantAboutEntry(entryToAsk);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-md transition-colors flex items-center space-x-1.5"
              >
                <span>Platicar sobre este día con la asistente</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewingEntry(null)}
                className="px-4 py-2 rounded-xl text-stone-400 text-xs font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
