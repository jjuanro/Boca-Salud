/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Calendar, CalendarDays, Bot, Droplets, Bell, Smartphone, 
  Wine, CheckCircle, Info, RefreshCw, Share2, Award, Trophy, ArrowRight,
  ShieldCheck, User, Utensils, Flame
} from 'lucide-react';

import { DayOfWeek, DayTracking, NotificationSchedule, AuraAnalysisResponse, GitHubUser } from './types/health';
import { 
  getInitialWeeklyData, 
  computeAuraMetrics, 
  requestAuraAnalysis, 
  DAYS_OF_WEEK 
} from './utils/auraEngine';
import { 
  getCurrentWeekDates, 
  generateSeedAnnualHistory,
  formatDateToISO
} from './utils/calendarService';
import { sounds } from './utils/audio';
import { notificationService } from './utils/notificationService';
import { usePWAInstall } from './hooks/usePWAInstall';
import { getStoredGitHubUser, saveStoredGitHubUser } from './utils/githubService';

import { WeeklyTable } from './components/WeeklyTable';
import { CheatMealTracker } from './components/CheatMealTracker';
import { WeeklyScoreCard } from './components/WeeklyScoreCard';
import { AuraAssistantCard } from './components/AuraAssistantCard';
import { AuraNotifications } from './components/AuraNotifications';
import { AuraMetricsDetail } from './components/AuraMetricsDetail';
import { AnnualCalendarView } from './components/AnnualCalendarView';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { DynamicIslandBanner } from './components/DynamicIslandBanner';
import { NutritionConsultantView } from './components/NutritionConsultantView';

const LOCAL_STORAGE_KEY = 'bocasalud_weekly_data_v2';
const LOCAL_NOTIFS_KEY = 'bocasalud_notifications_v2';
const LOCAL_HISTORY_KEY = 'bocasalud_annual_history_v2';

