// ─────────────────────────────────────────────────────────────
// HOME (/): el hero con el logo, la tira de carta y locales, la rejilla de
// nueve celdas y el pie de especificaciones. Es el componente Home de
// pages.jsx con las mismas clases. Lógica en islas/home.js (bajar, toast).
// ─────────────────────────────────────────────────────────────
import { esc } from "../plantilla.mjs";
import { esqueleto, specFoot } from "../shell.mjs";
import { mesEnCurso } from "../carta.mjs";
import * as E from "../enlaces.mjs";

export const RUTA = "/";

const ROJO = 'style="color:var(--red);font-style:normal;font-weight:inherit"';

// "9" → "nueve" / "nine": el número de dumplings de la carta, en palabras, para
// la frase de la sección /CARTA. Cubre hasta 20 (de sobra: la carta tiene
// entre 9 y 13); un número mayor cae al dígito, que sigue leyéndose bien.
const NUM_ES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez",
  "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"];
const NUM_EN = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const numeroALetra = (n, lang) => {
  const tabla = lang === "en" ? NUM_EN : NUM_ES;
  return tabla[n] ?? String(n);
};
const mayuscInicial = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function home(i, { locales, seo, ldGlobal, carta }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const L = locales;
  // Solo cuenta lo que de verdad sale en la carta: igual que renderCarta, sin
  // los platos ocultos (available:false) ni los archivados.
  const nDumplings = (carta.sections || [])
    .find((sec) => sec.id === "dumplings")?.items
    ?.filter((it) => it.available !== false && !it.archived).length || 0;
  const dumplingsEs = numeroALetra(nDumplings, "es");
  const dumplingsEn = numeroALetra(nDumplings, "en");
  const celda = (n, titulo, detalle, attrs) =>
    `  <a class="map-cell" ${attrs}><div class="n">[${n}]</div><div class="t">${esc(titulo)}</div><div class="d">${esc(detalle)}</div></a>`;
  const main = `<div data-screen-label="home">
<section class="home home-index">
  <div class="hero-index">
    <div class="hero-stage">
      <div class="hero-info hero-info-l">
        <div>${esc(t("TODOS LOS DÍAS", "EVERY DAY"))}</div>
        <div>13.00 – 15.39 &amp; 20.00 – 22.39</div>
      </div>
      <div class="hero-logo">
        <img src="img/logos/dumdum-claim.svg" alt="DUM DUM™ · Dumplings &amp; Desobediencia">
      </div>
      <div class="hero-info hero-info-r">
        <div>${esc(L.chamberi.dirLineas.join(" ").toUpperCase())} — MADRID</div>
        <div>${esc(L.bernabeu.dirLineas.join(" ").toUpperCase())} — MADRID</div>
      </div>
    </div>
    <div class="hero-actions hero-actions-4">
      <a class="btn" href="#" data-reservar>${esc(t("Reservar", "Book"))} →</a>
      <a class="btn" href="${i.ruta("/locales")}">${esc(t("Llegar", "Directions"))} →</a>
      <a class="btn" href="#" data-pide>${esc(t("Pide ya!", "Order now!"))} →</a>
      <a class="btn" href="${i.ruta("/eventos")}">${esc(t("Eventos", "Events"))} →</a>
    </div>
    <button type="button" class="hero-scroll" aria-label="${esc(t("Bajar", "Scroll down"))}" data-bajar>↓</button>
  </div>
</section>

<section class="feature-strip">
  <div>
    <div class="tiny muted" style="margin-bottom:16px">/ ${esc(t("CARTA", "MENU"))}</div>
    <h2>${esc(t("Una carta corta", "A short menu"))}<br><em ${ROJO}>${esc(t("que cambia cada mes.", "that changes every month."))}</em></h2>
    <p class="body" data-n-dumplings="${nDumplings}" style="margin-top:24px">${i.lang === "en"
      ? `<span data-cifra>${mayuscInicial(dumplingsEn)}</span> dumplings. A new one every month. Of the <span data-cifra>${dumplingsEn}</span>, at least 2 vegetarian. Of the <span data-cifra>${dumplingsEn}</span>, <strong style="font-weight:700">not one conventional</strong>.`
      : `<span data-cifra>${mayuscInicial(dumplingsEs)}</span> dumplings. Uno nuevo cada mes. De los <span data-cifra>${dumplingsEs}</span>, mínimo 2 vegetarianos. De los <span data-cifra>${dumplingsEs}</span>, <strong style="font-weight:700">ni uno convencional</strong>.`}</p>
    <div class="sistema-ctas" style="margin-top:32px">
      <a class="btn" href="${i.ruta("/menu")}">${esc(t("Leer carta de " + mesEnCurso("es"), "Read " + mesEnCurso("en") + "'s menu"))} →</a>
    </div>
  </div>
  <div>
    <div class="tiny muted" style="margin-bottom:16px">/ ${esc(t("LOCALES", "LOCATIONS"))}</div>
    <h2>${esc(t("Una casa en Chamberí.", "One home in Chamberí."))}<br><em ${ROJO}>${esc(t("Otra en Bernabéu.", "Another in Bernabéu."))}</em></h2>
    <p class="body" style="margin-top:24px">${esc(t(
      "Dos garitos distintos, pero igual de rico, igual de majos e igual de desobedientes.",
      "Two different spots, but equally tasty, equally lovely, and equally disobedient."))}</p>
    <div class="row gap-m sistema-ctas" style="margin-top:32px">
      <a class="btn" href="#" data-reservar="chamberi">${esc(t("Reservar en Chamberí", "Book at Chamberí"))} →</a>
      <a class="btn" href="#" data-reservar="bernabeu">${esc(t("Reservar en Bernabéu", "Book at Bernabéu"))} →</a>
    </div>
  </div>
</section>

<nav class="map-nav map-nav-3">
${[
    celda("01", t("La carta", "Menu"), t("ECHA UN VISTAZO", "TAKE A LOOK"), `href="${i.ruta("/menu")}"`),
    celda("02", t("A domicilio", "Delivery"), t("NI TE MUEVAS", "DON'T EVEN MOVE"), 'href="#" data-pide="domicilio"'),
    celda("03", "Take Away", t("PIDE ONLINE", "ORDER ONLINE"), `href="${E.TAKEAWAY_URL}" target="_blank" rel="noreferrer"`),
    celda("04", t("Locales", "Locations"), "CHAMBERÍ #015 + BERNABÉU #020", `href="${i.ruta("/locales")}"`),
    celda("05", t("Eventos", "Events"), t("AFTER WORKS · CUMPLES · DIVORCIOS?", "AFTER WORKS · BIRTHDAYS · DIVORCES?"), `href="${i.ruta("/eventos")}"`),
    celda("06", t("Contacto", "Contact"), t("SALÚDAME SIEMPRE", "SAY HI ANYTIME"), `href="${i.ruta("/contacto")}"`),
    celda("07", "Instagram", "@DUMDUM.PLINGS", `href="${E.INSTAGRAM_URL}" target="_blank" rel="noreferrer"`),
    celda("08", "DD*Radio", "SPOTIFY", `href="${E.SPOTIFY_URL}" target="_blank" rel="noreferrer"`),
    celda("09", "DD*Mer®ch", t("PRÓXIMAMENTE", "COMING SOON"), 'href="#" data-toast'),
  ].join("\n")}
  <div class="map-cell map-cell-seal" aria-hidden="true"><span class="seal-mark"></span></div>
</nav>

${specFoot([
    [t("Año", "Year"), "© " + t("DOSMIL24", "TWENTY24")],
    [t("Locales", "Locations"), `<a class="spec-link" href="${i.ruta("/locales")}"><strong style="font-weight:700">Madrid</strong> → Chamberí | Bernabéu</a>`],
    [t("Horario", "Hours"), `<a class="spec-link" href="${i.ruta("/locales")}">${esc(t("L-D / 13.00 - 15.39 / 20.00 - 22.39", "Mon-Sun / 13.00 - 15.39 / 20.00 - 22.39"))}</a>`],
    [t("Carta", "Menu"), `<a class="spec-link" href="${i.ruta("/menu")}">${esc(t("Una vez al mes, un dumpling nuevo", "Once a month, a new dumpling"))}</a>`],
  ], "home-end")}

<div class="home-toast" role="status" hidden>${esc(t("Próximamente.", "Coming soon."))}</div>
</div>`;
  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: ldGlobal,
  };
}
