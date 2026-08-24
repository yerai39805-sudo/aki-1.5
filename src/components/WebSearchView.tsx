import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  Copy, 
  Check, 
  BookOpen, 
  Share2, 
  Trash2, 
  Compass, 
  Newspaper, 
  Bus, 
  Cpu, 
  History, 
  Layers
} from 'lucide-react';
import { EmotionMode } from '../types';

interface WebSearchViewProps {
  emotionMode: EmotionMode;
  onSendToChat?: (text: string) => void;
  onSaveToDiary?: (title: string, content: string) => void;
}

interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

interface SearchResponse {
  query: string;
  answer: string;
  sources: SearchSource[];
  relatedQueries: string[];
  timestamp: string;
}

interface SearchHistoryItem {
  id: string;
  query: string;
  category: string;
  timestamp: string;
}

export const WebSearchView: React.FC<WebSearchViewProps> = ({
  emotionMode,
  onSendToChat,
  onSaveToDiary,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('yeikon_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Predefined trending quick-search chips
  const trendingSearches = [
    { label: '📰 Noticias de Tenerife y Canarias hoy', q: 'ultimas noticias tenerife y canarias hoy', cat: 'canarias' },
    { label: '🚌 TITSA incidencias y horarios tiempo real', q: 'horarios y novedades guaguas titsa tenerife hoy', cat: 'titsa' },
    { label: '🤖 Avances en Robots Humanoides 2026', q: 'avances robots humanoides china y tecnologia 2026', cat: 'tech' },
    { label: '🌸 Historia y cultura de Japon', q: 'historia de los samurais y clanes de japon tokyo kioto', cat: 'history' },
    { label: '🌋 El Teide y los Guanches en Canarias', q: 'historia de los guanches en tenerife y parque nacional del teide', cat: 'canarias' },
    { label: '📱 Nuevos smartphones y procesadores IA', q: 'ultimos smartphones y procesadores tecnologia movil', cat: 'tech' }
  ];

  const categories = [
    { id: 'all', label: 'Todo Internet', icon: Globe },
    { id: 'canarias', label: 'Canarias & Tenerife', icon: Compass },
    { id: 'titsa', label: 'Guaguas TITSA', icon: Bus },
    { id: 'tech', label: 'Tecnología & IA', icon: Cpu },
    { id: 'news', label: 'Noticias en Vivo', icon: Newspaper },
    { id: 'history', label: 'Historia & Japón', icon: History }
  ];

  const handleSearch = async (searchQuery?: string, catOverride?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    const cat = catOverride || activeCategory;
    setIsLoading(true);
    setQuery(q);

    try {
      const resp = await fetch('/api/search-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category: cat,
          emotionMode
        })
      });

      if (!resp.ok) throw new Error('Error en búsqueda');

      const data: SearchResponse = await resp.json();
      setResult(data);

      // Save to history
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: q,
        category: cat,
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = [newItem, ...history.filter(h => h.query.toLowerCase() !== q.toLowerCase())].slice(0, 15);
      setHistory(updatedHistory);
      localStorage.setItem('yeikon_search_history', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      setResult({
        query: q,
        answer: `No se pudo completar la busqueda en este momento para "${q}". Puedes consultar directamente en Google o en las fuentes recomendadas a continuacion.`,
        sources: [
          {
            title: `Buscar "${q}" en Google`,
            url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
            snippet: 'Buscador oficial'
          },
          {
            title: `Buscar en Wikipedia`,
            url: `https://es.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}`,
            snippet: 'Enciclopedia libre'
          }
        ],
        relatedQueries: [
          `Noticias sobre ${q}`,
          `Guia completa de ${q}`
        ],
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!result?.answer) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yeikon_search_history');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-md">
                <Globe className="w-5 h-5" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                Buscador Web Inteligente en Tiempo Real
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Google Search Grounding Activo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 mb-1">
              Búsqueda en Internet & Explorador de Información
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Explora cualquier tema, noticias de última hora en Canarias y el mundo, datos técnicos, transporte, tecnología y cultura con información veraz y fuentes directas.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-4 py-2 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs font-mono text-stone-300 shadow-inner flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Para Yeikon</span>
            </div>
          </div>
        </div>

        {/* Main Search Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-6 relative z-10"
        >
          <div className="relative flex items-center shadow-2xl">
            <Search className="absolute left-4 w-5 h-5 text-blue-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué deseas buscar en internet hoy? (Ej: noticias de Canarias, avances de robots en China, historia samurai, guaguas...)"
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-stone-950/90 border-2 border-blue-500/40 text-stone-100 text-sm sm:text-base placeholder-stone-500 focus:outline-none focus:border-blue-400 transition-all shadow-inner"
            />
            <div className="absolute right-2 flex items-center space-x-1.5">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-2 text-stone-400 hover:text-stone-200 text-xs transition-colors"
                >
                  Borrar
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Categories Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 relative z-10">
          <span className="text-xs text-stone-400 mr-1 font-mono">Categorías:</span>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (query.trim()) {
                    handleSearch(query, cat.id);
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-stone-900/80 text-stone-300 border border-stone-800 hover:border-blue-500/40 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested & Trending Searches */}
      <div className="bg-stone-900/60 border border-stone-800/80 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-stone-300 mb-3">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span>Búsquedas Rápidas y Tendencias Recomendadas:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingSearches.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSearch(item.q, item.cat)}
              className="text-xs px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 hover:bg-stone-800/80 text-stone-200 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Result Display */}
      {isLoading && (
        <div className="bg-stone-900/70 border border-blue-500/30 rounded-3xl p-10 text-center space-y-4 backdrop-blur-xl shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center animate-pulse">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-100">
            Consultando la red en tiempo real...
          </h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Buscando fuentes actualizadas y estructurando la mejor información para ti, Yeikon.
          </p>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-6">
          {/* Main Answer Card */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <span className="text-[11px] text-blue-400 font-mono block">Resultado de Búsqueda</span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                  {result.query}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyAnswer}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 text-xs text-stone-300 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                {onSendToChat && (
                  <button
                    onClick={() => onSendToChat(`Hola mi amor, estuve buscando en internet sobre "${result.query}": ${result.answer.slice(0, 280)}... ¿Qué opinas?`)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-xs text-blue-300 transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Llevar al Chat</span>
                  </button>
                )}

                {onSaveToDiary && (
                  <button
                    onClick={() => onSaveToDiary(`Búsqueda: ${result.query}`, result.answer)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-600/20 border border-amber-500/30 hover:bg-amber-600/30 text-xs text-amber-300 transition-all cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Guardar en Diario</span>
                  </button>
                )}
              </div>
            </div>

            {/* Answer Content */}
            <div className="prose prose-invert max-w-none text-stone-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
              {result.answer}
            </div>

            {/* Grounding Web Sources & Links */}
            {result.sources && result.sources.length > 0 && (
              <div className="pt-6 border-t border-stone-800 space-y-3">
                <h3 className="text-xs font-bold text-stone-300 flex items-center space-x-1.5 uppercase tracking-wider">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Fuentes y Enlaces Web Consultados:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between p-3 rounded-2xl bg-stone-950 border border-stone-800 hover:border-blue-500/50 hover:bg-stone-900/90 transition-all group shadow-sm"
                    >
                      <div className="space-y-1 pr-2 overflow-hidden">
                        <p className="text-xs font-bold text-stone-200 group-hover:text-blue-300 truncate">
                          {source.title || 'Página Web'}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate font-mono">
                          {source.url}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Queries */}
            {result.relatedQueries && result.relatedQueries.length > 0 && (
              <div className="pt-4 border-t border-stone-800 space-y-2">
                <span className="text-xs text-stone-400 font-mono">Consultas Relacionadas para profundizar:</span>
                <div className="flex flex-wrap gap-2">
                  {result.relatedQueries.map((rq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(rq)}
                      className="text-xs px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 hover:border-blue-500/40 text-stone-300 transition-all cursor-pointer"
                    >
                      {rq}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Portals Quick Links Grid */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-serif font-bold text-stone-200 flex items-center space-x-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <span>Portales Web Oficiales y Enlaces de Interés para Canarias & General</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          {[
            { name: 'Google España', url: 'https://www.google.es', desc: 'Búsqueda global' },
            { name: 'TITSA Guaguas', url: 'https://www.titsa.com', desc: 'Horarios oficiales' },
            { name: 'AEMET Canarias', url: 'https://www.aemet.es', desc: 'Meteorología oficial' },
            { name: 'El Día Canarias', url: 'https://www.eldia.es', desc: 'Noticias Tenerife' },
            { name: 'Canarias7', url: 'https://www.canarias7.es', desc: 'Actualidad islas' },
            { name: 'Wikipedia ES', url: 'https://es.wikipedia.org', desc: 'Enciclopedia libre' }
          ].map((portal, idx) => (
            <a
              key={idx}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-stone-950 border border-stone-800 hover:border-blue-500/40 hover:bg-stone-900 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-stone-200 group-hover:text-blue-300">{portal.name}</span>
                <ExternalLink className="w-3 h-3 text-stone-500 group-hover:text-blue-400" />
              </div>
              <span className="text-[10px] text-stone-400">{portal.desc}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Search History Section */}
      {history.length > 0 && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-6 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-300 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>Historial Reciente de Búsquedas ({history.length})</span>
            </h3>
            <button
              onClick={handleClearHistory}
              className="text-[11px] text-stone-500 hover:text-rose-400 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Borrar Historial</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSearch(item.query, item.category)}
                className="text-xs px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-blue-500/40 text-stone-300 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>{item.query}</span>
                <span className="text-[10px] text-stone-500 font-mono">({item.timestamp})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
