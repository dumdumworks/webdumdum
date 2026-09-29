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
  // datos esenciales bajo el timeline. Trazado de Yerai (dumpling.svg),
  // sin retocar — solo envuelto en un <g> con escala porque su viewBox
  // original (332.37x297.64) no coincide con la rejilla de 24x24 que
  // comparten el resto de iconos de este archivo. Sin fill propio: hereda
  // currentColor del <svg> como todos los demás (su rojo, #ff001e, es
  // igualmente --red).
  dumpling: '<g transform="translate(0,1.25) scale(0.072216)" fill-rule="nonzero"><path d="M324.03,174.74c-1.13-11.99-4.35-23.06-9.26-33.98-9.49-21.06-27.76-40.77-46.97-53.32l-15.17-9.91-2.54-1.6-6.38-4.34c-12.17-8.27-26.24-19.22-27.37-34.63-.23-3.11.03-6.28-.69-9.3-1.38-5.84-7.15-9.08-13.01-8.42-2.88.32-5.47,1.59-7.72,3.4l-5.44,4.38c-2.25,1.81-5.05,1.05-6.71-.97-2.16-2.62-4.03-5.2-6.38-7.59-5.81-5.93-15.51-5.73-20.86.54l-6.43,7.56c-1.61,1.9-4.44,1.91-6.33.42l-5.75-4.55c-3.61-2.86-8.38-4.09-12.83-2.65-3.7,1.2-6.77,4.11-7.66,7.9-.78,3.35-.38,6.7-.71,10.15-1.44,14.92-16.7,27.22-28.95,35.09l-16.54,10.63c-7.86,5.05-15,10.48-22.02,16.65-10.8,9.48-19.72,20.27-26.79,32.86-11.13,19.82-15.42,41.41-13.1,64.03.85,8.26,2.81,16.03,5.99,23.56,6.36,15.04,15.91,25.03,28.73,34.78.75.57,3.37,2.25,3.37,2.25,19.38,12.36,44.53,19.34,67.23,22.28,1.2.16,2.23.04,3.31.57,12.14,1.59,24.04,2.97,36.52,2.97h25.6c28.28-.67,61.62-5.15,87.82-16.08,23.83-9.94,44.09-26.78,52.76-51.65,4.61-13.23,5.6-27.06,4.28-41.02ZM107.37,111.9l-11.97,9.88s-.08.07-.12.1c-.55.12-1.85,1.28-3.57,2.99-1.96,1.7-3.92,3.56-4.84,4.99-.66.68-1.33,1.38-2,2.09,0,0,0,0,0,0-.07.04-.13.11-.19.2-5.89,6.1-12.22,12.33-13.54,10.51-2.25-3.1-3.81-6.14.14-12.37,9.66-14.1,24.44-21.65,35.76-33.05l2.49-2.51c6.46-6.51,11.8-13.86,16.25-21.9,1-1.81,2.82-2.46,4.47-1.83,1.77.67,2.7,2.54,2.02,4.66-4.57,14.23-13.34,26.72-24.88,36.25ZM159.26,85.67c-.81,9.82-3.05,19.13-7.37,28.03-4,8.24-8.84,15.68-14.78,22.61l-8.65,10.08c-1.2,1.4-3.01,2.57-4.71,2.48-2.47-.12-4.23-1.99-4.98-3.65-1.1-2.41-.53-4.88,1.04-6.87l9.06-11.5c12.26-15.56,20.08-31.27,21.93-51.19.18-1.91,1.75-3.38,3.2-3.65,5.71-1.08,5.81,7.06,5.26,13.66ZM179.1,151.24c-1.62-2.02-1.76-4.38-.95-6.78,1.48-4.44,3.04-8.62,4.08-13.24,2.84-12.59,2.46-25.44-1-37.85l-4.59-16.44c-.57-2.04.26-3.93,1.93-4.68,1.76-.8,3.85-.24,4.94,1.68,4.22,7.42,7.68,15.09,10.26,23.35,5.45,17.48,3.99,36.06-4.21,52.35-.89,1.77-2.46,3.47-4.43,4.01-2.48.67-4.84-.93-6.01-2.38ZM249.74,136.12c-1.91,1.77-4.6,2.33-7.04.93-1.37-.79-2.43-2.65-3.01-4.28-6.38-17.88-12.8-28.26-25.7-42.14-3.65-3.93-7.09-7.68-10.22-12.01-1.09-1.51-2.12-3.47-1.79-5.24.2-1.11,1.2-2.27,1.94-2.52,1.06-.36,2.56.11,3.38.91l6.25,6.12,7.79,7.07c14.74,13.37,23.9,24.91,30.25,44.35.89,2.73-.24,5.32-1.86,6.82Z"/></g>',
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
${mdParas(tx(L.historia), "body")
    .replace("{{eventos}}", `<a href="${i.ruta("/eventos")}" class="link-hover link-underline">${t("eventos", "events")}</a>`)
    .replace("{{talleres}}", `<a href="${i.ruta("/taller-team-building")}" class="link-hover link-underline">${t("talleres", "workshops")}</a>`)}
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
