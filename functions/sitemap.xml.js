export async function onRequestGet({ env }) {
  let menuDate = "2026-07-17";

  try {
    const raw = await env.MENU?.get("current");

    if (raw) {
      const menu = JSON.parse(raw);

      if (/^\d{4}-\d{2}-\d{2}$/.test(menu.updated || "")) {
        menuDate = menu.updated;
      }
    }
  } catch (error) {
    // Conserva la fecha anterior si KV no responde.
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dum-dum.es/</loc>
    <lastmod>2026-07-17</lastmod>
  </url>
  <url>
    <loc>https://dum-dum.es/menu</loc>
    <lastmod>${menuDate}</lastmod>
  </url>
  <url>
    <loc>https://dum-dum.es/locales</loc>
    <lastmod>2026-07-17</lastmod>
  </url>
  <url>
    <loc>https://dum-dum.es/eventos</loc>
    <lastmod>2026-09-11</lastmod>
  </url>
  <url>
    <loc>https://dum-dum.es/contacto</loc>
    <lastmod>2026-07-17</lastmod>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
