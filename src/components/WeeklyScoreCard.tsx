import React, { useState } from 'react';
import { Trophy, Award, Sparkles, ChevronDown, ChevronUp, Droplets, Apple, Flame, Wine, ShieldCheck } from 'lucide-react';
import { WeeklyScore } from '../types/health';
import { sounds } from '../utils/audio';

interface WeeklyScoreCardProps {
  score: WeeklyScore;
  healthyEatingRate: number;
}

export const WeeklyScoreCard: React.FC<WeeklyScoreCardProps> = ({ score, healthyEatingRate }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (val: number) => {
    if (val >= 9.0) return 'text-[#D4AF37] border-[#D4AF37]/50 bg-[#D4AF37]/10';
    if (val >= 8.0) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (val >= 7.0) return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  };

  const getProgressColor = (val: number) => {
    if (val === 0) return 'bg-slate-700';
    if (val >= 9.0) return 'bg-gradient-to-r from-[#0A84FF] via-[#38BDF8] to-[#D4AF37]';
    if (val >= 8.0) return 'bg-gradient-to-r from-[#0A84FF] to-[#38BDF8]';
    if (val >= 7.0) return 'bg-gradient-to-r from-[#0284C7] to-[#D4AF37]';
    return 'bg-gradient-to-r from-[#1E40AF] to-[#D4AF37]';
  };

  return (
    <div className="boca-card-gold rounded-3xl p-5 border border-[#0A84FF]/35 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0F1424] via-[#0C0F18] to-[#0A0C12]">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#0A84FF]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Score Row */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0A84FF]/25 via-[#141A2A] to-[#D4AF37]/25 border border-[#0A84FF]/40 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#0A84FF]/15">
            <Trophy className="w-6 h-6 stroke-[2.2] text-[#D4AF37]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#38BDF8] uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/35">
                {score.badge}
              </span>
            </div>
            <h3 className="text-base font-black text-white tracking-tight mt-0.5">
              Nota Semanal de Rendimiento
            </h3>
            <span className="text-xs text-[#D4AF37] font-semibold block">
              {score.gradeLabel}
            </span>
          </div>
        </div>

        {/* Big Score Display */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-black tracking-tight text-white font-mono">
              {score.totalScore.toFixed(1)}
            </span>
            <span className="text-xs text-[#D4AF37] font-semibold">/ 10</span>
          </div>
          <span className="text-[10px] text-[#38BDF8] font-semibold block">
            {score.totalScore >= 8.0 ? '✓ Estándar Superado' : score.totalScore > 0 ? 'En optimización' : 'Puntuación Reiniciada'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 mb-2 relative z-10">
        <div className="h-2.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/80 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor(score.totalScore)}`}
            style={{ width: `${Math.min(Math.round(score.totalScore * 10), 100)}%` }}
          />
        </div>
      </div>

      {/* Summary Feedback */}
      <p className="text-xs text-slate-300 leading-relaxed mt-2 relative z-10">
        {score.feedback}
      </p>

      {/* Toggle Breakdown Button */}
      <button
        onClick={() => {
          sounds.playTap();
          setShowDetails(!showDetails);
        }}
        className="mt-3 pt-2.5 border-t border-neutral-800/80 w-full flex items-center justify-between text-xs text-[#D4AF37] hover:text-[#F3E5AB] transition font-semibold"
      >
        <span>Desglose de los 4 Parámetros Semanales</span>
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Detailed 4-Pillar Breakdown */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-neutral-800/60 space-y-2.5 animate-in fade-in duration-200 text-xs">
          {/* 1. Comida Limpia (4.0 pts) */}
          <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Apple className="w-4 h-4 text-[#D4AF37]" />
              <div>
                <span className="font-semibold text-white block">Alimentación 80/20</span>
                <span className="text-[10px] text-slate-400">Adherencia limpia: {healthyEatingRate}%</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white">{score.breakdown.foodScore.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal"> / 4.0 pts</span>
            </div>
          </div>

          {/* 2. Hidratación (2.5 pts) */}
          <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <div>
                <span className="font-semibold text-white block">Hidratación Diaria</span>
                <span className="text-[10px] text-slate-400">Meta recomendada: 2.0L a 2.5L</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white">{score.breakdown.hydrationScore.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal"> / 2.5 pts</span>
            </div>
          </div>

          {/* 3. Actividad Física (2.5 pts) */}
          <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-white block">Actividad Física</span>
                <span className="text-[10px] text-slate-400">Entrenamiento y descanso activo</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white">{score.breakdown.exerciseScore.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal"> / 2.5 pts</span>
            </div>
          </div>

          {/* 4. Control de Caprichos (1.0 pt) */}
          <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wine className="w-4 h-4 text-[#E74C3C]" />
              <div>
                <span className="font-semibold text-white block">Gestión de Caprichos</span>
                <span className="text-[10px] text-slate-400">Límite respetado (máx. 2 por semana)</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-white">{score.breakdown.cheatScore.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-normal"> / 1.0 pt</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
