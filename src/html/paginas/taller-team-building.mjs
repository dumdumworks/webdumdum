// ─────────────────────────────────────────────────────────────
// TALLER TEAM BUILDING (/taller-team-building): la única celda de "Servicios"
// de /eventos con página propia. Contenido adaptado del dossier de eventos
// (incluye, comida, horarios, tarifas), con espacio de fotos (huecos hasta
// que haya fotos reales en galerias.json) y preguntas frecuentes — pensada
// para SEO/GEO: intención de búsqueda real en el H1, Service+FAQPage en el
// JSON-LD con las tarifas reales.
// ─────────────────────────────────────────────────────────────
import { esc, ORIGIN, breadcrumbLd } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";
import { galeria } from "../galeria.mjs";
import { seccion } from "./eventos.mjs";

export const RUTA = "/taller-team-building";
const DOSSIER = "/img/dossier/DUMDUM_DOSSIER_EVENTOS.pdf";

// [n, minititulo es/en, frase es/en] de cada paso.
const INCLUYE = [
  ["01", "Equipos", "Teams", "Por equipos.", "In teams."],
  ["02", "La masa", "The dough", "Aprendemos a amasar.", "We learn to knead."],
  ["03", "Montaje", "Assembly", "Montamos los dumplings.", "We build the dumplings."],
  ["04", "Cocción", "Cooking", "Los cocinamos.", "We cook them."],
  ["05", "Degustación", "Tasting", "Nos lo comemos.", "We eat."],
];
const COMIDA = [
  ["Entrante", "A compartir", "Starter", "To share"],
  ["Carta de dumplings", "Toda, por persona", "Dumpling menu", "The whole thing, per person"],
  ["Bebida", "Una", "Drink", "One"],
  ["Postre", "Un mochi", "Dessert", "One mochi"],
];
const HORARIOS = [
  ["Duración aprox.", "2 – 2,5 h", "Approx. duration", "2 – 2.5 h"],
  ["Bienvenida", "5 min", "Welcome", "5 min"],
  ["Taller", "1 h 15", "Workshop", "1 h 15"],
  ["Comida", "1 h 15", "Meal", "1 h 15"],
  ["Mañanas", "11.30 – 14.00", "Mornings", "11.30am – 2pm"],
  ["Tardes", "18.30 – 21.00", "Afternoons", "6.30 – 9pm"],
];
const TARIFAS = [
  ["Desde", "65€ / persona", "From", "€65 / person"],
  ["6–9 personas", "75€ / persona", "6–9 people", "€75 / person"],
  ["10–20 personas", "70€ / persona", "10–20 people", "€70 / person"],
  ["20–30 personas", "65€ / persona", "20–30 people", "€65 / person"],
  ["+30 personas", "Consultar", "30+ people", "Get in touch"],
];
// Para el JSON-LD (Service.offers): solo los tramos con precio real.
const OFERTAS = [
  { desde: 6, hasta: 9, precio: "75" },
  { desde: 10, hasta: 20, precio: "70" },
  { desde: 20, hasta: 30, precio: "65" },
];
const FAQ = [
  { q: ["¿Para cuántas personas es el team building?", "How many people is the team building for?"],
    a: ["Desde grupos pequeños hasta más de 30 personas. A partir de ahí, consúltanos directamente.",
      "From small groups up to 30+ people. Above that, just get in touch directly."] },
  { q: ["¿Cuánto dura el taller?", "How long does the workshop last?"],
    a: ["Entre 2 y 2,5 horas: bienvenida, una hora y cuarto de taller y otra hora y cuarto de comida. Se puede alargar bajo consulta.",
      "Between 2 and 2.5 hours: welcome, an hour and 15 minutes of workshop, and another hour and 15 minutes of food. Can run longer on request."] },
  { q: ["¿Qué incluye el precio?", "What's included in the price?"],
    a: ["Un entrante a compartir, toda la carta de dumplings por persona, una bebida y un mochi de postre.",
      "A starter to share, the whole dumpling menu per person, one drink and a mochi for dessert."] },
  { q: ["¿Cuánto cuesta?", "How much does it cost?"],
    a: ["Desde 65€ por persona, según el número de participantes. Te damos el precio exacto al escribirnos.",
      "From €65 per person, depending on group size. We'll give you the exact price when you reach out."] },
];

