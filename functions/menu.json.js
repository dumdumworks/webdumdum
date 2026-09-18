// GET /menu.json — la carta en vivo en JSON (la lee la SPA React mientras
// dure la migración). La lógica vive en _lib/carta.js, compartida con /menu.
import { leerCarta, CACHE } from "./_lib/carta.js";

export async function onRequestGet({ env, request }) {
  return new Response(await leerCarta(env, request), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": CACHE },
  });
}
