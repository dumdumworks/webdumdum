// ─────────────────────────────────────────────────────────────
// LA CARTA como página. A diferencia de las fichas, no se escribe en el build:
// la sirve functions/menu.js en cada petición con la carta viva de KV, usando
// esta misma plantilla empaquetada por build.mjs (functions/_generado/).
// ─────────────────────────────────────────────────────────────
import { esqueleto } from "../shell.mjs";
import { renderCarta } from "../carta.mjs";

export const RUTA = "/menu";

export function menu(i, { locales, seo, carta }) {
  const s = seo.find((r) => r.p === RUTA);
  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, renderCarta(i, carta)),
    ld: null,
  };
}
