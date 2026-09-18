// La carta (/menu): la ventana de alérgenos (pestañas, filtro por alérgeno,
// tabla), el relevo entre el botón de la cabecera y el flotante, "Volver
// arriba" y el visor de fotos de los platos. Es la lógica del componente Menu
// de pages.jsx; todo el contenido ya viene pintado desde el edge.
import { $, $$, atraparFoco, bloquearScroll, deslizar, tecladoVisor, desplazarA } from "./nucleo.js";
import { modal } from "./modales.js";

export function carta() {
  const raiz = $('[data-screen-label="menu"]');
  if (!raiz) return;
  alergenos(raiz);
  relevoFlotante(raiz);
  const arriba = $("[data-arriba]", raiz);
  if (arriba) arriba.addEventListener("click", () => desplazarA(0, 900));
  fotos(raiz);
}

// ── Ventana de alérgenos ─────────────────────────────────────
function alergenos(raiz) {
  const ventana = modal('[data-modal="alergenos"]');
  if (!ventana) return;
  const caja = ventana.overlay.firstElementChild;
  const scroll = $("[data-alerg-scroll]", caja);
  const fab = $("[data-alerg-fab]", raiz);
  const chips = $$("[data-alergeno]", caja);
  const lista = $$("li[data-alergenos]", caja);
  let marcados = 0;

  const verPestana = (nombre) => {
    $$("[data-pestana]", caja).forEach((b) => b.classList.toggle("on", b.dataset.pestana === nombre));
    $$("[data-vista]", caja).forEach((v) => { v.hidden = v.dataset.vista !== nombre; });
    fondo();
  };
  $$("[data-pestana]", caja).forEach((b) => b.addEventListener("click", () => verPestana(b.dataset.pestana)));

  // Filtro: los platos que llevan ALGUNO de los alérgenos marcados.
  const filtrar = () => {
    const sel = chips.filter((c) => c.classList.contains("on")).map((c) => c.dataset.alergeno);
    let hay = 0;
    lista.forEach((li) => {
      const fuera = sel.length > 0 && li.dataset.alergenos.split(",").some((a) => sel.includes(a));
      li.hidden = !fuera;
      if (fuera) hay++;
    });
    $("[data-resultado]", caja).hidden = sel.length === 0;
    $("[data-hay]", caja).hidden = hay === 0;
    $("[data-ninguno]", caja).hidden = hay > 0;
    // Al marcar el PRIMER alérgeno, la vista baja hasta el resultado (en móvil
    // queda fuera de pantalla y, si no, parece que no pasa nada).
    if (marcados === 0 && sel.length > 0) {
      requestAnimationFrame(() => {
        const objetivo = $(".alerg-result", caja);
        desplazarA(scroll.scrollTop + objetivo.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 12, 650, scroll);
      });
    }
    marcados = sel.length;
    fondo();
  };
  chips.forEach((c) => c.addEventListener("click", () => { c.classList.toggle("on"); filtrar(); }));

  // El degradado inferior se apaga cuando el scroll llega al final (o no hay
  // scroll): no debe insinuar más contenido cuando ya no lo hay.
  const fondo = () => {
    const alFinal = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 2;
    caja.classList.toggle("at-bottom", alFinal || scroll.scrollHeight <= scroll.clientHeight + 1);
  };
  scroll.addEventListener("scroll", fondo, { passive: true });
  window.addEventListener("resize", fondo);

  // Se abre siempre en el selector y sin marcas previas. El flotante se
  // esconde mientras la ventana está abierta (el overlay solo tiñe al 40%).
  const abrir = (e) => {
    e.preventDefault();
    chips.forEach((c) => c.classList.remove("on"));
    marcados = 0;
    filtrar();
    verPestana("select");
    ventana.abrir();
    if (fab) fab.hidden = true;
    fondo();
  };
  $$("[data-alergenos]", raiz).forEach((b) => b.addEventListener("click", abrir));
  const cerrar = ventana.cerrar;
  ventana.cerrar = () => { cerrar(); if (fab) fab.hidden = false; };
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") ventana.cerrar(); });
}

// ── Relevo del acceso a alérgenos (escritorio) ──────────────
// Mientras el botón de la cabecera se ve, el flotante está oculto; en cuanto
// sale de pantalla, entra el flotante. En móvil el botón va con display:none,
// nunca intersecta y el flotante queda visible toda la carta.
function relevoFlotante(raiz) {
  const boton = $(".menu-alerg-desk", raiz), fab = $("[data-alerg-fab]", raiz);
  if (!boton || !fab || typeof IntersectionObserver === "undefined") return;
  new IntersectionObserver(([e]) => fab.classList.toggle("is-on", !e.isIntersecting)).observe(boton);
}

// ── Visor de fotos de los platos ────────────────────────────
// Carrusel: la foto del plato y deslizar/flechas/teclado para recorrer todas
// las que tienen foto, en el orden de la carta.
function fotos(raiz) {
  const botones = $$("[data-foto]", raiz);
  if (!botones.length) return;
  const items = botones.map((b) => ({ src: b.dataset.foto, nombre: b.dataset.nombre }));
  botones.forEach((b, n) => b.addEventListener("click", () => abrirVisor(items, n)));
}
function abrirVisor(items, inicio) {
  let n = inicio;
  const ov = document.createElement("div");
  ov.className = "dish-lightbox";
  ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
  ov.innerHTML = '<button type="button" class="dish-lightbox-close" aria-label="Cerrar">✕</button>'
    + '<button type="button" class="dish-lightbox-nav prev" aria-label="Anterior">‹</button>'
    + '<button type="button" class="dish-lightbox-nav next" aria-label="Siguiente">›</button>'
    + '<figure class="dish-lightbox-fig"><img alt="" draggable="false"><figcaption><span class="dish-lightbox-name"></span><span class="dish-lightbox-count"></span></figcaption></figure>';
  const fig = $("figure", ov), img = $("img", ov);
  const pintar = () => {
    const it = items[n];
    img.src = it.src; img.alt = it.nombre;
    ov.setAttribute("aria-label", it.nombre);
    $(".dish-lightbox-name", ov).textContent = it.nombre;
    $(".dish-lightbox-count", ov).textContent = (n + 1) + " / " + items.length;
  };
  const ir = (d) => { n = (n + d + items.length) % items.length; pintar(); };
  const desbloquear = bloquearScroll();
  const sinTeclado = tecladoVisor(() => cerrar(), ir);
  let soltar = null;
  const cerrar = () => { sinTeclado(); desbloquear(); if (soltar) soltar(); ov.remove(); };
  ov.addEventListener("click", cerrar);
  fig.addEventListener("click", (e) => e.stopPropagation());
  $(".dish-lightbox-close", ov).addEventListener("click", cerrar);
  $(".prev", ov).addEventListener("click", (e) => { e.stopPropagation(); ir(-1); });
  $(".next", ov).addEventListener("click", (e) => { e.stopPropagation(); ir(1); });
  deslizar(fig, ir);
  pintar();
  document.body.appendChild(ov);
  soltar = atraparFoco(ov);
}
