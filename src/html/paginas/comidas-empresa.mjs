// ─────────────────────────────────────────────────────────────
// COMIDAS DE EMPRESA (/comidas-empresa): landing de destino con tres menús
// cerrados por persona. El segundo es el recomendado (columna roja invertida,
// como el plato destacado de la carta). Todo lo que hay que revisar con el
// negocio (precios, qué lleva cada menú, qué incluyen todos) está en las
// constantes de abajo: la plantilla no lleva ninguna cifra suelta.
// ─────────────────────────────────────────────────────────────
import { esc, breadcrumbLd, ldGlobalIdioma } from "../plantilla.mjs";
import { esqueleto } from "../shell.mjs";
import { galeria } from "../galeria.mjs";
import { srcset } from "../imagenes.mjs";
import * as E from "../enlaces.mjs";
import { icono } from "./local.mjs";
import { faqSeccion, faqLd } from "../faq.mjs";
import { WEB3FORMS_KEY, hoyISOMadrid } from "./eventos.mjs";

export const RUTA = "/comidas-empresa";
// Tríptico de escritorio: la barra de azulejo, las bolas rojas con la gorra y la mesa roja con la vaporera. En móvil
// se ve la galería de la ficha de Bernabéu (galerias.json), con el mismo componente y las mismas fotos.
const FOTOS = [
  { src: "img/espacio/05-barra-vertical.jpg", alt: ["La barra de azulejo verde de DUM DUM Bernabéu, con las estanterías de madera al fondo.", "The green-tiled counter at DUM DUM Bernabéu, with the wooden shelves behind it."] },
  { src: "img/espacio/11-merchandising.jpg", alt: ["Dos bolas de luz rojas junto a una gorra colgada en el panel de la pared.", "Two red globe lights next to a cap hanging on the wall panel."] },
  { src: "img/espacio/10-detalle-mesa.jpg", alt: ["Una mesa roja con una vaporera de bambú con dumplings.", "A red table with a bamboo steamer of dumplings."] },
];

// Los tres bloques de cada menú, en este orden. El rótulo es común.
// Rótulo [es, en] e icono de cada bloque (ver ICONOS en local.mjs).
const GRUPOS = [[["Para empezar", "To start"], "entrante"], [["Los dumplings", "The dumplings"], "dumpling"], [["Postre", "Dessert"], "mochi"], [["Bebida", "Drinks"], "bebida"]];

// Cada menú: nombre, lema, precio por persona (€), una línea principal + una
// de detalle por bloque (el detalle es opcional, pero igual en las tres columnas
// para que casen línea a línea; el tercer dato, también opcional, son los iconos
// si no basta el del bloque; un "×N" es un multiplicador y un "+" los suma). Todo [es, en].
const MENUS = [
  {
    id: "tranqui", nombre: ["Tranqui", "Chill"], lema: ["Hasta mañana chicos", "See you tomorrow, guys"], precio: 32,
    bloques: [
      [["Latindilla de berberechos", "Cockles Latindilla"], ["una por cada 3 comensales", "one for every 3 people"]],
      [["Degustación de toda la carta", "Tasting of the whole menu"], ["por persona", "per person"]],
      [["Un mochi", "One mochi"], ["por persona", "per person"]],
      [["Una bebida por persona", "One drink each"], null, ["bebida"]],
    ],
  },
  {
    id: "alegre", nombre: ["Alegre", "Cheerful"], lema: ["¿Ya te vas?", "Leaving already?"], precio: 36, destacado: true,
    bloques: [
      [["Latindilla de berberechos", "Cockles Latindilla"], ["una por cada 3 comensales", "one for every 3 people"]],
      [["Degustación de toda la carta", "Tasting of the whole menu"], ["por persona", "per person"]],
      [["Mochi + taco crepe Luna & Wanda", "Mochi + Luna & Wanda crepe taco"], ["por persona", "per person"], ["mochi", "+", "crepe"]],
      [["Dos bebidas por persona", "Two drinks each"], null, ["×2", "bebida"]],
    ],
  },
  {
    id: "nos-vemos", nombre: ["Nos vemos", "See ya"], lema: ["No le hagáis fotos, anda", "Don't take pictures of them, come on"], precio: 44,
    bloques: [
      [["Latindilla de berberechos", "Cockles Latindilla"], ["una por cada 3 comensales", "one for every 3 people"]],
      [["Degustación de toda la carta", "Tasting of the whole menu"], ["por persona", "per person"]],
      [["Mochi + taco crepe Luna & Wanda", "Mochi + Luna & Wanda crepe taco"], ["por persona", "per person"], ["mochi", "+", "crepe"]],
      [["Dos bebidas y una copa por persona", "Two drinks and a glass each"], null, ["×2", "bebida", "+", "copa"]],
    ],
  },
];

