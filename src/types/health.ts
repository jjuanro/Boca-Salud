export type DayOfWeek = 
  | 'Lunes' 
  | 'Martes' 
  | 'Miércoles' 
  | 'Jueves' 
  | 'Viernes' 
  | 'Sábado' 
  | 'Domingo';

export interface DayTracking {
  dia: DayOfWeek;
  agua_cumplida: boolean;         // >= 2.0L de agua en el día
  comida_saludable: boolean;      // Plan de alimentación limpia 80/20
  ejercicio_completado: boolean;  // Actividad física completada
  capricho_usado: boolean;        // Comida libre / cheat meal
  agua_litros?: number;           // Cantidad exacta en litros (ej. 2.2L)
  ejercicio_minutos?: number;     // Minutos de actividad
  notas?: string;                 // Notas opcionales de platos o entreno
}

export interface WeeklyScoreBreakdown {
  foodScore: number;         // Puntos obtenidos sobre 4.0
  hydrationScore: number;    // Puntos obtenidos sobre 2.5
  exerciseScore: number;     // Puntos obtenidos sobre 2.5
  cheatScore: number;        // Puntos obtenidos sobre 1.0
}

export interface WeeklyScore {
  totalScore: number;          // Nota global de 0.0 a 10.0
  gradeLabel: string;          // "Excelente (A+)" | "Sobresaliente (A)" | "Notable (B)" | "En Progreso (C)"
  badge: string;               // "Distinción Aura Oro" | "Equilibrio 80/20" | etc.
  feedback: string;            // Explicación de la nota
  breakdown: WeeklyScoreBreakdown;
}

export interface AuraMetricsSummary {
  hydrationDays: number;
  exerciseDays: number;
  healthyEatingDays: number;
  healthyEatingRate: number;      // Porcentaje 0 a 100
  cheatMealsUsed: number;         // 0 a 2
  cheatMealAllowed: boolean;      // True if adherence >= 80% and used < 2
  activeDaysElapsed: number;      // Número de días transcurridos hasta hoy
  weeklyScore: WeeklyScore;       // Nota semanal calculada
}

export interface AuraAnalysisResponse {
  markdown: string;
  summary: AuraMetricsSummary;
  generatedAt: string;
  isAiGenerated: boolean;
}

export interface NotificationSchedule {
  id: string;
  title: string;
  time: string;
  type: 'water' | 'food' | 'exercise' | 'cheat';
  message: string;
  enabled: boolean;
}

export interface CalendarDayInfo {
  dateStr: string;        // 'YYYY-MM-DD'
  dayNumber: number;      // 1 - 31
  month: number;          // 0 - 11
  year: number;
  dayOfWeek: DayOfWeek;
  isCurrentMonth: boolean;
  isToday: boolean;
  score: number;          // 0.0 a 10.0
  tracking?: DayTracking;
}

export interface CalendarWeekInfo {
  weekNumber: number;     // Semana del año
  year: number;
  startDate: string;      // YYYY-MM-DD
  endDate: string;        // YYYY-MM-DD
  days: CalendarDayInfo[];
  weekScore: number;      // 0.0 a 10.0
  gradeLabel: string;
  cheatMealsUsed: number;
}

export interface GitHubUser {
  id: number | string;
  login: string;
  name?: string;
  avatar_url: string;
  bio?: string;
  html_url: string;
  public_repos?: number;
  followers?: number;
  connectedAt: string;
}

export type MealCategory = 'clean_80' | 'cheat_20';

export interface MealNutrition {
  id?: string;
  name: string;                   // Nombre del plato (ej: "Salmón con espárragos y arroz integral")
  portion: string;                // Porción estándar (ej: "1 ración (350g)")
  calories: number;               // kcal aproximadas (ej: 520)
  protein: number;                // gramos de proteína (ej: 42)
  carbs: number;                  // gramos de carbohidratos (ej: 38)
  fat: number;                    // gramos de grasa total (ej: 18)
  fiber: number;                  // gramos de fibra (ej: 6)
  healthyFatsRatio?: string;      // ej: "Rico en grasas monoinsaturadas y Omega-3"
  category: MealCategory;         // 'clean_80' o 'cheat_20'
  categoryLabel: string;          // "Comida Limpia 80%" o "Capricho Semanal 20%"
  bocaScore: number;              // Puntuación 1 a 10 de calidad nutricional
  glycemicIndex?: 'Bajo' | 'Medio' | 'Alto';
  micronutrients: string[];       // ["Omega-3", "Hierro", "Magnesio", "Vitamina C"]
  tips: string;                   // Consejo saludable Boca Salud
  source?: 'ai' | 'database';
}


