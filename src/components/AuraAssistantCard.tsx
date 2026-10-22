import React, { useState } from 'react';
import { 
  Sparkles, RefreshCw, Bot, Trophy, Award, Droplets, 
  Apple, Flame, Wine, CheckCircle2, AlertCircle, ArrowUpRight, 
  Lightbulb, ShieldCheck, Heart, ChevronRight, HelpCircle, X,
  Activity, Zap, BarChart2
} from 'lucide-react';
import { AuraAnalysisResponse, DayTracking } from '../types/health';
import { sounds } from '../utils/audio';

interface AuraAssistantCardProps {
  analysis: AuraAnalysisResponse | null;
  isLoading: boolean;
  onRefreshAnalysis: () => void;
  weekData?: DayTracking[];
}

interface QuickFaq {
  question: string;
  answer: string;
  category: string;
}

const BOCA_WELLNESS_FAQS: QuickFaq[] = [
  {
    category: 'Regla 80/20',
    question: '¿Qué cuenta exactamente como comida libre (Capricho)?',
    answer: 'Un capricho es una comida fuera de tu pauta habitual (ej. pizza artesanal, burger, postre especial o copas). En Boca Salud, si mantienes el 80% de tus comidas limpias en la semana, tienes derecho a 2 caprichos disfrutados con total plenitud y cero culpa.',
  },
  {
    category: 'Hidratación 2.0L',
    question: '¿Las infusiones o café cuentan para la meta de 2.0L?',
    answer: 'El agua pura debe ser el 80% de tu hidratación. Las infusiones sin azúcar y caldos vegetales suman a la hidratación. El café con moderación hidrata, pero no debe sustituir tu consumo de agua mineral o filtrada.',
  },
  {
    category: 'Actividad Física',
    question: '¿Qué es un descanso activo en Boca Salud?',
    answer: 'No todos los días exigen entrenamiento de alta intensidad. Caminar 8,000 pasos a paso ligero, 25 minutos de estiramientos o yoga suave cuentan plenamente como actividad física cumplida para la vitalidad celular.',
  },
  {
    category: 'Recuperación',
    question: '¿Cómo recupero la semana si consumí un capricho no previsto?',
    answer: 'La regla 80/20 premia la consistencia, no la perfección rígida. No hagas ayunos extremos: simplemente retoma de inmediato tu hidratación de 2.2L y tu plato limpio en la siguiente comida.',
  },
];

