// ─────────────────────────────────────────────────────────────
// POST /api/upload — sube una foto de plato a Cloudflare R2 (binding PHOTOS).
// Protegido por Cloudflare Access (igual que /api/menu).
//
// Recibe multipart/form-data con:
//   · file : la imagen
//   · name : (opcional) base del nombre, p. ej. el id del plato
//   · w, v480, v800 : (opcionales) lo que manda el panel tras redimensionar en
//     el navegador: file es un JPEG de w px de ancho y v480/v800 sus variantes
//     más estrechas (convención de nombres en src/html/fotos-r2.mjs). Sin w se
//     guarda tal cual llega, como siempre (p. ej. si el navegador no pudo
//     decodificar la foto).
// Devuelve { ok:true, url:"/img/menu/<clave>" } — esa url se guarda en el campo
// "image" del plato y la sirve functions/img/menu/[[path]].js desde R2.
// ─────────────────────────────────────────────────────────────
import { requireAccess } from "../_lib/access.js";
import { claveFoto, variantesDe } from "../../src/html/fotos-r2.mjs";

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequestPost({ env, request }) {
  const denegado = await requireAccess(request, env);
  if (denegado) return denegado;
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

  const stripAccents = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const base =
    stripAccents((form.get("name") || "foto").toString().toLowerCase())
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "foto";
  const ts = Date.now();
  const ancho = Number(form.get("w"));

  // Foto ya redimensionada por el panel: principal + variantes, todas JPEG.
  if (ancho) {
    if (type !== "image/jpeg" || !Number.isInteger(ancho) || ancho < 100 || ancho > 4000) {
      return json({ error: "La foto redimensionada debe ser un JPEG con un ancho válido." }, 400);
    }
    const piezas = [[claveFoto(base, ts, ancho), file]];
    for (const a of variantesDe(ancho)) {
      const v = form.get("v" + a);
      if (!v || typeof v === "string" || v.type !== "image/jpeg") return json({ error: `Falta la variante de ${a} px.` }, 400);
      piezas.push([claveFoto(base, ts, a), v]);
    }
    for (const [key, blob] of piezas) {
      if (blob.size > 2 * 1024 * 1024) return json({ error: "Una foto redimensionada supera 2 MB." }, 400);
      await env.PHOTOS.put(key, await blob.arrayBuffer(), { httpMetadata: { contentType: "image/jpeg" } });
    }
    return json({ ok: true, url: `/img/menu/${piezas[0][0]}` });
  }

  const ext = (type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
  const key = `${base}-${ts}.${ext}`;
  await env.PHOTOS.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: type } });

  return json({ ok: true, url: `/img/menu/${key}` });
}
