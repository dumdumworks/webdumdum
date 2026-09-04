// ─────────────────────────────────────────────────────────────
// GET /img/menu/<clave> — sirve una foto de plato desde Cloudflare R2.
// Pública (los clientes ven las fotos) y con caché larga.
// Solo cubre /img/menu/*; el resto de /img/* (dumplings, espacio, prensa…)
// son estáticos del repo y los sirve Pages directamente.
// ─────────────────────────────────────────────────────────────
export async function onRequestGet({ env, params }) {
  if (!env.PHOTOS) return new Response("Almacén de fotos no configurado", { status: 500 });

  const key = Array.isArray(params.path) ? params.path.join("/") : String(params.path || "");
  if (!key) return new Response("Falta la clave", { status: 400 });

  const obj = await env.PHOTOS.get(key);
  if (!obj) return new Response("Foto no encontrada", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", obj.httpEtag);
  return new Response(obj.body, { headers });
}