export const AuraAssistantCard: React.FC<AuraAssistantCardProps> = ({
  analysis,
  isLoading,
  onRefreshAnalysis,
  weekData = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'dictamen' | 'faqs'>('visual');
  const [selectedFaq, setSelectedFaq] = useState<QuickFaq | null>(null);
  const [simulatorFood, setSimulatorFood] = useState<string>('pizza');
  const [showSimulatorModal, setShowSimulatorModal] = useState<boolean>(false);

  const handleConsult = () => {
    sounds.playTap();
    onRefreshAnalysis();
  };

  if (!analysis) {
    return (
      <div className="boca-card-gold rounded-3xl p-6 text-center space-y-4 border border-[#0A84FF]/30 bg-gradient-to-br from-[#0F1424] to-[#0A0C12] shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A84FF]/20 to-[#D4AF37]/20 border border-[#0A84FF]/40 text-[#D4AF37] flex items-center justify-center mx-auto shadow-lg shadow-[#0A84FF]/15">
          <Bot className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Análisis Visual Boca Salud
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Evalúa tu semana con inteligencia artificial, nota global ponderada y dictamen para tu capricho.
          </p>
        </div>
        <button
          onClick={handleConsult}
          disabled={isLoading}
          className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#0A84FF] via-[#0284C7] to-[#D4AF37] text-white font-bold text-xs shadow-lg shadow-[#0A84FF]/30 active:scale-95 transition flex items-center gap-2 mx-auto"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Generar Análisis Semanal</span>
        </button>
      </div>
    );
  }

  const { summary, markdown, generatedAt } = analysis;
  const score = summary.weeklyScore;

  // Circular gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (Math.min(score.totalScore / 10, 1) * circumference);

  return (
    <div className="space-y-4">
      {/* 1. Header with Mode Selector */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
            <span>Análisis Semanal Boca Salud</span>
            <span className="text-[9px] font-bold text-[#38BDF8] px-2 py-0.5 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/30 uppercase">
              IA & Métricas
            </span>
          </h2>
          <span className="text-[10px] text-slate-400">
            Última actualización: {generatedAt}
          </span>
        </div>

        <button
          onClick={handleConsult}
          disabled={isLoading}
          className="p-2 rounded-xl bg-[#111522] border border-[#0A84FF]/30 text-[#38BDF8] hover:border-[#D4AF37] hover:text-[#D4AF37] active:scale-95 transition flex items-center gap-1.5 text-xs shadow-md"
          title="Recalcular análisis"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-[11px] font-semibold hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Sub-tab navigation switcher: Visual Hub | Dictamen Editorial | Consultas */}
      <div className="flex p-1 rounded-2xl bg-[#0D101A] border border-[#0A84FF]/25 text-xs">
        <button
          onClick={() => {
            sounds.playTap();
            setActiveSubTab('visual');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'visual'
              ? 'bg-gradient-to-r from-[#0A84FF] to-[#0284C7] text-white shadow-md shadow-[#0A84FF]/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Panel Visual</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveSubTab('dictamen');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'dictamen'
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-neutral-950 shadow-md shadow-[#D4AF37]/25'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Dictamen IA</span>
        </button>

        <button
          onClick={() => {
            sounds.playTap();
            setActiveSubTab('faqs');
          }}
          className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'faqs'
              ? 'bg-[#161B2A] text-[#38BDF8] border border-[#0A84FF]/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Guía 80/20</span>
        </button>
      </div>

      {/* SUBTAB 1: PANEL VISUAL HUB */}
      {activeSubTab === 'visual' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Main Visual Score Card with Glowing Circular Meter */}
          <div className="boca-card-gold rounded-3xl p-5 border border-[#0A84FF]/35 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0F1424] via-[#0C0F18] to-[#0A0C12]">
            {/* Atmospheric ambient glows */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#0A84FF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
              {/* Circular SVG Meter */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                <svg width="136" height="136" className="transform -rotate-90">
                  <defs>
                    <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0A84FF" />
                      <stop offset="50%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#D4AF37" />
                    </linearGradient>
                  </defs>
                  {/* Outer glow circle track */}
                  <circle
                    cx="68"
                    cy="68"
                    r={radius}
                    fill="none"
                    stroke="#141824"
                    strokeWidth="11"
                  />
                  {/* Main animated progress circle */}
                  <circle
                    cx="68"
                    cy="68"
                    r={radius}
                    fill="none"
                    stroke="url(#scoreGaugeGrad)"
                    strokeWidth="11"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Central Score Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-3xl font-black font-mono text-white tracking-tight leading-none drop-shadow">
                    {score.totalScore.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider mt-1">
                    de 10.0
                  </span>
                </div>
              </div>

              {/* Status and Qualitative Breakdown */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] px-2.5 py-1 rounded-full bg-[#0A84FF]/15 border border-[#0A84FF]/35">
                    {score.badge}
                  </span>
                  <span className="text-[10px] font-bold text-[#D4AF37] px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                    Boca Salud
                  </span>
                </div>

                <h4 className="text-base font-black text-white tracking-tight">
                  {score.gradeLabel}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {score.feedback}
                </p>

                {/* Small indicator pill */}
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-3 text-[11px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                    {summary.hydrationDays}/7 días agua
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                    {summary.healthyEatingRate}% dieta limpia
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Habit Tracker Card (Visual Matrix) */}
          {weekData.length > 0 && (
            <div className="boca-card rounded-2xl p-4 border border-[#0A84FF]/25 shadow-xl bg-[#0F131E]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Matriz Visual de los 7 Días</span>
                </h4>
                <span className="text-[10px] text-slate-400">
                  Cumplimiento diario
                </span>
              </div>

              {/* 7 day columns */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {weekData.map((day) => {
                  const dayScore = 
                    (day.comida_saludable ? 4.0 : 0) +
                    (day.agua_cumplida ? 2.5 : (day.agua_litros ? Math.min(2.5, +(day.agua_litros * 1.25).toFixed(1)) : 0)) +
                    (day.ejercicio_completado ? 2.5 : 0) +
                    (!day.capricho_usado ? 1.0 : 0.5);

                  return (
                    <div
                      key={day.dia}
                      className="p-2 rounded-xl bg-[#0A0D14] border border-neutral-800/80 flex flex-col items-center justify-between min-h-[72px]"
                    >
                      <span className="text-[10px] font-bold text-slate-300">
                        {day.dia.substring(0, 3)}
                      </span>

                      {/* Day score number */}
                      <span className="text-xs font-mono font-bold text-[#D4AF37] my-1">
                        {dayScore > 0 ? dayScore.toFixed(1) : '—'}
                      </span>

                      {/* 4 tiny dot indicators for each metric */}
                      <div className="flex items-center gap-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            day.comida_saludable ? 'bg-[#D4AF37]' : 'bg-neutral-800'
                          }`}
                          title="Comida limpia 80/20"
                        />
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            day.agua_cumplida ? 'bg-[#38BDF8]' : 'bg-neutral-800'
                          }`}
                          title="Agua 2.0L+"
                        />
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            day.ejercicio_completado ? 'bg-[#0A84FF]' : 'bg-neutral-800'
                          }`}
                          title="Entrenamiento"
                        />
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            day.capricho_usado ? 'bg-[#E74C3C]' : 'bg-neutral-800'
                          }`}
                          title="Capricho"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-neutral-800/80">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Comida Limpia
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" /> Agua 2L+
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]" /> Entreno
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E74C3C]" /> Capricho
                </span>
              </div>
            </div>
          )}

          {/* 4 Pillars Progress Cards in Negro, Azul & Oro */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Comida Limpia 80/20 */}
            <div className="p-4 rounded-2xl bg-[#0F131E] border border-[#0A84FF]/25 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                  <Apple className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#D4AF37]">
                  {score.breakdown.foodScore.toFixed(1)} / 4.0 pts
                </span>
              </div>
              <span className="text-xs font-bold text-white block">Alimentación 80/20</span>
              <div className="flex items-baseline justify-between mt-1 mb-2">
                <strong className="text-xl font-black text-white">{summary.healthyEatingRate}%</strong>
                <span className="text-[10px] text-slate-400">Meta: 80%</span>
              </div>
              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    summary.healthyEatingRate >= 80 ? 'bg-gradient-to-r from-[#D4AF37] to-[#F5E4A8]' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(summary.healthyEatingRate, 100)}%` }}
                />
              </div>
            </div>

            {/* 2. Hidratación */}
            <div className="p-4 rounded-2xl bg-[#0F131E] border border-[#0A84FF]/25 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/15 text-[#38BDF8] flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#38BDF8]">
                  {score.breakdown.hydrationScore.toFixed(1)} / 2.5 pts
                </span>
              </div>
              <span className="text-xs font-bold text-white block">Hidratación 2.0L+</span>
              <div className="flex items-baseline justify-between mt-1 mb-2">
                <strong className="text-xl font-black text-[#38BDF8]">{summary.hydrationDays} / 7</strong>
                <span className="text-[10px] text-slate-400">días logrados</span>
              </div>
              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-[#0A84FF] to-[#38BDF8] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((summary.hydrationDays / 7) * 100), 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Actividad Física */}
            <div className="p-4 rounded-2xl bg-[#0F131E] border border-[#0A84FF]/25 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/15 text-[#0A84FF] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#0A84FF]">
                  {score.breakdown.exerciseScore.toFixed(1)} / 2.5 pts
                </span>
              </div>
              <span className="text-xs font-bold text-white block">Actividad Física</span>
              <div className="flex items-baseline justify-between mt-1 mb-2">
                <strong className="text-xl font-black text-white">{summary.exerciseDays} / 7</strong>
                <span className="text-[10px] text-slate-400">días activos</span>
              </div>
              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-[#0A84FF] to-[#0284C7] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.round((summary.exerciseDays / 4) * 100), 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Gestión de Caprichos */}
            <div className="p-4 rounded-2xl bg-[#0F131E] border border-[#0A84FF]/25 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                  <Wine className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#D4AF37]">
                  {score.breakdown.cheatScore.toFixed(1)} / 1.0 pt
                </span>
              </div>
              <span className="text-xs font-bold text-white block">Caprichos Semanales</span>
              <div className="flex items-baseline justify-between mt-1 mb-2">
                <strong className="text-xl font-black text-white">{summary.cheatMealsUsed} / 2</strong>
                <span className="text-[10px] text-slate-400">utilizados</span>
              </div>
              <div className="flex gap-2">
                <div
                  className={`flex-1 h-2 rounded-full transition ${
                    summary.cheatMealsUsed >= 1 ? 'bg-[#D4AF37]' : 'bg-neutral-800'
                  }`}
                />
                <div
                  className={`flex-1 h-2 rounded-full transition ${
                    summary.cheatMealsUsed >= 2 ? 'bg-[#D4AF37]' : 'bg-neutral-800'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Interactive Cheat Meal Verdict Banner */}
          <div
            className={`rounded-2xl p-4 border flex items-center gap-3.5 shadow-xl transition-all duration-300 ${
              summary.cheatMealAllowed
                ? 'bg-gradient-to-r from-[#0F2417] to-[#0A160F] border-emerald-500/40 text-emerald-200'
                : summary.cheatMealsUsed >= 2
                ? 'bg-gradient-to-r from-[#240E14] to-[#16090D] border-[#D4AF37]/40 text-[#F5E4A8]'
                : 'bg-gradient-to-r from-[#211B0C] to-[#141006] border-amber-500/40 text-amber-200'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                summary.cheatMealAllowed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : summary.cheatMealsUsed >= 2
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {summary.cheatMealAllowed ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/40">
                  Veredicto de Capricho
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-0.5">
                {summary.cheatMealAllowed
                  ? '🟢 LUZ VERDE: Capricho Autorizado sin culpa'
                  : summary.cheatMealsUsed >= 2
                  ? '🍷 Has completado tus 2 caprichos de la semana'
                  : '🟡 Capricho en pausa (Adherencia < 80%)'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {summary.cheatMealAllowed
                  ? 'Tu adherencia supera el 80%. Disfruta hoy o el fin de semana con equilibrio.'
                  : summary.cheatMealsUsed >= 2
                  ? 'Has aprovechado tus 2 comidas libres. Continúa con comida limpia para fijar tus resultados.'
                  : 'Suma comidas limpias hoy para alcanzar el 80% y desbloquear tu comida libre.'}
              </p>
            </div>

            <button
              onClick={() => setShowSimulatorModal(true)}
              className="py-1.5 px-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-[#D4AF37] text-slate-200 hover:text-white text-[11px] font-bold flex-shrink-0 active:scale-95 transition"
            >
              Simular
            </button>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DICTAMEN EDITORIAL BOCA IA */}
      {activeSubTab === 'dictamen' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="boca-card rounded-3xl p-5 border border-[#0A84FF]/25 shadow-xl bg-[#0F131E] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                  Dictamen Oficial de Boca Salud
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                Basado en tu tabla semanal
              </span>
            </div>

            {/* Structured Prose Display */}
            <div className="space-y-3.5 text-xs leading-relaxed text-slate-300">
              {markdown.split('\n\n').map((block, idx) => {
                if (block.startsWith('### ')) {
                  const heading = block.replace('### ', '');
                  return (
                    <div key={idx} className="pt-2 first:pt-0">
                      <h5 className="font-bold text-white text-xs flex items-center gap-1.5 pb-1 border-b border-neutral-800/60">
                        <span className="text-[#0A84FF]">✦</span>
                        <span>{heading}</span>
                      </h5>
                    </div>
                  );
                }

                if (block.includes('* ') || block.includes('- ')) {
                  const lines = block.split('\n');
                  return (
                    <div key={idx} className="space-y-1.5 pl-1 bg-[#0A0D14] p-3 rounded-xl border border-neutral-800/80">
                      {lines.map((l, lIdx) => (
                        <div
                          key={lIdx}
                          className="flex items-start gap-2"
                          dangerouslySetInnerHTML={{
                            __html: l
                              .replace(/^[\*\-]\s+/, '<span class="text-[#0A84FF] font-bold">•</span> ')
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>'),
                          }}
                        />
                      ))}
                    </div>
                  );
                }

                return (
                  <p
                    key={idx}
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>'),
                    }}
                  />
                );
              })}
            </div>

            {/* Aura Highlight Recommendation Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/15 to-[#0A84FF]/10 border border-[#D4AF37]/40 text-slate-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#D4AF37] mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compromiso Boca Salud</span>
              </div>
              <p className="text-[11px] text-slate-300">
                La excelencia no es un acto aislado, sino un hábito continuo. Mantén el foco en tus 2.0L de agua y tus comidas 80/20.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: GUÍA & FAQS 80/20 */}
      {activeSubTab === 'faqs' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Principios de la Filosofía Boca Salud
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Aprende cómo optimizar tu nutrición 80/20 y tus 2 caprichos semanales sin culpa.
            </p>
          </div>

          <div className="space-y-2.5">
            {BOCA_WELLNESS_FAQS.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => {
                  sounds.playTap();
                  setSelectedFaq(faq);
                }}
                className="p-3.5 rounded-2xl bg-[#0F131E] border border-[#0A84FF]/25 hover:border-[#D4AF37] cursor-pointer transition shadow-md active:scale-98 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] block">
                    {faq.category}
                  </span>
                  <h5 className="text-xs font-bold text-white mt-0.5">
                    {faq.question}
                  </h5>
                </div>
                <ChevronRight className="w-4 h-4 text-[#D4AF37] flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Detail Modal */}
      {selectedFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F131D] border border-[#0A84FF]/40 shadow-2xl p-5 text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#38BDF8]">
                {selectedFaq.category}
              </span>
              <button
                onClick={() => setSelectedFaq(null)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-slate-300 flex items-center justify-center hover:bg-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-sm font-bold text-white">
              {selectedFaq.question}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0D14] p-3.5 rounded-2xl border border-neutral-800">
              {selectedFaq.answer}
            </p>

            <button
              onClick={() => setSelectedFaq(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0284C7] text-white font-bold text-xs shadow-md shadow-[#0A84FF]/25"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Cheat Simulator Modal */}
      {showSimulatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0F131D] border border-[#D4AF37]/40 shadow-2xl p-5 text-left space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Wine className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-sm font-bold text-white">
                  Simulador de Capricho Boca Salud
                </h3>
              </div>
              <button
                onClick={() => setShowSimulatorModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-800 text-slate-300 flex items-center justify-center hover:bg-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              ¿Estás pensando en una comida libre hoy? Consulta qué ocurriría con tu balance:
            </p>

            <div className="p-3.5 rounded-2xl bg-[#0A0D14] border border-neutral-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Adherencia actual:</span>
                <strong className="text-white font-mono">{summary.healthyEatingRate}%</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Caprichos usados:</span>
                <strong className="text-white font-mono">{summary.cheatMealsUsed} de 2</strong>
              </div>
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Dictamen si lo consumes hoy:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  summary.cheatMealAllowed 
                    ? 'text-emerald-400 bg-emerald-500/15' 
                    : 'text-amber-400 bg-amber-500/15'
                }`}>
                  {summary.cheatMealAllowed ? 'Totalmente Seguro' : 'Desviaría Adherencia'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {summary.cheatMealAllowed
                ? '¡Adelante! Tu constancia de la semana te respalda plenamente. Disfrútalo con consciencia y retoma tu plato limpio en la siguiente comida.'
                : 'Te sugerimos sumar un día más de comida limpia y 2.0L de agua antes de usar tu capricho.'}
            </p>

            <button
              onClick={() => setShowSimulatorModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-neutral-950 font-bold text-xs shadow-md shadow-[#D4AF37]/25"
            >
              Cerrar Simulador
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
