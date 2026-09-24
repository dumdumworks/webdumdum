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
import { icono } from "./local.mjs";

export const RUTA = "/taller-team-building";
const DOSSIER = "/img/dossier/DUMDUM_DOSSIER_EVENTOS.pdf";

// [n, icono, minititulo es/en, frase es/en] de cada paso. Los iconos son
// ICONOS.equipo/masa/dumpling/cocinar/comer en local.mjs, trazados a partir
// de bocetos reales del proceso del taller.
const INCLUYE = [
  ["01", "equipo", "Equipos", "Teams",
    "En cuanto llegáis os dividimos <strong>en equipos</strong>: la dinámica es de grupo de principio a fin, no cada uno a su bola.",
    "As soon as you arrive we split you <strong>into teams</strong>: it's a group thing from start to finish, not everyone doing their own."],
  ["02", "masa", "La masa", "The dough",
    "Amasáis vosotros mismos la masa de los dumplings, paso a paso, con <strong>nuestro equipo guiándoos</strong> de cerca.",
    "You knead the dumpling dough yourselves, step by step, with <strong>our team guiding you</strong> closely."],
  ["03", "dumpling", "Montaje", "Assembly",
    "Rellenáis y cerráis cada dumpling <strong>a mano</strong>: aquí se nota qué equipo tiene más maña.",
    "You fill and fold each dumpling <strong>by hand</strong> — this is where you find out which team's got the knack."],
  ["04", "cocinar", "Cocinado", "Cooking",
    "<strong>Cocináis</strong> lo que habéis montado y <strong>aprendéis a emplatarlo</strong> tal como hacemos en el restaurante.",
    "<strong>You cook</strong> what you've put together, and <strong>learn to plate it</strong> just the way we do it in the restaurant."],
  ["05", "comer", "Degustación", "Tasting",
    "Os sentáis a <strong>comer lo que habéis hecho</strong>, con el resto de la carta también en la mesa.",
    "You sit down to eat <strong>what you've made</strong>, with the rest of the menu on the table too."],
];
// Fila de .taller-list, como Horarios y Tarifas: [etiqueta es, valor es,
// etiqueta en, valor en].
const COMIDA = [
  ["Entrante", "Un entrante, a compartir", "Starter", "One starter, to share"],
  ["Dumplings", "Toda la carta, 10 por persona", "Dumplings", "The whole menu, 10 per person"],
  ["Bebida", "A elegir", "Drink", "Your choice"],
  ["Postre", "Un mochi, a elegir", "Dessert", "One mochi, your choice"],
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
      ${INCLUYE.map(([n]) => `<div class="taller-tl-num tiny">${esc(n)}</div>`).join("\n      ")}
    </div>
    <div class="taller-tl-fila taller-tl-riel">
      <div class="taller-tl-linea"></div>
      ${INCLUYE.map(([, ico], idx) => `<div class="taller-tl-ico" style="grid-column:${idx + 1}">${icono(ico)}</div>`).join("\n      ")}
    </div>
    <div class="taller-tl-fila">
      ${INCLUYE.map(([, , esT, enT]) => `<div class="taller-tl-titulo">${esc(i.lang === "en" ? enT : esT)}</div>`).join("\n      ")}
    </div>
    <div class="taller-tl-fila">
      ${INCLUYE.map(([, , , , esC, enC]) => `<div class="taller-tl-desc">${i.lang === "en" ? enC : esC}</div>`).join("\n      ")}
    </div>
  </div>`;
const railMovil = (i) => `<div class="taller-tl-movil">
    ${INCLUYE.map(([n, ico, esT, enT, esC, enC]) => `<div class="taller-tl-paso-m">
      <span class="taller-tl-ico-m">${icono(ico)}</span>
      <div class="taller-tl-cuerpo-m">
        <div class="taller-tl-cab-m">
          <span class="taller-tl-num-m tiny">${esc(n)}</span>
          <span class="taller-tl-titulo-m">${esc(i.lang === "en" ? enT : esT)}</span>
        </div>
        <p class="taller-tl-desc-m">${i.lang === "en" ? enC : esC}</p>
      </div>
    </div>`).join("\n    ")}
  </div>`;
// Casilla de la rejilla de 3×2 ([02]-[07]): rótulo, icono de categoría,
// titular compacto, un subtítulo opcional y el contenido, a una sola
// columna — no el .ev-split a medias de seccion(). El alto de cada fila lo
// pone la rejilla CSS por su cuenta (stretch): la casilla con más
// contenido de la fila manda, las demás se adaptan solas.
const casilla = (n, ico, rotulo, titulo, subtitulo, derecha) => `<div class="taller-casilla">
    <div class="tiny muted">[${n}] ${esc(rotulo)}</div>
    <div class="taller-casilla-ico">${icono(ico)}</div>
    <h3 class="taller-casilla-h">${titulo}</h3>
    ${subtitulo ? `<p class="taller-casilla-sub">${subtitulo}</p>\n    ` : ""}<div class="taller-casilla-body">
${derecha}
    </div>
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
    <p class="body" style="font-size:18px;flex:1 1 420px;min-width:0;margin:0">${t(
      "Un <strong>taller de cocina para empresas</strong>: <strong>por equipos</strong>, aprendéis a elaborar <strong>dumplings desde cero</strong> guiados por nuestro equipo y, al terminar, os coméis <strong>lo que habéis hecho</strong>, con el <strong>resto de la carta incluida</strong>. Unas <strong>dos horas</strong>, en nuestro local de <strong>Bernabéu</strong>.",
      "A <strong>hands-on cooking workshop for companies</strong>: <strong>in teams</strong>, you learn to make <strong>dumplings from scratch</strong> with our team, then eat <strong>what you've made</strong>, plus the <strong>rest of the menu</strong>. <strong>About two hours</strong>, at our <strong>Bernabéu</strong> spot.")}</p>
  </div>
  <div class="ev-hero-cta" style="display:flex;flex-wrap:wrap;gap:16px">
    <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
    <a class="btn" href="${esc(DOSSIER)}" target="_blank" rel="noreferrer"><span class="btn-label">${esc(t("Descargar dossier con tarifas", "Download dossier with rates"))}</span><span class="btn-arrow">↓</span></a>
  </div>
</section>

<section class="taller-tl">
  <div class="taller-tl-head">
    <div class="tiny muted">[01] ${esc(t("El taller", "The workshop"))}</div>
    <h2 class="h-1">${t("Así funciona<br>el taller.", "How the<br>workshop works.")}</h2>
  </div>
  ${railEscritorio(i)}
  ${railMovil(i)}
</section>

<section class="taller-grid">
  ${casilla("02", "comida", t("Comida", "Food"),
    t("El menú de<br>la degustación.", "The tasting<br>menu."),
    esc(t("Se prueba toda la carta.", "You get to try the whole menu.")),
    `      <div class="taller-list">
        ${filas(i, COMIDA)}
      </div>
      <p class="tiny muted taller-casilla-nota">${esc(t("* Consumos extra aparte.", "* Extra consumption not included."))}</p>`)}
  ${casilla("03", "hora", t("Horarios", "Timings"),
    t("Horarios y<br>duraciones.", "Timings and<br>durations."),
    esc(t("Un par de horitas, para que no se aburran.", "A couple of hours, so nobody gets bored.")),
    `      <div class="taller-list">
        ${filas(i, HORARIOS)}
      </div>
      <p class="tiny muted taller-casilla-nota">${esc(t("* Otros horarios o más duración, bajo consulta.", "* Other times or a longer session, on request."))}</p>`)}
  ${casilla("04", "tarifa", t("Tarifas", "Rates"),
    t("Precios<br>y tarifas.", "Prices<br>and rates."),
    esc(t("A más gente, mejor precio.", "More people, better price.")),
    `      <div class="taller-list">
        ${filas(i, TARIFAS)}
      </div>
      <p class="tiny muted taller-casilla-nota">${esc(t("* Talleres fuera del restaurante sujetos a disponibilidad.", "* Off-site workshops subject to availability."))}</p>`)}
  ${casilla("05", "ajustar", t("Y si tu evento es distinto", "And if your event is different"),
    t("Adaptabilidad<br>y versatilidad.", "Adaptability<br>and versatility."),
    esc(t("Adecuamos el taller para que parezca vuestro.", "We shape the workshop to feel like yours.")),
    `      <p class="body">${esc(t(
      "El espacio, la carta y las tarifas se adaptan al tipo de evento. Cumpleaños, despedidas, presentaciones… si nos cuentas qué necesitas, le buscamos forma.",
      "The space, the menu and the rates all adapt to the type of event. Birthdays, leaving dos, launches… tell us what you need and we'll make it work."))}</p>`)}
  ${casilla("06", "camara", t("En imágenes", "In pictures"),
    t("Así se ve<br>el taller.", "This is<br>the workshop."),
    esc(t("La verdad es que la gente lo pasa bien.", "Honestly, people have a great time.")),
    "      " + galeria(i, { fotos: galerias.tallerTeamBuilding || [], ratio: "3 / 4", etiquetaHueco: t("Team Building", "Team Building"), raiz, modo: "paginado", etiqueta: t("Team Building", "Team Building"), huecos: 4, cols: 1 }))}
  ${casilla("07", "bocadillo", t("Preguntas frecuentes", "FAQ"),
    t("Lo que más<br>nos preguntáis.", "What you<br>ask us most."),
    null,
    `      <div class="taller-casilla-faq">
${FAQ.map(({ q, a }) => `        <div style="margin-bottom:18px">
          <div class="taller-casilla-q">${esc(i.lang === "en" ? q[1] : q[0])}</div>
          <p class="taller-casilla-a">${esc(i.lang === "en" ? a[1] : a[0])}</p>
        </div>`).join("\n")}
      </div>
      <div class="taller-casilla-cta">
        <h3 class="taller-casilla-cta-h">${t("¿Hablamos?", "Let's talk?")}</h3>
        <p class="taller-casilla-cta-p">${esc(t(
          "Cuéntanos cuántos sois y cuándo, y te mandamos disponibilidad y presupuesto.",
          "Tell us how many you are and when, and we'll send you availability and a quote."))}</p>
        <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
      </div>`)}
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