// Preguntas frecuentes (ver ../faq.mjs). Solo dicen lo que ya dice la página.
const FAQ = [
  { q: ["¿Dónde se hacen las cenas de empresa?", "Where are the company dinners held?"],
    a: ["Solo en {{bernabeu}}, en Infanta Mercedes 17 (Madrid), que es donde se puede cantar sin que bajen los vecinos.",
      "Only at {{bernabeu}}, on Infanta Mercedes 17 (Madrid), which is where you can sing without the neighbours coming down."] },
  { q: ["¿Qué lleva cada menú?", "What does each menu include?"],
    a: ["Los tres llevan la degustación de toda la carta por persona, una latindilla de berberechos por cada 3 comensales y un mochi por persona. Cambian el postre y la bebida: una bebida en Tranqui, dos y un taco crepe Luna & Wanda en Alegre, y dos bebidas y una copa en Nos vemos.",
      "All three include a tasting of the whole menu per person, one cockles latindilla for every 3 people and a mochi each. The dessert and the drinks change: one drink in Chill, two plus a Luna & Wanda crepe taco in Cheerful, and two drinks and a glass in See ya."] },
  { q: ["¿Los precios son por persona?", "Are the prices per person?"],
    a: ["Sí: 32 €, 36 € o 44 € por persona, según el menú. Es un precio cerrado y la bebida va dentro, así que no hay sorpresas al pedir la cuenta.",
      "Yes: €32, €36 or €44 per person, depending on the menu. It's a fixed price with drinks included, so there are no surprises when the bill comes."] },
  { q: ["¿Hay opciones vegetarianas y alérgenos?", "Are there vegetarian options and allergens?"],
    a: ["Sí. La carta tiene dumplings vegetarianos y cada plato lleva marcados sus alérgenos. Si en tu grupo hay restricciones, cuéntanoslas y lo dejamos todo listo.",
      "Yes. The menu has vegetarian dumplings and every dish lists its allergens. If your group has restrictions, tell us and we'll have it all sorted."] },
  { q: ["¿Cómo se reserva?", "How do I book?"],
    a: ["Rellenas el formulario de arriba con tu nombre, tu email, cuántos sois, la fecha y el menú, y te contestamos en cero coma.",
      "Fill in the form above with your name, email, how many of you, the date and the menu, and we'll reply in a flash."] },
  { q: ["¿Y si la terminamos liando?", "What if we end up getting carried away?"],
    a: ["Pasa en las mejores cenas de empresa. No se lo contamos a nadie.",
      "It happens at the best company dinners. We won't tell anyone."] },
];

// Lo que llevan todos los menús, en el mismo formato que los datos esenciales de
// /taller-team-building (icono, titular en dos líneas cortas, párrafo). Cada dato:
// [icono, titular (dos líneas), párrafo, enlace de la última línea del titular].
const incluye = (i) => {
  const { t } = i;
  return [
    ["tarifa", t(["Precio", "cerrado"], ["Fixed", "price"]), t("Lo que pone es lo que se paga, con la bebida dentro. Sin sorpresas al pedir la cuenta.", "What it says is what you pay, drinks included. No surprises when the bill comes, and nobody doing sums.")],
    ["pin", t(["Solo en", "Bernabéu"], ["Only at", "Bernabéu"]), t("Las cenas de empresa solo se hacen en el local de Bernabéu que es donde se puede cantar sin que bajen los vecinos.", "Company dinners are only held at the Bernabéu spot, which is where you can sing without the neighbours coming down."), i.ruta("/locales/bernabeu")],
    ["hoja", t(["Opciones", "vegetarianas"], ["Vegetarian", "options"]), t("Dumplings vegetarianos en carta y los alérgenos marcados en cada plato, para que nadie tenga que preguntar.", "Vegetarian dumplings on the menu and allergens flagged on every dish, so nobody has to ask.")],
  ];
};

const dato = ([ico, titulo, texto, enlace]) => {
  const ultima = titulo.length - 1;
  const lineas = titulo.map((l, k) => enlace && k === ultima
    ? `<span><a href="${esc(enlace)}" class="link-hover link-underline">${esc(l)}</a></span>`
    : `<span>${esc(l)}</span>`).join("");
  return `<div class="taller2-dato">
      <span class="taller2-dato-ico">${icono(ico)}</span>
      <div class="taller2-dato-titulo">${lineas}</div>
      <p class="body taller2-dato-desc">${esc(texto)}</p>
    </div>`;
};

