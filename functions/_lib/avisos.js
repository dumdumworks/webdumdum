// ─────────────────────────────────────────────────────────────
// Los avisos «Por cierto!». Los edita el panel (/api/banners) y los guarda en la
// misma KV que la carta (binding MENU), bajo su propia clave; la web los lee de
// /por-cierto.json. Modelo (el mismo del editor y de islas/por-cierto.js):
//   { galeria: boolean, avisos: [{ id, nombre, creado, modificado, activo, paginas: ["/eventos"],
//     media: { tipo: "imagen"|"video", src, poster?, mini?, alt },
//     boton: { texto, texto_en, color: "rojo"|"blanco", url | accion: "pide"|"reservar" } }] }
// El editor manda lo que quiere guardar: aquí se valida y se reconstruye campo a campo,
// así en KV (y en la web) no entra nada que no esté en este modelo.
// ─────────────────────────────────────────────────────────────
export const CLAVE = "por-cierto";
const MAX_AVISOS = 12;

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const fecha = (v) => (typeof v === "string" && !isNaN(Date.parse(v)) ? new Date(v).toISOString() : "");
// Los archivos de un aviso viven en R2 y se sirven de /img/menu/ (functions/img/menu/[[path]].js).
const archivo = (v) => (typeof v === "string" && /^\/img\/menu\/[a-z0-9._-]+$/.test(v) ? v : "");
const ruta = (v) => (typeof v === "string" && /^\/[a-z0-9\-/#]*$/.test(v) ? v : "");

// Devuelve { data } con el conjunto ya limpio, o { error } con el motivo.
export function sanear(entrada) {
  if (!entrada || typeof entrada !== "object" || !Array.isArray(entrada.avisos)) return { error: "Faltan los avisos." };
  if (entrada.avisos.length > MAX_AVISOS) return { error: `Como mucho ${MAX_AVISOS} avisos.` };
  const ids = new Set();
  const avisos = [];
  for (const a of entrada.avisos) {
    const id = texto(a && a.id, 40);
    if (!/^[a-z0-9]+$/i.test(id) || ids.has(id)) return { error: "Cada aviso necesita un id único." };
    ids.add(id);
    const m = (a.media && typeof a.media === "object" && a.media) || {};
    const b = (a.boton && typeof a.boton === "object" && a.boton) || {};
    const activo = a.activo !== false;
    const aviso = {
      id,
      nombre: texto(a.nombre, 60),
      creado: fecha(a.creado),
      modificado: fecha(a.modificado),
      activo,
      paginas: [...new Set((Array.isArray(a.paginas) ? a.paginas : []).map(ruta).filter(Boolean))],
      media: {
        tipo: m.tipo === "video" ? "video" : "imagen",
        src: archivo(m.src),
        ...(archivo(m.poster) ? { poster: archivo(m.poster) } : {}),
        ...(archivo(m.mini) ? { mini: archivo(m.mini) } : {}),
        alt: texto(m.alt, 140),
      },
      boton: {
        texto: texto(b.texto, 40),
        texto_en: texto(b.texto_en, 40),
        color: b.color === "blanco" ? "blanco" : "rojo",
        ...(b.accion === "pide" || b.accion === "reservar" ? { accion: b.accion } : ruta(b.url) ? { url: ruta(b.url) } : {}),
      },
    };
    // Un aviso activo que no se puede pintar no se guarda: la web no debe enseñar tarjetas rotas.
    if (activo) {
      const falta = !aviso.media.src ? "no tiene imagen" : !aviso.boton.texto ? "no tiene texto en el botón"
        : !(aviso.boton.accion || aviso.boton.url) ? "no tiene destino" : !aviso.paginas.length ? "no tiene ninguna página" : "";
      if (falta) return { error: `El aviso «${aviso.nombre || id}» está activo pero ${falta}.` };
    }
    avisos.push(aviso);
  }
  return { data: { galeria: entrada.galeria !== false, avisos } };
}

// Lo que ve la web: solo los activos y sin los campos internos del editor (nombre y fechas). Lleva
// activo:true porque la isla no pinta ningún aviso que no lo declare (islas/por-cierto.js, `sale`).
export function publico(data) {
  const avisos = ((data && data.avisos) || []).filter((a) => a.activo).map(({ id, paginas, media, boton }) => ({ id, activo: true, paginas, media, boton }));
  return { galeria: !data || data.galeria !== false, avisos };
}

export async function leerAvisos(env) {
  try {
    const v = env.MENU && (await env.MENU.get(CLAVE));
    if (v) return JSON.parse(v);
  } catch (e) {
    // KV sin configurar o dato roto: sin avisos, que la web siga como si nada
  }
  return { galeria: true, avisos: [] };
}
