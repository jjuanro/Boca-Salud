import { DayOfWeek, DayTracking, CalendarDayInfo, CalendarWeekInfo } from '../types/health';
import { DAYS_OF_WEEK } from './auraEngine';

export const MONTH_NAMES_SPANISH = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_SHORT_SPANISH = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export function computeDailyScore(tracking?: DayTracking): number {
  if (!tracking) return 0;

  // Has at least one parameter marked or entered?
  const hasData = tracking.agua_cumplida || tracking.comida_saludable || 
                  tracking.ejercicio_completado || tracking.capricho_usado || 
                  (tracking.agua_litros && tracking.agua_litros > 0);
  if (!hasData) return 0;

  let score = 0;

  // 1. Alimentación Limpia (4.0 pts)
  if (tracking.comida_saludable) {
    score += 4.0;
  }

  // 2. Hidratación (2.5 pts)
  if (tracking.agua_cumplida || (tracking.agua_litros && tracking.agua_litros >= 2.0)) {
    score += 2.5;
  } else if (tracking.agua_litros && tracking.agua_litros > 0) {
    score += Math.min(2.5, Number(((tracking.agua_litros / 2.0) * 2.5).toFixed(1)));
  }

  // 3. Actividad física (2.5 pts)
  if (tracking.ejercicio_completado) {
    score += 2.5;
  }

  // 4. Gestión de Caprichos (1.0 pt)
  // Consumir un capricho no penaliza a cero si está dentro de las metas, pero la disciplina limpia suma el punto completo
  if (!tracking.capricho_usado) {
    score += 1.0;
  } else {
    // Si fue capricho consciente pero con comida limpia o entreno
    score += 0.5;
  }

  return Math.min(10.0, Number(score.toFixed(1)));
}

export function formatDateToISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getCurrentWeekDates(): { day: DayOfWeek; dateStr: string }[] {
  const now = new Date();
  const currentDayOfWeekIdx = (now.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
  
  // Find Monday of this week
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeekIdx);

  return DAYS_OF_WEEK.map((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const dateStr = formatDateToISO(d.getFullYear(), d.getMonth(), d.getDate());
    return { day, dateStr };
  });
}

export function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

// Generate full month calendar grid with week grouping
export function generateMonthData(
  year: number,
  month: number,
  historyMap: Record<string, DayTracking>
): { weeks: CalendarWeekInfo[]; days: CalendarDayInfo[] } {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // Day of week of 1st day (0 = Lunes, 6 = Domingo)
  const firstWeekday = (firstDay.getDay() + 6) % 7;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const allCalendarDays: CalendarDayInfo[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const dayNr = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = formatDateToISO(prevYear, prevMonth, dayNr);
    const tracking = historyMap[dateStr];
    const score = computeDailyScore(tracking);
    const dayOfWeek = DAYS_OF_WEEK[(firstWeekday - 1 - i) % 7];

    allCalendarDays.push({
      dateStr,
      dayNumber: dayNr,
      month: prevMonth,
      year: prevYear,
      dayOfWeek,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      score,
      tracking,
    });
  }

  // Current month days
  for (let dayNr = 1; dayNr <= totalDays; dayNr++) {
    const dateStr = formatDateToISO(year, month, dayNr);
    const tracking = historyMap[dateStr];
    const score = computeDailyScore(tracking);
    const dayDate = new Date(year, month, dayNr);
    const dayOfWeek = DAYS_OF_WEEK[(dayDate.getDay() + 6) % 7];

    allCalendarDays.push({
      dateStr,
      dayNumber: dayNr,
      month,
      year,
      dayOfWeek,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      score,
      tracking,
    });
  }

  // Next month leading days to complete week row (multiples of 7)
  const remaining = (7 - (allCalendarDays.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = formatDateToISO(nextYear, nextMonth, i);
    const tracking = historyMap[dateStr];
    const score = computeDailyScore(tracking);
    const dayDate = new Date(nextYear, nextMonth, i);
    const dayOfWeek = DAYS_OF_WEEK[(dayDate.getDay() + 6) % 7];

    allCalendarDays.push({
      dateStr,
      dayNumber: i,
      month: nextMonth,
      year: nextYear,
      dayOfWeek,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      score,
      tracking,
    });
  }

  // Group into weeks
  const weeks: CalendarWeekInfo[] = [];
  for (let i = 0; i < allCalendarDays.length; i += 7) {
    const weekDays = allCalendarDays.slice(i, i + 7);
    const midDate = new Date(weekDays[3].year, weekDays[3].month, weekDays[3].dayNumber);
    const weekNr = getWeekNumber(midDate);

    // Filter days with actual score/data
    const evaluatedDays = weekDays.filter((d) => d.score > 0);
    let weekScore = 0;
    if (evaluatedDays.length > 0) {
      const sum = evaluatedDays.reduce((acc, d) => acc + d.score, 0);
      weekScore = Number((sum / evaluatedDays.length).toFixed(1));
    }

    let gradeLabel = 'Sin datos';
    if (weekScore >= 9.0) gradeLabel = 'Excelente (A+)';
    else if (weekScore >= 8.0) gradeLabel = 'Sobresaliente (A)';
    else if (weekScore >= 7.0) gradeLabel = 'Notable (B)';
    else if (weekScore > 0) gradeLabel = 'En Progreso (C)';

    const cheatMealsUsed = weekDays.filter((d) => d.tracking?.capricho_usado).length;

    weeks.push({
      weekNumber: weekNr,
      year,
      startDate: weekDays[0].dateStr,
      endDate: weekDays[6].dateStr,
      days: weekDays,
      weekScore,
      gradeLabel,
      cheatMealsUsed,
    });
  }

  return { weeks, days: allCalendarDays };
}

// Starts fresh with clean history (no data from days prior to today)
export function generateSeedAnnualHistory(_currentYear: number = 2026): Record<string, DayTracking> {
  return {};
}