// Fila de .taller-list: dos idiomas o cuatro (etiqueta/valor por idioma).
const filas = (i, datos) => datos.map((d) => {
  const [es1, es2, en1, en2] = d.length === 4 ? d : [d[1], d[2], d[1], d[2]];
  const etiqueta = i.lang === "en" ? (d.length === 4 ? en1 : d[0]) : es1;
  const valor = i.lang === "en" ? en2 : es2;
  return `<div><b>${esc(etiqueta)}</b><span>${esc(valor)}</span></div>`;
}).join("\n      ");
// INCLUYE es una línea de tiempo real: a ancho completo (no la rejilla a
// medias de .ev-split), con un riel horizontal en escritorio — cinco filas
// alineadas por columnas (número / riel con puntos / título / frase), el
// filete uniendo el primer punto con el último exactamente (grid-column
// 1/5, sin cálculos a mano) — y un riel vertical en móvil con el mismo
// punto-sobre-filete, ya validado en esta página.
const railEscritorio = (i) => `<div class="taller-tl-rail">
    <div class="taller-tl-fila">
      ${INCLUYE.map(([n]) => `<div class="taller-tl-num tiny muted">${esc(n)}</div>`).join("\n      ")}
    </div>
    <div class="taller-tl-fila taller-tl-riel">
      <div class="taller-tl-linea"></div>
      ${INCLUYE.map((_, idx) => `<div class="taller-tl-dot" style="grid-column:${idx + 1}"></div>`).join("\n      ")}
    </div>
    <div class="taller-tl-fila">
      ${INCLUYE.map(([, esT, enT]) => `<div class="taller-tl-titulo">${esc(i.lang === "en" ? enT : esT)}</div>`).join("\n      ")}
    </div>
    <div class="taller-tl-fila">
      ${INCLUYE.map(([, , , esC, enC]) => `<div class="taller-tl-desc">${esc(i.lang === "en" ? enC : esC)}</div>`).join("\n      ")}
    </div>
  </div>`;
const railMovil = (i) => `<div class="taller-tl-movil">
    ${INCLUYE.map(([n, esT, enT, esC, enC]) => `<div class="taller-tl-paso-m">
      <div class="taller-tl-cab-m">
        <span class="taller-tl-num-m tiny muted">${esc(n)}</span>
        <span class="taller-tl-titulo-m">${esc(i.lang === "en" ? enT : esT)}</span>
      </div>
      <p class="taller-tl-desc-m">${esc(i.lang === "en" ? enC : esC)}</p>
    </div>`).join("\n    ")}
  </div>`;

function jsonLd(i, url) {
  const { t } = i;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: t("Taller de team building con dumplings", "Dumpling team building workshop"),
    description: t(
      "Taller participativo de elaboración de dumplings para empresas, con dinámicas por equipos y degustación final.",
      "A hands-on dumpling-making workshop for companies, with team activities and a final tasting."),
    url,
    provider: { "@type": "Restaurant", name: "DUM DUM", url: ORIGIN + "/" },
    areaServed: { "@type": "City", name: "Madrid" },
    offers: OFERTAS.map((o) => ({
      "@type": "Offer", price: o.precio, priceCurrency: "EUR",
      eligibleQuantity: { "@type": "QuantitativeValue", minValue: o.desde, maxValue: o.hasta },
      description: t(`${o.desde}–${o.hasta} personas, por persona`, `${o.desde}–${o.hasta} people, per person`),
    })),
  };
}
function faqLd(i) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: i.lang === "en" ? q[1] : q[0],
      acceptedAnswer: { "@type": "Answer", text: i.lang === "en" ? a[1] : a[0] },
    })),
  };
}

