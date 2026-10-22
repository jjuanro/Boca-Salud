import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trophy, 
  Award, Sparkles, Droplets, Apple, Flame, Wine, CheckCircle2, 
  X, Filter, BarChart3, Clock 
} from 'lucide-react';
import { DayTracking, CalendarDayInfo, CalendarWeekInfo, DayOfWeek } from '../types/health';
import { 
  MONTH_NAMES_SPANISH, 
  MONTH_SHORT_SPANISH, 
  generateMonthData, 
  computeDailyScore, 
  formatDateToISO 
} from '../utils/calendarService';
import { sounds } from '../utils/audio';

interface AnnualCalendarViewProps {
  historyMap: Record<string, DayTracking>;
  onSaveDayTracking: (dateStr: string, tracking: DayTracking) => void;
}

export const AnnualCalendarView: React.FC<AnnualCalendarViewProps> = ({
  historyMap,
  onSaveDayTracking,
}) => {
  const currentYearNow = new Date().getFullYear();
  const currentMonthNow = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<number>(currentYearNow);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthNow);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  // Selected day for detailed inspection modal
  const [activeDay, setActiveDay] = useState<CalendarDayInfo | null>(null);

  // Month data
  const { weeks, days } = generateMonthData(selectedYear, selectedMonth, historyMap);

  const handlePrevMonth = () => {
    sounds.playTap();
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    sounds.playTap();
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day: CalendarDayInfo) => {
    sounds.playTap();
    // Retrieve fresh tracking from historyMap or create blank
    const tracking = historyMap[day.dateStr] || {
      dia: day.dayOfWeek,
      agua_cumplida: false,
      comida_saludable: false,
      ejercicio_completado: false,
      capricho_usado: false,
      agua_litros: 0,
    };
    setActiveDay({
      ...day,
      tracking,
      score: computeDailyScore(tracking),
    });
  };

  const handleModalSave = (updatedTracking: DayTracking) => {
    if (!activeDay) return;
    sounds.playTap();
    onSaveDayTracking(activeDay.dateStr, updatedTracking);
    setActiveDay(null);
  };

  const getDayScoreBadgeClass = (score: number) => {
    if (score === 0) return 'text-slate-600 border-neutral-800 bg-neutral-900/40';
    if (score >= 9.0) return 'text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/15 font-bold';
    if (score >= 8.0) return 'text-[#0A84FF] border-[#0A84FF]/50 bg-[#0A84FF]/15 font-semibold';
    if (score >= 7.0) return 'text-[#38BDF8] border-[#38BDF8]/40 bg-[#38BDF8]/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  // Year summary calculations
  const yearEntries = Object.entries(historyMap).filter(([k]) => k.startsWith(`${selectedYear}-`));
  const evaluatedDaysCount = yearEntries.length;
  const yearWaterMetCount = yearEntries.filter(([, v]) => v.agua_cumplida).length;
  const yearExerciseCount = yearEntries.filter(([, v]) => v.ejercicio_completado).length;
  const yearCleanRate = evaluatedDaysCount > 0 
    ? Math.round((yearEntries.filter(([, v]) => v.comida_saludable).length / evaluatedDaysCount) * 100) 
    : 0;

  const totalScoreSum = yearEntries.reduce((sum, [, v]) => sum + computeDailyScore(v), 0);
  const yearAverageScore = evaluatedDaysCount > 0 ? (totalScoreSum / evaluatedDaysCount).toFixed(1) : '0.0';

  return (
    <div className="space-y-4 pb-20">
      {/* Year & Month Controller Bar */}
      <div className="boca-card-gold rounded-3xl p-4 border border-[#0A84FF]/30 shadow-xl bg-gradient-to-br from-[#0F1424] via-[#0D101A] to-[#0A0C12]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedYear((y) => y - 1);
              }}
              className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white hover:border-[#0A84FF]/40 transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-lg font-black text-white tracking-tight font-mono px-1">
              {selectedYear}
            </span>
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedYear((y) => y + 1);
              }}
              className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white hover:border-[#0A84FF]/40 transition active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher: Mes / Año */}
          <div className="flex p-0.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('month');
              }}
              className={`py-1 px-3 rounded-lg font-semibold transition ${
                viewMode === 'month'
                  ? 'bg-gradient-to-r from-[#0A84FF] to-[#0284C7] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                setViewMode('year');
              }}
              className={`py-1 px-3 rounded-lg font-semibold transition ${
                viewMode === 'year'
                  ? 'bg-gradient-to-r from-[#0A84FF] to-[#0284C7] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              12 Meses
            </button>
          </div>
        </div>

        {/* Year Metric Badges */}
        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-neutral-800/80 text-center">
          <div className="p-2 rounded-xl bg-[#0A0D14] border border-neutral-800/80">
            <span className="text-[10px] text-[#D4AF37] block font-semibold">Nota Anual</span>
            <strong className="text-white text-sm font-mono font-bold">{yearAverageScore}</strong>
            <span className="text-[9px] text-slate-400 block">/ 10</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0A0D14] border border-neutral-800/80">
            <span className="text-[10px] text-[#38BDF8] block font-semibold">💧 Agua 2L+</span>
            <strong className="text-white text-sm font-mono font-bold">{yearWaterMetCount}</strong>
            <span className="text-[9px] text-slate-400 block">días</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0A0D14] border border-neutral-800/80">
            <span className="text-[10px] text-[#0A84FF] block font-semibold">🏃 Entrenos</span>
            <strong className="text-white text-sm font-mono font-bold">{yearExerciseCount}</strong>
            <span className="text-[9px] text-slate-400 block">sesiones</span>
          </div>
          <div className="p-2 rounded-xl bg-[#0A0D14] border border-neutral-800/80">
            <span className="text-[10px] text-[#D4AF37] block font-semibold">🍏 Dieta 80/20</span>
            <strong className="text-white text-sm font-mono font-bold">{yearCleanRate}%</strong>
            <span className="text-[9px] text-slate-400 block">limpia</span>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: DETAILED MONTH CALENDAR */}
      {viewMode === 'month' && (
        <div className="space-y-4">
          {/* Month Navigator Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold text-white tracking-tight">
                {MONTH_NAMES_SPANISH[selectedMonth]} {selectedYear}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="text-xs text-[#38BDF8] font-medium">
              Toca un día para ver/editar
            </span>
          </div>

          {/* Weeks and Days Grid */}
          <div className="space-y-3">
            {weeks.map((week) => (
              <div
                key={week.weekNumber}
                className="boca-card rounded-2xl p-3 border border-[#0A84FF]/25 shadow-lg bg-[#0F131E]"
              >
                {/* Week Score Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30">
                      Semana {week.weekNumber}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {week.days[0].dayNumber} {MONTH_SHORT_SPANISH[week.days[0].month]} - {week.days[6].dayNumber} {MONTH_SHORT_SPANISH[week.days[6].month]}
                    </span>
                  </div>

                  {/* Weekly Score Badge */}
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-slate-400 text-[11px]">Nota Semanal:</span>
                    <strong className="text-sm font-mono text-white font-bold">
                      {week.weekScore > 0 ? `${week.weekScore} / 10` : '—'}
                    </strong>
                    {week.weekScore > 0 && (
                      <span className="text-[10px] font-semibold text-[#D4AF37] ml-1">
                        ({week.gradeLabel})
                      </span>
                    )}
                  </div>
                </div>

                {/* Week Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {/* Column headers (L, M, X, J, V, S, D) */}
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <div key={i} className="text-[10px] font-bold text-slate-300 pb-1">
                      {d}
                    </div>
                  ))}

                  {/* The 7 Day Cells */}
                  {week.days.map((day) => {
                    const isEvaluated = day.score > 0;

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => handleDayClick(day)}
                        className={`p-1.5 rounded-xl border flex flex-col items-center justify-between cursor-pointer transition-all duration-200 active:scale-95 min-h-[58px] ${
                          day.isToday
                            ? 'border-[#0A84FF] bg-[#0A84FF]/20 shadow-md shadow-[#0A84FF]/20'
                            : day.isCurrentMonth
                            ? 'border-neutral-800 bg-[#0A0D14] hover:border-[#0A84FF]/40'
                            : 'border-neutral-900 bg-neutral-950/40 opacity-40 hover:opacity-80'
                        }`}
                      >
                        {/* Day number */}
                        <span
                          className={`text-xs font-bold leading-none ${
                            day.isToday
                              ? 'text-white'
                              : day.isCurrentMonth
                              ? 'text-slate-200'
                              : 'text-slate-500'
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {/* Day Score Pill */}
                        <div
                          className={`text-[9px] px-1 py-0.5 rounded-md border my-0.5 font-mono ${getDayScoreBadgeClass(
                            day.score
                          )}`}
                        >
                          {isEvaluated ? day.score.toFixed(1) : '—'}
                        </div>

                        {/* Parameter mini indicators */}
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <span
                            className={`w-1 h-1 rounded-full ${
                              day.tracking?.comida_saludable ? 'bg-[#D4AF37]' : 'bg-neutral-800'
                            }`}
                            title="Comida limpia"
                          />
                          <span
                            className={`w-1 h-1 rounded-full ${
                              day.tracking?.agua_cumplida ? 'bg-[#38BDF8]' : 'bg-neutral-800'
                            }`}
                            title="Agua 2L+"
                          />
                          <span
                            className={`w-1 h-1 rounded-full ${
                              day.tracking?.ejercicio_completado ? 'bg-[#0A84FF]' : 'bg-neutral-800'
                            }`}
                            title="Entreno"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: 12 MONTHS YEARLY OVERVIEW */}
      {viewMode === 'year' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MONTH_NAMES_SPANISH.map((name, mIdx) => {
              const monthData = generateMonthData(selectedYear, mIdx, historyMap);
              const scoredDays = monthData.days.filter((d) => d.isCurrentMonth && d.score > 0);
              const monthAvg =
                scoredDays.length > 0
                  ? (scoredDays.reduce((acc, d) => acc + d.score, 0) / scoredDays.length).toFixed(1)
                  : '—';

              const isCurrent = mIdx === currentMonthNow && selectedYear === currentYearNow;

              return (
                <div
                  key={mIdx}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedMonth(mIdx);
                    setViewMode('month');
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 active:scale-95 ${
                    isCurrent
                      ? 'border-[#0A84FF] bg-gradient-to-br from-[#0F1424] to-[#0A0C12] shadow-md shadow-[#0A84FF]/20'
                      : 'border-neutral-800/80 bg-[#0F131E] hover:border-[#0A84FF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-white tracking-tight">
                      {name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-[#D4AF37]">
                      {monthAvg !== '—' ? `${monthAvg} / 10` : '—'}
                    </span>
                  </div>

                  {/* Micro mini heatmap */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthData.days.filter((d) => d.isCurrentMonth).map((d) => (
                      <div
                        key={d.dateStr}
                        className={`h-2.5 rounded-[3px] transition ${
                          d.score >= 9.0
                            ? 'bg-[#D4AF37]'
                            : d.score >= 8.0
                            ? 'bg-[#0A84FF]'
                            : d.score >= 7.0
                            ? 'bg-[#38BDF8]'
                            : d.score > 0
                            ? 'bg-amber-500/60'
                            : 'bg-neutral-800'
                        }`}
                        title={`${d.dayNumber} de ${name}: ${d.score > 0 ? d.score.toFixed(1) + '/10' : 'Sin datos'}`}
                      />
                    ))}
                  </div>

                  <span className="text-[9px] text-[#38BDF8] mt-2 block font-medium">
                    {scoredDays.length} días evaluados
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day Inspection & Quick Edit Modal */}
      {activeDay && activeDay.tracking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0F131D] border border-[#0A84FF]/35 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#0A84FF]/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A84FF]/20 to-[#D4AF37]/20 border border-[#0A84FF]/30 flex items-center justify-center text-[#D4AF37]">
                  <CalendarIcon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {activeDay.dayOfWeek}, {activeDay.dayNumber} de {MONTH_NAMES_SPANISH[activeDay.month]}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">
                      Nota del Día: {computeDailyScore(activeDay.tracking).toFixed(1)} / 10
                    </span>
                    <span className="text-[10px] text-slate-400">({activeDay.dateStr})</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveDay(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-slate-300 flex items-center justify-center hover:bg-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Parameter Check Toggles */}
            <div className="space-y-3 pt-4 text-xs">
              {/* Comida Limpia 80/20 */}
              <div
                onClick={() => {
                  sounds.playTap();
                  if (!activeDay.tracking) return;
                  setActiveDay({
                    ...activeDay,
                    tracking: {
                      ...activeDay.tracking,
                      comida_saludable: !activeDay.tracking.comida_saludable,
                    },
                  });
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  activeDay.tracking.comida_saludable
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-white'
                    : 'bg-[#0A0D14] border-neutral-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Apple className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <strong className="block text-white">Alimentación Limpia (80/20)</strong>
                    <span className="text-[10px] text-slate-400">+4.0 puntos</span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold ${
                    activeDay.tracking.comida_saludable
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                      : 'border-neutral-700'
                  }`}
                >
                  {activeDay.tracking.comida_saludable && '✓'}
                </div>
              </div>

              {/* Hidratación */}
              <div
                onClick={() => {
                  sounds.playTap();
                  if (!activeDay.tracking) return;
                  const nextWater = !activeDay.tracking.agua_cumplida;
                  setActiveDay({
                    ...activeDay,
                    tracking: {
                      ...activeDay.tracking,
                      agua_cumplida: nextWater,
                      agua_litros: nextWater ? 2.2 : 0,
                    },
                  });
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  activeDay.tracking.agua_cumplida
                    ? 'bg-[#0A84FF]/15 border-[#0A84FF]/50 text-white'
                    : 'bg-[#0A0D14] border-neutral-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-4 h-4 text-[#38BDF8]" />
                  <div>
                    <strong className="block text-white">Hidratación (&gt;= 2.0L a 2.5L)</strong>
                    <span className="text-[10px] text-slate-400">+2.5 puntos</span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold ${
                    activeDay.tracking.agua_cumplida
                      ? 'bg-[#0A84FF] border-[#0A84FF] text-white'
                      : 'border-neutral-700'
                  }`}
                >
                  {activeDay.tracking.agua_cumplida && '✓'}
                </div>
              </div>

              {/* Actividad Física */}
              <div
                onClick={() => {
                  sounds.playTap();
                  if (!activeDay.tracking) return;
                  setActiveDay({
                    ...activeDay,
                    tracking: {
                      ...activeDay.tracking,
                      ejercicio_completado: !activeDay.tracking.ejercicio_completado,
                      ejercicio_minutos: !activeDay.tracking.ejercicio_completado ? 40 : 0,
                    },
                  });
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  activeDay.tracking.ejercicio_completado
                    ? 'bg-[#0A84FF]/15 border-[#0A84FF]/50 text-white'
                    : 'bg-[#0A0D14] border-neutral-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-[#0A84FF]" />
                  <div>
                    <strong className="block text-white">Actividad Física Completada</strong>
                    <span className="text-[10px] text-slate-400">+2.5 puntos</span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold ${
                    activeDay.tracking.ejercicio_completado
                      ? 'bg-[#0A84FF] border-[#0A84FF] text-white'
                      : 'border-neutral-700'
                  }`}
                >
                  {activeDay.tracking.ejercicio_completado && '✓'}
                </div>
              </div>

              {/* Capricho Usado */}
              <div
                onClick={() => {
                  sounds.playTap();
                  if (!activeDay.tracking) return;
                  setActiveDay({
                    ...activeDay,
                    tracking: {
                      ...activeDay.tracking,
                      capricho_usado: !activeDay.tracking.capricho_usado,
                    },
                  });
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  activeDay.tracking.capricho_usado
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-white'
                    : 'bg-[#0A0D14] border-neutral-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wine className="w-4 h-4 text-[#D4AF37]" />
                  <div>
                    <strong className="block text-white">Comida Libre / Capricho Consumido</strong>
                    <span className="text-[10px] text-slate-400">Regla 80/20 (máx 2 por semana)</span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold ${
                    activeDay.tracking.capricho_usado
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                      : 'border-neutral-700'
                  }`}
                >
                  {activeDay.tracking.capricho_usado && '✓'}
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Notas de platos o sensaciones
                </label>
                <input
                  type="text"
                  placeholder="Ej. Salmón con verduras y paseo vespertino..."
                  value={activeDay.tracking.notas || ''}
                  onChange={(e) => {
                    if (!activeDay.tracking) return;
                    setActiveDay({
                      ...activeDay,
                      tracking: {
                        ...activeDay.tracking,
                        notas: e.target.value,
                      },
                    });
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#0A0D14] border border-neutral-800 text-xs text-white focus:outline-none focus:border-[#0A84FF]"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDay(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-slate-300 text-xs font-semibold"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleModalSave(activeDay.tracking!)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0284C7] text-white font-bold text-xs shadow-lg shadow-[#0A84FF]/25 transition active:scale-95"
                >
                  Guardar Día
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
