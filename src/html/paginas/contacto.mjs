// ─────────────────────────────────────────────────────────────
// CONTACTO (/contacto). Es el componente Contacto de pages.jsx.
// ─────────────────────────────────────────────────────────────
import { esc, breadcrumbLd } from "../plantilla.mjs";
import { esqueleto, specFoot } from "../shell.mjs";
import * as E from "../enlaces.mjs";

export const RUTA = "/contacto";

// Preguntas frecuentes: única fuente para lo que se VE en la página (detalles
// nativos, sin JS) y para el FAQPage de JSON-LD — nunca pueden desincronizarse
// porque salen del mismo sitio. [es, en] en cada campo.
//
// "enlaces" (opcional, por pregunta) engancha palabras de la respuesta que ya
// son otra cosa en la web: un botón, la carta, un local, pedir para recoger…
// Cada entrada es {es, en, attrs}: "es"/"en" son a la vez el texto a buscar Y
// el texto del enlace (coincidencia literal, no regex), y solo engancha la
// PRIMERA vez que aparece en la respuesta — por eso los nombres de botón
// llevan sus comillas tipográficas: así no enganchan una mención suelta de la
// misma palabra que venga antes en la frase (ver conEnlaces, más abajo).
const A_MENU = (i) => `href="${i.ruta("/menu")}"`;
const A_EVENTOS = (i) => `href="${i.ruta("/eventos")}"`;
const A_LOCAL = (i, slug) => `href="${i.ruta("/locales/" + slug)}"`;
const A_RESERVAR = 'href="#" data-reservar';
const A_PIDE = 'href="#" data-pide';
const A_DOMICILIO = 'href="#" data-pide="domicilio"';
const A_RECOGER = `href="${E.TAKEAWAY_URL}" target="_blank" rel="noreferrer"`;