const DEFAULT_SCHEDULES: NotificationSchedule[] = [
  {
    id: 'boca_water_morning',
    title: '💧 Hidratación Matutina (2.0L - 2.5L)',
    time: '09:00',
    type: 'water',
    message: 'Comienza tu jornada con 500 ml de agua fresca para activar tu metabolismo y asegurar tu rendimiento Boca Salud.',
    enabled: true,
  },
  {
    id: 'boca_clean_lunch',
    title: '🍏 Alimentación Limpia 80/20',
    time: '14:00',
    type: 'food',
    message: 'Nutre tu cuerpo con excelencia. Mantén tu plato en el estándar 80/20 con verduras, proteínas y grasas saludables.',
    enabled: true,
  },
  {
    id: 'boca_workout_active',
    title: '🏃 Actividad Física & Movilidad',
    time: '18:30',
    type: 'exercise',
    message: 'Hora de tu sesión de entrenamiento o descanso activo. ¡Suma vitalidad y cierra tus metas en Boca Salud!',
    enabled: true,
  },
  {
    id: 'boca_cheat_weekend',
    title: '🍷 Balance Semanal de Caprichos',
    time: '20:30',
    type: 'cheat',
    message: 'Revisa tu tabla semanal: si tu adherencia supera el 80%, tienes luz verde para disfrutar de tu capricho sin culpa.',
    enabled: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'table' | 'nutrition' | 'calendar' | 'assistant' | 'today' | 'notifications'>('table');
  
  const [weeklyData, setWeeklyData] = useState<DayTracking[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return getInitialWeeklyData();
  });

  const [annualHistory, setAnnualHistory] = useState<Record<string, DayTracking>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_HISTORY_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return generateSeedAnnualHistory(2026);
  });

  const [schedules, setSchedules] = useState<NotificationSchedule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_NOTIFS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SCHEDULES;
  });

  const [githubUser, setGithubUser] = useState<GitHubUser | null>(() => getStoredGitHubUser());
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  const [analysis, setAnalysis] = useState<AuraAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Current day index
  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayName: DayOfWeek = DAYS_OF_WEEK[todayIdx];
  const currentDayData = weeklyData.find((d) => d.dia === todayName) || weeklyData[0];

  // Save weekly data
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(weeklyData));
    } catch {
      // Ignore
    }
  }, [weeklyData]);

  // Save annual history
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(annualHistory));
    } catch {
      // Ignore
    }
  }, [annualHistory]);

  // Save schedules
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(schedules));
    } catch {
      // Ignore
    }
  }, [schedules]);

  // Initial clear of prior days and analysis request on load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/callback')) {
      window.history.replaceState({}, '', '/');
    }
    handleClearPriorDays();
    handleRunAnalysis();
  }, []);

  // Listen for OAuth message events from popup
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const origin = event.origin || '';
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        const user: GitHubUser = event.data.user;
        setGithubUser(user);
        saveStoredGitHubUser(user);
        notificationService.dispatchNotification({
          title: '🌟 Conexión GitHub Exitosa',
          message: `Bienvenido @${user.login}. Tu perfil está vinculado con Boca Salud en tu iPhone.`,
          type: 'system',
        });
      }
    };
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await requestAuraAnalysis(weeklyData);
      setAnalysis(result);
    } catch (err) {
      console.error('Error generating Boca Salud analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Synchronize a day change with both weeklyData and annualHistory
  const handleToggleCheck = (
    day: DayOfWeek,
    field: 'agua_cumplida' | 'comida_saludable' | 'ejercicio_completado' | 'capricho_usado'
  ) => {
    let updatedTarget: DayTracking | null = null;

    setWeeklyData((prev) =>
      prev.map((item) => {
        if (item.dia === day) {
          const updatedValue = !item[field];
          const updated = { ...item, [field]: updatedValue };

          // If turning on water, ensure litres is at least 2.0
          if (field === 'agua_cumplida' && updatedValue && (item.agua_litros || 0) < 2.0) {
            updated.agua_litros = 2.2;
          }

          updatedTarget = updated;
          return updated;
        }
        return item;
      })
    );

    // Sync to annual history map
    const weekDates = getCurrentWeekDates();
    const matched = weekDates.find((w) => w.day === day);
    if (matched && updatedTarget) {
      setAnnualHistory((prev) => ({
        ...prev,
        [matched.dateStr]: updatedTarget!,
      }));
    }
  };

  const handleUpdateDayDetails = (day: DayOfWeek, details: Partial<DayTracking>) => {
    let updatedTarget: DayTracking | null = null;

    setWeeklyData((prev) =>
      prev.map((item) => {
        if (item.dia === day) {
          const updated = { ...item, ...details };
          updatedTarget = updated;
          return updated;
        }
        return item;
      })
    );

    const weekDates = getCurrentWeekDates();
    const matched = weekDates.find((w) => w.day === day);
    if (matched && updatedTarget) {
      setAnnualHistory((prev) => ({
        ...prev,
        [matched.dateStr]: updatedTarget!,
      }));
    }
  };

  const handleSaveAnnualDayTracking = (dateStr: string, tracking: DayTracking) => {
    setAnnualHistory((prev) => ({
      ...prev,
      [dateStr]: tracking,
    }));

    // If date is in current week, update weeklyData as well
    const weekDates = getCurrentWeekDates();
    const matched = weekDates.find((w) => w.dateStr === dateStr);
    if (matched) {
      setWeeklyData((prev) =>
        prev.map((item) => (item.dia === matched.day ? { ...tracking, dia: matched.day } : item))
      );
    }
  };

  const handleAddWaterLitres = (amount: number) => {
    const current = currentDayData.agua_litros || 0;
    const nextVal = +(current + amount).toFixed(2);
    handleUpdateDayDetails(todayName, {
      agua_litros: nextVal,
      agua_cumplida: nextVal >= 2.0 ? true : currentDayData.agua_cumplida,
    });
  };

  const handleClearPriorDays = () => {
    const currentWeekdayIdx = (new Date().getDay() + 6) % 7; // 0 = Lunes, 3 = Jueves
    const now = new Date();
    const todayStr = formatDateToISO(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Wipe all tracking fields for days prior to today
    setWeeklyData((prev) =>
      prev.map((item, idx) => {
        if (idx < currentWeekdayIdx) {
          return {
            dia: item.dia,
            agua_cumplida: false,
            comida_saludable: false,
            ejercicio_completado: false,
            capricho_usado: false,
            agua_litros: 0,
            ejercicio_minutos: undefined,
            notas: '',
          };
        }
        return item;
      })
    );

    // 2. Wipe history before today
    setAnnualHistory((prev) => {
      const updated: Record<string, DayTracking> = {};
      for (const [dateStr, tracking] of Object.entries(prev)) {
        if (dateStr >= todayStr) {
          updated[dateStr] = tracking;
        }
      }
      return updated;
    });

    notificationService.dispatchNotification({
      title: '🗑️ Datos Previos Eliminados',
      message: 'Se han borrado los registros de los días previos a hoy y la puntuación se ha reiniciado a 0.',
      type: 'system',
    });
  };

  const handleResetWeek = () => {
    const fresh = DAYS_OF_WEEK.map((d) => ({
      dia: d,
      agua_cumplida: false,
      comida_saludable: false,
      ejercicio_completado: false,
      capricho_usado: false,
      agua_litros: 0,
    }));
    setWeeklyData(fresh);
  };

  const summary = computeAuraMetrics(weeklyData);

  return (
    <div className="min-h-screen bg-[#0A0C12] text-white flex justify-center selection:bg-[#0A84FF]/30">
      {/* Floating Dynamic Island alert */}
      <DynamicIslandBanner />

      {/* Main Container - Mobile Responsive iOS Viewport */}
      <div className="w-full max-w-lg min-h-screen flex flex-col bg-[#0A0C12] border-x border-[#0A84FF]/15 shadow-2xl relative">
        
        {/* iOS Top Bar / Notch Area with Black + Blue & Gold highlights */}
        <header 
          className="sticky top-0 z-40 bg-[#0A0C12]/92 backdrop-blur-xl border-b border-[#0A84FF]/20 px-4 pb-3"
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-center justify-between">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0A84FF] via-[#0284C7] to-[#D4AF37] p-0.5 shadow-md shadow-[#0A84FF]/25 flex items-center justify-center">
                <div className="w-full h-full bg-[#0D101A] rounded-[10px] flex items-center justify-center text-[#D4AF37]">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                  <span>Boca Salud</span>
                  <span className="text-[9px] font-bold text-[#D4AF37] tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                    80/20
                  </span>
                </h1>
                <span className="text-[11px] text-[#38BDF8] mt-0.5 block font-medium">
                  Estilo de Vida, Nutrición & Bienestar
                </span>
              </div>
            </div>

            {/* Actions: Nutrition, GitHub & Install on iPhone */}
            <div className="flex items-center gap-1.5">
              {/* Nutrition Quick Tool Button */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('nutrition');
                }}
                className={`py-1 px-2.5 rounded-full border text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition ${
                  activeTab === 'nutrition'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-neutral-950 border-[#D4AF37] shadow-md shadow-[#D4AF37]/25 font-bold'
                    : 'bg-[#111522] border-[#D4AF37]/40 text-[#D4AF37] hover:border-[#D4AF37]'
                }`}
                title="Consultar Comida, Calorías y Macros"
              >
                <Utensils className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">Nutrición</span>
              </button>

              {/* GitHub Profile / Login Button */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowGitHubModal(true);
                }}
                className={`py-1 px-2.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 active:scale-95 transition ${
                  githubUser
                    ? 'bg-[#121824] border-emerald-500/50 text-white shadow-sm'
                    : 'bg-[#111522] border-[#0A84FF]/40 text-slate-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                }`}
                title="Acceso GitHub"
              >
                {githubUser ? (
                  <>
                    <img
                      src={githubUser.avatar_url}
                      alt={githubUser.login}
                      className="w-4 h-4 rounded-full border border-emerald-400 object-cover"
                    />
                    <span className="max-w-[70px] truncate text-[10px] font-mono">
                      @{githubUser.login}
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span className="text-[10px]">GitHub</span>
                  </>
                )}
              </button>

              {/* iPhone PWA Install Guide */}
              <button
                onClick={() => {
                  sounds.playTap();
                  setShowIOSModal(true);
                }}
                className="py-1 px-2 rounded-full bg-[#111522] border border-[#0A84FF]/35 text-[#38BDF8] text-[11px] font-semibold hover:border-[#D4AF37] hover:text-[#D4AF37] transition flex items-center gap-1 active:scale-95"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">iPhone</span> PWA
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 py-4 space-y-4 overflow-y-auto no-scrollbar">
          {/* TAB 1: WEEKLY TABLE */}
          {activeTab === 'table' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Quick Switch to Annual Calendar Banner */}
              <div 
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('calendar');
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-[#0F1424] to-[#0A0D14] border border-[#0A84FF]/30 flex items-center justify-between cursor-pointer hover:border-[#D4AF37] transition group shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/15 text-[#38BDF8] flex items-center justify-center group-hover:text-[#D4AF37] transition">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition">
                      Calendario Anual con Puntuación
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Ver historial y notas de días y semanas de cada año
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#38BDF8] group-hover:text-[#D4AF37] transition">
                  <span>Abrir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Quick Switch to Nutrition Consultant Banner */}
              <div 
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('nutrition');
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-[#171322] via-[#101524] to-[#0A0D15] border border-[#D4AF37]/35 flex items-center justify-between cursor-pointer hover:border-[#D4AF37] transition group shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition flex items-center gap-1.5">
                      <span>Consultor Nutricional Boca Salud</span>
                      <span className="text-[9px] font-bold text-[#38BDF8] bg-[#0A84FF]/20 px-1.5 py-0.2 rounded border border-[#0A84FF]/30">80/20</span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Calorías, macros y clasificación de comidas limpias o caprichos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] transition">
                  <span>Consultar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Weekly Performance Score Card */}
              <WeeklyScoreCard score={summary.weeklyScore} healthyEatingRate={summary.healthyEatingRate} />

              {/* Cheat Meal 80/20 Rules Status Banner */}
              <CheatMealTracker summary={summary} />

              {/* Weekly Interactive Table */}
              <WeeklyTable
                weekData={weeklyData}
                onToggleCheck={handleToggleCheck}
                onUpdateDayDetails={handleUpdateDayDetails}
                onResetWeek={handleResetWeek}
                onClearPriorDays={handleClearPriorDays}
              />

              {/* Quick Assistant Teaser */}
              <div className="boca-card-gold rounded-2xl p-4 flex items-center justify-between border border-[#D4AF37]/30 shadow-lg bg-gradient-to-br from-[#181921] to-[#12141C]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">¿Tienes dudas sobre tu capricho?</h4>
                    <p className="text-[11px] text-slate-300">Consulta a Boca Salud para tu balance semanal</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveTab('assistant');
                  }}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-neutral-950 text-xs font-bold shadow-md shadow-[#D4AF37]/20 active:scale-95 transition"
                >
                  Ver Dictamen
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONSULTOR NUTRICIONAL (Boca Salud - Calorías, Macros & 80/20) */}
          {activeTab === 'nutrition' && (
            <NutritionConsultantView
              currentDay={currentDayData}
              onUpdateDay={(details) => handleUpdateDayDetails(todayName, details)}
              onSelectTab={setActiveTab}
            />
          )}

          {/* TAB 3: ANNUAL CALENDAR (Calendario de cada año con puntuación de días y semanas) */}
          {activeTab === 'calendar' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#D4AF37]" />
                    <span>Calendario Histórico Anual</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Puntuación por día (0-10) y nota ponderada de cada semana
                  </p>
                </div>

                <button
                  onClick={() => {
                    sounds.playTap();
                    setActiveTab('table');
                  }}
                  className="py-1 px-3 rounded-xl bg-[#111522] border border-[#0A84FF]/30 text-xs font-bold text-[#38BDF8] hover:text-[#D4AF37] transition"
                >
                  Semana Actual
                </button>
              </div>

              <AnnualCalendarView
                historyMap={annualHistory}
                onSaveDayTracking={handleSaveAnnualDayTracking}
              />
            </div>
          )}

          {/* TAB 3: BOCA IA / VISUAL WEEKLY ANALYSIS */}
          {activeTab === 'assistant' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Weekly Performance Score Card */}
              <WeeklyScoreCard score={summary.weeklyScore} healthyEatingRate={summary.healthyEatingRate} />

              <CheatMealTracker summary={summary} />

              <AuraAssistantCard
                analysis={analysis}
                isLoading={isAnalyzing}
                onRefreshAnalysis={handleRunAnalysis}
                weekData={weeklyData}
              />
            </div>
          )}

          {/* TAB 4: TODAY / REGISTRO RAPIDO */}
          {activeTab === 'today' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Registro Rápido de {todayName}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Ingresa tus litros de agua y platos saludables de hoy
                  </p>
                </div>
                <span className="text-xs font-bold text-[#D4AF37] px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  {currentDayData.comida_saludable ? '80/20 Activo' : 'Pendiente'}
                </span>
              </div>

              {/* Quick Nutrition Lookup Shortcut */}
              <div 
                onClick={() => {
                  sounds.playTap();
                  setActiveTab('nutrition');
                }}
                className="p-3 rounded-2xl bg-gradient-to-r from-[#171322] via-[#101422] to-[#0A0D15] border border-[#D4AF37]/35 flex items-center justify-between cursor-pointer hover:border-[#D4AF37] transition group shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition">
                      ¿Dudas sobre tus platos o calorías de hoy?
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Calcula a groso modo macros y si cuenta como comida limpia o capricho
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] transition">
                  <span>Abrir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <AuraMetricsDetail
                currentDay={currentDayData}
                onUpdateDay={(details) => handleUpdateDayDetails(todayName, details)}
                onAddWaterLitres={handleAddWaterLitres}
              />
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <AuraNotifications
                schedules={schedules}
                onToggleSchedule={(id) => {
                  setSchedules((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
                  );
                }}
                onUpdateTime={(id, time) => {
                  setSchedules((prev) =>
                    prev.map((s) => (s.id === id ? { ...s, time } : s))
                  );
                }}
              />
            </div>
          )}
        </main>

        {/* iOS Floating Bottom Tab Bar with 6 tabs and safe-area inset bottom */}
        <nav 
          className="sticky bottom-0 z-40 bg-[#0E1118]/95 backdrop-blur-2xl border-t border-neutral-800/90 px-1 pt-2 flex items-center justify-around"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Tab 1: Semana */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('table');
            }}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition ${
              activeTab === 'table'
                ? 'text-[#D4AF37]'
                : 'text-neutral-500 hover:text-slate-300'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold">Semana</span>
          </button>

          {/* Tab 2: Nutrición */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('nutrition');
            }}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition ${
              activeTab === 'nutrition'
                ? 'text-[#D4AF37]'
                : 'text-neutral-500 hover:text-slate-300'
            }`}
          >
            <Utensils className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold">Nutrición</span>
          </button>

          {/* Tab 3: Calendario Anual */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('calendar');
            }}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition ${
              activeTab === 'calendar'
                ? 'text-[#0A84FF]'
                : 'text-neutral-500 hover:text-slate-300'
            }`}
          >
            <CalendarDays className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold">Calendario</span>
          </button>

          {/* Tab 4: Boca IA */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('assistant');
            }}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition relative ${
              activeTab === 'assistant'
                ? 'text-[#0A84FF]'
                : 'text-neutral-500 hover:text-slate-300'
            }`}
          >
            <Bot className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold">Boca IA</span>
            {summary.cheatMealAllowed && (
              <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[#0A84FF] animate-ping" />
            )}
          </button>

          {/* Tab 5: Hoy */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('today');
            }}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition ${
              activeTab === 'today'
                ? 'text-[#0A84FF]'
                : 'text-neutral-500 hover:text-slate-300'
            }`}
          >
            <Droplets className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold">Hoy</span>
          </button>

          {/* Tab 6: Alertas */}
          <button
            onClick={() => {
              sounds.playTap();
              setActiveTab('notifications');
            }}
            className={`flex flex-col items-center py-1 px-1.5 rounded-xl transition ${
              activeTab === 'notifications'
                ? 'text-[#0A84FF]'
                : 'text-neutral-500 hover:text-slate-300'
            }`}
          >
            <Bell className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold">Alertas</span>
          </button>
        </nav>

        {/* GitHub Auth Modal */}
        <GitHubAuthModal
          isOpen={showGitHubModal}
          onClose={() => setShowGitHubModal(false)}
          currentUser={githubUser}
          onUserChange={(u) => setGithubUser(u)}
        />

        {/* iPhone PWA Safari Guide Modal */}
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-[#0F131D] border border-[#0A84FF]/40 shadow-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#0A84FF]/15 border border-[#0A84FF]/40 text-[#0A84FF] flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-7 h-7" />
              </div>

              <h3 className="text-base font-bold text-white mb-1">
                Instalar Boca Salud en tu iPhone
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Disfruta de Boca Salud a pantalla completa, sin barras de navegación y con soporte para notificaciones locales.
              </p>

              <div className="space-y-2.5 text-left bg-neutral-900/80 rounded-2xl p-3.5 border border-neutral-800 text-xs text-slate-300 mb-5">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0A84FF]/20 text-[#38BDF8] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    1
                  </span>
                  <span>Abre esta web en <strong>Safari</strong> en tu iPhone.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0A84FF]/20 text-[#38BDF8] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    2
                  </span>
                  <span>Pulsa el botón <strong>Compartir</strong> (icono con la flecha hacia arriba <Share2 className="w-3.5 h-3.5 inline text-[#0A84FF]" />).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0A84FF]/20 text-[#38BDF8] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                    3
                  </span>
                  <span>Selecciona <strong>"Añadir a pantalla de inicio"</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0A84FF] text-white font-bold text-xs transition shadow-lg shadow-[#0A84FF]/25"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
