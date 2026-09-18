// ─────────────────────────────────────────────────────────────
// LA CARTA como página. A diferencia de las fichas, no se escribe en el build:
// la sirve functions/menu.js en cada petición con la carta viva de KV, usando
// esta misma plantilla empaquetada por build.mjs (functions/_generado/).
// ─────────────────────────────────────────────────────────────
import { ORIGIN } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";
import { renderCarta, tf } from "../carta.mjs";

export const RUTA = "/menu";

// Datos estructurados de la carta (schema.org/Menu): secciones y platos con
// precio, foto y dieta. Salen de la misma carta viva que la página, así que
// nunca pueden contradecirla. Los buscadores y las IAs citan de aquí.
function jsonLd(i, carta, url) {
  const absoluta = (src) => (src ? ORIGIN + "/" + String(src).replace(/^\//, "") : undefined);
  const secciones = (carta.sections || []).map((sec) => ({
    "@type": "MenuSection",
    name: tf(i, sec, "title"),
    ...(tf(i, sec, "note") ? { description: tf(i, sec, "note") } : {}),
    hasMenuItem: (sec.items || []).filter((it) => it.available !== false && !it.archived).map((it) => {
      const veg = (it.tags || []).some((x) => String(x).toUpperCase() === "VEG");
      return {
        "@type": "MenuItem",
        name: tf(i, it, "name"),
        ...(tf(i, it, "ingredients") ? { description: tf(i, it, "ingredients") } : {}),
        ...(it.image ? { image: absoluta(it.image) } : {}),
        ...(veg ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
        offers: { "@type": "Offer", price: String(it.price || "").replace(",", "."), priceCurrency: "EUR" },
      };
    }),
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: i.t("Carta de DUM DUM", "DUM DUM menu"),
    url,
    inLanguage: i.lang,
    hasMenuSection: secciones,
    provider: { "@type": "Restaurant", name: "DUM DUM", url: ORIGIN + "/" },
  };
}

export function menu(i, { locales, seo, carta }) {
  const s = seo.find((r) => r.p === RUTA);
  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, renderCarta(i, carta)),
    ld: jsonLd(i, carta, ORIGIN + i.ruta(RUTA)),
  };
}
