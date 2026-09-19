// ─────────────────────────────────────────────────────────────
// FICHA DE LOCAL (/locales/chamberi · /locales/bernabeu). Una sola plantilla
// para los dos: misma forma, distinto contenido. Todo lo que cambia sale de
// DUMDUM_LOCALES (src/ui.jsx), que sigue siendo la fuente única, y las fotos
// de galerias.json. Es el LocalFicha de pages.jsx con las mismas clases.
// ─────────────────────────────────────────────────────────────
import { esc, ORIGIN } from "../plantilla.mjs";
import { esqueleto, specFoot } from "../shell.mjs";
import { mdInline, mdParas, anio } from "../texto.mjs";
import { galeria } from "../galeria.mjs";

// Iconos del resumen: formas SÓLIDAS, sin trazo, dibujados aquí. No se usan los
// logotipos reales (Metro de Madrid, el estadio): son marcas de terceros.
const ICONOS = {
  pin: '<path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 12.5 7.5 12.5s7.5-6.9 7.5-12.5A7.5 7.5 0 0 0 12 2Zm0 10.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z"/>',
  metro: '<path d="M8 2.2h8a3.8 3.8 0 0 1 3.8 3.8v7.7a3.8 3.8 0 0 1-3.8 3.8H8a3.8 3.8 0 0 1-3.8-3.8V6A3.8 3.8 0 0 1 8 2.2Zm-1.6 4.4v4.2h11.2V6.6H6.4Zm2.2 7.1a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Zm6.8 0a1.15 1.15 0 1 0 0 2.3 1.15 1.15 0 0 0 0-2.3Z"/><path d="m9.6 18.4 1.5.85-1.9 2.95-1.5-.85zM14.4 18.4l-1.5.85 1.9 2.95 1.5-.85z"/>',
  cerca: '<path d="m12 2.6 2.95 5.98 6.6.96-4.77 4.65 1.12 6.57L12 17.65l-5.9 3.11 1.13-6.57L2.45 9.54l6.6-.96z"/>',
  hora: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1.15 4.9v4.5l3.2 1.85a1.15 1.15 0 0 1-1.15 2L11.4 13.1a1.15 1.15 0 0 1-.55-.98V6.9a1.15 1.15 0 0 1 2.3 0Z"/>',
  aforo: '<path d="M9 3.1a3.45 3.45 0 1 1 0 6.9 3.45 3.45 0 0 1 0-6.9Zm0 8.3c3.65 0 6.6 1.95 6.6 4.35v2.9c0 .6-.5 1.1-1.1 1.1H3.5c-.6 0-1.1-.5-1.1-1.1v-2.9c0-2.4 2.95-4.35 6.6-4.35Z"/><path d="M17.35 4.7a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Zm.5 7.4c2.6 0 4.75 1.75 4.75 3.9v2.35c0 .6-.5 1.1-1.1 1.1h-3.6c.1-.3.15-.62.15-.95v-2.9c0-1.4-.6-2.65-1.6-3.6.44-.06.9-.1 1.4-.1Z"/>',
  desde: '<path d="M7.6 1.9a1.2 1.2 0 0 1 1.2 1.2v1.1h6.4V3.1a1.2 1.2 0 1 1 2.4 0v1.1H18a3.6 3.6 0 0 1 3.6 3.6v10.6a3.6 3.6 0 0 1-3.6 3.6H6a3.6 3.6 0 0 1-3.6-3.6V7.8A3.6 3.6 0 0 1 6 4.2h.4V3.1a1.2 1.2 0 0 1 1.2-1.2ZM4.8 10.3v8.1c0 .66.54 1.2 1.2 1.2h12c.66 0 1.2-.54 1.2-1.2v-8.1H4.8Z"/>',
};
const icono = (k) => `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true">${ICONOS[k]}</svg>`;
// Icono del teléfono del botón "Llamar a X"; lo comparte /locales.
export const TEL_ICO = '<span class="call-ico-wrap"><svg class="tel-ico" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>';

