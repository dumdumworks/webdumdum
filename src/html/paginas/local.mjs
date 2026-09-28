// ─────────────────────────────────────────────────────────────
// FICHA DE LOCAL (/locales/chamberi · /locales/bernabeu). Una sola plantilla
// para los dos: misma forma, distinto contenido. Todo lo que cambia sale de
// DUMDUM_LOCALES (src/ui.jsx), que sigue siendo la fuente única, y las fotos
// de galerias.json. Es el LocalFicha de pages.jsx con las mismas clases.
// ─────────────────────────────────────────────────────────────
import { esc, ORIGIN, breadcrumbLd } from "../plantilla.mjs";
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
  // Los del espacio de Eventos, en el mismo lenguaje: formas sólidas, sin trazo.
  barra: '<rect x="2" y="7.5" width="20" height="4" rx="2"/><path d="M5 11.5h3V21H5zM16 11.5h3V21h-3z"/>',
  taburete: '<circle cx="12" cy="6.5" r="3.5"/><path d="M10.5 9.5h3V21h-3z"/><path d="M7 19.5h10V21H7z"/>',
  mesa: '<path d="M2.5 8h19v3h-2v10h-3V11h-9v10h-3V11h-2z"/>',
  mesaAlta: '<path d="M4 3h16v3h-1.5v15h-3V6h-7v15h-3V6H4z"/>',
  audio: '<path d="M3.5 9h4.5l5-4.5v15L8 15H3.5z"/><path d="M15 7.5a5.5 5.5 0 0 1 0 9v-9z"/>',
  luz: '<path d="M12 2a6.2 6.2 0 0 0-3.6 11.2c.6.5 1 1.1 1 1.9v1.4h5.2v-1.4c0-.8.4-1.4 1-1.9A6.2 6.2 0 0 0 12 2Zm-2.6 15.8h5.2V19a1.8 1.8 0 0 1-1.8 1.8h-1.6A1.8 1.8 0 0 1 9.4 19v-1.2Z"/>',
  despejado: '<path d="M3 3h18v18H3V3Zm2.6 2.6v12.8h12.8V5.6H5.6Z"/>',
  // Los de Redes en Eventos: alcance, respuesta y la palabra.
  ojo: '<path d="M12 5C6.6 5 2.7 9.3 1.5 12c1.2 2.7 5.1 7 10.5 7s9.3-4.3 10.5-7C21.3 9.3 17.4 5 12 5Zm0 11.2a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Z"/><circle cx="12" cy="12" r="2.1"/>',
  corazon: '<path d="M12 21S3.6 15.8 2.3 10.7C1.3 7 3.6 4 6.9 4c2.1 0 3.9 1.2 5.1 3 1.2-1.8 3-3 5.1-3 3.3 0 5.6 3 4.6 6.7C20.4 15.8 12 21 12 21Z"/>',
  bocadillo: '<path d="M4 3h16a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 20 17h-7.4L7 21.3V17H4a2.5 2.5 0 0 1-2.5-2.5v-9A2.5 2.5 0 0 1 4 3Z"/>',
  // Las casillas de /taller-team-building ([02]-[04]): "hora" y "bocadillo"
  // ya existían y sirven tal cual para Horarios y Preguntas frecuentes.
  tarifa: '<path d="M12.6 2.3h6.9A2.1 2.1 0 0 1 21.6 4.4v6.9c0 .56-.22 1.09-.62 1.48l-9.2 9.2a2.1 2.1 0 0 1-2.97 0L2.3 15.47a2.1 2.1 0 0 1 0-2.97l9.2-9.2c.39-.4.92-.62 1.48-.62Z"/><circle cx="16.3" cy="7.1" r="1.6" fill="var(--bg)"/>',
  // El de /taller-team-building para "Degusta de toda la carta", en los
  // datos esenciales bajo el timeline. Es el mismo trazado del set de
  // iconos del taller (DUM_DUM_iconos.zip) que se quitó al retirar el
  // riel de arriba; se recupera aquí porque a este dato sí le hace falta.
  dumpling: '<path d="M11.0,21.8 C10.0,21.8 8.4,21.6 7.9,21.5 C7.8,21.4 7.6,21.4 7.3,21.3 C5.4,20.9 3.6,19.9 2.7,18.8 C1.8,17.7 1.4,16.5 1.4,15.0 C1.4,13.4 1.9,11.7 3.0,10.4 C3.5,9.7 3.9,9.3 5.0,8.7 C5.3,8.5 5.7,8.1 5.8,7.9 C5.8,7.8 5.9,7.7 5.9,7.5 C6.0,7.1 6.1,6.9 6.2,6.6 C6.3,6.4 6.7,6.2 7.4,5.9 C8.0,5.6 8.3,5.4 8.6,5.1 C9.1,4.6 9.5,4.1 9.9,3.4 C10.2,2.9 10.4,2.7 10.8,2.5 C11.6,2.1 12.7,2.1 13.4,2.6 C13.7,2.8 13.8,2.9 14.0,3.2 C14.1,3.4 14.2,3.6 14.4,3.8 C14.6,4.2 14.9,4.5 15.3,4.9 C15.8,5.4 16.0,5.6 16.7,5.9 C17.2,6.1 17.6,6.4 17.7,6.5 C17.9,6.7 18.0,7.0 18.1,7.5 C18.1,7.7 18.2,7.8 18.2,7.9 C18.3,8.0 18.8,8.5 19.0,8.7 C20.0,9.2 20.6,9.8 21.1,10.4 C22.4,12.2 23.0,14.5 22.5,16.5 C22.2,17.7 21.4,18.8 20.5,19.6 C18.3,21.2 15.3,22.0 11.0,21.8 Z M12.8,21.0 C15.7,20.9 17.6,20.4 19.1,19.4 C19.9,18.8 20.8,17.9 21.2,17.2 C21.9,15.9 22.0,14.3 21.3,12.7 C21.0,11.9 20.5,11.2 19.7,10.4 C19.1,9.9 18.8,9.6 18.3,9.3 C17.7,9.0 17.5,8.6 17.3,7.9 C17.3,7.5 17.2,7.5 16.9,7.1 C16.6,6.8 16.6,6.8 16.0,6.6 C14.7,5.9 14.4,5.6 13.6,4.4 C13.3,3.9 12.9,3.5 12.6,3.3 C12.3,3.0 11.9,3.0 11.5,3.2 C11.3,3.3 10.8,3.8 10.6,4.1 C10.2,4.8 9.7,5.5 9.5,5.6 C9.4,5.7 9.3,5.8 9.3,5.8 C9.1,6.0 8.7,6.2 8.1,6.5 C7.5,6.8 7.4,6.9 7.0,7.2 C6.8,7.5 6.8,7.6 6.7,7.9 C6.6,8.5 6.3,8.9 5.8,9.3 C5.2,9.6 5.1,9.7 4.9,9.9 C4.5,10.2 3.8,11.0 3.5,11.3 C2.9,12.2 2.5,13.1 2.3,14.3 C2.2,15.0 2.3,15.9 2.5,16.6 C3.0,17.8 4.2,19.0 5.6,19.8 C7.1,20.6 9.1,21.0 11.6,21.0 C11.8,21.0 12.0,21.0 12.0,21.0 C12.1,21.0 12.4,21.0 12.8,21.0 Z M7.8,11.4 C7.8,11.4 7.7,11.2 7.7,11.1 C7.7,10.9 7.8,10.8 8.0,10.6 C9.2,9.6 10.0,8.5 10.4,7.3 C10.4,7.1 10.5,7.0 10.5,6.9 C10.5,6.9 10.8,6.9 10.9,6.9 C11.0,7.0 10.8,8.0 10.5,8.8 C10.0,10.0 9.2,11.0 8.4,11.4 C8.3,11.4 8.0,11.4 7.8,11.4 Z M15.6,11.3 C14.5,10.8 13.3,8.9 13.1,7.4 C13.1,7.0 13.1,6.9 13.4,6.9 C13.6,6.9 13.6,6.9 13.7,7.2 C13.9,8.3 14.8,9.6 15.9,10.5 C16.3,10.8 16.3,10.9 16.3,11.2 C16.3,11.4 16.2,11.4 16.0,11.4 C15.8,11.4 15.7,11.4 15.6,11.3 Z"/>',
};
export const icono = (k) => `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true">${ICONOS[k]}</svg>`;
// Icono del teléfono del botón "Llamar a X"; lo comparte /locales.
export const TEL_ICO = '<span class="call-ico-wrap"><svg class="tel-ico" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>';

