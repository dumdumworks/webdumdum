// Los dos visores de foto ampliada de la web, con las clases de siempre:
//   abrirVisorFotos  → el de las galerías (.lb-overlay): contador y flechas.
//   abrirVisorPlatos → el de la carta (.dish-lightbox): nombre del plato.
// Los dos navegan con flechas y teclado, cierran con la X, el fondo y Escape,
// se deslizan con el dedo y bloquean el scroll del fondo sin que la página salte.
import { $, $$, atraparFoco, bloquearScroll, deslizar, tecladoVisor } from "./nucleo.js";

const pad = (n) => String(n).padStart(2, "0");

// Ciclo de vida común: crea el overlay, engancha cierre/navegación y lo monta.
function visor({ clase, html, escenario, pintar, total, inicio, alCerrar }) {
  let n = inicio;
  const ov = document.createElement("div");
  ov.className = clase;
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  ov.innerHTML = html;
  const ir = async (d) => { n = (n + d + total) % total; await pintar(ov, n); };
  const desbloquear = bloquearScroll();
  const sinTeclado = tecladoVisor(() => cerrar(), ir);
  let soltar = null;
  const cerrar = () => { sinTeclado(); desbloquear(); if (soltar) soltar(); ov.remove(); if (alCerrar) alCerrar(); };
  ov.addEventListener("click", cerrar);
  $$("[data-visor-quieto]", ov).forEach((el) => el.addEventListener("click", (e) => e.stopPropagation()));
  $("[data-visor-cerrar]", ov).addEventListener("click", cerrar);
  $("[data-visor-ir='-1']", ov).addEventListener("click", (e) => { e.stopPropagation(); ir(-1); });
  $("[data-visor-ir='1']", ov).addEventListener("click", (e) => { e.stopPropagation(); ir(1); });
  deslizar($(escenario, ov), ir);
  pintar(ov, n);
  document.body.appendChild(ov);
  // Después de insertarlo: fuera del DOM no hay nada enfocable.
  soltar = atraparFoco(ov);
}

// fotos: [{src, pos}] (las sin src se saltan). textos: {galeria, cerrar, anterior, siguiente}.
export function abrirVisorFotos(fotos, inicio, textos) {
  const total = fotos.length;
  visor({
    clase: "lb-overlay", total, inicio, escenario: ".lb-stage",
    html: `<div class="lb-head" data-visor-quieto><span class="tiny"></span><button type="button" class="lb-close" aria-label="${textos.cerrar}" data-visor-cerrar>✕</button></div>`
      + `<button type="button" class="lb-nav lb-prev" aria-label="${textos.anterior}" data-visor-ir="-1">←</button>`
      + `<div class="lb-stage" data-visor-quieto><img class="lb-img" alt="" draggable="false"></div>`
      + `<button type="button" class="lb-nav lb-next" aria-label="${textos.siguiente}" data-visor-ir="1">→</button>`,
    pintar: (ov, n) => {
      const f = fotos[n];
      ov.setAttribute("aria-label", textos.galeria);
      const img = $("img", ov);
      img.src = f.src; img.style.objectPosition = f.pos || "50% 50%";
      $(".lb-head .tiny", ov).textContent = (textos.etiqueta ? textos.etiqueta + " · " : "") + pad(n + 1) + " / " + pad(total);
      // Antes de dar la foto por cambiada: que el navegador la haya decodificado
      // de verdad, o se ve la vieja un instante de más (ver deslizar() en nucleo.js).
      return img.decode().catch(() => {});
    },
  });
}

// platos: [{src, nombre}].
export function abrirVisorPlatos(platos, inicio) {
  const total = platos.length;
  visor({
    clase: "dish-lightbox", total, inicio, escenario: "figure",
    html: '<button type="button" class="dish-lightbox-close" aria-label="Cerrar" data-visor-cerrar>✕</button>'
      + '<button type="button" class="dish-lightbox-nav prev" aria-label="Anterior" data-visor-ir="-1">‹</button>'
      + '<button type="button" class="dish-lightbox-nav next" aria-label="Siguiente" data-visor-ir="1">›</button>'
      + '<figure class="dish-lightbox-fig" data-visor-quieto><img alt="" draggable="false"><figcaption><span class="dish-lightbox-name"></span><span class="dish-lightbox-count"></span></figcaption></figure>',
    pintar: (ov, n) => {
      const it = platos[n];
      const img = $("img", ov);
      img.src = it.src; img.alt = it.nombre;
      ov.setAttribute("aria-label", it.nombre);
      $(".dish-lightbox-name", ov).textContent = it.nombre;
      $(".dish-lightbox-count", ov).textContent = (n + 1) + " / " + total;
      return img.decode().catch(() => {});
    },
  });
}
