import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, Clock, Volume2, Sparkles, Smartphone, ShieldCheck, Wine, Droplets, Flame, Apple } from 'lucide-react';
import { NotificationSchedule } from '../types/health';
import { notificationService } from '../utils/notificationService';
import { sounds } from '../utils/audio';

interface AuraNotificationsProps {
  schedules: NotificationSchedule[];
  onToggleSchedule: (id: string) => void;
  onUpdateTime: (id: string, time: string) => void;
}

export const AuraNotifications: React.FC<AuraNotificationsProps> = ({
  schedules,
  onToggleSchedule,
  onUpdateTime,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleRequestPermission = async () => {
    sounds.playTap();
    const granted = await notificationService.requestPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      notificationService.dispatchNotification({
        title: '🌟 AuraHealth Activado',
        message: 'Recibirás avisos discretos y elegantes en tu iPhone para mantener tu estilo de vida en la excelencia.',
        type: 'system',
      });
    }
  };

  const handleTestAlert = () => {
    sounds.playTap();
    notificationService.dispatchNotification({
      title: '✨ Recordatorio de Boca Salud',
      message: '¡Excelente progreso hoy! Tu hidratación supera los 2.0L y tu adherencia 80/20 te acerca a desbloquear tu capricho del fin de semana.',
      type: 'water',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  const getScheduleIcon = (type: NotificationSchedule['type']) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-4 h-4 text-[#38BDF8]" />;
      case 'food':
        return <Apple className="w-4 h-4 text-[#D4AF37]" />;
      case 'exercise':
        return <Flame className="w-4 h-4 text-[#0A84FF]" />;
      case 'cheat':
        return <Wine className="w-4 h-4 text-[#D4AF37]" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Permission Card in Negro + Azul y Oro */}
      <div className="boca-card-gold rounded-3xl p-5 border border-[#0A84FF]/35 shadow-xl bg-gradient-to-br from-[#0F1424] via-[#0D101A] to-[#0A0C12]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0A84FF]/25 to-[#D4AF37]/20 border border-[#0A84FF]/40 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Notificaciones para Metas Diarias
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {permission === 'granted'
                  ? 'Permisos del sistema concedidos en tu dispositivo'
                  : permission === 'denied'
                  ? 'Notificaciones bloqueadas en el navegador'
                  : 'Autoriza las alertas de tu iPhone para no olvidar ninguna meta de Boca Salud'}
              </p>
            </div>
          </div>

          {permission !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="py-1.5 px-3.5 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0A84FF] active:scale-95 text-white text-xs font-bold transition shadow-lg shadow-[#0A84FF]/25 flex-shrink-0"
            >
              Permitir
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-[#38BDF8] font-semibold">
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>Concedido</span>
            </span>
          )}
        </div>

        {/* Test alert trigger button */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Sonido sutil de campana champagne</span>
          </div>

          <button
            onClick={handleTestAlert}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1.5 ${
              testSent
                ? 'bg-emerald-500 text-white'
                : 'bg-neutral-900 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{testSent ? '¡Notificación Emitida!' : 'Probar Notificación'}</span>
          </button>
        </div>
      </div>

      {/* iPhone Instructions Card */}
      <div className="aura-card rounded-2xl p-4 border border-neutral-800 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-300">
          <strong className="text-white block mb-0.5 font-semibold">
            Instalación en iPhone (PWA Standalone)
          </strong>
          Para una experiencia 100% nativa con alertas flotantes, pulsa el botón{' '}
          <strong className="text-white">Compartir</strong> de Safari y selecciona{' '}
          <strong className="text-[#D4AF37]">"Añadir a pantalla de inicio"</strong>.
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Horarios de Metas Diarias ({schedules.filter((s) => s.enabled).length} activas)
          </h3>
          <span className="text-xs text-[#D4AF37]">Regla 80/20 & Hidratación</span>
        </div>

        <div className="space-y-2.5">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`rounded-2xl p-4 transition-all duration-200 border ${
                schedule.enabled
                  ? 'aura-card border-[#D4AF37]/20 bg-neutral-900/60'
                  : 'bg-neutral-950/40 border-neutral-800/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getScheduleIcon(schedule.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {schedule.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                      {schedule.message}
                    </p>
                  </div>
                </div>

                {/* iOS Toggle Switch in Champagne Gold */}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playTap();
                    onToggleSchedule(schedule.id);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 focus:outline-none ${
                    schedule.enabled ? 'bg-[#D4AF37]' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      schedule.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Time Configuration */}
              <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">Hora de aviso en iPhone:</span>
                </div>

                <input
                  type="time"
                  value={schedule.time}
                  disabled={!schedule.enabled}
                  onChange={(e) => onUpdateTime(schedule.id, e.target.value)}
                  className="py-1 px-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#D4AF37] disabled:opacity-40"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