// Las celdas van en paralelo y todas tienen que ocupar las mismas líneas: la
// segunda línea y el secundario, si faltan, se rellenan con un espacio duro.
const NBSP = "&nbsp;";
const dosLineas = (l) => esc(l[0]) + "<br>" + (l[1] ? esc(l[1]) : NBSP);
// Resumen del cuerpo (escritorio): icono grande arriba, etiqueta, valor en dos líneas y secundario.
const datoDestacado = (ico, etiqueta, lineas, extra) =>
  `<div class="resumen-dato"><b><span class="resumen-ico">${icono(ico)}</span>${esc(etiqueta)}</b>`
  + `<span class="resumen-valor">${dosLineas(lineas)}</span><span class="resumen-extra">${extra ? esc(extra) : NBSP}</span></div>`;
// Celda de la ficha (móvil): la celda de la home, comparte .n/.t/.d con .map-cell.
const celdaDato = (ico, etiqueta, valor, pie) =>
  `<div class="dato-celda"><div class="n"><span class="dato-ico">${icono(ico)}</span>${esc(etiqueta)}</div>`
  + `<div class="t">${dosLineas(valor)}</div><div class="d">${pie ? esc(pie) : NBSP}</div></div>`;

const DIAS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hhmm = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
function jsonLd(L, url) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "DUM DUM " + L.nombre,
    url,
    address: { "@type": "PostalAddress", streetAddress: L.calle, addressLocality: "Madrid", postalCode: L.cp, addressCountry: "ES" },
    telephone: L.tel,
    servesCuisine: ["Dumplings", "Asiática", "Fusión"],
    priceRange: "€€",
    acceptsReservations: true,
    hasMenu: ORIGIN + "/menu",
    publicTransport: L.metro,
    openingHoursSpecification: L.tramos.map(([ini, fin]) => ({
      "@type": "OpeningHoursSpecification", dayOfWeek: DIAS, opens: hhmm(ini), closes: hhmm(fin),
    })),
    parentOrganization: { "@type": "Restaurant", name: "DUM DUM", url: ORIGIN + "/" },
    sameAs: ["https://www.instagram.com/dumdum.plings"],
  };
}

export const RUTA_LOCAL = (slug) => "/locales/" + slug;

