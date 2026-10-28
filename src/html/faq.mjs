// ─────────────────────────────────────────────────────────────
// Preguntas frecuentes de una página: la sección con el acordeón (lo anima
// islas/faq.js) y su FAQPage en JSON-LD, desde la misma lista:
//   [{ q: [es, en], a: [es, en] }]
// En una respuesta, {{bernabeu}} es el enlace al local de Bernabéu (en el
// JSON-LD, solo su nombre).
// ─────────────────────────────────────────────────────────────
import { esc } from "./plantilla.mjs";

export function faqSeccion(i, faq) {
  const { t } = i;
  const en = i.lang === "en";
  return `<section class="taller2-faq">
  <div class="taller2-faq-col">
    <div class="tiny muted">${esc(t("Preguntas frecuentes", "FAQ"))}</div>
    <h2 class="h-1" style="margin-top:16px;max-width:18ch">${esc(t("Lo que más nos preguntáis.", "What you ask us most."))}</h2>
    <details class="faq-toggle taller2-faq-toggle" open>
      <summary class="big">${esc(t("Preguntas frecuentes", "FAQ"))}<span class="faq-ico" aria-hidden="true"></span></summary>
      <div class="faq-list">
        ${faq.map(({ q, a }) => `      <details class="faq-item">
        <summary>${esc(en ? q[1] : q[0])}<span class="faq-ico" aria-hidden="true"></span></summary>
        <p class="body">${esc(en ? a[1] : a[0]).replace("{{bernabeu}}", `<a href="${i.ruta("/locales/bernabeu")}" class="link-hover">DUM DUM Bernabéu</a>`)}</p>
      </details>`).join("\n")}
      </div>
    </details>
  </div>
</section>`;
}

export function faqLd(i, faq) {
  const en = i.lang === "en";
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({
      "@type": "Question",
      name: en ? q[1] : q[0],
      acceptedAnswer: { "@type": "Answer", text: (en ? a[1] : a[0]).replace("{{bernabeu}}", "DUM DUM Bernabéu") },
    })),
  };
}
