// ─────────────────────────────────────────────────────────────
// POST /api/upload — sube una foto de plato a Cloudflare R2 (binding PHOTOS).
// Protegido por Cloudflare Access (igual que /api/menu).
//
// Recibe multipart/form-data con:
//   · file : la imagen
//   · name : (opcional) base del nombre, p. ej. el id del plato
// Devuelve { ok:true, url:"/img/menu/<clave>" } — esa url se guarda en el campo
// "image" del plato y la sirve functions/img/menu/[[path]].js desde R2.
// ─────────────────────────────────────────────────────────────
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost({ env, request }) {
  if (!request.headers.get("Cf-Access-Jwt-Assertion")) return json({ error: "No autorizado" }, 401);
  if (!env.PHOTOS) return json({ error: "El almacén de fotos (R2 binding PHOTOS) no está configurado todavía." }, 500);

  let form;
  try {
    form = await request.formData();
  } catch (e) {
    return json({ error: "Se esperaba multipart/form-data." }, 400);
  }
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "Falta el archivo 'file'." }, 400);

  const type = file.type || "application/octet-stream";
  if (!type.startsWith("image/")) return json({ error: "Solo se admiten imágenes." }, 400);
  // Límite defensivo de tamaño (~8 MB).
  if (file.size > 8 * 1024 * 1024) return json({ error: "La imagen supera 8 MB." }, 400);

  const ext = (type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
  const stripAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const base =
    stripAccents((form.get("name") || "foto").toString().toLowerCase())
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "foto";
  const key = `${base}-${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  await env.PHOTOS.put(key, bytes, { httpMetadata: { contentType: type } });

  return json({ ok: true, url: `/img/menu/${key}` });
}