// Las celdas van en paralelo y todas tienen que ocupar las mismas líneas: la
// segunda línea y el secundario, si faltan, se rellenan con un espacio duro.
const NBSP = "&nbsp;";
const dosLineas = (l) => esc(l[0]) + "<br>" + (l[1] ? esc(l[1]) : NBSP);
// Resumen del cuerpo (escritorio): icono grande arriba, etiqueta, valor en dos
// líneas (o en una, si viene como texto y no como par) y secundario.
export const datoDestacado = (ico, etiqueta, lineas, extra) =>
  `<div class="resumen-dato"><b><span class="resumen-ico">${icono(ico)}</span>${esc(etiqueta)}</b>`
  + `<span class="resumen-valor">${Array.isArray(lineas) ? dosLineas(lineas) : esc(lineas)}</span><span class="resumen-extra">${extra ? esc(extra) : NBSP}</span></div>`;
// Celda de la ficha (móvil): la celda de la home, comparte .n/.t/.d con .map-cell.
export const celdaDato = (ico, etiqueta, valor, pie) =>
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
      <iframe title="${esc(t("Mapa", "Map") + " " + L.nombre)}" src="${esc(L.mapa)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-cookieconsent="ignore"></iframe>
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
      ld: [jsonLd(L, url), breadcrumbLd(i, [{ nombre: t("Locales", "Locations"), ruta: "/locales" }, { nombre: L.nombre, ruta }])],
    };
  };
}
