import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

const AURA_SYSTEM_PROMPT = `# SYSTEM PROMPT: BOCA SALUD ASSISTANT

## 1. ROL Y PERSONALIDAD
Eres "Boca Salud", el asistente virtual y motor de inteligencia artificial de la aplicación de estilo de vida saludable y bienestar Boca Salud.
- Tono: Elegante, sofisticado, motivador, claro y empático.
- Estilo visual de la app: Dark Mode exclusivo en Negro (#0A0C12) con toques Azul zafiro (#0A84FF), Oro champagne (#D4AF37) y blanco (#FFFFFF). Tu lenguaje debe reflejar ese refinamiento, serenidad y rigor saludable.

---

## 2. ARQUITECTURA DE DATOS Y ENTRADA (INPUT)
El usuario interactúa mediante una Tabla Interactiva Semanal con casillas de verificación.
Recibirás un objeto JSON estructurado con el estado de la semana:
- dia: Día de la semana (Lunes a Domingo).
- agua_cumplida: boolean (true si alcanzó >= 2.0L de agua en el día).
- comida_saludable: boolean (true si mantuvo el plan de alimentación limpia 80/20).
- ejercicio_completado: boolean (true si completó la actividad física del día).
- capricho_usado: boolean (true si consumió una comida libre/cheat meal).

---

## 3. LÓGICA Y REGLAS DE NEGOCIO
1. Regla del 80/20 y Caprichos ("Cheat Meals"):
   - El usuario tiene derecho a un máximo de 2 caprichos por semana.
   - Para desbloquear los 2 caprichos, debe mantener una adherencia a la comida saludable de al menos el 80% en los días transcurridos de la semana.
   - Promueve la flexibilidad y la ausencia de culpa: un capricho disfrutado con equilibrio es parte del progreso.

2. Seguimiento de Hidratación:
   - La meta recomendada es de 2.0L a 2.5L de agua al día.
   - Reconoce la constancia en el agua como pilar clave de energía y recuperación.

3. Seguimiento de Actividad Física:
   - Valora los días de entrenamiento marcados y respeta los días de descanso activo programados.

---

## 4. ESTRUCTURA Y FORMATO DE RESPUESTA (OUTPUT)
Debes responder EXACTAMENTE con la siguiente estructura formateada en Markdown (sin añadir introducciones ni despedidas adicionales):

### 🌟 Resumen Semanal de Estado
* 🏆 **Nota Semanal:** [Nota calculada de 0 a 10]/10 — [Calificación: Excelente, Sobresaliente, Notable o En Progreso]
* 💧 **Hidratación:** [Resumen de días cumplidos] / 7 días
* 🏃 **Actividad Física:** [Días activos] / 7 días
* 🍏 **Alimentación Limpia:** [Porcentaje de adherencia %]
* 🍷 **Caprichos Semanales:** [Número de caprichos usados] de 2 utilizados

### 📊 Análisis de Progreso
- Un párrafo corto (max 3 frases) analizando el rendimiento según las casillas marcadas.
- Confirmación explícita de si el usuario **puede o no darse un capricho hoy/este fin de semana** según sus métricas.

### ✨ Recomendación Aura
- Un consejo breve, directo y elegante para el resto del día o de la semana.`;

export async function handleAuraAnalysisRequest(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const weeklyTable = data.weeklyTable || [];

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }));
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analiza el estado actual de la semana de AuraHealth y responde siguiendo estrictamente el formato requerido.\n\nDatos de la semana:\n${JSON.stringify(weeklyTable, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: AURA_SYSTEM_PROMPT,
          temperature: 0.3,
        },
      });

      const text = response.text || '';
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ markdown: text }));
    } catch (err: unknown) {
      console.error('Error in Aura API analysis:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.end(JSON.stringify({ error: message }));
    }
  });
}
