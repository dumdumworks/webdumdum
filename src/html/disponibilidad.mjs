// ─────────────────────────────────────────────────────────────
// Disponibilidad de un plato por días de la semana: `dias: [1..7]` (ISO: 1 = lunes … 7 = domingo).
// Sin el campo, o con los siete, el plato está disponible TODOS los días (es el valor por defecto: los
// platos que ya existían no hay que tocarlos). Módulo puro, sin fs: lo importan la carta (que se pinta
// en el edge en cada petición), los datos estructurados y la función que guarda la carta
// (functions/api/menu.js), para que lo que admite el servidor y lo que pinta la web sea lo mismo.
//
// El día que cuenta es el de Madrid (el del local), no el del servidor ni el del cliente: ver diaSemanaMadrid.
// ─────────────────────────────────────────────────────────────
export const TODOS_LOS_DIAS = [1, 2, 3, 4, 5, 6, 7];

const ABREV = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

// Día de la semana (1 = lunes … 7 = domingo) en Madrid.
export function diaSemanaMadrid(fecha = new Date()) {
  try {
    const d = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Madrid", weekday: "short" }).format(fecha);
    return ABREV[d] ?? 1;
  } catch (e) {
    return ((fecha.getDay() + 6) % 7) + 1; // sin soporte de zonas: el día local
  }
}

// Días en que está disponible un plato. Un valor ausente, vacío o roto cuenta como «todos»: ante la
// duda el plato SE VE (el panel y el servidor ya impiden guardarlo con días inválidos).
export function diasDe(it) {
  const v = it && it.dias;
  if (!Array.isArray(v)) return TODOS_LOS_DIAS;
  const dias = [...new Set(v.filter((n) => Number.isInteger(n) && n >= 1 && n <= 7))].sort((a, b) => a - b);
  return dias.length ? dias : TODOS_LOS_DIAS;
}

// ¿Sale este plato en la carta el día `dia`? Oculto (available:false) y archivado no salen nunca.
export const disponibleEn = (it, dia) => it.available !== false && !it.archived && diasDe(it).includes(dia);

// Validación al guardar. → { ok:true, dias } (dias = null si son los siete: se guarda sin el campo) o { ok:false }.
export function validarDias(valor) {
  if (valor == null) return { ok: true, dias: null };
  if (!Array.isArray(valor) || !valor.length || valor.length > 7) return { ok: false };
  if (!valor.every((n) => Number.isInteger(n) && n >= 1 && n <= 7)) return { ok: false };
  const dias = [...new Set(valor)].sort((a, b) => a - b);
  return { ok: true, dias: dias.length === 7 ? null : dias };
}
