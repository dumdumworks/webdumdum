// ─────────────────────────────────────────────────────────────
// Carga en diferido de los avisos (botón redondo + tarjeta). No se pide nada hasta que la página ha
// terminado de cargar y el navegador está libre; entonces lee /por-cierto.json
// (functions/por-cierto.json.js) y SOLO si hay algún aviso activo baja su CSS y su JS
// (assets/avisos.<hash>.css/.js, ver build.mjs). Sin avisos, la web no carga nada más que ese JSON.
// Los avisos activos salen en TODAS las páginas. Cualquier fallo (404, JSON roto, lista vacía)
// deja la página sin botón.
// ─────────────────────────────────────────────────────────────

// __AVISOS_CSS__ y __AVISOS_JS__ los sustituye build.mjs por las rutas con hash.
const CSS = __AVISOS_CSS__, JS = __AVISOS_JS__;

// Un aviso sale solo si está activo y tiene medio y botón.
const sale = (a) => a && a.activo === true && a.media && a.media.src && a.boton;

async function cargarAvisos() {
  let datos;
  try {
    const r = await fetch("/por-cierto.json");
    if (!r.ok) return;
    datos = await r.json();
  } catch (e) { return; }
  const activos = Array.isArray(datos && datos.avisos) ? datos.avisos.filter(sale) : [];
  // Con varios activos, stories (por defecto) o solo el primero, según el interruptor del editor.
  const avisos = datos.galeria === false ? activos.slice(0, 1) : activos;
  if (!avisos.length) return;
  window.dumdumAvisos = avisos;
  // A la vez que el CSS y el JS se bajan la foto de perfil del botón y lo primero que se ve al abrir
  // (el póster del vídeo o la imagen): cuando salga el botón y se toque, ya están y no hay hueco.
  new Image().src = "/favicon-192x192.png";
  const m0 = avisos[0].media, previa = m0.tipo === "video" ? m0.poster : m0.src;
  if (previa) new Image().src = previa;
  // El CSS primero: la isla crea el botón con opacidad 0 desde ese CSS y, sin él, parpadearía.
  const css = document.createElement("link");
  css.rel = "stylesheet"; css.href = "/" + CSS;
  css.onload = () => {
    const js = document.createElement("script");
    js.src = "/" + JS;
    document.head.append(js);
  };
  document.head.append(css);
}

export function avisos() {
  const arrancar = () => {
    // Safari no tiene requestIdleCallback: un margen fijo tras la carga.
    if ("requestIdleCallback" in window) requestIdleCallback(cargarAvisos, { timeout: 4000 });
    else setTimeout(cargarAvisos, 500);
  };
  if (document.readyState === "complete") arrancar();
  else addEventListener("load", arrancar, { once: true });
}