export function tallerTeamBuilding(i, { locales, seo, ldGlobal, galerias, raiz }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const url = ORIGIN + i.ruta(RUTA);

  const main = `<div data-screen-label="taller-team-building">
<section class="ev-hero">
  <div class="tiny muted"><a href="${i.ruta("/eventos")}" class="link-hover">${esc(t("Eventos", "Events"))}</a> · ${esc(t("Talleres Team Building", "Team Building Workshops"))}</div>
  <h1 class="h-display" style="margin-top:16px">${esc(t("Team building", "Team building"))}<br>${esc(t("de taller de dumplings.", "dumpling workshop."))}</h1>
  <div class="ev-hero-row" style="margin-top:32px;display:flex;flex-wrap:wrap;align-items:center;gap:32px">
    <p class="body" style="font-size:18px;flex:1 1 420px;min-width:0;margin:0">${esc(t(
      "Un taller de cocina para empresas: por equipos, aprendéis a elaborar dumplings desde cero guiados por nuestro equipo y, al terminar, os coméis lo que habéis hecho, con el resto de la carta incluida. Unas dos horas, en nuestro local de Bernabéu.",
      "A hands-on cooking workshop for companies: in teams, you learn to make dumplings from scratch with our team, then eat what you've made, plus the rest of the menu. About two hours, at our Bernabéu spot."))}</p>
  </div>
  <div class="ev-hero-cta" style="display:flex;flex-wrap:wrap;gap:16px">
    <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
    <a class="btn" href="${esc(DOSSIER)}" target="_blank" rel="noreferrer"><span class="btn-label">${esc(t("Descargar dossier con tarifas", "Download dossier with rates"))}</span><span class="btn-arrow">↓</span></a>
  </div>
</section>

<section class="taller-tl">
  <div class="taller-tl-head">
    <div class="tiny muted">[01] ${esc(t("Incluye", "Includes"))}</div>
    <h2 class="h-1">${t("Cocinamos.<br>Todos. A la vez.", "We cook.<br>All of us. Together.")}</h2>
  </div>
  ${railEscritorio(i)}
  ${railMovil(i)}
</section>

${seccion("02", t("Comida", "Food"),
    esc(t("Y luego, se come.", "And then, we eat.")),
    `<div class="taller-list">
      ${filas(i, COMIDA)}
    </div>
    <p class="tiny muted" style="margin-top:16px">${esc(t("* Consumos extra aparte.", "* Extra consumption not included."))}</p>`)}

${seccion("03", t("Horarios", "Timings"),
    t("Un par de horas,<br>ni un minuto más.", "A couple hours,<br>not one more."),
    `<div class="taller-list">
      ${filas(i, HORARIOS)}
    </div>
    <p class="tiny muted" style="margin-top:16px">${esc(t("* Otros horarios o más duración, bajo consulta.", "* Other times or a longer session, on request."))}</p>`)}

${seccion("04", t("Tarifas", "Rates"),
    t("Más gente,<br>mejor precio.", "More people,<br>better price."),
    `<div class="taller-list">
      ${filas(i, TARIFAS)}
    </div>
    <p class="tiny muted" style="margin-top:16px">${esc(t("* Desplazamiento sujeto a disponibilidad; sin comida, solo el taller dinámico.", "* Off-site sessions subject to availability; food not included, workshop only."))}</p>`)}

${seccion("05", t("Y si tu evento es distinto", "And if your event is different"),
    t("Adaptabilidad<br>y versatilidad.", "Adaptability<br>and versatility."),
    `<p class="body">${esc(t(
      "El espacio, la carta y las tarifas se adaptan al tipo de evento. Cumpleaños, despedidas, presentaciones… si nos cuentas qué necesitas, le buscamos forma.",
      "The space, the menu and the rates all adapt to the type of event. Birthdays, leaving dos, launches… tell us what you need and we'll make it work."))}</p>`)}

${seccion("06", t("En imágenes", "In pictures"),
    t("Así se ve<br>el taller.", "This is<br>the workshop."),
    galeria(i, { fotos: galerias.tallerTeamBuilding || [], ratio: "3 / 4", etiquetaHueco: t("Team Building", "Team Building"), raiz, modo: "paginado", etiqueta: t("Team Building", "Team Building"), huecos: 6 }))}

${seccion("07", t("Preguntas frecuentes", "FAQ"),
    esc(t("Lo que preguntáis siempre.", "What you always ask.")),
    FAQ.map(({ q, a }) => `<div style="margin-bottom:24px">
      <h3 class="h-2" style="font-size:18px">${esc(i.lang === "en" ? q[1] : q[0])}</h3>
      <p class="body" style="margin-top:8px">${esc(i.lang === "en" ? a[1] : a[0])}</p>
    </div>`).join("\n    "))}

<section class="ev-split ev-split--contact" id="contact-taller">
  <div>
    <div class="tiny muted">[08] ${esc(t("Contacto", "Contact"))}</div>
    <h2 class="h-1" style="margin-top:16px">${t("¿Hablamos?", "Let's talk?")}</h2>
    <p class="body" style="margin-top:16px">${esc(t(
      "Cuéntanos cuántos sois y cuándo, y te mandamos disponibilidad y presupuesto para el team building.",
      "Tell us how many you are and when, and we'll send you availability and a quote for the team building."))}</p>
  </div>
  <div>
    <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos" style="width:fit-content"><span class="btn-label">${esc(t("Ir al formulario", "Go to the form"))}</span><span class="btn-arrow">→</span></a>
  </div>
</section>
</div>`;

  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: [ldGlobal, breadcrumbLd(i, [
      { nombre: t("Eventos", "Events"), ruta: "/eventos" },
      { nombre: t("Talleres Team Building", "Team Building Workshops"), ruta: RUTA },
    ]), jsonLd(i, url), faqLd(i)],
  };
}
