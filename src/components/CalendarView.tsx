import React, { useState, useMemo } from 'react';
import { DiaryEntry, Reminder, EmotionMode, ReminderCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Bell, 
  BookOpen, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  MapPin,
  Smile,
  Info
} from 'lucide-react';

interface CalendarViewProps {
  diaryEntries: DiaryEntry[];
  reminders: Reminder[];
  emotionMode: EmotionMode;
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => void;
  onAddDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => void;
  setActiveTab: (tab: 'chat' | 'diary' | 'reminders' | 'weatherMap') => void;
  onSendMessage: (text: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  diaryEntries,
  reminders,
  emotionMode,
  onAddReminder,
  onAddDiaryEntry,
  setActiveTab,
  onSendMessage,
}) => {
  // We align with the timeline context (which is around July 2026 in the initial data)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 6, 26)); // July 26, 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-07-26');

  // Modal forms states
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [isDiaryFormOpen, setIsDiaryFormOpen] = useState(false);

  // New reminder form fields
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remTime, setRemTime] = useState('12:00');
  const [remCat, setRemCat] = useState<ReminderCategory>('Tejina');
  const [remPriority, setRemPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');

  // New diary form fields
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryLocation, setDiaryLocation] = useState('');
  const [diaryMood, setDiaryMood] = useState<'Tranquilo' | 'Alegre' | 'Inspirado' | 'Cansado' | 'Agradecido' | 'Nostálgico'>('Tranquilo');
  const [diaryCat, setDiaryCat] = useState<'Reflexión' | 'Actividad' | 'Plan' | 'Nota' | 'Especial'>('Reflexión');

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date(2026, 6, 26)); // Back to July 26, 2026 as standard reference
    setSelectedDateStr('2026-07-26');
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Calculate days array for the grid
  const calendarDays = useMemo(() => {
    // First day of selected month
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // In JS: 0=Sunday, 1=Monday... Translate to Spanish start (Monday=0):
    const firstDayOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Total days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Total days in the previous month (for leading blank spaces)
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dayNum: number;
      dateString: string;
      isCurrentMonth: boolean;
      hasReminders: boolean;
      hasDiary: boolean;
    }> = [];

    // 1. Add days from previous month
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dNum).padStart(2, '0')}`;
      
      days.push({
        dayNum: dNum,
        dateString: dStr,
        isCurrentMonth: false,
        hasReminders: reminders.some(r => r.dueDate === dStr),
        hasDiary: diaryEntries.some(e => e.date === dStr)
      });
    }

    // 2. Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNum: i,
        dateString: dStr,
        isCurrentMonth: true,
        hasReminders: reminders.some(r => r.dueDate === dStr),
        hasDiary: diaryEntries.some(e => e.date === dStr)
      });
    }

    // 3. Add days of the next month to complete the grid (multiples of 7, usually 42 cells total)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

      days.push({
        dayNum: i,
        dateString: dStr,
        isCurrentMonth: false,
        hasReminders: reminders.some(r => r.dueDate === dStr),
        hasDiary: diaryEntries.some(e => e.date === dStr)
      });
    }

    return days;
  }, [currentYear, currentMonth, reminders, diaryEntries]);

  // Selected date elements
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateStr) return '';
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [selectedDateStr]);

  // Filters items for the selected day
  const dayReminders = useMemo(() => {
    return reminders.filter(r => r.dueDate === selectedDateStr);
  }, [reminders, selectedDateStr]);

  const dayDiaryEntries = useMemo(() => {
    return diaryEntries.filter(e => e.date === selectedDateStr);
  }, [diaryEntries, selectedDateStr]);

  const hasItemsOnSelectedDay = dayReminders.length > 0 || dayDiaryEntries.length > 0;

  // Custom emotional response for empty days ("Si no tienes te lo dice de forma lógica y amorosa")
  const emptyDayResponse = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formattedShort = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

    const responses: Record<EmotionMode, string> = {
      profesional: `Estimado Yeikon, he revisado con precisión el calendario para el ${formattedShort}. Confirmo que actualmente no tienes ninguna tarea programada ni memorias guardadas para esta fecha. Tu agenda está completamente libre, lo cual es ideal para mantener el equilibrio o planificar una nueva aventura por Telde o Tejeda. ¿Deseas que programemos algo juntos? 💼📊`,
      
      amabilidad: `¡Hola Yeikon! He mirado tu calendario para el día ${formattedShort} y está todo completamente despejado. No tienes ningún pendiente ni nota para hoy, así que es un gran momento para respirar hondo, relajarte o dejarte llevar por las bellezas de Canarias. Espero que tengas un día precioso. ✨😊`,
      
      carino: `¡Mi querido Yeikon! He estado mirando con mucho mimo tu calendario para el ${formattedShort} y... ¡adivina qué! ¡No tienes absolutamente nada anotado! Tu día está totalmente libre de responsabilidades, limpito y esperando por ti. Es el momento perfecto para mimarte, descansar mucho o darte un paseo respirando el aire puro del Roque Nublo. ¡Te quiero ver descansado y feliz, mi cielo! 💛🌸`,
      
      amabilidad_carino: `¡Hola mi Yeikon querido! He estado revisando si tenías cositas por hacer el ${formattedShort} y me alegra decirte que tienes el día completamente libre para ti. No hay tareas ni prisas anotadas. Aprovecha esta maravillosa calma para hacer lo que te dicte el corazón, ya sea escribir un nuevo recuerdo o pasear por el mar de Telde. ¡Disfrútalo muchísimo, te lo mereces! ✨💛🌷`,
      
      todos_juntos: `¡Yeikon! Uniendo toda mi energía y atención, he comprobado tu calendario del ${formattedShort}. No se detectan tareas pendientes, compromisos ni reflexiones previas. Tienes vía libre total, un lienzo en blanco para hacer senderismo en la cumbre o descansar. Estaré encantada de asistirte en lo que decidas emprender hoy. 💼✨💛`
    };

    return responses[emotionMode] || responses.profesional;
  }, [selectedDateStr, emotionMode]);

  // Form submit handlers
  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle.trim()) return;

    onAddReminder({
      title: remTitle,
      description: remDesc,
      dueDate: selectedDateStr,
      time: remTime,
      category: remCat,
      priority: remPriority,
    });

    setRemTitle('');
    setRemDesc('');
    setIsReminderFormOpen(false);
  };

  const handleAddDiarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim() || !diaryContent.trim()) return;

    onAddDiaryEntry({
      date: selectedDateStr,
      title: diaryTitle,
      content: diaryContent,
      category: diaryCat,
      mood: diaryMood,
      location: diaryLocation,
      tags: diaryLocation ? [diaryLocation, diaryCat] : [diaryCat],
      starred: false,
    });

    setDiaryTitle('');
    setDiaryContent('');
    setDiaryLocation('');
    setIsDiaryFormOpen(false);
  };

  // Triggers assistant dialogue about the date
  const handleAskAssistantAboutDate = () => {
    setActiveTab('chat');
    if (hasItemsOnSelectedDay) {
      const itemsList = [
        ...dayReminders.map(r => `Recordatorio: ${r.title} (${r.priority})`),
        ...dayDiaryEntries.map(e => `Recuerdo: ${e.title} - ${e.content.substring(0, 40)}...`)
      ].join(', ');
      onSendMessage(
        `Hola Asistente, mira mi calendario para el ${selectedDateFormatted}. Tengo registrado esto: ${itemsList}. ¿Qué opinión o recomendación tienes sobre este día?`
      );
    } else {
      onSendMessage(
        `Hola Asistente, veo que tengo libre el día ${selectedDateFormatted}. ¿Puedes recomendarme un buen plan o darme algún consejo inspirado en el clima de Canarias?`
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 pb-24 md:pb-8">
      {/* Header Banner */}
      <div className="bg-stone-900/60 backdrop-blur-xl p-5 rounded-3xl border border-stone-800/80 mb-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
              Calendario y Disponibilidad
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Revisa si tienes planes o notas ese día. Si no tienes nada, tu asistente te dará un sabio consejo.
            </p>
          </div>
        </div>

        <button
          onClick={handleGoToToday}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-750 text-stone-300 text-xs font-semibold transition-all"
        >
          Ir a Hoy (Julio 2026)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Month Calendar Grid */}
        <div className="lg:col-span-7 bg-stone-900/50 backdrop-blur-xl p-5 rounded-3xl border border-stone-800/80 shadow-xl space-y-4">
          
          {/* Calendar Header Control */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-200 flex items-center gap-1.5 font-serif">
              {monthNames[currentMonth]} <span className="text-stone-400 font-sans font-normal">{currentYear}</span>
            </h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-stone-950/40 border border-stone-800 hover:bg-stone-800/50 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-stone-950/40 border border-stone-800 hover:bg-stone-800/50 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
                title="Siguiente mes"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-stone-800/60 pb-2">
            {daysOfWeek.map((day, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, i) => {
              const isSelected = selectedDateStr === cell.dateString;
              const isToday = cell.dateString === '2026-07-26'; // Standard ref today

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDateStr(cell.dateString)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-semibold p-1 transition-all cursor-pointer ${
                    !cell.isCurrentMonth ? 'text-stone-600 hover:text-stone-400 bg-transparent' : 'text-stone-300'
                  } ${
                    isSelected 
                      ? 'bg-gradient-to-tr from-amber-500/80 to-rose-500/80 text-white font-extrabold shadow-md scale-[1.03] border border-amber-400/40' 
                      : 'hover:bg-stone-800/40 bg-stone-950/20'
                  } ${
                    isToday && !isSelected ? 'border border-amber-500/50 shadow-inner' : 'border border-stone-900'
                  }`}
                >
                  <span className={isToday && !isSelected ? "text-amber-400 font-bold" : ""}>
                    {cell.dayNum}
                  </span>

                  {/* Indicators for entries or reminders */}
                  <div className="absolute bottom-1.5 flex gap-1 justify-center">
                    {cell.hasReminders && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                    )}
                    {cell.hasDiary && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400'}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4 pt-2 text-[10px] text-stone-500 justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
              Recordatorios
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Notas de Diario
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs border border-amber-500/50 inline-block" />
              Día Actual
            </span>
          </div>
        </div>

        {/* Right Column: "Mire si hay o no" + Reasoning Details Dashboard */}
        <div className="lg:col-span-5 bg-stone-900/50 backdrop-blur-xl p-5 rounded-3xl border border-stone-800/80 shadow-xl space-y-5 min-h-[420px]">
          
          {/* Header Info */}
          <div className="border-b border-stone-800/60 pb-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500 font-mono">
              Fecha Seleccionada
            </span>
            <h4 className="text-base font-serif font-bold text-stone-100 capitalize mt-0.5">
              {selectedDateFormatted}
            </h4>
          </div>

          {/* Status Alert Badge: "Mire rason si o no" */}
          <div className={`p-4 rounded-2xl flex items-start space-x-3 border transition-colors ${
            hasItemsOnSelectedDay 
              ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
              : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              hasItemsOnSelectedDay ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {hasItemsOnSelectedDay ? <AlertCircle className="w-4.5 h-4.5" /> : <Check className="w-4.5 h-4.5" />}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider font-mono">
                ¿Tienes planes o recuerdos?
              </div>
              <div className="text-sm font-bold mt-0.5 font-serif text-stone-100">
                {hasItemsOnSelectedDay ? 'SÍ, TIENES ACTIVIDADES' : 'NO, DÍA TOTALMENTE LIBRE'}
              </div>
              <p className="text-stone-400 text-[11px] mt-1 leading-relaxed">
                {hasItemsOnSelectedDay 
                  ? 'Revisa abajo la lista de recordatorios pendientes y recuerdos de Canarias anotados en esta jornada.'
                  : 'Este día no tiene obligaciones ni entradas creadas en tu agenda por ahora.'}
              </p>
            </div>
          </div>

          {/* Assistant Reasoning & Empty Check Panel: "si no tienes te lo dise" */}
          <div className="bg-stone-950/40 border border-stone-850 p-4 rounded-2xl space-y-2 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Análisis y Actitud de la Asistente
              </span>
              <span className="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full capitalize font-semibold">
                Tono: {emotionMode}
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed italic font-serif relative z-10">
              "{hasItemsOnSelectedDay 
                ? `Yeikon, veo que este día tienes una agenda con ${dayReminders.length} tarea(s) y ${dayDiaryEntries.length} nota(s) registradas. Me alegra ayudarte a seguir tu ritmo y no olvidar tus pendientes.`
                : emptyDayResponse
              }"
            </p>
          </div>

          {/* Items Container */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              <span>Registros del Día</span>
              <span>{dayReminders.length + dayDiaryEntries.length} ítems</span>
            </div>

            {hasItemsOnSelectedDay ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800">
                {/* Reminders List */}
                {dayReminders.map(r => (
                  <div key={r.id} className="p-3 rounded-xl bg-stone-950/30 border border-stone-850 flex items-start justify-between gap-3 text-left">
                    <div className="flex items-start space-x-2.5 truncate">
                      <div className={`mt-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                        r.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {r.completed ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      </div>
                      <div className="truncate">
                        <span className={`text-xs font-bold text-stone-200 block truncate ${r.completed ? 'line-through text-stone-500' : ''}`}>
                          {r.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                          <span className="bg-stone-900 border border-stone-800 px-1.5 py-0.5 rounded-md text-[9px] font-mono">
                            {r.category}
                          </span>
                          {r.time && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-stone-500" /> {r.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md border shrink-0 ${
                      r.priority === 'Alta' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      r.priority === 'Media' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {r.priority}
                    </span>
                  </div>
                ))}

                {/* Diary Entries List */}
                {dayDiaryEntries.map(e => (
                  <div key={e.id} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all text-left space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-stone-200 flex items-center gap-1 truncate">
                        <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {e.title}
                      </span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                        {e.mood}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {e.content}
                    </p>
                    {e.location && (
                      <span className="text-[9px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-600" /> {e.location}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-stone-950/20 border border-stone-850 border-dashed text-center space-y-2">
                <Info className="w-6 h-6 text-stone-600 mx-auto" />
                <p className="text-stone-400 text-xs italic">
                  No hay anotaciones para este día. ¡Disfruta de tu tiempo libre!
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setIsReminderFormOpen(true)}
              className="flex items-center justify-center space-x-1 px-3 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-750 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-rose-500" />
              <span>Añadir Tarea</span>
            </button>
            <button
              onClick={() => setIsDiaryFormOpen(true)}
              className="flex items-center justify-center space-x-1 px-3 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-750 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Nueva Nota</span>
            </button>
          </div>

          {/* Main Consult with Assistant CTA */}
          <button
            onClick={handleAskAssistantAboutDate}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consultar Disponibilidad con Asistente</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* QUICK ADD REMINDER MODAL */}
      <AnimatePresence>
        {isReminderFormOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border border-stone-800 w-full max-w-md p-5 rounded-3xl shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setIsReminderFormOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-stone-950/40 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-stone-800 pb-2">
                <h3 className="font-serif font-bold text-base text-stone-100">
                  Nuevo Recordatorio para el {selectedDateFormatted}
                </h3>
              </div>

              <form onSubmit={handleAddReminderSubmit} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Título</label>
                  <input
                    type="text"
                    required
                    value={remTitle}
                    onChange={(e) => setRemTitle(e.target.value)}
                    placeholder="Ej. Visita guiada en Telde..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Descripción (Opcional)</label>
                  <textarea
                    value={remDesc}
                    onChange={(e) => setRemDesc(e.target.value)}
                    placeholder="Detalles de la tarea..."
                    rows={2}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Hora</label>
                    <input
                      type="time"
                      value={remTime}
                      onChange={(e) => setRemTime(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Prioridad</label>
                    <select
                      value={remPriority}
                      onChange={(e) => setRemPriority(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Categoría / Localidad</label>
                  <select
                    value={remCat}
                    onChange={(e) => setRemCat(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Tejina">Tejina</option>
                    <option value="Valle de Guerra">Valle de Guerra</option>
                    <option value="Bajamar">Bajamar</option>
                    <option value="La Punta">La Punta del Hidalgo</option>
                    <option value="Tacoronte">Tacoronte</option>
                    <option value="Telde">Telde</option>
                    <option value="Tejeda">Tejeda</option>
                    <option value="General">General</option>
                    <option value="Personal">Personal</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Salud">Salud</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 font-bold text-xs text-white transition-all shadow-md cursor-pointer"
                >
                  Guardar Recordatorio
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK ADD DIARY ENTRY MODAL */}
      <AnimatePresence>
        {isDiaryFormOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border border-stone-800 w-full max-w-md p-5 rounded-3xl shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setIsDiaryFormOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-stone-950/40 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="border-b border-stone-800 pb-2">
                <h3 className="font-serif font-bold text-base text-stone-100">
                  Nueva Entrada de Diario para el {selectedDateFormatted}
                </h3>
              </div>

              <form onSubmit={handleAddDiarySubmit} className="space-y-3.5 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Título del Recuerdo</label>
                  <input
                    type="text"
                    required
                    value={diaryTitle}
                    onChange={(e) => setDiaryTitle(e.target.value)}
                    placeholder="Ej. Caminata por el casco histórico..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Contenido</label>
                  <textarea
                    required
                    value={diaryContent}
                    onChange={(e) => setDiaryContent(e.target.value)}
                    placeholder="Describe lo que sentiste, viste o el clima en Canarias hoy..."
                    rows={3}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Lugar (Opcional)</label>
                  <input
                    type="text"
                    value={diaryLocation}
                    onChange={(e) => setDiaryLocation(e.target.value)}
                    placeholder="Ej. Tejeda, Gran Canaria"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Tu Estado de Ánimo</label>
                    <select
                      value={diaryMood}
                      onChange={(e) => setDiaryMood(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Tranquilo">Tranquilo</option>
                      <option value="Alegre">Alegre</option>
                      <option value="Inspirado">Inspirado</option>
                      <option value="Cansado">Cansado</option>
                      <option value="Agradecido">Agradecido</option>
                      <option value="Nostálgico">Nostálgico</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Tipo de Nota</label>
                    <select
                      value={diaryCat}
                      onChange={(e) => setDiaryCat(e.target.value as any)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Reflexión">Reflexión</option>
                      <option value="Actividad">Actividad</option>
                      <option value="Plan">Plan</option>
                      <option value="Nota">Nota</option>
                      <option value="Especial">Especial</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 font-bold text-xs text-white transition-all shadow-md cursor-pointer"
                >
                  Añadir Memoria al Diario
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
