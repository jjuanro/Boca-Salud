import React, { useState } from 'react';
import { Droplets, Apple, Flame, Wine, Plus, CheckCircle, Scale, Moon, Sparkles } from 'lucide-react';
import { DayTracking, DayOfWeek } from '../types/health';
import { sounds } from '../utils/audio';

interface AuraMetricsDetailProps {
  currentDay: DayTracking;
  onUpdateDay: (details: Partial<DayTracking>) => void;
  onAddWaterLitres: (amount: number) => void;
}

export const AuraMetricsDetail: React.FC<AuraMetricsDetailProps> = ({
  currentDay,
  onUpdateDay,
  onAddWaterLitres,
}) => {
  const [mealText, setMealText] = useState('');

  const currentWater = currentDay.agua_litros || 0;
  const isWaterMet = currentWater >= 2.0;

  const handleAddWater = (litres: number) => {
    sounds.playWaterDrop();
    onAddWaterLitres(litres);
  };

  const handleAddMealNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText.trim()) return;
    const prev = currentDay.notas ? `${currentDay.notas} · ` : '';
    onUpdateDay({ notas: `${prev}${mealText.trim()}` });
    setMealText('');
    sounds.playTap();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Hydration Interactive Card in Negro + Azul y Oro */}
      <div className="boca-card rounded-3xl p-5 border border-[#0A84FF]/30 shadow-xl relative overflow-hidden bg-gradient-to-br from-[#0F1424] to-[#0A0C12]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0A84FF]/20 border border-[#0A84FF]/40 flex items-center justify-center text-[#38BDF8]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Hidratación de {currentDay.dia}
              </h3>
              <p className="text-xs text-slate-300">Meta recomendada: 2.0L a 2.5L de agua al día</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-[#38BDF8] tracking-tight">
              {currentWater.toFixed(1)} <span className="text-xs text-[#D4AF37] font-semibold">/ 2.5L</span>
            </span>
            <span className="block text-[10px] text-slate-400">
              {isWaterMet ? '✓ Meta alcanzada' : 'En progreso'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-neutral-900 rounded-full overflow-hidden mb-4 border border-[#0A84FF]/20">
          <div
            className="h-full bg-gradient-to-r from-[#0A84FF] via-[#38BDF8] to-[#D4AF37] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(Math.round((currentWater / 2.5) * 100), 100)}%` }}
          />
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAddWater(0.25)}
            className="py-2 px-3 rounded-xl bg-[#0A84FF]/15 hover:bg-[#0A84FF]/25 active:scale-95 border border-[#0A84FF]/35 text-[#38BDF8] text-xs font-semibold transition flex flex-col items-center"
          >
            <span>+0.25 L</span>
            <span className="text-[10px] opacity-70">1 Vaso</span>
          </button>
          <button
            onClick={() => handleAddWater(0.5)}
            className="py-2 px-3 rounded-xl bg-[#0A84FF]/20 hover:bg-[#0A84FF]/30 active:scale-95 border border-[#0A84FF]/40 text-white text-xs font-semibold transition flex flex-col items-center"
          >
            <span>+0.50 L</span>
            <span className="text-[10px] opacity-70">Botella</span>
          </button>
          <button
            onClick={() => handleAddWater(1.0)}
            className="py-2 px-3 rounded-xl bg-[#111522] hover:bg-[#161C2E] active:scale-95 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-semibold transition flex flex-col items-center"
          >
            <span>+1.0 L</span>
            <span className="text-[10px] opacity-70">Jarra</span>
          </button>
        </div>
      </div>

      {/* Clean Food (80/20) Card */}
      <div className="aura-card-gold rounded-3xl p-5 border border-[#D4AF37]/30 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Alimentación Limpia (Regla 80/20)
              </h3>
              <p className="text-xs text-slate-300">
                Prioriza comida real, verduras, proteínas y grasas saludables
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onUpdateDay({ comida_saludable: !currentDay.comida_saludable });
            }}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              currentDay.comida_saludable
                ? 'bg-[#D4AF37] text-neutral-950 shadow-md shadow-[#D4AF37]/20'
                : 'bg-neutral-800 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{currentDay.comida_saludable ? 'Limpia 80/20' : 'Marcar Limpia'}</span>
          </button>
        </div>

        {/* Meal Note input */}
        <form onSubmit={handleAddMealNote} className="flex gap-2 mt-4 pt-3 border-t border-neutral-800">
          <input
            type="text"
            placeholder="Añadir plato (ej. Salmón con quinoa y aguacate)"
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            className="flex-1 py-2 px-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-xs text-[#D4AF37] font-semibold transition"
          >
            Añadir
          </button>
        </form>

        {currentDay.notas && (
          <div className="mt-3 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-slate-300">
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] block mb-1">
              Registro del día
            </span>
            {currentDay.notas}
          </div>
        )}
      </div>

      {/* Physical Activity Card */}
      <div className="aura-card rounded-3xl p-5 border border-emerald-500/20 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Actividad Física & Descanso Activo
              </h3>
              <p className="text-xs text-slate-300">Entrenamiento o movilidad programada</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onUpdateDay({ ejercicio_completado: !currentDay.ejercicio_completado });
            }}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              currentDay.ejercicio_completado
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-neutral-800 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{currentDay.ejercicio_completado ? 'Entrenado' : 'Marcar Entreno'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800">
          <span className="text-slate-400">Minutos de ejercicio registrados:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playTap();
                onUpdateDay({ ejercicio_minutos: Math.max(0, (currentDay.ejercicio_minutos || 0) + 15) });
              }}
              className="py-1 px-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[#D4AF37] font-semibold hover:bg-neutral-800"
            >
              +15 min
            </button>
            <button
              onClick={() => {
                sounds.playTap();
                onUpdateDay({ ejercicio_minutos: Math.max(0, (currentDay.ejercicio_minutos || 0) + 30) });
              }}
              className="py-1 px-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 font-semibold hover:bg-neutral-800"
            >
              +30 min
            </button>
            <span className="font-bold text-white font-mono ml-1">
              {currentDay.ejercicio_minutos || 0} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
