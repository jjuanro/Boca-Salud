import React, { useState } from 'react';
import { Check, Droplets, Apple, Flame, Wine, ChevronRight, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { DayTracking, DayOfWeek } from '../types/health';
import { sounds } from '../utils/audio';

interface WeeklyTableProps {
  weekData: DayTracking[];
  onToggleCheck: (day: DayOfWeek, field: 'agua_cumplida' | 'comida_saludable' | 'ejercicio_completado' | 'capricho_usado') => void;
  onUpdateDayDetails: (day: DayOfWeek, details: Partial<DayTracking>) => void;
  onResetWeek: () => void;
  onClearPriorDays?: () => void;
}

export const WeeklyTable: React.FC<WeeklyTableProps> = ({
  weekData,
  onToggleCheck,
  onUpdateDayDetails,
  onResetWeek,
  onClearPriorDays,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayTracking | null>(null);

  // Detect current day in Spanish
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
  const todayName: DayOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][todayIndex] as DayOfWeek;

  const handleCellClick = (
    e: React.MouseEvent,
    day: DayOfWeek,
    field: 'agua_cumplida' | 'comida_saludable' | 'ejercicio_completado' | 'capricho_usado'
  ) => {
    e.stopPropagation();
    sounds.playTap();
    onToggleCheck(day, field);
  };

  const handleOpenModal = (day: DayTracking) => {
    sounds.playTap();
    setSelectedDay({ ...day });
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    onUpdateDayDetails(selectedDay.dia, {
      agua_litros: selectedDay.agua_litros,
      ejercicio_minutos: selectedDay.ejercicio_minutos,
      notas: selectedDay.notas,
      agua_cumplida: (selectedDay.agua_litros || 0) >= 2.0 ? true : selectedDay.agua_cumplida,
    });
    sounds.playTap();
    setSelectedDay(null);
  };

  return (
    <div className="space-y-3">
      {/* Table Header and Quick Actions */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <span>Tabla Interactiva Semanal</span>
            <span className="text-[10px] font-semibold text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              Semana Actual
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Toca las casillas para registrar tu disciplina diaria
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onClearPriorDays && (
            <button
              onClick={() => {
                sounds.playTap();
                onClearPriorDays();
              }}
              title="Borrar todos los datos de los días previos a hoy y reiniciar puntuación"
              className="text-xs text-[#D4AF37] hover:text-[#f3cd5a] transition flex items-center gap-1 py-1 px-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 hover:bg-[#D4AF37]/20 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[10px] font-semibold hidden xs:inline">Borrar previos</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playTap();
              onResetWeek();
            }}
            title="Reiniciar valores de la semana"
            className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 p-1.5 rounded-lg hover:bg-neutral-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Luxury Table Container in Negro + Azul & Oro */}
      <div className="boca-card rounded-2xl overflow-hidden shadow-xl border border-[#0A84FF]/25">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[340px]">
            <thead>
              <tr className="border-b border-[#0A84FF]/15 bg-[#0F131E] text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                <th className="py-3 px-3">Día</th>
                <th className="py-3 px-2 text-center" title="Meta >= 2.0L">
                  <div className="flex flex-col items-center">
                    <Droplets className="w-4 h-4 text-[#38BDF8] mb-0.5" />
                    <span className="text-[9px] text-[#38BDF8]">2.0L+</span>
                  </div>
                </th>
                <th className="py-3 px-2 text-center" title="Comida Limpia 80/20">
                  <div className="flex flex-col items-center">
                    <Apple className="w-4 h-4 text-[#D4AF37] mb-0.5" />
                    <span className="text-[9px] text-[#D4AF37]">80/20</span>
                  </div>
                </th>
                <th className="py-3 px-2 text-center" title="Actividad Física">
                  <div className="flex flex-col items-center">
                    <Flame className="w-4 h-4 text-[#0A84FF] mb-0.5" />
                    <span className="text-[9px] text-[#0A84FF]">Entreno</span>
                  </div>
                </th>
                <th className="py-3 px-2 text-center" title="Capricho (Cheat Meal, máx 2)">
                  <div className="flex flex-col items-center">
                    <Wine className="w-4 h-4 text-[#D4AF37] mb-0.5" />
                    <span className="text-[9px] text-[#D4AF37]">Cheat</span>
                  </div>
                </th>
                <th className="py-3 px-2 text-center w-8"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#0A84FF]/10 text-xs">
              {weekData.map((row) => {
                const isToday = row.dia === todayName;

                return (
                  <tr
                    key={row.dia}
                    onClick={() => handleOpenModal(row)}
                    className={`group cursor-pointer transition-colors ${
                      isToday
                        ? 'bg-[#141A28]/70 hover:bg-[#141A28]'
                        : 'hover:bg-[#111522]/60'
                    }`}
                  >
                    {/* Day Column */}
                    <td className="py-3 px-3 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">
                          {row.dia}
                        </span>
                        {isToday && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#0A84FF]/20 text-[#38BDF8] border border-[#0A84FF]/40 uppercase tracking-wider">
                            Hoy
                          </span>
                        )}
                      </div>
                      {row.notas && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[100px] mt-0.5">
                          {row.notas}
                        </div>
                      )}
                    </td>

                    {/* Checkbox 1: Agua Cumplida (Azul) */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleCellClick(e, row.dia, 'agua_cumplida')}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 ${
                          row.agua_cumplida
                            ? 'bg-[#0A84FF] text-white shadow-md shadow-[#0A84FF]/30'
                            : 'bg-[#0A0D14] border border-[#0A84FF]/30 hover:border-[#38BDF8] text-transparent'
                        }`}
                        title="¿Alcanzaste 2.0L o más de agua hoy?"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </td>

                    {/* Checkbox 2: Comida Saludable (Oro) */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleCellClick(e, row.dia, 'comida_saludable')}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 ${
                          row.comida_saludable
                            ? 'bg-[#D4AF37] text-neutral-950 font-bold shadow-md shadow-[#D4AF37]/35'
                            : 'bg-[#0A0D14] border border-[#D4AF37]/35 hover:border-[#D4AF37] text-transparent'
                        }`}
                        title="¿Mantuviste tu alimentación limpia 80/20?"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </td>

                    {/* Checkbox 3: Ejercicio Completado (Azul Zafiro / Eléctrico) */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleCellClick(e, row.dia, 'ejercicio_completado')}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 ${
                          row.ejercicio_completado
                            ? 'bg-gradient-to-br from-[#0A84FF] to-[#0284C7] text-white shadow-md shadow-[#0A84FF]/30'
                            : 'bg-[#0A0D14] border border-[#0A84FF]/30 hover:border-[#0A84FF] text-transparent'
                        }`}
                        title="¿Completaste actividad física o entreno?"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </td>

                    {/* Checkbox 4: Capricho Usado (Oro & Borgoña suave) */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleCellClick(e, row.dia, 'capricho_usado')}
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all duration-200 active:scale-90 ${
                          row.capricho_usado
                            ? 'bg-gradient-to-br from-[#D4AF37] to-[#B38F23] text-neutral-950 font-bold shadow-md shadow-[#D4AF37]/30'
                            : 'bg-[#0A0D14] border border-neutral-700 hover:border-[#D4AF37]/60 text-transparent'
                        }`}
                        title="Comida libre o cheat meal consumido"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </td>

                    {/* Row Arrow */}
                    <td className="py-2.5 px-2 text-center text-slate-500 group-hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="bg-neutral-900/90 px-4 py-2.5 border-t border-neutral-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>* Toca cualquier día para añadir notas o litros exactos.</span>
          <span className="text-[#D4AF37] font-medium">Meta semanal 80/20 activa</span>
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0F131D] border border-[#0A84FF]/30 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#0A84FF]/20">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Detalles de {selectedDay.dia}</span>
                  <span className="text-xs text-[#0A84FF] font-semibold">Boca Salud</span>
                </h3>
                <p className="text-xs text-slate-400">Personaliza tus métricas del día</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 text-slate-300 flex items-center justify-center hover:bg-neutral-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    💧 Litros de Agua (L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="6"
                    value={selectedDay.agua_litros ?? ''}
                    onChange={(e) =>
                      setSelectedDay({
                        ...selectedDay,
                        agua_litros: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Ej. 2.4"
                    className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Meta: &gt;= 2.0L a 2.5L
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    🏃 Minutos de Ejercicio
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={selectedDay.ejercicio_minutos ?? ''}
                    onChange={(e) =>
                      setSelectedDay({
                        ...selectedDay,
                        ejercicio_minutos: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    placeholder="Ej. 45"
                    className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Actividad física o descanso activo
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas de platos, recetas o sensaciones
                </label>
                <textarea
                  rows={2}
                  value={selectedDay.notas ?? ''}
                  onChange={(e) =>
                    setSelectedDay({
                      ...selectedDay,
                      notas: e.target.value,
                    })
                  }
                  placeholder="Ej. Almuerzo limpio con salmón, cena ligera y paseo vespertino..."
                  className="w-full py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-slate-300 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29D2C] text-neutral-950 font-bold text-xs shadow-lg shadow-[#D4AF37]/20 transition"
                >
                  Guardar Día
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
