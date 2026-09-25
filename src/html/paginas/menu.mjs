// ─────────────────────────────────────────────────────────────
// LA CARTA como página. A diferencia de las fichas, no se escribe en el build:
// la sirve functions/menu.js en cada petición con la carta viva de KV, usando
// esta misma plantilla empaquetada por build.mjs (functions/_generado/).
// ─────────────────────────────────────────────────────────────
import { ORIGIN, breadcrumbLd } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";
import { renderCarta, tf, dumplingsDisponibles, numeroALetra, mayuscInicial } from "../carta.mjs";

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
  // La cifra de la meta description sale de la carta viva, no de un número
  // suelto en seo.mjs: si no, en cuanto cambia la carta la descripción que
  // enseña Google deja de ser verdad (ver dumplingsDisponibles en carta.mjs).
  const n = dumplingsDisponibles(carta).length;
  const cifra = { es: mayuscInicial(numeroALetra(n, "es")), en: mayuscInicial(numeroALetra(n, "en")) };
  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en"
      ? `${cifra.en} dumplings, not a single conventional one. Short menu that changes every month: price, ingredients and allergens for each dish.`
      : `${cifra.es} dumplings de autor, ni uno convencional. Carta corta que cambia cada mes: precio, ingredientes y alérgenos de cada plato.`,
    cuerpo: esqueleto(i, RUTA, locales, renderCarta(i, carta)),
    ld: [jsonLd(i, carta, ORIGIN + i.ruta(RUTA)), breadcrumbLd(i, [{ nombre: i.t("Carta", "Menu"), ruta: RUTA }])],
  };
}
