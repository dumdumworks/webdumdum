// ─────────────────────────────────────────────────────────────
// Verificación REAL del token de Cloudflare Access.
//
// Access va por delante de /api/* y ya no deja pasar a nadie sin sesión: esto
// es la segunda cerradura. Antes solo se miraba que la cabecera EXISTIERA, así
// que si algún día Access dejara de cubrir la ruta —un cambio de configuración,
// un dominio nuevo—, cualquiera con una cabecera inventada entraría. Ahora se
// comprueba la firma contra las claves públicas del equipo y las tres cosas que
// el propio Access recomienda: emisor, audiencia y caducidad.
//
// Necesita dos variables de entorno en Cloudflare Pages (Settings → Variables):
//   ACCESS_TEAM_DOMAIN  p. ej. https://twilight-sun-473f.cloudflareaccess.com
//   ACCESS_AUD          el "Application Audience (AUD) Tag" de la aplicación
//                       que protege /admin y /api (Zero Trust → Access →
//                       Applications → la app → Overview).
// Sin ellas la puerta se queda CERRADA (401 con el motivo), nunca abierta.
// ─────────────────────────────────────────────────────────────

const b64url = (s) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  s += "=".repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
};
const decodeJSON = (s) => JSON.parse(new TextDecoder().decode(b64url(s)));

// Las claves públicas cambian rara vez: se guardan en memoria una hora por
// aislado, y si un token trae un `kid` que no está en la copia, se refrescan
// una vez antes de rechazarlo (rotación de claves sin cortar el servicio).
let jwksCache = { at: 0, keys: [] };
async function loadKeys(teamDomain, fetcher, force) {
  const fresh = Date.now() - jwksCache.at < 60 * 60 * 1000;
  if (!force && fresh && jwksCache.keys.length) return jwksCache.keys;
  const res = await fetcher(teamDomain.replace(/\/$/, "") + "/cdn-cgi/access/certs");
  if (!res.ok) throw new Error("No se pudieron leer las claves de Access (" + res.status + ")");
  const data = await res.json();
  jwksCache = { at: Date.now(), keys: Array.isArray(data.keys) ? data.keys : [] };
  return jwksCache.keys;
}

async function importKey(jwk) {
  return crypto.subtle.importKey(
    "jwk", { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
}

/**
 * Verifica un token de Access. Devuelve { ok:true, claims } o { ok:false, error }.
 * `opts.fetcher` y `opts.now` existen para poder probarlo sin red ni reloj.
 */
export async function verifyAccessJWT(token, { teamDomain, aud, fetcher = fetch, now = Date.now } = {}) {
  if (!teamDomain || !aud) return { ok: false, error: "ACCESS_TEAM_DOMAIN o ACCESS_AUD sin configurar" };
  if (!token || typeof token !== "string") return { ok: false, error: "sin token" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "token malformado" };

  let header, claims;
  try { header = decodeJSON(parts[0]); claims = decodeJSON(parts[1]); }
  catch (e) { return { ok: false, error: "token ilegible" }; }
  if (header.alg !== "RS256" || !header.kid) return { ok: false, error: "algoritmo o kid no admitidos" };

  // Firma: se busca la clave por kid; si no está, se refrescan las claves UNA vez.
  let keys = await loadKeys(teamDomain, fetcher, false);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) { keys = await loadKeys(teamDomain, fetcher, true); jwk = keys.find((k) => k.kid === header.kid); }
  if (!jwk) return { ok: false, error: "clave desconocida" };

  const data = new TextEncoder().encode(parts[0] + "." + parts[1]);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", await importKey(jwk), b64url(parts[2]), data);
  if (!valid) return { ok: false, error: "firma inválida" };

  // Claims. El `aud` de Access es una lista; `iss` es el dominio del equipo.
  const t = Math.floor(now() / 1000);
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!auds.includes(aud)) return { ok: false, error: "audiencia incorrecta" };
  if (claims.iss !== teamDomain.replace(/\/$/, "")) return { ok: false, error: "emisor incorrecto" };
  if (typeof claims.exp !== "number" || claims.exp <= t) return { ok: false, error: "token caducado" };
  if (typeof claims.nbf === "number" && claims.nbf > t + 60) return { ok: false, error: "token aún no válido" };
  return { ok: true, claims };
}

/** Atajo para las Functions: lee cabecera y entorno, devuelve null si vale o una Response 401. */
export async function requireAccess(request, env) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion") || "";
  const r = await verifyAccessJWT(token, { teamDomain: env.ACCESS_TEAM_DOMAIN, aud: env.ACCESS_AUD });
  if (r.ok) return null;
  return new Response(JSON.stringify({ error: "No autorizado", motivo: r.error }), {
    status: 401,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}
