// GET /en/menu — la carta en inglés, pintada en el edge con la carta viva de KV.
import { servirCarta } from "../_lib/carta.js";
export const onRequestGet = servirCarta("en");