// Los tres pasos: solo titular, en tres líneas cortas (como los datos de arriba, mismo ancho de columna). [es, en].
const tarjeta = (i, m) => {
  const { t } = i;
  const bloque = ([[p1, p2], det, icos], k) => `<div class="me-bloque">
        <span class="me-bloque-ico">${(icos || [GRUPOS[k][1]]).map((ico) => ico === "+" || ico[0] === "×" ? `<span class="me-bloque-x">${esc(ico)}</span>` : icono(ico, `me-ico-${ico}`)).join("")}</span>
        <div class="tiny me-bloque-t">${esc(t(...GRUPOS[k][0]))}</div>
        <p class="me-item">${esc(t(p1, p2))}</p>
        ${det ? `<p class="me-detalle">${esc(t(...det))}</p>` : ""}
      </div>`;
  return `<article class="me-card${m.destacado ? " me-card--destacado" : ""}">
      ${m.destacado ? `<div class="tiny me-tab">${esc(t("Nuestra recomendación", "Our recommendation"))}</div>` : ""}
      <header class="me-cab">
        <p class="tiny me-menu">${esc(t("Menú", "Menu"))}</p>
        <h3 class="h-2 me-nombre">${esc(t(...m.nombre))}</h3>
        <p class="me-lema">“${esc(t(...m.lema))}”</p>
      </header>
      <p class="me-precio"><span class="me-precio-n">${m.precio}</span><span class="tiny me-precio-u">€<br>${esc(t("por persona", "per person"))}</span></p>
      ${m.bloques.map(bloque).join("\n      ")}
    </article>`;
};

