// ─────────────────────────────────────────────────────────────
// LOCALES (/locales): las dos tarjetas con estado, datos, botones, mapa y el
// acceso a cada ficha. Es el componente Locales de pages.jsx; los datos salen
// de DUMDUM_LOCALES, que antes iban escritos a mano en la tarjeta.
// ─────────────────────────────────────────────────────────────
import { esc } from "../plantilla.mjs";
import { esqueleto, specFoot } from "../shell.mjs";
import { anio } from "../texto.mjs";
import { RUTA_LOCAL, TEL_ICO } from "./local.mjs";

export const RUTA = "/locales";

function tarjeta(i, L, lema) {
  const { t, lang } = i;
  const tx = (campo) => (lang === "en" ? (campo.en || campo.es) : campo.es);
  const tramos = L.tramos.map((x) => x.join("-")).join(",");
  return `<div class="locale-card">
    <div>
      <div class="row gap-s tiny estado-local" data-estado data-tramos="${tramos}"
        data-abierto="${esc(t("Abierto · cierra {h}h", "Open · closes {h}h"))}"
        data-cerrado="${esc(t("Nos vemos a partir de las {h}h", "See you from {h}h"))}"></div>
      <h2>${esc(L.nombre)}.</h2>
      <div class="tiny muted" style="margin-top:8px">${esc(lema)} · ${esc(t("desde", "since"))} ${esc(anio(i, L.desde))}</div>
      <div class="info">
        <b>${esc(t("Dirección", "Address"))}</b><div>${esc(L.dirLineas.join(" "))} · ${esc(L.cp)} Madrid</div>
        <b>${esc(t("Metro", "Metro"))}</b><div>${esc(L.metro)}</div>
        <b>${esc(t("Horario", "Hours"))}</b><div>13.00–15.39 / 20.00–22.39</div>
        <b>${esc(t("Aforo", "Capacity"))}</b><div>${esc(tx(L.aforo))}</div>
      </div>
      <div class="locale-btns" style="margin-top:24px">
        <a class="btn red" href="#" data-reservar="${L.slug}">${esc(t("Reservar en " + L.nombre, "Book at " + L.nombre))} →</a>
        <a class="btn btn-call-green" href="tel:${esc(L.tel)}" data-llamar data-humano="${esc(L.telHuman)}">${TEL_ICO}${esc(t("Llamar a " + L.nombre, "Call " + L.nombre))} →</a>
      </div>
    </div>
    <div class="locale-pie">
      <div class="locale-map">
        <iframe title="${esc(t("Mapa", "Map") + " " + L.nombre)}" src="${esc(L.mapa)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-cookieconsent="ignore"></iframe>
      </div>
      <a class="btn locale-mas" href="${i.ruta(RUTA_LOCAL(L.slug))}">${esc(t("Saber más de " + L.nombre, "More about " + L.nombre))} →</a>
    </div>
  </div>`;
}

export function locales(i, { locales, seo, ldGlobal }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const main = `<div data-screen-label="locales">
<section style="padding:14vh var(--gutter) 6vh;border-bottom:1px solid var(--line)">
  <div class="tiny muted">[02] ${esc(t("Locales", "Locations"))}</div>
  <h1 class="h-display" style="margin-top:16px">${esc(t("Dos casas", "Two homes"))}<br>${esc(t("en Madrid.", "in Madrid."))}</h1>
</section>

<div class="locales">
  ${tarjeta(i, locales.chamberi, t("Local original", "Original spot"))}
  ${tarjeta(i, locales.bernabeu, t("Segundo local", "Second spot"))}
</div>

${specFoot([
    [t("Interiorismo", "Interior design"), '<a class="spec-link" href="https://nota-estudio.com/" target="_blank" rel="noreferrer">Nota Estudio</a>'],
    [t("Identidad", "Identity"), "Yerai Gómez"],
    [t("Cocina", "Kitchen"), "Kéril Gómez · BCC"],
    [t("Año apertura", "Opening year"), esc(`CHAMBERÍ · ${anio(i, locales.chamberi.desde)} | BERNABÉU · ${anio(i, locales.bernabeu.desde)}`)],
  ])}
</div>`;
  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: ldGlobal,
  };
}
