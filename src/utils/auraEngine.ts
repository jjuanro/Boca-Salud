import { DayOfWeek, DayTracking, AuraMetricsSummary, AuraAnalysisResponse } from '../types/health';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

export function getInitialWeeklyData(): DayTracking[] {
  // All days start completely blank/clean: prior days erased, fresh tracking for today and future days
  return DAYS_OF_WEEK.map((dia) => ({
    dia,
    agua_cumplida: false,
    comida_saludable: false,
    ejercicio_completado: false,
    capricho_usado: false,
    agua_litros: 0,
    ejercicio_minutos: undefined,
    notas: '',
  }));
}

export function computeWeeklyScore(
  healthyEatingDays: number,
  activeDaysElapsed: number,
  hydrationDays: number,
  exerciseDays: number,
  cheatMealsUsed: number
) {
  // If no days with activity have been registered or activeDaysElapsed is 0, score is reset to 0
  const hasAnyActivity = healthyEatingDays > 0 || hydrationDays > 0 || exerciseDays > 0 || cheatMealsUsed > 0;
  if (!hasAnyActivity || activeDaysElapsed === 0) {
    return {
      totalScore: 0.0,
      gradeLabel: 'Reiniciada (0.0)',
      badge: 'Puntuación Reiniciada',
      feedback: 'Datos previos a hoy eliminados. Tu puntuación se ha reiniciado; comienza a registrar tus hábitos desde hoy.',
      breakdown: {
        foodScore: 0,
        hydrationScore: 0,
        exerciseScore: 0,
        cheatScore: 0,
      },
    };
  }

  const safeDays = Math.max(activeDaysElapsed, 1);

  // 1. Food adherence (4.0 points max)
  const foodRatio = healthyEatingDays / safeDays;
  const foodScore = Math.min(4.0, Number((foodRatio * 4.0).toFixed(1)));

  // 2. Hydration (2.5 points max)
  const hydrationRatio = hydrationDays / safeDays;
  const hydrationScore = Math.min(2.5, Number((hydrationRatio * 2.5).toFixed(1)));

  // 3. Exercise (2.5 points max - scaled to 4 workouts/week target)
  const targetExercise = Math.max(1, Math.round(safeDays * (4 / 7)));
  const exerciseScore = Math.min(2.5, Number((Math.min(exerciseDays / targetExercise, 1.2) * (2.5 / 1.0)).toFixed(1)));

  // 4. Cheat meal balance (1.0 point max - penalized if > 2)
  let cheatScore = 1.0;
  if (cheatMealsUsed > 2) {
    cheatScore = Math.max(0, Number((1.0 - (cheatMealsUsed - 2) * 0.5).toFixed(1)));
  }

  const rawTotal = foodScore + hydrationScore + exerciseScore + cheatScore;
  const totalScore = Math.min(10.0, Math.max(0, Number(rawTotal.toFixed(1))));

  let gradeLabel = 'En Progreso (C)';
  let badge = 'Semana en Curso';
  let feedback = 'Oportunidad de mejora: eleva tu comida limpia al 80% y asegura tus 2.0L de agua diarios.';

  if (totalScore >= 9.0) {
    gradeLabel = 'Excelente (A+)';
    badge = 'Distinción Boca Salud Oro';
    feedback = 'Disciplina impecable: cumples con holgura los 4 pilares de nutrición, ejercicio e hidratación.';
  } else if (totalScore >= 8.0) {
    gradeLabel = 'Sobresaliente (A)';
    badge = 'Equilibrio 80/20 Boca Salud';
    feedback = 'Gran solidez semanal: mantienes una adherencia óptima con tus caprichos bajo control.';
  } else if (totalScore >= 7.0) {
    gradeLabel = 'Notable (B)';
    badge = 'Camino al Éxito Boca Salud';
    feedback = 'Buen progreso: afina los días de descanso activo y el agua para desbloquear tu capricho.';
  }

  return {
    totalScore,
    gradeLabel,
    badge,
    feedback,
    breakdown: {
      foodScore,
      hydrationScore,
      exerciseScore,
      cheatScore,
    },
  };
}

export function computeAuraMetrics(week: DayTracking[]): AuraMetricsSummary {
  const hydrationDays = week.filter((d) => d.agua_cumplida).length;
  const exerciseDays = week.filter((d) => d.ejercicio_completado).length;
  const cheatMealsUsed = week.filter((d) => d.capricho_usado).length;

  // Active days: days where at least one status is marked
  const activeDaysList = week.filter(
    (d) => d.agua_cumplida || d.comida_saludable || d.ejercicio_completado || d.capricho_usado || ((d.agua_litros || 0) > 0)
  );
  const activeDaysElapsed = activeDaysList.length;

  const healthyEatingDays = week.filter((d) => d.comida_saludable).length;
  const healthyEatingRate = activeDaysElapsed > 0 ? Math.round((healthyEatingDays / activeDaysElapsed) * 100) : 0;

  // Business Rule:
  // User has maximum 2 cheat meals per week.
  // To unlock the 2 cheat meals, they must maintain healthy food adherence of at least 80% in elapsed days.
  const cheatMealAllowed = activeDaysElapsed > 0 && healthyEatingRate >= 80 && cheatMealsUsed < 2;

  const weeklyScore = computeWeeklyScore(
    healthyEatingDays,
    activeDaysElapsed,
    hydrationDays,
    exerciseDays,
    cheatMealsUsed
  );

  return {
    hydrationDays,
    exerciseDays,
    healthyEatingDays,
    healthyEatingRate,
    cheatMealsUsed,
    cheatMealAllowed,
    activeDaysElapsed,
    weeklyScore,
  };
}

