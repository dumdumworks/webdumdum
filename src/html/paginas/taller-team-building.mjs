// ─────────────────────────────────────────────────────────────
// TALLER TEAM BUILDING (/taller-team-building): la única celda de "Servicios"
// de /eventos con página propia. Contenido adaptado del dossier de eventos
// (incluye, comida, horarios, tarifas) y preguntas frecuentes — pensada
// para SEO/GEO: intención de búsqueda real en el H1, Service+FAQPage en el
// JSON-LD con las tarifas reales. Sin galería de fotos por ahora (se
// retiró a propósito, pendiente de retomarla — ver .taller-galeria en
// styles-2.css, que se dejó tal cual para cuando vuelva).
// ─────────────────────────────────────────────────────────────
import { esc, ORIGIN, breadcrumbLd } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";
import { icono } from "./local.mjs";

export const RUTA = "/taller-team-building";
const DOSSIER = "/img/dossier/DUMDUM_DOSSIER_EVENTOS.pdf";

// [n, icono, minititulo es/en, frase es/en] de cada paso. Los iconos son
// ICONOS.equipo/masa/dumpling/cocinar/comer en local.mjs, trazados a partir
// de bocetos reales del proceso del taller.
const INCLUYE = [
  ["01", "equipo", "Equipos", "Teams",
    "<strong>En equipos</strong> desde que llegáis.",
    "<strong>Into teams</strong> from the moment you arrive."],
  ["02", "masa", "La masa", "The dough",
    "Amasáis, con <strong>nuestro equipo</strong> cerca.",
    "You knead it, <strong>our team guiding you</strong>."],
  ["03", "dumpling", "Montaje", "Assembly",
    "Rellenáis y cerráis <strong>a mano</strong>.",
    "You fill and fold <strong>by hand</strong>."],
  ["04", "cocinar", "Cocinado", "Cooking",
    "<strong>Cocináis</strong> y <strong>aprendéis a emplatar</strong>.",
    "<strong>You cook</strong> and <strong>learn to plate</strong> it."],
  ["05", "comer", "Degustación", "Tasting",
    "Os sentáis a <strong>comer lo hecho</strong>.",
    "You sit down to <strong>eat what you made</strong>."],
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
// [nombre es, nombre en, rango es, rango en, precio€] — el tramo más
// barato primero (el foco de venta: "a más gente, mejor precio", aquí se
// ve de entrada, no hay que llegar al final para encontrarlo).
const TARIFAS = [
  ["Equipo grande", "Large team", "20–30 personas", "20–30 people", 65],
  ["Equipo mediano", "Medium team", "10–20 personas", "10–20 people", 70],
  ["Equipo pequeño", "Small team", "6–9 personas", "6–9 people", 75],
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
  { q: ["¿Podéis adaptar el taller a otro tipo de evento?", "Can you adapt the workshop for a different kind of event?"],
    a: ["Sí: el espacio, la carta y las tarifas se adaptan al tipo de evento. Cumpleaños, despedidas, presentaciones… cuéntanos qué necesitas y le buscamos forma.",
      "Yes: the space, the menu and the rates all adapt to the type of event. Birthdays, leaving dos, launches… tell us what you need and we'll make it work."] },
];

// Fila de .taller-list: dos idiomas o cuatro (etiqueta/valor por idioma).
const filas = (i, datos) => datos.map((d) => {
  const [es1, es2, en1, en2] = d.length === 4 ? d : [d[1], d[2], d[1], d[2]];
  const etiqueta = i.lang === "en" ? (d.length === 4 ? en1 : d[0]) : es1;
  const valor = i.lang === "en" ? en2 : es2;
  return `<div><b>${esc(etiqueta)}</b><span>${esc(valor)}</span></div>`;
}).join("\n      ");
// El desglose del menú (antes su propia casilla, [03] Comida) se mete
// dentro de cada tarjeta de precio: es el mismo menú para los tres
// tramos, así que se repite igual en las tres — cada tarjeta ya cuenta
// la historia completa (cuánto dura, a quién, cuánto cuesta y qué se
// come), sin depender de otra casilla aparte. La duración va primero,
// con el valor tomado de HORARIOS[0] en vez de repetido a mano, para que
// no se desincronice si cambia ahí.
const menuDesglose = (i) => {
  const { t } = i;
  const [, esDuracion, , enDuracion] = HORARIOS[0];
  const filas = [[t("Taller", "Workshop"), i.lang === "en" ? enDuracion : esDuracion], ...COMIDA.map(([esL, esV, enL, enV]) =>
    [i.lang === "en" ? enL : esL, i.lang === "en" ? enV : esV])]
    .map(([etiqueta, valor]) => `        <div><b>${esc(etiqueta)}</b><span>${esc(valor)}</span></div>`).join("\n");
  return `      <div class="taller-tarifas-caja-menu">
${filas}
      </div>`;
};
// [02] Tarifas: tres cajas una al lado de la otra, una por tramo — la más
// barata (más gente) destaca con una etiqueta "Recomendado" arriba, no
// la pastilla entera en rojo sólido de antes: la jerarquía de venta se
// ve igual de rápido sin convertir toda la tarjeta en un bloque de
// color. El botón "Contratar" va dentro de cada tarjeta, no uno
// compartido debajo de las tres — cada tramo se contrata por su cuenta.
const tarifasVisual = (i, nota) => {
  const { t } = i;
  const precios = TARIFAS.map(([, , , , p]) => p);
  const min = Math.min(...precios);
  const recomendado = esc(t("Recomendado", "Recommended"));
  const cajas = TARIFAS.map(([esN, enN, esR, enR, p]) => {
    const mejor = p === min;
    const nombre = esc(i.lang === "en" ? enN : esN);
    const rango = esc(i.lang === "en" ? enR : esR);
    return `      <div class="taller-tarifas-caja${mejor ? " es-mejor" : ""}">
        <div class="taller-tarifas-caja-badge"${mejor ? "" : " aria-hidden=\"true\""}>${recomendado}</div>
        <div class="taller-tarifas-caja-nombre">${nombre}</div>
        <div class="taller-tarifas-caja-rango">${rango}</div>
        <div class="taller-tarifas-caja-precio">${p}<span class="taller-tarifas-caja-simbolo">€</span></div>
        <div class="taller-tarifas-caja-persona">${esc(t("por persona", "per person"))}</div>
${menuDesglose(i)}
        <a class="btn taller-tarifas-btn" href="${i.ruta("/eventos")}#contact-eventos"><span class="btn-label">${esc(t("Contratar", "Book now"))}</span><span class="btn-arrow">→</span></a>
      </div>`;
  }).join("\n");
  return `      <div class="taller-tarifas-cajas">
${cajas}
      </div>
      <div class="taller-tarifas-pie">
        <p class="taller-tarifas-consulta">${esc(t("+30 personas, consultamos contigo.", "30+ people — let's talk it through."))}</p>
        <p class="tiny muted taller-casilla-nota">${esc(nota)}</p>
      </div>`;
};
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
// Casilla de [02]-[04] (Tarifas junto al timeline, Horarios/FAQ debajo —
// Comida ya no tiene casilla propia, su desglose vive en cada tarjeta de
// precio): rótulo, icono de categoría, titular compacto, un subtítulo
// opcional y el contenido, a una sola columna — no el .ev-split a medias
// de seccion(). El alto de cada fila lo pone la rejilla CSS por su cuenta
// (stretch): la casilla con más contenido de la fila manda, las demás se
// adaptan solas. sinTitulo (solo [02] Tarifas) se salta el rótulo y el
// icono+titular: al fundirse visualmente con [01] en la misma caja, un
// segundo titular ahí quedaba redundante.
const casilla = (ico, rotulo, titulo, subtitulo, derecha, sinTitulo) => `<div class="taller-casilla">
    ${sinTitulo ? "" : `<div class="tiny muted">${esc(rotulo)}</div>
    <div class="taller-casilla-cab">
      <div class="taller-casilla-ico">${icono(ico)}</div>
      <h3 class="taller-casilla-h">${titulo}</h3>
    </div>
    `}${subtitulo ? `<p class="taller-casilla-sub">${subtitulo}</p>\n    ` : ""}<div class="taller-casilla-body">
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

export function tallerTeamBuilding(i, { locales, seo, ldGlobal }) {
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
  <div class="taller-tl-grid">
    <div class="taller-tl-mitad">
      <div class="taller-tl-head">
        <div class="tiny muted">${esc(t("El taller", "The workshop"))}</div>
        <div class="taller-casilla-cab">
          <div class="taller-casilla-ico">${icono("aforo")}</div>
          <h2 class="taller-casilla-h">${esc(t("Así funciona el taller.", "How the workshop works."))}</h2>
        </div>
        <p class="taller-casilla-sub">${esc(t("De la masa al plato, en equipo.", "From dough to plate, as a team."))}</p>
      </div>
      ${railEscritorio(i)}
      ${railMovil(i)}
    </div>
  </div>
  <div class="taller-tl-tarifas">
    ${casilla("tarifa", t("Tarifas", "Rates"),
      esc(t("Precios y tarifas.", "Prices and rates.")),
      "",
      tarifasVisual(i, t(
        "* Consumos extra aparte. Talleres fuera del restaurante sujetos a disponibilidad.",
        "* Extra consumption not included. Off-site workshops subject to availability.")), true)}
  </div>
</section>

<section class="taller-grid">
  ${casilla("hora", t("Horarios", "Timings"),
    esc(t("Horarios y duraciones.", "Timings and durations.")),
    esc(t("Un par de horitas, para que no se aburran.", "A couple of hours, so nobody gets bored.")),
    `      <div class="taller-list">
        ${filas(i, HORARIOS)}
      </div>
      <p class="tiny muted taller-casilla-nota">${esc(t("* Otros horarios o más duración, bajo consulta.", "* Other times or a longer session, on request."))}</p>`)}
  ${casilla("bocadillo", t("Preguntas frecuentes", "FAQ"),
    esc(t("Lo que más nos preguntáis.", "What you ask us most.")),
    esc(t("Las dudas más repetidas.", "The questions we hear most.")),
    `      <details class="faq-toggle taller-faq-toggle" open>
        <summary class="big">${esc(t("Preguntas frecuentes", "FAQ"))}<span class="faq-ico" aria-hidden="true"></span></summary>
        <div class="faq-list">
          ${FAQ.map(({ q, a }) => `          <details class="faq-item">
            <summary>${esc(i.lang === "en" ? q[1] : q[0])}<span class="faq-ico" aria-hidden="true"></span></summary>
            <p class="body">${esc(i.lang === "en" ? a[1] : a[0])}</p>
          </details>`).join("\n")}
        </div>
      </details>`)}
</section>

<section class="taller-cierre">
  <div class="taller-faq-cierre">
    <h3 class="h-1">${t("¿Hablamos?", "Let's talk?")}</h3>
    <p class="body">${esc(t(
      "Cuéntanos cuántos sois y cuándo, y te mandamos disponibilidad y presupuesto.",
      "Tell us how many you are and when, and we'll send you availability and a quote."))}</p>
    <a class="btn red" href="${i.ruta("/eventos")}#contact-eventos" style="width:fit-content"><span class="btn-label">${esc(t("Pedir presupuesto", "Get a quote"))}</span><span class="btn-arrow">→</span></a>
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
