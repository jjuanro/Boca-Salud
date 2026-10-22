import React from 'react';
import { Wine, Sparkles, CheckCircle2, Lock, AlertCircle, Info } from 'lucide-react';
import { AuraMetricsSummary } from '../types/health';

interface CheatMealTrackerProps {
  summary: AuraMetricsSummary;
  onToggleCaprichoToday?: () => void;
}

export const CheatMealTracker: React.FC<CheatMealTrackerProps> = ({ summary }) => {
  const isUnlocked = summary.cheatMealAllowed;
  const remainingCaprichos = Math.max(2 - summary.cheatMealsUsed, 0);

  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-300 ${
        isUnlocked
          ? 'boca-card-gold shadow-lg shadow-[#0A84FF]/10 border border-[#0A84FF]/35 bg-gradient-to-br from-[#0F1424] to-[#0A0C12]'
          : summary.cheatMealsUsed >= 2
          ? 'aura-card-burgundy shadow-lg border border-[#D4AF37]/30 bg-[#120D14]'
          : 'boca-card bg-[#0F131E] border-[#0A84FF]/25'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isUnlocked
                ? 'bg-gradient-to-br from-[#0A84FF]/20 to-[#D4AF37]/20 text-[#D4AF37] border border-[#0A84FF]/40'
                : 'bg-neutral-900 text-slate-400 border border-neutral-800'
            }`}
          >
            <Wine className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Control de Caprichos (Cheat Meals)
              </h3>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/35">
                Regla 80/20
              </span>
            </div>
            <p className="text-xs text-[#38BDF8]">
              Boca Salud · Máximo 2 comidas libres por semana
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-right">
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Desbloqueado</span>
            </span>
          ) : summary.cheatMealsUsed >= 2 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#E74C3C]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Agotados (2/2)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Bloqueado (&lt;80%)</span>
            </span>
          )}
        </div>
      </div>

      {/* 2 Capricho Visual Tokens */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {/* Token 1 */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition ${
            summary.cheatMealsUsed >= 1
              ? 'bg-[#800020]/30 border-[#800020] text-slate-200'
              : isUnlocked
              ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-white'
              : 'bg-neutral-900 border-neutral-800 text-slate-400 opacity-60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🍷</span>
            <div>
              <div className="text-xs font-bold">1.º Capricho</div>
              <div className="text-[10px] text-slate-400">
                {summary.cheatMealsUsed >= 1 ? 'Consumido' : isUnlocked ? 'Disponible' : 'Requiere 80%'}
              </div>
            </div>
          </div>
          {summary.cheatMealsUsed >= 1 ? (
            <CheckCircle2 className="w-4 h-4 text-[#E74C3C]" />
          ) : isUnlocked ? (
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
          )}
        </div>

        {/* Token 2 */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between transition ${
            summary.cheatMealsUsed >= 2
              ? 'bg-[#800020]/30 border-[#800020] text-slate-200'
              : isUnlocked && summary.cheatMealsUsed === 1
              ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-white'
              : isUnlocked && summary.cheatMealsUsed === 0
              ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-white'
              : 'bg-neutral-900 border-neutral-800 text-slate-400 opacity-60'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🍷</span>
            <div>
              <div className="text-xs font-bold">2.º Capricho</div>
              <div className="text-[10px] text-slate-400">
                {summary.cheatMealsUsed >= 2 ? 'Consumido' : isUnlocked ? 'Disponible' : 'Requiere 80%'}
              </div>
            </div>
          </div>
          {summary.cheatMealsUsed >= 2 ? (
            <CheckCircle2 className="w-4 h-4 text-[#E74C3C]" />
          ) : isUnlocked ? (
            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
          )}
        </div>
      </div>

      {/* Progress to unlock / info */}
      <div className="pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Info className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>
            Adherencia actual limpia: <strong className="text-white">{summary.healthyEatingRate}%</strong> (mín. 80%)
          </span>
        </div>

        <span className="text-[11px] text-[#D4AF37] font-semibold">
          {remainingCaprichos} de 2 libres
        </span>
      </div>
    </div>
  );
};