export function local(slug) {
  return (i, { locales, galerias, seo, raiz }) => {
    const { t, lang } = i;
    const L = locales[slug];
    const otro = slug === "chamberi" ? locales.bernabeu : locales.chamberi;
    const ruta = RUTA_LOCAL(slug);
    // Campo bilingüe {es, en} con caída al español, como el resto de la web.
    const tx = (campo) => !campo ? "" : (lang === "en" ? (campo.en || campo.es) : campo.es);
    // Las dos paradas de metro, al mismo nivel y con la barra cerrando la primera.
    const metroLineas = [L.metro.split(" · ")[0] + " /", L.metro.split(" · ")[1]];
    const cercaLineas = lang === "en" ? (L.cerca.en || L.cerca.es) : L.cerca.es;
    const cercaCorta = L.cercaCorto ? tx(L.cercaCorto) : cercaLineas;
    const horario = "13.00–15.39 / 20.00–22.39 · " + t("todos los días", "every day");
    const desde = anio(i, L.desde);
    const s = seo.find((r) => r.p === ruta);
    const url = ORIGIN + i.ruta(ruta);
    const tramos = L.tramos.map((x) => x.join("-")).join(",");

    const main = `<div data-screen-label="local-${slug}">
<section class="local-hero">
  <div class="tiny muted"><a href="${i.ruta("/locales")}" class="link-hover">[02] ${esc(t("Locales", "Locations"))}</a> · ${esc(L.nombre)}</div>
  <h1 class="h-display" style="margin-top:16px">${esc(tx(L.titular))}</h1>
  <p class="body local-entradilla">${mdInline(tx(L.entradilla))}</p>
  <div class="row gap-s tiny estado-local" data-estado data-tramos="${tramos}"
    data-abierto="${esc(t("Abierto · cierra {h}h", "Open · closes {h}h"))}"
    data-cerrado="${esc(t("Nos vemos a partir de las {h}h", "See you from {h}h"))}"></div>
</section>

<section class="local-cuerpo">
  <div class="local-historia">
${mdParas(tx(L.historia), "body")}
  </div>
  ${datoDestacado("pin", t("Dirección", "Address"), L.dirLineas, "Madrid " + L.cp)}
  ${datoDestacado("metro", t("Metro", "Metro"), metroLineas, tx(L.metroTiempo))}
  ${datoDestacado("cerca", t("Al lado", "Nearby"), cercaLineas, tx(L.cerca.tiempo))}
</section>

<section class="local-galeria">
${galeria(i, { fotos: (L.galeria && galerias[L.galeria]) || [], ratio: "3 / 4", etiquetaHueco: t("Foto", "Photo"), raiz })}
</section>

<section class="local-ficha-sec">
  <div class="local-ficha">
    <div class="local-datos">
      <div class="info">
        <b>${esc(t("Dirección", "Address"))}</b><div>${esc(L.calle)} · ${esc(L.cp)} Madrid</div>
        <b>${esc(t("Metro", "Metro"))}</b><div>${esc(L.metro)}</div>
        <b>${esc(t("Horario", "Hours"))}</b><div>${esc(horario)}</div>
        <b>${esc(t("Aforo", "Capacity"))}</b><div>${esc(tx(L.aforo))}</div>
        <b>${esc(t("Abierto desde", "Open since"))}</b><div>${esc(desde)}</div>
      </div>
      <div class="datos-rejilla">
        ${celdaDato("pin", t("Dirección", "Address"), L.dirLineas, "Madrid " + L.cp)}
        ${celdaDato("metro", t("Metro", "Metro"), metroLineas, tx(L.metroTiempo))}
        ${celdaDato("hora", t("Horario", "Hours"), ["13.00–15.39", "20.00–22.39"], t("todos los días", "every day"))}
        ${celdaDato("aforo", t("Aforo", "Capacity"), tx(L.aforoLineas))}
        ${celdaDato("cerca", t("Al lado", "Nearby"), cercaCorta, tx(L.cerca.tiempo))}
        ${celdaDato("desde", t("Abierto desde", "Open since"), [desde])}
      </div>
      <div class="local-acciones">
        <div class="locale-btns" style="margin-top:24px">
          <a class="btn red" href="#" data-reservar="${slug}">${esc(t("Reservar", "Book"))} →</a>
          <a class="btn btn-call-green" href="tel:${esc(L.tel)}" data-llamar data-humano="${esc(L.telHuman)}">${TEL_ICO}${esc(t("Llamar a " + L.nombre, "Call " + L.nombre))} →</a>
        </div>
        <a class="btn btn-maps" href="${esc(L.mapa.replace("&output=embed", ""))}" target="_blank" rel="noreferrer">${esc(t("Ver en", "See on"))} Maps&nbsp;→</a>
        <a class="btn local-volver" href="${i.ruta("/locales")}">← ${esc(t("Todos los locales", "All locations"))}</a>
      </div>
    </div>
    <div class="locale-map">
      <iframe title="${esc(t("Mapa", "Map") + " " + L.nombre)}" src="${esc(L.mapa)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>
  </div>
</section>

${specFoot([
      [t("Carta", "Menu"), `<a class="spec-link" href="${i.ruta("/menu")}">${esc(t("Ver la carta", "See the menu"))} →</a>`],
      [t("El otro local", "The other spot"), `<a class="spec-link" href="${i.ruta(RUTA_LOCAL(otro.slug))}">${esc(otro.nombre)} →</a>`],
      [t("Teléfono", "Phone"), `<a class="spec-link" href="tel:${esc(L.tel)}">${esc(L.telHuman)}</a>`],
      [t("Eventos", "Events"), `<a class="spec-link" href="${i.ruta("/eventos")}">${esc(t("Espacios para grupos", "Spaces for groups"))} →</a>`],
    ])}
</div>`;

    return {
      titulo: lang === "en" ? (s.te || s.t) : s.t,
      desc: lang === "en" ? (s.de || s.d) : s.d,
      cuerpo: esqueleto(i, ruta, locales, main),
      ld: jsonLd(L, url),
    };
  };
}
