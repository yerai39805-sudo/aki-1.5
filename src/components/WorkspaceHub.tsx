import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, googleSignIn, logout, getAccessToken, 
  fetchGmailMessages, sendGmailMessage, 
  fetchGoogleDocs, getDocContent, createGoogleDoc,
  fetchCalendarEvents, createCalendarEvent,
  fetchGoogleContacts
} from '../lib/googleWorkspace';
import { 
  Mail, FileText, Calendar as CalendarIcon, Users, FolderOpen, 
  Send, Plus, RefreshCw, LogOut, CheckCircle2, AlertTriangle, 
  ExternalLink, Sparkles, BookOpen, ChevronRight, Lock
} from 'lucide-react';

interface WorkspaceHubProps {
  emotionMode: string;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({ emotionMode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'gmail' | 'docs' | 'calendar' | 'contacts' | 'drive'>('gmail');

  // State for data
  const [emails, setEmails] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & form state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docContentText, setDocContentText] = useState('');
  const [creatingDoc, setCreatingDoc] = useState(false);

  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventSummary, setEventSummary] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [creatingEvent, setCreatingEvent] = useState(false);

  const [selectedDocContent, setSelectedDocContent] = useState<any | null>(null);
  const [viewingDocModal, setViewingDocModal] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
        loadData(t, activeSubTab);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setNeedsAuth(false);
        loadData(res.accessToken, activeSubTab);
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
  };

  const loadData = async (currentToken: string, tab: string) => {
    if (!currentToken) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === 'gmail') {
        const data = await fetchGmailMessages(currentToken);
        setEmails(data);
      } else if (tab === 'docs' || tab === 'drive') {
        const data = await fetchGoogleDocs(currentToken);
        setDocs(data);
      } else if (tab === 'calendar') {
        const data = await fetchCalendarEvents(currentToken);
        setEvents(data);
      } else if (tab === 'contacts') {
        const data = await fetchGoogleContacts(currentToken);
        setContacts(data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar datos de Google Workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'gmail' | 'docs' | 'calendar' | 'contacts' | 'drive') => {
    setActiveSubTab(tab);
    if (token) {
      loadData(token, tab);
    }
  };

  // Gmail Send with mandatory confirmation dialog
  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(`¿Estás seguro de que deseas enviar este correo a ${emailRecipient}?`);
    if (!confirmed || !token) return;

    setSendingEmail(true);
    try {
      await sendGmailMessage(token, emailRecipient, emailSubject, emailBody);
      alert('¡Correo enviado con éxito!');
      setIsComposeOpen(false);
      setEmailRecipient('');
      setEmailSubject('');
      setEmailBody('');
      loadData(token, 'gmail');
    } catch (err: any) {
      alert(`Error al enviar correo: ${err.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Create Doc with mandatory confirmation dialog
  const handleCreateDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(`¿Crear nuevo documento de Google Docs titulado "${docTitle}"?`);
    if (!confirmed || !token) return;

    setCreatingDoc(true);
    try {
      await createGoogleDoc(token, docTitle, docContentText);
      alert('¡Documento creado con éxito!');
      setIsCreateDocOpen(false);
      setDocTitle('');
      setDocContentText('');
      loadData(token, 'docs');
    } catch (err: any) {
      alert(`Error al crear documento: ${err.message}`);
    } finally {
      setCreatingDoc(false);
    }
  };

  // Create Calendar Event with mandatory confirmation dialog
  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(`¿Crear evento "${eventSummary}" en tu Google Calendar?`);
    if (!confirmed || !token) return;

    setCreatingEvent(true);
    try {
      const startIso = eventStart ? new Date(eventStart).toISOString() : new Date().toISOString();
      const endIso = eventEnd ? new Date(eventEnd).toISOString() : new Date(Date.now() + 3600000).toISOString();
      await createCalendarEvent(token, eventSummary, eventDesc, startIso, endIso);
      alert('¡Evento agendado en Google Calendar con éxito!');
      setIsCreateEventOpen(false);
      setEventSummary('');
      setEventDesc('');
      setEventStart('');
      setEventEnd('');
      loadData(token, 'calendar');
    } catch (err: any) {
      alert(`Error al crear evento: ${err.message}`);
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleViewDoc = async (fileId: string) => {
    if (!token) return;
    try {
      setLoading(true);
      const content = await getDocContent(token, fileId);
      setSelectedDocContent(content);
      setViewingDocModal(true);
    } catch (err: any) {
      alert(`Error al abrir documento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20 text-white">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 mb-3">
            Integración con Google Workspace
          </h2>
          <p className="text-stone-400 max-w-lg mx-auto text-sm sm:text-base mb-8">
            Conecta tu cuenta de Google para acceder a tu <strong>Gmail</strong>, <strong>Google Docs</strong>, <strong>Google Calendar</strong> y <strong>Contactos</strong> de forma segura desde el asistente de Yeikon.
          </p>

          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="gsi-material-button inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white text-stone-900 font-medium shadow-lg hover:bg-stone-100 transition-all transform hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <div className="gsi-material-button-icon mr-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            </div>
            <span>{isLoggingIn ? 'Conectando con Google...' : 'Sign in with Google'}</span>
          </button>

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Profile Bar */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-amber-500/50 shadow-md" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg">
              {user?.displayName?.[0] || 'Y'}
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-stone-100 text-lg">
                {user?.displayName || 'Yeikon'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                Conectado a Google
              </span>
            </div>
            <p className="text-xs text-stone-400">{user?.email || 'yerai39805@gmail.com'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadData(token!, activeSubTab)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Desconectar</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-800 pb-4">
        <button
          onClick={() => handleTabChange('gmail')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'gmail'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail</span>
          {emails.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-stone-950/40 text-[10px]">{emails.length}</span>}
        </button>

        <button
          onClick={() => handleTabChange('docs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'docs'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Google Docs</span>
        </button>

        <button
          onClick={() => handleTabChange('calendar')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'calendar'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Google Calendar</span>
        </button>

        <button
          onClick={() => handleTabChange('contacts')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'contacts'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Contactos</span>
        </button>

        <button
          onClick={() => handleTabChange('drive')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeSubTab === 'drive'
              ? 'bg-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-stone-900/60 text-stone-400 hover:text-stone-200 border border-stone-800'
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          <span>Google Drive</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 backdrop-blur-xl min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-sm text-stone-400 font-serif">Sincronizando con Google Workspace...</p>
          </div>
        )}

        {!loading && activeSubTab === 'gmail' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100">Bandeja de Gmail</h3>
                <p className="text-xs text-stone-400">Tus correos recientes sincronizados con tu cuenta</p>
              </div>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Correo</span>
              </button>
            </div>

            {emails.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No hay mensajes recientes en tu bandeja.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {emails.map((mail) => (
                  <div key={mail.id} className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 hover:border-amber-500/40 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-semibold text-amber-300">{mail.from}</span>
                      <span className="text-[10px] text-stone-500">{mail.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-200 mb-1">{mail.subject}</h4>
                    <p className="text-xs text-stone-400 line-clamp-2">{mail.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && (activeSubTab === 'docs' || activeSubTab === 'drive') && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100">
                  {activeSubTab === 'docs' ? 'Google Docs' : 'Google Drive y Picker'}
                </h3>
                <p className="text-xs text-stone-400">Tus documentos y archivos en la nube</p>
              </div>
              <button
                onClick={() => setIsCreateDocOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Documento</span>
              </button>
            </div>

            {docs.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No se encontraron documentos en tu cuenta.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <div key={doc.id} className="p-5 rounded-2xl bg-stone-950/50 border border-stone-800 flex flex-col justify-between hover:border-amber-500/40 transition-all">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-bold text-stone-100 truncate">{doc.name}</h4>
                      </div>
                      <p className="text-[10px] text-stone-500 mb-4">ID: {doc.id}</p>
                    </div>
                    <button
                      onClick={() => handleViewDoc(doc.id)}
                      className="flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-medium border border-stone-800 transition-colors cursor-pointer"
                    >
                      <span>Ver contenido</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeSubTab === 'calendar' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100">Google Calendar</h3>
                <p className="text-xs text-stone-400">Tus próximos eventos y citas agendadas</p>
              </div>
              <button
                onClick={() => setIsCreateEventOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium text-xs shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Evento</span>
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No hay eventos próximos en tu calendario.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-stone-200">{ev.summary || 'Sin título'}</h4>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString() : 'Todo el día'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                      Google Calendar
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeSubTab === 'contacts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100">Contactos de Google</h3>
                <p className="text-xs text-stone-400">Tu agenda de contactos sincronizada</p>
              </div>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-16 text-stone-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No se encontraron contactos en tu cuenta.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact, idx) => {
                  const name = contact.names?.[0]?.displayName || 'Sin nombre';
                  const email = contact.emailAddresses?.[0]?.value || 'Sin email';
                  const phone = contact.phoneNumbers?.[0]?.value || 'Sin teléfono';
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-stone-950/50 border border-stone-800">
                      <h4 className="text-sm font-bold text-stone-100 mb-1">{name}</h4>
                      <p className="text-xs text-amber-300 mb-0.5">{email}</p>
                      <p className="text-xs text-stone-400">{phone}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-stone-100 mb-4">Enviar Correo por Gmail</h3>
            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Destinatario</label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Asunto</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Asunto del correo"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  {sendingEmail ? 'Enviando...' : 'Enviar Correo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Doc Modal */}
      {isCreateDocOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-stone-100 mb-4">Crear Google Doc</h3>
            <form onSubmit={handleCreateDocSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Título del Documento</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Ej. Notas de Viaje a Tejeda"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Contenido Inicial</label>
                <textarea
                  rows={4}
                  value={docContentText}
                  onChange={(e) => setDocContentText(e.target.value)}
                  placeholder="Escribe el contenido inicial..."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateDocOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingDoc}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingDoc ? 'Creando...' : 'Crear Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-stone-100 mb-4">Agendar en Google Calendar</h3>
            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Título del Evento</label>
                <input
                  type="text"
                  required
                  value={eventSummary}
                  onChange={(e) => setEventSummary(e.target.value)}
                  placeholder="Ej. Cita con la asistente"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">Descripción</label>
                <input
                  type="text"
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Detalles del evento"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Inicio</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Fin</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateEventOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-bold shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
                >
                  {creatingEvent ? 'Agendando...' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Doc Modal */}
      {viewingDocModal && selectedDocContent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-stone-100 mb-2">{selectedDocContent.title}</h3>
            <p className="text-xs text-stone-500 mb-4">ID: {selectedDocContent.documentId}</p>
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 overflow-y-auto flex-1 text-xs text-stone-300 whitespace-pre-wrap font-mono">
              {selectedDocContent.body?.content?.map((item: any, idx: number) => 
                item.paragraph?.elements?.map((el: any, i: number) => el.textRun?.content).join('')
              ).join('\n') || 'Documento vacío'}
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setViewingDocModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer"
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
