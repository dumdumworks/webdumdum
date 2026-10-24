// GET /por-cierto.json — los avisos «Por cierto!» activos, para islas/por-cierto.js.
// Público: solo sale lo que el editor ha dejado activo y sin sus campos internos.
// Caché corta, como la carta, para que un cambio del panel llegue en segundos.
import { leerAvisos, publico } from "./_lib/avisos.js";
import { CACHE } from "./_lib/carta.js";

export async function onRequestGet({ env }) {
  return new Response(JSON.stringify(publico(await leerAvisos(env))), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": CACHE },
  });
}
