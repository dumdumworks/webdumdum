// ─────────────────────────────────────────────────────────────
// GET /img/menu/<clave> — sirve una foto de plato (o el archivo de un aviso) desde Cloudflare R2.
// Pública (los clientes lo ven) y con caché larga.
// Solo cubre /img/menu/*; el resto de /img/* (dumplings, espacio, prensa…)
// son estáticos del repo y los sirve Pages directamente.
// Atiende peticiones Range (206): Safari las exige para reproducir un vídeo.
// ─────────────────────────────────────────────────────────────
export async function onRequestGet({ env, params, request }) {
  if (!env.PHOTOS) return new Response("Almacén de fotos no configurado", { status: 500 });

  const key = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");
  if (!key) return new Response("Falta la clave", { status: 400 });

  const rango = request.headers.has("Range");
  const obj = await env.PHOTOS.get(key, rango ? { range: request.headers } : {});
  if (!obj) return new Response("Foto no encontrada", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", obj.httpEtag);
  headers.set("Accept-Ranges", "bytes");
  if (rango && obj.range) {
    // R2 devuelve el tramo como { offset, length } o, si se pidió «los últimos n bytes», { suffix }.
    const { offset: o, length: l, suffix } = obj.range;
    const offset = suffix != null ? obj.size - suffix : o ?? 0, length = suffix != null ? suffix : l ?? obj.size - offset;
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    return new Response(obj.body, { status: 206, headers });
  }
  return new Response(obj.body, { headers });
}
