// ─────────────────────────────────────────────────────────────
// Carga en diferido de los avisos (botón redondo + tarjeta). En la PRIMERA página de la visita no se pide
// nada hasta que ha terminado de cargar y el navegador está libre; entonces lee /por-cierto.json
// (functions/por-cierto.json.js) y SOLO si hay algún aviso activo baja su CSS y su JS
// (assets/avisos.<hash>.css/.js, ver build.mjs). Sin avisos, la web no carga nada más que ese JSON.
// En las DEMÁS páginas de la visita el botón se comporta como «Pide ya», que ya está en el HTML: como se
// guardaron los avisos de la página anterior, arranca nada más cargar el script (sin esperar a la carga ni
// al JSON) y el JSON solo sirve para comprobar después que siguen siendo los mismos.
// Los avisos activos salen en TODAS las páginas. Cualquier fallo (404, JSON roto, lista vacía)
// deja la página sin botón.
// ─────────────────────────────────────────────────────────────

// __AVISOS_CSS__ y __AVISOS_JS__ los sustituye build.mjs por las rutas con hash.
const CSS = __AVISOS_CSS__, JS = __AVISOS_JS__;
// Los avisos que se pintaron (ya filtrados) en esta visita.
const GUARDADO = "dumdum.avisos.datos";

// Un aviso sale solo si está activo y tiene medio y botón.
const sale = (a) => a && a.activo === true && a.media && a.media.src && a.boton;

// Los avisos activos de ahora mismo, o null si no se han podido leer (se deja todo como estaba).
async function leerAvisos() {
  let datos;
  try {
    const r = await fetch("/por-cierto.json");
    if (!r.ok) return null;
    datos = await r.json();
  } catch (e) { return null; }
  const activos = Array.isArray(datos && datos.avisos) ? datos.avisos.filter(sale) : [];
  // Con varios activos, stories (por defecto) o solo el primero, según el interruptor del editor.
  return datos.galeria === false ? activos.slice(0, 1) : activos;
}

function lanzar(avisos) {
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
  let guardados = [];
  try { guardados = JSON.parse(sessionStorage.getItem(GUARDADO)) || []; } catch (e) { /* sin datos: como la primera página */ }
  const yaLanzado = Array.isArray(guardados) && guardados.length > 0;
  if (yaLanzado) lanzar(guardados);

  const comprobar = async () => {
    const frescos = await leerAvisos();
    if (!frescos) return;
    try {
      if (frescos.length) sessionStorage.setItem(GUARDADO, JSON.stringify(frescos)); else sessionStorage.removeItem(GUARDADO);
    } catch (e) { /* idem */ }
    if (!yaLanzado) { if (frescos.length) lanzar(frescos); return; }
    // Ya se pintó lo de la página anterior: si ahora no queda ningún aviso activo, se retira; si solo
    // cambió algo, se verá en la página siguiente.
    if (!frescos.length) { window.dumdumAvisos = []; if (window.dumdumAvisosQuitar) window.dumdumAvisosQuitar(); }
  };
  const alLibre = () => {
    // Safari no tiene requestIdleCallback: un margen fijo tras la carga.
    if ("requestIdleCallback" in window) requestIdleCallback(comprobar, { timeout: 4000 });
    else setTimeout(comprobar, 500);
  };
  if (document.readyState === "complete") alLibre();
  else addEventListener("load", alLibre, { once: true });
}
