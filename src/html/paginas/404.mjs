// ─────────────────────────────────────────────────────────────
// 404. Cloudflare Pages la sirve sola, con estado 404 real, para lo que no
// existe: dist/404.html para todo y dist/en/404.html para lo que cuelga de /en/.
// ─────────────────────────────────────────────────────────────
import { esc } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";

export const RUTA = "/404";

export function noEncontrada(i, { locales }) {
  const { t } = i;
  const main = `<section style="padding:18vh var(--gutter);text-align:left">
  <div class="tiny muted">[404]</div>
  <h1 class="h-display" style="margin-top:16px">${esc(t("Por aquí", "Nothing on"))}<br>${esc(t("no hay carta.", "the menu here."))}</h1>
  <a href="${i.ruta("/")}" class="btn red" style="margin-top:32px">${esc(t("Volver al inicio", "Back home"))} →</a>
</section>`;
  return {
    titulo: t("DUM DUM™ — Página no encontrada", "DUM DUM™ — Page not found"),
    desc: t("Por aquí no hay carta. Vuelve al inicio.", "Nothing on the menu here. Back home."),
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: null,
  };
}