export function comidasEmpresa(i, { locales, seo, ldGlobal, galerias, raiz }) {
  const { t } = i;
  const s = seo.find((r) => r.p === RUTA);
  const campo = (etiqueta, input) => `<label class="ev-field"><span>${esc(etiqueta)}</span>${input}</label>`;
  const textos = {
    obligatorios: t("Faltan respuestas por completar", "Some answers are missing"),
    error: t("No se pudo enviar. Inténtalo de nuevo o escríbenos directamente.", "Couldn't send. Try again or email us directly."),
    red: t("No hay conexión. Inténtalo de nuevo.", "No connection. Please try again."),
    enviando: t("Enviando…", "Sending…"),
  };

  const main = `<div data-screen-label="comidas-empresa">
<section class="me-hero">
  <div class="tiny muted">${esc(t("Menús de empresa · Madrid", "Company menus · Madrid"))}</div>
  <h1 class="h-display">${esc(t("Reuniones de\u00a0empresa", "Work meetings"))}<br>${esc(t("que sí apetecen", "worth the walk"))}</h1>
  <p class="body me-hero-p">${esc(t(
    "Las cenas de empresa de DUM DUM™ son guays porque pruebas toda la carta, todo es bastante desenfadado y si la terminas liando (como suele pasar en las cenas de empresa) no se lo contamos a nadie. Todo ventajas.",
    "DUM DUM™ company dinners are great because you get to try the whole menu, everything is pretty relaxed, and if you end up getting carried away (as tends to happen at company dinners) we won't tell anyone. All upsides."))}</p>
  <div class="ev-hero-cta">
    <a class="btn red" href="${i.ruta(RUTA)}#reservar" data-ir><span class="btn-label">${esc(t("Reservar", "Book"))}</span><span class="btn-arrow">↓</span></a>
    <a class="btn" href="${i.ruta(RUTA)}#menus" data-ir><span class="btn-label">${esc(t("Ver los menús", "See the menus"))}</span><span class="btn-arrow">↓</span></a>
  </div>
</section>

<div class="me-fotos">
  ${FOTOS.map(({ src, alt }) => {
    const ss = srcset(raiz, src);
    return `<img src="${esc(src)}"${ss ? ` srcset="${esc(ss)}" sizes="calc((100vw - 112px) / 3)"` : ""} alt="${esc(t(...alt))}" loading="lazy" decoding="async">`;
  }).join("\n  ")}
</div>
<section class="local-galeria me-fotos-movil">
${galeria(i, { fotos: galerias.bernabeu || [], ratio: "3 / 4", etiquetaHueco: t("Foto", "Photo"), raiz })}
</section>

<section class="me-menus" id="menus">
  <div class="me-seccion-cab">
    <div class="tiny muted">${esc(t("Los menús", "The menus"))}</div>
    <h2 class="h-1">${esc(t("Tres menús posibles", "Three possible menus"))}<br>${esc(t("para tres posibles finales", "for three possible endings"))}</h2>
    <p class="body">${esc(t("Vosotros elegís cómo queréis acabar y nosotros adaptamos nuestro menú a vuestras intenciones. Sean las que sean.", "You choose how you want to end up and we adapt our menu to your intentions. Whatever they may be."))}</p>
  </div>
  <div class="me-grid">
    ${MENUS.map((m) => tarjeta(i, m)).join("\n    ")}
  </div>
</section>

<section class="me-incluye">
  <div class="hr taller2-datos-filete" aria-hidden="true"></div>
  <div class="taller2-datos">
    ${incluye(i).map(dato).join("\n    ")}
  </div>
</section>

<section class="me-reserva" id="reservar">
  <div class="hr taller2-datos-filete" aria-hidden="true"></div>
  <div class="me-seccion-cab">
    <div class="tiny muted">${esc(t("Reserva tu cena", "Book your dinner"))}</div>
    <h2 class="h-1">${esc(t("Reserva desde aquí", "Book from here"))}</h2>
  </div>
  <form class="ev-form me-form" novalidate data-formulario data-clave="${WEB3FORMS_KEY}" data-asunto="Reserva cena de empresa" data-origen="Web DUM DUM · Cenas de empresa" data-textos='${esc(JSON.stringify(textos))}'>
    <input type="checkbox" name="botcheck" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="ev-form-row">
      ${campo(t("¿Tu nombre?", "Your name?"), `<input type="text" name="nombre" data-etiqueta="Nombre y apellido" required autocomplete="name" placeholder="${esc(t("Nombre y apellido", "Full name"))}">`)}
      ${campo(t("¿Tu email?", "Your email?"), `<input type="email" name="email" data-etiqueta="Email de contacto" required autocomplete="email" placeholder="tu@email.com">`)}
      ${campo(t("¿Cuántos sois?", "How many of you?"), `<input type="text" name="personas" data-etiqueta="Personas" inputmode="numeric" pattern="[0-9]+" required placeholder="${esc(t("Ej. 12", "E.g. 12"))}">`)}
      ${campo(t("¿Qué fecha?", "Which date?"), `<input type="date" name="fecha" data-etiqueta="Fecha" min="${hoyISOMadrid()}" required data-fecha>`)}
      ${campo(t("¿Qué menú?", "Which menu?"), `<select name="menu" data-etiqueta="Menú" class="ev-select" required><option value="">${esc(t("Elige uno…", "Pick one…"))}</option>${MENUS.map((m) => `<option value="${esc(m.nombre[0])} · ${m.precio} €">${esc(t(...m.nombre))} · ${m.precio} €</option>`).join("")}</select>`)}
      <div class="me-accion">
        <div class="me-enviar">
          <button type="submit" class="btn red"><span class="btn-label">${esc(t("Enviar solicitud", "Send request"))}</span><span class="btn-arrow">→</span></button>
          <div class="ev-form-err" role="alert" hidden></div>
        </div>
      </div>
    </div>
  </form>
  <div class="ev-form ev-form-ok" data-formulario-ok hidden>
    <div class="tiny muted">${esc(t("Reserva enviada", "Booking sent"))}</div>
    <h3 class="h-2" style="margin-top:12px" tabindex="-1">${esc(t("Gracias.", "Thank you."))} <em>${esc(t("Te contestamos en cero coma.", "We'll reply in a flash."))}</em></h3>
    <button type="button" class="btn" style="margin-top:24px" data-otra>${esc(t("Enviar otra", "Send another"))}</button>
  </div>
  <p class="tiny me-form-contacto">${esc(t("Más info en", "More info at"))} <a class="link-hover" href="mailto:${E.EMAIL}">${esc(E.EMAIL)}</a> · <a class="link-hover" href="tel:${E.TEL_GENERAL.tel}">${esc(E.TEL_GENERAL.humano)}</a></p>
</section>

<div class="me-faq">
  <div class="hr taller2-datos-filete" aria-hidden="true"></div>
  ${faqSeccion(i, FAQ)}
</div>
</div>`;

  return {
    titulo: i.lang === "en" ? (s.te || s.t) : s.t,
    desc: i.lang === "en" ? (s.de || s.d) : s.d,
    cuerpo: esqueleto(i, RUTA, locales, main),
    ld: [ldGlobalIdioma(i, ldGlobal), faqLd(i, FAQ), breadcrumbLd(i, [
      { nombre: t("Eventos", "Events"), ruta: "/eventos" },
      { nombre: t("Menús de empresa", "Company menus"), ruta: RUTA },
    ])],
  };
}