const FAQ = [
  { q: ["¿Hacéis reservas?", "Do you take reservations?"],
    a: ["Sí, en los dos locales (Chamberí y Bernabéu), para comer o cenar. Se reserva directamente desde el botón “Reservar” de la web. De hecho, en general los botones de la web hacen lo que pone. El que pone “Carta” es la carta. El que pone “Eventos” es info para hacer eventos. El que pone “Pide ya!” es una orden, así que ya sabes. Haz como “Reservar”. Haz lo que dice el botón.",
      "Yes, at both locations (Chamberí and Bernabéu). Book directly from the “Book” button on the site. Actually, in general, the buttons on this site do exactly what they say. The one that says “Menu” is the menu. The one that says “Events” is info for hosting events. The one that says “Order now!” is an order, so there you go. Same with “Book”. Do what the button says."],
    enlaces: (i) => [
      { es: "Chamberí", en: "Chamberí", attrs: A_LOCAL(i, "chamberi") },
      { es: "Bernabéu", en: "Bernabéu", attrs: A_LOCAL(i, "bernabeu") },
      { es: "“Reservar”", en: "“Book”", attrs: A_RESERVAR },
      { es: "“Carta”", en: "“Menu”", attrs: A_MENU(i) },
      { es: "“Eventos”", en: "“Events”", attrs: A_EVENTOS(i) },
      { es: "“Pide ya!”", en: "“Order now!”", attrs: A_PIDE },
    ] },
  { q: ["¿Tenéis dumplings vegetarianos?", "Do you have vegetarian dumplings?"],
    a: ["Sí. Son los que llevan la etiqueta VEG en la carta. Como ves, no nos complicamos mucho.",
      "Yes. The ones marked VEG on the menu. As you can see, we don't overthink it."],
    enlaces: (i) => [{ es: "la carta", en: "the menu", attrs: A_MENU(i) }] },
  { q: ["¿Hacéis entrega a domicilio?", "Do you deliver?"],
    a: ["Sí, a través de Uber Eats y Glovo. El enlace correcto depende del local: se elige primero dónde estás y luego se abre la app. Aunque lo suyo, en verdad, es pedir para recoger. Por varios motivos. El primero es que así estiras las patas y te da un poco el aire. El segundo es que, además, no te cobran comisión. Y el tercero es que no nos la cobran a nosotros. Que estamos porque tenemos que estar, pero te pegan unos palos que te dejan tiritando. Los colegas. Pide para recoger. Sé gente maja.",
      "Yes, via Uber Eats and Glovo. The link depends on the location: pick where you are first and the app opens. Though honestly, the smart move is picking it up yourself. For a few reasons. First, you stretch your legs and get some fresh air. Second, they don't charge you a commission. Third, they don't charge us one either. We put up with it because we have to, but they really rough us up. Real pals. Order for pickup. Be a good egg."],
    // "Uber Eats" y "Glovo" llevan al selector de local (data-pide="domicilio"),
    // no a una URL fija: el texto explica justo por qué (depende del local).
    enlaces: () => [
      { es: "Uber Eats", en: "Uber Eats", attrs: A_DOMICILIO },
      { es: "Glovo", en: "Glovo", attrs: A_DOMICILIO },
      { es: "Pide para recoger", en: "Order for pickup", attrs: A_RECOGER },
    ] },
  { q: ["¿Puedo pedir para recoger?", "Can I order for pickup?"],
    a: ["Sí, puedes. ¡Y debes! Si todavía no sabes por qué, lee la pregunta anterior.",
      "Yes, you can. And you should! If you still don't know why, read the previous answer."] },
  { q: ["¿Puedo consultar los alérgenos de cada plato?", "Can I check allergens per dish?"],
    a: ["Sí, la carta tiene un selector de alérgenos: marcas los tuyos y te dice qué platos evitar. Eso si tienes alergia y quieres tener una noche tranquila. Si, sin embargo, tienes alergias y te gustan las emociones fuertes, podemos hacernos una ruleta rusa de dumplings y que sea lo que Dios quiera.",
      "Yes, the menu has an allergen selector: tick yours and we'll tell you which dishes to avoid. That's if you have allergies and want a quiet night. If, on the other hand, you have allergies and like strong emotions, we can play dumpling roulette and see what happens."],
    enlaces: (i) => [{ es: "la carta", en: "the menu", attrs: A_MENU(i) }] },
  { q: ["¿Cambia la carta?", "Does the menu change?"],
    a: ["Sí, hay un dumpling nuevo cada mes. Lo que lo convierte en un motivo para volver cada mes. Lo que lo convierte en una alegría mensual para nosotros al volverte a ver aparecer. Lo que lo convierte al mundo en un lugar mejor. El aleteo de una mariposa. La teoría del caos, pero bien.",
      "Yes, a new dumpling every month. Which makes it a reason to come back every month. Which makes it a monthly joy for us to see you walk in again. Which makes the world a better place. The flap of a butterfly's wings. Chaos theory, but the good kind."],
    enlaces: (i) => [{ es: "un dumpling nuevo", en: "a new dumpling", attrs: A_MENU(i) }] },
  { q: ["¿Hacéis eventos privados o para grupos?", "Do you host private or group events?"],
    a: ["Sí, hay espacios para grupos y un dossier con la información, disponible en la página de Eventos. Comentarte que no nos importa el tipo de evento. O sea, si queréis un evento de pasárselo bien, tipo un cumple, a full. Pero ojo, que de pronto está el típico que dice “Me acabo de divorciar y quiero reunir a toda la peña que conozco para que me vea mal y contagiarles”. Pues ahí nos tienes también. Ponemos temitas llorones de Alex Ubago o de cualquier otro del rollo y a llorar todo Dios, nosotros incluidos. Lo que necesites.",
      "Yes, we've got space for groups and a dossier with all the info, on the Events page. Worth saying: we don't mind what kind of event it is. So if you want a fun one, like a birthday, we're all in. But watch out, because every so often someone says “I just got divorced and I want to gather everyone I know so they can see me at my worst and catch the feeling.” Well, we're here for that too. We'll put on some tear-jerker ballads and everyone cries, us included. Whatever you need."],
    enlaces: (i) => [{ es: "Eventos", en: "Events", attrs: A_EVENTOS(i) }] },
  { q: ["¿Cuál es el horario?", "What are your hours?"],
    a: ["Todos los días, 13.00 – 15.39 y 20.00 – 22.39. Es un horario un poco raro, pero desobediencia y eso. Ya sabes.",
      "Every day, 1.00 – 3.39pm and 8.00 – 10.39pm. It's a slightly odd schedule, but disobedience and all that. You know how it is."] },
  { q: ["¿Dónde están los locales?", "Where are you located?"],
    a: ["Están en Madrid: en Chamberí (C. de Blasco de Garay, 10), en Bernabéu (C. de Infanta Mercedes, 17), y en tu corazón (jeje).",
      "In Madrid: Chamberí (C. de Blasco de Garay, 10), Bernabéu (C. de Infanta Mercedes, 17), and in your heart (heh)."],
    enlaces: (i) => [
      { es: "Chamberí", en: "Chamberí", attrs: A_LOCAL(i, "chamberi") },
      { es: "Bernabéu", en: "Bernabéu", attrs: A_LOCAL(i, "bernabeu") },
    ] },
  { q: ["¿Se puede venir sin reservar?", "Can I come without a reservation?"],
    a: ["Sí, se puede venir sin reserva. Si hay hueco, pa dentro. Y, si tocara esperar un poco, la verdad es que somos balas. Y damos agua mientras esperáis. Y os cogemos la mochila si de repente tal. Y también os vamos diciendo “yo creo que estos pagan y se van ya” para que la espera se os haga más corta. Y luego “os limpiamos la mesa y os sentamos ya”. Y vosotros en plan “joe, qué majos los chavalitos de DUM DUM”. Y nosotros “sí, bueno...” y nos ponemos coloraos y nos hacemos amigos. Fin.",
      "Yes, walk-ins are welcome. If there's room, straight in you go. And if you do have to wait a bit, honestly, we're quick. We'll bring you water while you wait. We'll hold your bag if that happens. We'll even mutter “I think that table's about to pay and leave” to make the wait feel shorter. Then “let's clear this table and sit you down now”. And you'll be like “wow, these DUM DUM kids are lovely”. And we'll go “yeah, well...” and blush and become friends. The end."] },
  { q: ["¿Qué formas de pago aceptáis?", "What payment methods do you accept?"],
    a: ["Efectivo, VISA, Mastercard, AMEX... todas, incluido ticket restaurante. Bueno, casi todas. Trueques a lo siglo II a.C., no. Pagos en especies, tampoco. Ni pagos aplazados. Ni luego te hago Bizum.",
      "Cash, Visa, Mastercard, Amex... all of them, including meal vouchers. Well, almost all. Bartering like it's 200 BC, no. Payment in goods, no. Instalments, no. And don't try the old “I'll transfer it to you later” trick either."] },
  { q: ["¿Puedo venir con mi mascota?", "Can I bring my pet?"],
    a: ["Sí, siempre que sea maja. Es más, como si viene ella sola. Todo el que sea majo, pa dentro en DUM DUM.",
      "Yes, as long as they're well-behaved. Actually, even if they show up alone. Anyone well-behaved is welcome at DUM DUM."] },
];

