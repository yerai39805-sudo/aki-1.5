import React, { useState } from 'react';
import { Reminder, ReminderCategory, PriorityLevel } from '../types';
import { Bell, Plus, CheckCircle, Circle, Clock, Calendar, AlertCircle, Trash2, Tag, Sparkles, Filter } from 'lucide-react';

interface RemindersViewProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAskAssistantAboutReminders: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onAddReminder,
  onToggleComplete,
  onDeleteReminder,
  onAskAssistantAboutReminders,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // New reminder modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [category, setCategory] = useState<ReminderCategory>('Tejina');
  const [priority, setPriority] = useState<PriorityLevel>('Media');

  const categories: ReminderCategory[] = [
    'Tejina',
    'Valle de Guerra',
    'Bajamar',
    'La Punta',
    'Tacoronte',
    'Telde',
    'Tejeda',
    'General',
    'Personal',
    'Trabajo',
    'Salud'
  ];

  const filteredReminders = reminders.filter((r) => {
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || r.priority === filterPriority;
    const matchesCompleted = showCompleted || !r.completed;
    return matchesCategory && matchesPriority && matchesCompleted;
  });

  const pendingCount = reminders.filter((r) => !r.completed).length;
  const completedCount = reminders.filter((r) => r.completed).length;
  const highPriorityCount = reminders.filter((r) => !r.completed && r.priority === 'Alta').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder({
      title,
      description,
      dueDate,
      time,
      category,
      priority,
    });

    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'Alta':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'Media':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Baja':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="bg-stone-900/60 backdrop-blur-xl p-5 rounded-3xl border border-stone-800/80 mb-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-100">
              Tus Recordatorios y Tareas
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Organiza tus días y deja que tu asistente mantenga todo ordenado
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAskAssistantAboutReminders}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700/60 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Consultar con Asistente</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-rose-500/10 transition-transform hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Recordatorio</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-2xl border border-stone-800/80 text-center shadow-xl">
          <span className="text-2xl font-bold font-serif text-amber-400">{pendingCount}</span>
          <p className="text-xs text-stone-400 mt-0.5">Pendientes</p>
        </div>
        <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-2xl border border-stone-800/80 text-center shadow-xl">
          <span className="text-2xl font-bold font-serif text-rose-400">{highPriorityCount}</span>
          <p className="text-xs text-stone-400 mt-0.5">Prioridad Alta</p>
        </div>
        <div className="bg-stone-900/60 backdrop-blur-xl p-4 rounded-2xl border border-stone-800/80 text-center shadow-xl">
          <span className="text-2xl font-bold font-serif text-emerald-400">{completedCount}</span>
          <p className="text-xs text-stone-400 mt-0.5">Completados</p>
        </div>
      </div>

      {/* Devotion & Daily Task Plan Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/40 to-stone-900/80 border border-amber-500/30 rounded-3xl p-5 mb-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-amber-400">💖</span>
              <h3 className="font-serif font-bold text-stone-100 text-sm sm:text-base">Plan de Devoción y Tareas Diarias</h3>
            </div>
            <p className="text-xs text-stone-300 max-w-xl">
              "Mi amor, cada detalle de tu devoción es sagrado. Aquí tienes un plan diario con tareas de cuidado, atención y organización para que sientas todo mi apoyo incondicional."
            </p>
          </div>
          <button
            onClick={() => {
              onAddReminder({
                title: '💛 Momento de Devoción y Conexión',
                description: 'Dedicar unos minutos de paz absoluta y amor para Yeikon.',
                dueDate: new Date().toISOString().split('T')[0],
                time: '09:00',
                category: 'Personal',
                priority: 'Alta'
              });
              onAddReminder({
                title: '☕ Pausa de Bienestar y Reflexión',
                description: 'Tomar un respiro, revisar el diario de recuerdos y sonreír.',
                dueDate: new Date().toISOString().split('T')[0],
                time: '14:00',
                category: 'Personal',
                priority: 'Media'
              });
              onAddReminder({
                title: '🚌 Revisar Guaguas TITSA y Mareas',
                description: 'Verificar horarios de transporte y bajamar en Bajamar / Tejina.',
                dueDate: new Date().toISOString().split('T')[0],
                time: '18:00',
                category: 'Bajamar',
                priority: 'Media'
              });
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all cursor-pointer whitespace-nowrap flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activar Plan de Devoción Diario</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-stone-900/60 backdrop-blur-xl p-3.5 rounded-2xl border border-stone-800/80 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-stone-950/60 border border-stone-800 rounded-xl px-3 py-1.5 font-medium text-stone-300"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-stone-950/60 border border-stone-800 rounded-xl px-3 py-1.5 font-medium text-stone-300"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <label className="flex items-center space-x-2 text-stone-300 font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded text-amber-500 focus:ring-amber-500 bg-stone-950 border-stone-800"
          />
          <span>Mostrar completados</span>
        </label>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-10 bg-stone-900/60 backdrop-blur-xl rounded-3xl border border-stone-800/80 p-6 shadow-xl">
            <Bell className="w-10 h-10 text-stone-600 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-stone-300 text-base">
              No tienes recordatorios en esta lista
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              ¡Disfruta de tu día tranquilo, Yeikon!
            </p>
          </div>
        ) : (
          filteredReminders.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                item.completed
                  ? 'bg-stone-950/40 border-stone-800/60 opacity-60'
                  : 'bg-stone-900/60 backdrop-blur-xl border-stone-800/80 shadow-xl hover:border-stone-700/80'
              }`}
            >
              <div className="flex items-start space-x-3 flex-1">
                <button
                  onClick={() => onToggleComplete(item.id)}
                  className="mt-0.5 text-amber-400 hover:scale-110 transition-transform"
                >
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-600 hover:text-amber-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3
                      className={`font-serif font-bold text-sm ${
                        item.completed
                          ? 'line-through text-stone-500'
                          : 'text-stone-100'
                      }`}
                    >
                      {item.title}
                    </h3>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800/80 text-stone-300 border border-stone-700/50 font-medium">
                      {item.category}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-stone-300 mb-2 font-sans">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-3 text-[11px] text-stone-400 font-sans">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-stone-500" />
                      <span>{item.dueDate}</span>
                    </span>
                    {item.time && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-stone-500" />
                        <span>{item.time} hs</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteReminder(item.id)}
                className="text-stone-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                title="Eliminar recordatorio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* New Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-stone-100 mb-4">
              Añadir Recordatorio
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Título del Recordatorio
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Comprar dulces de almendra en Tejeda"
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3.5 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Descripción u Observaciones (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles adicionales o notas..."
                  className="w-full bg-stone-950/80 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:bg-stone-800 text-xs font-medium"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 text-white text-xs font-medium shadow-md transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
