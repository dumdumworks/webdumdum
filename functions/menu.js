// GET /menu — la carta en español, pintada en el edge con la carta viva de KV.
import { servirCarta } from "./_lib/carta.js";
export const onRequestGet = servirCarta("es");