// Enlaza dentro de una respuesta ya escapada las frases de su "enlaces". El
// texto plano (para faqLd, más abajo) no pasa por aquí: el JSON-LD siempre
// lleva la respuesta limpia, sin marcado.
function conEnlaces(i, texto, enlaces) {
  let html = esc(texto);
  for (const { es, en, attrs } of enlaces ? enlaces(i) : []) {
    const frase = esc(i.lang === "en" ? en : es);
    html = html.replace(frase, `<a ${attrs}>${frase}</a>`);
  }
  return html;
}

function faqLd(i) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: i.lang === "en" ? q[1] : q[0],
      acceptedAnswer: { "@type": "Answer", text: i.lang === "en" ? a[1] : a[0] },
    })),
  };
}

export function contacto(i, { locales, seo, ldGlobal }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const grande = (href, texto, externo) =>
    `<a class="big" href="${esc(href)}"${externo ? ' target="_blank" rel="noreferrer"' : ""}>${esc(texto)} <span class="arr">↗︎</span></a>`;
  const main = `<div data-screen-label="contacto">
<section class="contact">
  <div>
    <div class="tiny muted">[04] ${esc(t("Contacto", "Contact"))}</div>
    <h1 style="margin-top:16px">${esc(t("Saluda", "Say hi"))}<span style="color:var(--red)">.</span></h1>
    <p class="body" style="margin-top:24px">${esc(t(
      "Por si te apetece preguntar, criticar, colaborar, vender, invitar, contratar o invitarnos. La puerta y la bandeja están abiertas.",
      "In case you fancy asking, complaining, collaborating, selling, inviting, hiring or treating us. The door and the inbox are open."))}</p>
    <div style="margin-top:48px;display:flex;flex-direction:column;gap:4px">
      <div class="tiny muted">${esc(t("Horario atención", "Support hours"))}</div>
      <div class="mono">${esc(t("LUN — VIE · 10.00 – 18.00", "MON — FRI · 10.00 – 18.00"))}</div>
    </div>
  </div>
  <div>
    ${grande("mailto:" + E.EMAIL, E.EMAIL)}
    ${grande(E.INSTAGRAM_URL, "Instagram", true)}
    ${grande("tel:" + E.TEL_GENERAL.tel, E.TEL_GENERAL.humano)}
    <details class="faq-toggle">
      <summary class="big">FAQs<span class="faq-ico" aria-hidden="true"></span></summary>
      <div class="faq-list">
${FAQ.map(({ q, a, enlaces }) => `        <details class="faq-item">
          <summary>${esc(i.lang === "en" ? q[1] : q[0])}<span class="faq-ico" aria-hidden="true"></span></summary>
          <p class="body">${conEnlaces(i, i.lang === "en" ? a[1] : a[0], enlaces)}</p>
        </details>`).join("\n")}
      </div>
    </details>
  </div>
</section>

${specFoot([
    ["Email", `<a class="spec-link" href="mailto:${E.EMAIL}">${E.EMAIL}</a>`],
    ["Instagram", `<a class="spec-link" href="${E.INSTAGRAM_URL}" target="_blank" rel="noreferrer">@dumdum.plings</a>`],
    [t("Teléfono", "Phone"), `<a class="spec-link" href="tel:${E.TEL_GENERAL.tel}">${E.TEL_GENERAL.humano}</a>`],
    [t("Reservas", "Booking"), `<a class="spec-link" href="#" data-reservar>${esc(t("Reservar mesa", "Book a table"))}</a>`],
  ])}
</div>`;
  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: [ldGlobal, breadcrumbLd(i, [{ nombre: t("Contacto", "Contact"), ruta: RUTA }]), faqLd(i)],
  };
}