export function generateLocalAuraResponse(week: DayTracking[]): string {
  const summary = computeAuraMetrics(week);
  const score = summary.weeklyScore;

  if (summary.activeDaysElapsed === 0 || score.totalScore === 0) {
    return `### 🌟 Puntuación Reiniciada · Boca Salud 80/20
* 🏆 **Nota Semanal:** 0.0/10 — Puntuación Reiniciada
* 💧 **Hidratación:** 0 / 7 días
* 🏃 **Actividad Física:** 0 / 7 días
* 🍏 **Alimentación Limpia:** 0%
* 🍷 **Caprichos Semanales:** 0 de 2 utilizados

### 📊 Estado Actual
- **Todos los datos de los días previos a hoy han sido borrados** y la puntuación se ha reiniciado por completo.
- Dispones del lienzo en blanco para registrar tus hábitos saludables desde hoy.

### ✨ Recomendación Boca Salud
- Empieza marcando tu ingesta de agua (2.0L+) y tu comida limpia del día para activar tu puntuación en Boca Salud.`;
  }

  let progressParagraph = '';
  let cheatConfirmation = '';

  if (summary.healthyEatingRate >= 80) {
    if (summary.cheatMealsUsed === 0) {
      progressParagraph = `Tu disciplina en Boca Salud esta semana es impecable, reflejando un sólido compromiso con tu bienestar integral y energía. Con una nota de ${score.totalScore}/10 (${score.gradeLabel}), una adherencia del ${summary.healthyEatingRate}% y ${summary.hydrationDays} días de hidratación óptima, tu cuerpo se encuentra en un estado metabólico excelente.`;
      cheatConfirmation = `Confirmación Boca Salud: **Tienes total luz verde para disfrutar de tu 1.º capricho hoy o durante el fin de semana sin remordimientos**, respaldado plenamente por tu regla 80/20.`;
    } else if (summary.cheatMealsUsed === 1) {
      progressParagraph = `Mantienes un equilibrio ejemplar tras haber disfrutado con moderación de tu primer capricho semanal. Tu nota semanal de ${score.totalScore}/10 certifica que tu constancia en el entrenamiento (${summary.exerciseDays} días) y nutrición limpia compensan con creces cualquier exceso puntual.`;
      cheatConfirmation = `Confirmación Boca Salud: **Aún dispones de 1 capricho libre adicional desbloqueado** para este fin de semana, ya que tu adherencia se mantiene por encima del umbral del 80%.`;
    } else {
      progressParagraph = `Has aprovechado tus 2 caprichos semanales con elegancia y sin comprometer tus cimientos de salud. Tu calificación de ${score.totalScore}/10 confirma que tu constancia te ha permitido disfrutar con plena libertad manteniendo tus metas firmes.`;
      cheatConfirmation = `Confirmación Boca Salud: **Has completado tus 2 caprichos permitidos de la semana.** Te recomendamos reservar los próximos días para una nutrición 100% limpia para consolidar tus resultados.`;
    }
  } else {
    progressParagraph = `Tu adherencia a la comida limpia en Boca Salud se sitúa actualmente en el ${summary.healthyEatingRate}%, con una nota semanal de ${score.totalScore}/10 (${score.gradeLabel}). Es una excelente oportunidad para redoblar el enfoque en alimentos frescos y nutritivos antes de relajarte.`;
    cheatConfirmation = `Confirmación Boca Salud: **El capricho se encuentra temporalmente bloqueado** hasta elevar tu adherencia al 80%. Cumplir tu plan limpio hoy y mañana te devolverá el acceso a tu comida libre del fin de semana.`;
  }

  let auraTip = '';
  if (summary.hydrationDays < 3) {
    auraTip = 'Prioriza alcanzar tus 2.0L a 2.5L de agua fresca hoy; la correcta hidratación potenciará tu claridad mental y digestión.';
  } else if (summary.exerciseDays >= 3) {
    auraTip = 'Tu constancia física es sobresaliente. Dedica la velada a estiramientos suaves o un descanso reparador de calidad.';
  } else {
    auraTip = 'Una caminata consciente de 20 minutos tras tu comida principal optimizará tu sensibilidad a la insulina y cerrará tu día con armonía.';
  }

  return `### 🌟 Resumen Semanal de Estado
* 🏆 **Nota Semanal:** ${score.totalScore}/10 — ${score.gradeLabel} (${score.badge})
* 💧 **Hidratación:** ${summary.hydrationDays} / 7 días
* 🏃 **Actividad Física:** ${summary.exerciseDays} / 7 días
* 🍏 **Alimentación Limpia:** ${summary.healthyEatingRate}%
* 🍷 **Caprichos Semanales:** ${summary.cheatMealsUsed} de 2 utilizados

### 📊 Análisis de Progreso
- ${progressParagraph}
- ${cheatConfirmation}

### ✨ Recomendación Boca Salud
- ${auraTip}`;
}


export async function requestAuraAnalysis(week: DayTracking[]): Promise<AuraAnalysisResponse> {
  const summary = computeAuraMetrics(week);
  const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // Prepare standard payload matching the prompt schema
  const payload = {
    weeklyTable: week.map((d) => ({
      dia: d.dia,
      agua_cumplida: d.agua_cumplida,
      comida_saludable: d.comida_saludable,
      ejercicio_completado: d.ejercicio_completado,
      capricho_usado: d.capricho_usado,
    })),
  };

  try {
    const res = await fetch('/api/aura-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.markdown) {
        return {
          markdown: data.markdown,
          summary,
          generatedAt: now,
          isAiGenerated: true,
        };
      }
    }
  } catch (err) {
    console.warn('Could not connect to /api/aura-analysis, using local Aura engine:', err);
  }

  // Graceful deterministic fallback
  return {
    markdown: generateLocalAuraResponse(week),
    summary,
    generatedAt: now,
    isAiGenerated: false,
  };
}
