import React, { useState, useEffect } from 'react';
import { 
  Search, Flame, Apple, Wine, Sparkles, Scale, Info, Check, 
  Plus, History, Trash2, ArrowUpRight, ChefHat, Activity, Heart,
  ShieldCheck, Share2, Copy
} from 'lucide-react';
import { MealNutrition, DayTracking } from '../types/health';
import { 
  fetchMealNutrition, 
  POPULAR_FOOD_PRESETS, 
  getRecentSearches, 
  clearRecentSearches 
} from '../utils/nutritionService';
import { LOCAL_MEAL_DATABASE } from '../../server/nutritionApi';
import { sounds } from '../utils/audio';

interface NutritionConsultantViewProps {
  currentDay: DayTracking;
  onUpdateDay: (details: Partial<DayTracking>) => void;
  onSelectTab?: (tab: 'table' | 'calendar' | 'assistant' | 'today') => void;
}

export const NutritionConsultantView: React.FC<NutritionConsultantViewProps> = ({
  currentDay,
  onUpdateDay,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealNutrition | null>(LOCAL_MEAL_DATABASE[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [recents, setRecents] = useState<MealNutrition[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'clean' | 'cheat'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    setRecents(getRecentSearches());
  }, []);

  const handleSearch = async (termToSearch?: string) => {
    const term = (termToSearch || searchQuery).trim();
    if (!term) return;

    sounds.playTap();
    setIsLoading(true);
    setActionNotice(null);

    try {
      const result = await fetchMealNutrition(term);
      setSelectedMeal(result);
      setRecents(getRecentSearches());
      if (termToSearch) {
        setSearchQuery(termToSearch);
      }
    } catch (err) {
      console.error('Error fetching meal nutrition:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleAddNotesToToday = () => {
    if (!selectedMeal) return;
    sounds.playSuccess();

    const mealNote = `${selectedMeal.name} (~${selectedMeal.calories} kcal, ${selectedMeal.protein}g P)`;
    const existing = currentDay.notas?.trim();
    const updatedNotas = existing ? `${existing} | ${mealNote}` : mealNote;

    onUpdateDay({ notas: updatedNotas });
    showNotice(`✓ "${selectedMeal.name}" añadido a las notas de ${currentDay.dia}`);
  };

  const handleApplyToDayStatus = () => {
    if (!selectedMeal) return;
    sounds.playSuccess();

    if (selectedMeal.category === 'clean_80') {
      onUpdateDay({ comida_saludable: true });
      showNotice(`✓ Marcado como Comida Limpia (80%) para ${currentDay.dia}`);
    } else {
      onUpdateDay({ capricho_usado: true });
      showNotice(`✓ Marcado como Capricho Semanal usado para ${currentDay.dia}`);
    }
  };

  const handleCopySummary = () => {
    if (!selectedMeal) return;
    sounds.playTap();

    const summary = `🍽️ ${selectedMeal.name} (${selectedMeal.portion})
🔥 Calorías: ${selectedMeal.calories} kcal
🥩 Proteínas: ${selectedMeal.protein}g | 🥖 Carbohidratos: ${selectedMeal.carbs}g | 🥑 Grasas: ${selectedMeal.fat}g | 🥦 Fibra: ${selectedMeal.fiber}g
⭐ Boca Salud: ${selectedMeal.bocaScore}/10 (${selectedMeal.categoryLabel})
💡 Consejo: ${selectedMeal.tips}`;

    navigator.clipboard?.writeText(summary);
    showNotice('✓ Resumen nutricional copiado al portapapeles');
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  // Macro calorie calculation for distribution bar
  const proteinKcal = (selectedMeal?.protein || 0) * 4;
  const carbsKcal = (selectedMeal?.carbs || 0) * 4;
  const fatKcal = (selectedMeal?.fat || 0) * 9;
  const totalMacroKcal = Math.max(1, proteinKcal + carbsKcal + fatKcal);

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalMacroKcal) * 100);
  const fatPct = Math.round((fatKcal / totalMacroKcal) * 100);

  // Filtered preset catalog
  const filteredCatalog = LOCAL_MEAL_DATABASE.filter((m) => {
    if (activeFilter === 'clean') return m.category === 'clean_80';
    if (activeFilter === 'cheat') return m.category === 'cheat_20';
    return true;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0F1424] via-[#0B0E17] to-[#0A0C12] border border-[#0A84FF]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A84FF]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-md shadow-[#0A84FF]/25">
            <div className="w-full h-full bg-[#0D111A] rounded-[10px] flex items-center justify-center text-[#D4AF37]">
              <Flame className="w-4 h-4 text-[#D4AF37]" />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5 leading-none">
              <span>Consultor Nutricional Boca Salud</span>
              <span className="text-[9px] font-bold text-[#38BDF8] uppercase px-1.5 py-0.5 rounded bg-[#0A84FF]/15 border border-[#0A84FF]/30">
                IA 3.8
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Consulta a groso modo calorías, macros y clasificación 80/20 de cualquier plato
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-3 relative"
        >
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej. Salmón con verduras, Pizza, Tortilla, Lentejas..."
              className="w-full pl-10 pr-24 py-2.5 bg-[#131826] border border-[#0A84FF]/40 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition shadow-inner"
            />
            <Search className="w-4 h-4 text-[#38BDF8] absolute left-3.5 pointer-events-none" />

            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0A84FF] disabled:opacity-40 text-white text-[11px] font-bold shadow-md shadow-[#0A84FF]/20 active:scale-95 transition flex items-center gap-1"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Consultar</span>
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Food Preset Chips */}
        <div className="mt-3 pt-2.5 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
            <span className="font-semibold text-slate-300">Consultas rápidas frecuentes:</span>
            <span className="text-[9px] text-[#D4AF37]">Toca para ver</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {POPULAR_FOOD_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset.query)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1.5 active:scale-95 transition ${
                  preset.type === 'clean'
                    ? 'bg-[#121A2A] border-[#0A84FF]/30 text-slate-200 hover:border-[#38BDF8] hover:text-[#38BDF8]'
                    : 'bg-[#1C1217] border-rose-900/40 text-rose-200 hover:border-amber-400/50 hover:text-amber-300'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-2.5 rounded-xl bg-[#0F2318] border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150 shadow-lg">
          <span>{actionNotice}</span>
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* ACTIVE MEAL ANALYSIS CARD */}
      {selectedMeal && (
        <div className="p-4 rounded-3xl bg-[#0D111A] border border-[#0A84FF]/25 shadow-2xl space-y-4 relative overflow-hidden">
          {/* Top Title & Classification */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                    selectedMeal.category === 'clean_80'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                      : 'bg-rose-950/70 text-rose-300 border-rose-600/40'
                  }`}
                >
                  {selectedMeal.category === 'clean_80' ? '🍏 80% Comida Limpia' : '🍷 20% Capricho Semanal'}
                </span>

                {selectedMeal.glycemicIndex && (
                  <span className="text-[10px] font-semibold text-slate-400 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                    I.G. {selectedMeal.glycemicIndex}
                  </span>
                )}
              </div>

              <h3 className="text-base font-black text-white leading-tight">
                {selectedMeal.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Porción estimada: <strong className="text-slate-300">{selectedMeal.portion}</strong>
              </p>
            </div>

            {/* Boca Score Badge */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0A0D15] border border-[#D4AF37]/40 flex flex-col items-center justify-center shadow-md">
                <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-tighter">Boca</span>
                <span className="text-base font-black text-white leading-none">
                  {selectedMeal.bocaScore.toFixed(1)}
                </span>
                <span className="text-[8px] text-slate-400">/ 10</span>
              </div>
            </div>
          </div>

          {/* 5 MACRONUTRIENT & CALORIE TILES */}
          <div className="grid grid-cols-5 gap-1.5">
            {/* Calories */}
            <div className="p-2.5 rounded-2xl bg-[#131929] border border-[#0A84FF]/30 text-center flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-[#38BDF8] flex items-center justify-center gap-0.5">
                <Flame className="w-2.5 h-2.5 text-amber-400 inline" /> Kcal
              </span>
              <span className="text-sm font-black text-white my-0.5">
                {selectedMeal.calories}
              </span>
              <span className="text-[8px] text-slate-400">energía</span>
            </div>

            {/* Protein */}
            <div className="p-2.5 rounded-2xl bg-[#141824] border border-blue-500/20 text-center flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-blue-400">Proteína</span>
              <span className="text-sm font-black text-white my-0.5">
                {selectedMeal.protein}g
              </span>
              <span className="text-[8px] text-blue-300">{proteinPct}%</span>
            </div>

            {/* Carbs */}
            <div className="p-2.5 rounded-2xl bg-[#141824] border border-amber-500/20 text-center flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-amber-400">Carbos</span>
              <span className="text-sm font-black text-white my-0.5">
                {selectedMeal.carbs}g
              </span>
              <span className="text-[8px] text-amber-300">{carbsPct}%</span>
            </div>

            {/* Fat */}
            <div className="p-2.5 rounded-2xl bg-[#141824] border border-rose-500/20 text-center flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-rose-400">Grasas</span>
              <span className="text-sm font-black text-white my-0.5">
                {selectedMeal.fat}g
              </span>
              <span className="text-[8px] text-rose-300">{fatPct}%</span>
            </div>

            {/* Fiber */}
            <div className="p-2.5 rounded-2xl bg-[#141824] border border-emerald-500/20 text-center flex flex-col justify-between">
              <span className="text-[9px] uppercase font-bold text-emerald-400">Fibra</span>
              <span className="text-sm font-black text-white my-0.5">
                {selectedMeal.fiber}g
              </span>
              <span className="text-[8px] text-emerald-300">saciedad</span>
            </div>
          </div>

          {/* Visual Macro Proportion Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Distribución calórica:</span>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">● Prot {proteinPct}%</span>
                <span className="text-amber-400">● Carbs {carbsPct}%</span>
                <span className="text-rose-400">● Grasas {fatPct}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-neutral-800 flex w-full">
              <div style={{ width: `${proteinPct}%` }} className="bg-blue-500 h-full transition-all" title={`Proteína: ${proteinPct}%`} />
              <div style={{ width: `${carbsPct}%` }} className="bg-amber-400 h-full transition-all" title={`Carbohidratos: ${carbsPct}%`} />
              <div style={{ width: `${fatPct}%` }} className="bg-rose-500 h-full transition-all" title={`Grasas: ${fatPct}%`} />
            </div>
          </div>

          {/* Micronutrientes y Calidad de Grasas */}
          <div className="p-3 rounded-2xl bg-[#101420] border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Heart className="w-3 h-3 text-[#D4AF37]" />
                Micronutrientes destacados
              </span>
              {selectedMeal.healthyFatsRatio && (
                <span className="text-[10px] text-[#38BDF8] truncate max-w-[170px]" title={selectedMeal.healthyFatsRatio}>
                  {selectedMeal.healthyFatsRatio}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedMeal.micronutrients && selectedMeal.micronutrients.length > 0 ? (
                selectedMeal.micronutrients.map((micro, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium text-slate-300 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-800 flex items-center gap-1"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    {micro}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-500">Aporte estándar de micronutrientes</span>
              )}
            </div>
          </div>

          {/* Boca Salud Consejo */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#141724] to-[#0E121B] border border-[#D4AF37]/35 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-[#D4AF37]">
                Dictamen Boca Salud
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                {selectedMeal.tips}
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS: Add to Today / Apply to Tracker */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleAddNotesToToday}
              className="py-2.5 px-3 rounded-xl bg-[#131929] border border-[#0A84FF]/40 hover:border-[#0A84FF] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
            >
              <Plus className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Añadir a notas de hoy</span>
            </button>

            <button
              onClick={handleApplyToDayStatus}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
                selectedMeal.category === 'clean_80'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-teal-600 hover:to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:from-[#B89628] hover:to-[#D4AF37] text-neutral-950 font-black'
              }`}
            >
              {selectedMeal.category === 'clean_80' ? (
                <>
                  <Apple className="w-3.5 h-3.5" />
                  <span>Marcar comida limpia</span>
                </>
              ) : (
                <>
                  <Wine className="w-3.5 h-3.5" />
                  <span>Registrar capricho</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Copy summary button */}
          <div className="flex justify-end">
            <button
              onClick={handleCopySummary}
              className="text-[10px] text-slate-400 hover:text-[#D4AF37] flex items-center gap-1 transition"
            >
              <Copy className="w-3 h-3" />
              <span>Copiar resumen nutricional</span>
            </button>
          </div>
        </div>
      )}

      {/* CATALOG / RECENT SEARCHES SECTION */}
      <div className="p-4 rounded-3xl bg-[#0B0E17] border border-neutral-800/80 space-y-3">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <ChefHat className="w-3.5 h-3.5 text-[#0A84FF]" />
            <span>Catálogo Rápido Boca Salud</span>
          </h3>

          <div className="flex items-center gap-1 bg-[#121622] p-0.5 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                activeFilter === 'all' ? 'bg-[#0A84FF] text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('clean')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                activeFilter === 'clean' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400'
              }`}
            >
              80% Limpios
            </button>
            <button
              onClick={() => setActiveFilter('cheat')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                activeFilter === 'cheat' ? 'bg-rose-900/80 text-rose-200 shadow-sm' : 'text-slate-400'
              }`}
            >
              20% Caprichos
            </button>
          </div>
        </div>

        {/* Catalog Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
          {filteredCatalog.map((meal) => (
            <div
              key={meal.id || meal.name}
              onClick={() => {
                sounds.playTap();
                setSelectedMeal(meal);
                setSearchQuery(meal.name);
              }}
              className={`p-2.5 rounded-2xl border cursor-pointer active:scale-98 transition flex items-center justify-between ${
                selectedMeal?.name === meal.name
                  ? 'bg-[#151C2C] border-[#0A84FF] shadow-md shadow-[#0A84FF]/20'
                  : 'bg-[#11141F] border-neutral-800/90 hover:border-[#0A84FF]/40'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      meal.category === 'clean_80'
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-rose-950 text-rose-300'
                    }`}
                  >
                    {meal.category === 'clean_80' ? '80%' : '20%'}
                  </span>
                  <span className="text-[10px] font-bold text-[#D4AF37]">
                    {meal.calories} kcal
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white truncate">
                  {meal.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">
                  P: {meal.protein}g · C: {meal.carbs}g · G: {meal.fat}g
                </p>
              </div>

              <div className="flex items-center text-slate-500">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Searches */}
        {recents.length > 0 && (
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <History className="w-3 h-3 text-slate-400" />
                Consultas recientes
              </span>
              <button
                onClick={() => {
                  clearRecentSearches();
                  setRecents([]);
                }}
                className="text-[9px] text-slate-500 hover:text-rose-400 flex items-center gap-0.5 transition"
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>Borrar historial</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {recents.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sounds.playTap();
                    setSelectedMeal(r);
                    setSearchQuery(r.name);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[#131722] hover:bg-[#182030] border border-neutral-800 hover:border-[#0A84FF]/30 text-[10px] text-slate-300 transition flex items-center gap-1"
                >
                  <span className="truncate max-w-[150px]">{r.name}</span>
                  <span className="text-[9px] text-[#D4AF37] font-mono">({r.calories} kcal)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
