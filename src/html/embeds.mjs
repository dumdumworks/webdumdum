// ─────────────────────────────────────────────────────────────
// Sliders de vídeos de YouTube y reels de Instagram (Eventos): paginados en
// escritorio, con contador; en móvil los reels van de uno en uno en carrusel,
// como las fotos, y el vídeo sigue paginado. La página visible carga con la
// página (para que al llegar ya esté); el resto lleva el src en data-src y la
// isla lo monta justo antes de que haga falta (la siguiente página, o los dos
// siguientes al deslizar), para que cambiar no espere a la red.
// data-cookieconsent="ignore": el bloqueo automático de Cookiebot vacía el src
// de los iframes de terceros que encuentra en el HTML inicial (React los
// insertaba después y se libraba). Se mantiene el comportamiento de siempre:
// los embeds cargan sin esperar al consentimiento.
// ─────────────────────────────────────────────────────────────
import { esc } from "./plantilla.mjs";

const pad = (n) => String(n).padStart(2, "0");

// Los IDs de YouTube tienen SIEMPRE 11 caracteres [A-Za-z0-9_-]. Exigirlo evita
// fabricar embeds a partir de cadenas basura.
export function idYouTube(url) {
  if (!url) return null;
  const s = String(url).trim();
  const m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) || s.match(/[?&]v=([A-Za-z0-9_-]{11})/) || s.match(/\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : null;
}

// URL /embed/ ABSOLUTA de un post/reel de Instagram, o null si no es una URL
// válida de instagram.com (una relativa o de un tercero no se incrusta jamás).
export function embedInstagram(url) {
  if (!url) return null;
  let u;
  try { u = new URL(String(url).trim()); } catch (e) { return null; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (!/(^|\.)instagram\.com$/i.test(u.hostname)) return null;
  const ruta = u.pathname.replace(/\/+$/, "");
  if (!ruta) return null;
  const base = "https://www.instagram.com" + ruta;
  return /\/embed$/i.test(ruta) ? base + "/" : base + "/embed/";
}

function slider({ items, etiqueta, visibles, cols, slot, movilPaginado }) {
  return `<div class="ev-slider ev-slider-cols-${cols}" data-galeria data-galeria-modo="paginado"${movilPaginado ? ' data-galeria-movil="paginado"' : ""} data-galeria-visibles="${visibles}">
  <div class="ev-slider-head">
    <div class="tiny muted">${esc(etiqueta)} · <span data-galeria-cuenta>01</span> / ${pad(items.length)}</div>
    <div class="ev-slider-ctrls">
      <button type="button" class="ev-slider-btn" data-galeria-ir="-1" aria-label="Anterior">←</button>
      <button type="button" class="ev-slider-btn" data-galeria-ir="1" aria-label="Siguiente">→</button>
    </div>
  </div>
  <div class="ev-slider-track${movilPaginado ? "" : " ev-slider-track-mobile"}" data-galeria-pista>
${items.map((it, n) => slot(it, n + 1, n >= visibles)).join("\n")}
  </div>
</div>`;
}

// Universo: hasta 3 vídeos, uno a la vista, 16:9.
export function sliderYouTube(items) {
  const lista = items.length ? items : [{}, {}, {}];
  return slider({
    items: lista, etiqueta: "Universo", visibles: 1, cols: 1, movilPaginado: true,
    slot: (it, n, oculto) => {
      const id = idYouTube(it.youtube || it.url);
      const dentro = id
        ? `<iframe ${oculto ? "data-" : ""}src="https://www.youtube.com/embed/${id}" title="Universo ${n}" style="width:100%;height:100%;border:0;display:block" data-cookieconsent="ignore"`
          + ` allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
        : `<div class="ev-slider-ph"><span>[ Vídeo · ${pad(n)} ]</span></div>`;
      return `    <div class="ev-slider-slot" style="aspect-ratio:16 / 9"${oculto ? " hidden" : ""}>${dentro}</div>`;
    },
  });
}

// Redes: 6 reels, dos a la vista en escritorio y de uno en uno en móvil, 9:16.
export function sliderReels(items) {
  const lista = items.length ? items : Array.from({ length: 6 }, () => ({}));
  return slider({
    items: lista, etiqueta: "Reels", visibles: 2, cols: 2,
    slot: (it, n, oculto) => {
      const src = embedInstagram(it.url);
      const dentro = src
        ? `<iframe ${oculto ? "data-" : ""}src="${esc(src)}" title="Reel ${n}" class="ig-embed" data-cookieconsent="ignore" allow="encrypted-media; picture-in-picture; clipboard-write" allowfullscreen scrolling="no"></iframe>`
        : `<div class="ev-slider-ph"><span>[ Reel · ${pad(n)} ]</span></div>`;
      return `    <div class="ev-slider-slot ig-slot"${oculto ? " hidden" : ""}>${dentro}</div>`;
    },
  });
}
