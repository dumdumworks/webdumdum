// ─────────────────────────────────────────────────────────────
// LA CARTA (/menu · /en/menu): el marcado del componente Menu de pages.jsx,
// con las mismas clases. Es código puro (sin Node ni DOM): lo ejecuta la
// función de Cloudflare en cada petición con la carta que hay en KV, para que
// lo que edita el panel salga en segundos sin esperar a ningún build.
// ─────────────────────────────────────────────────────────────
import { esc } from "./plantilla.mjs";
import { sanearInline, mdInline } from "./texto.mjs";

// Los 14 alérgenos de declaración obligatoria (UE). id = clave que guarda cada plato.
export const ALERGENOS = [
  { id: "crustaceos", es: "Crustáceos", en: "Crustaceans" },
  { id: "gluten", es: "Gluten", en: "Gluten" },
  { id: "soja", es: "Soja", en: "Soy" },
  { id: "sesamo", es: "Sésamo", en: "Sesame" },
  { id: "altramuces", es: "Altramuces", en: "Lupin" },
  { id: "moluscos", es: "Moluscos", en: "Molluscs" },
  { id: "huevos", es: "Huevos", en: "Eggs" },
  { id: "cacahuetes", es: "Cacahuetes", en: "Peanuts" },
  { id: "lacteos", es: "Lácteos", en: "Milk" },
  { id: "apio", es: "Apio", en: "Celery" },
  { id: "pescado", es: "Pescado", en: "Fish" },
  { id: "mostaza", es: "Mostaza", en: "Mustard" },
  { id: "sulfitos", es: "Sulfitos", en: "Sulphites" },
  { id: "frutos_cascara", es: "Frutos de cáscara", en: "Nuts" },
];

// Etiquetas de los platos (VEG, HOT…): texto y clase en un solo sitio.
const TAGS = {
  PICANTE: ["HOT 🌶", "HOT 🌶", "hot"],
  VEG: ["VEG 🌱", "VEG 🌱", "veg"],
  "POR TIEMPO LIMITADO": ["POR TIEMPO LIMITADO", "LIMITED TIME OFFER", "limited"],
  NEW: ["NEW", "NEW", "red"],
  "DEL MES": ["DEL MES", "OF THE MONTH", "month"],
  TOP: ["TOP", "TOP", "month"],
};
const tag = (i, tg) => {
  const d = TAGS[String(tg || "").toUpperCase()] || [tg, tg, ""];
  return `<span class="tag ${d[2]}">${esc(i.t(d[0], d[1]))}</span>`;
};
// VEG y HOT van con el nombre; el resto, sobre la foto (solo escritorio).
const esInline = (tg) => /^(VEG|PICANTE)$/i.test(tg);
const esLimitado = (tg) => String(tg).toUpperCase() === "POR TIEMPO LIMITADO";
const esNew = (tg) => String(tg).toUpperCase() === "NEW";
// Orden fijo al mostrarlas, sea cual sea el orden del CMS: NEW siempre
// primera. El resto conserva su orden del CMS.
const conNewPrimero = (tags) => [...tags].sort((a, b) => (esNew(a) ? -1 : esNew(b) ? 1 : 0));

// Campo bilingüe del CMS: en inglés usa "<campo>_en" si tiene contenido.
// En los ingredientes, " · " pasa a coma y la letra que la sigue a minúscula.
export function tf(i, obj, campo) {
  if (!obj) return "";
  const en = obj[campo + "_en"];
  let v = i.lang === "en" && en && String(en).trim() !== "" ? en : (obj[campo] || "");
  if (campo === "ingredients") {
    v = String(v).replace(/\s*·\s*/g, ", ").replace(/,\s+(\p{Lu})/gu, (m, l) => ", " + l.toLowerCase());
  }
  return v;
}

// Mes y año en curso, SIEMPRE con la hora de Madrid (el subtítulo de la carta
// y el botón de la home). En español en minúscula, en inglés capitalizado: es lo
// que devuelve Intl para cada locale.
export function mesEnCurso(lang) {
  const locale = lang === "en" ? "en-US" : "es-ES";
  try { return new Intl.DateTimeFormat(locale, { timeZone: "Europe/Madrid", month: "long" }).format(new Date()); }
  catch (e) { return new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date()); }
}
function anioYY() {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric" }).format(new Date()).slice(-2); }
  catch (e) { return String(new Date().getFullYear()).slice(-2); }
}

const num = (n) => "[nº" + String(n).padStart(2, "0") + "]";

function plato(i, it, opts = {}) {
  const { t } = i;
  const nombre = tf(i, it, "name"), tagline = tf(i, it, "tagline"), ingr = tf(i, it, "ingredients");
  const tagsCms = conNewPrimero(it.tags || []);
  const sobreFoto = tagsCms.filter((x) => !esInline(x));
  const conNombre = tagsCms.filter(esInline);
  const pills = (arr) => arr.map((x) => tag(i, x).replace('class="tag ', 'style="font-size:10px" class="tag ')).join("");
  // Móvil: en mochis todas las etiquetas van junto al nombre, como estaba. En
  // el resto, las etiquetas normales en su línea propia y "POR TIEMPO
  // LIMITADO" en otra aparte, siempre la última: así su caja no depende de
  // cuánto texto quepa al lado (en inglés es más corta y quedaba una caja
  // ancha con hueco vacío si se forzaba el salto por CSS).
  const tagsMovil = opts.tagsInline ? tagsCms : tagsCms.filter((x) => !esLimitado(x));
  const limitadoMovil = opts.tagsInline ? [] : tagsCms.filter(esLimitado);
  const pillsMovil = pills(tagsMovil);
  return `<article class="dish${it.featured ? " is-featured" : ""}">
  <div class="num m-only">${num(it.n)}</div>
  <div class="body m-only">
    <div class="name-row"><span class="name" style="font-size:20px">${esc(nombre)}</span>${opts.tagsInline ? pillsMovil : ""}</div>
    ${!opts.tagsInline && tagsMovil.length ? `<div class="tags-row">${pillsMovil}</div>` : ""}
    ${limitadoMovil.length ? `<div class="tags-row">${pills(limitadoMovil)}</div>` : ""}
    ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ""}
    ${ingr ? `<div class="ingr" style="font-size:13px">${esc(ingr)}</div>` : ""}
  </div>
  <div class="dish-price-col m-only">
    <div class="price tnum" style="font-size:11px">${esc(it.price)} €</div>
    ${it.image ? `<button type="button" class="dish-photo-btn" data-foto="${esc(it.image)}" data-nombre="${esc(nombre)}">${esc(t("Foto", "Photo"))}</button>` : ""}
  </div>
  <div class="dish-img">
    ${it.image
      ? `<img src="${esc(it.image)}" alt="${esc(nombre)}" loading="lazy" decoding="async">`
      : `<div class="dish-img-ph"><span class="ph-label">[${esc(nombre)}]</span><span class="ph-sub">product shot · 4:5</span></div>`}
    ${sobreFoto.length ? `<div class="dish-tags-overlay">${sobreFoto.map((x) => tag(i, x)).join("")}</div>` : ""}
  </div>
  <div class="dish-card">
    <div class="dish-card-row dish-card-meta"><span class="num">${num(it.n)}</span><span class="price tnum">${esc(it.price)} €</span></div>
    <div class="dish-card-row dish-card-name"><span class="name">${esc(nombre)}</span>${conNombre.map((x) => tag(i, x).replace('class="tag ', 'class="tag tag-inline ')).join("")}</div>
    <div class="dish-card-row dish-card-text">
      ${tagline ? `<div class="tagline">${esc(tagline)}</div>` : ""}
      ${ingr ? `<div class="ingr">${esc(ingr)}</div>` : ""}
    </div>
  </div>
</article>`;
}

function seccion(i, sec) {
  const platos = (sec.items || []).filter((it) => it.available !== false && !it.archived);
  const cls = ["dish-grid", sec.id === "postres" ? "dish-grid-2col-m" : "", sec.id === "bebidas" ? "dish-grid-2col-m drinks-grid" : ""].filter(Boolean).join(" ");
  // La nota admite " / " para forzar un salto de línea (igual que los
  // títulos, vía mdInline): sin eso, envuelve sola según el ancho y el hueco
  // hasta el filete varía con la longitud del texto de cada sección.
  return `<section class="menu-section section--${esc(sec.id)}${sec.id === "bebidas" ? " section-mobile-only" : ""}">
  <div class="menu-sectionhead"><h3>${esc(tf(i, sec, "title"))}</h3><div class="meta">${mdInline(tf(i, sec, "note"))}</div></div>
  <div class="${cls}">
${/* En mochis las etiquetas van junto al nombre (columna estrecha, ficha
     compacta); en el resto de secciones, en su propia línea (ver plato()). */
  platos.map((it) => plato(i, it, { tagsInline: sec.id === "postres" })).join("\n")}
  </div>
</section>`;
}

// Ventana de alérgenos: selector (chips + resultado) y tabla completa. Todo el
// contenido va prerenderizado; la isla solo muestra, oculta y filtra.
function ventanaAlergenos(i, platos) {
  const { t } = i;
  const al = (a) => (i.lang === "en" ? a.en : a.es);
  const legal = `<p class="alerg-legal">${esc(t(
    "Nuestros platos se elaboran en una cocina donde se manipulan todos los alérgenos; pueden existir trazas. Ante cualquier alergia, consúltanos.",
    "Our dishes are prepared in a kitchen that handles all allergens; traces may be present. For any allergy, please ask us."))}</p>`;
  return `<div class="alerg-overlay" data-modal="alergenos" hidden>
  <div class="alerg-modal" role="dialog" aria-modal="true" aria-label="${esc(t("Alérgenos", "Allergens"))}">
    <div class="alerg-closebar"><button class="alerg-close" type="button" aria-label="${esc(t("Cerrar", "Close"))}" data-cerrar>×</button></div>
    <div class="alerg-scroll" data-alerg-scroll>
      <div class="alerg-tabs">
        <button type="button" class="on" data-pestana="select">${esc(t("Filtrar por mi alergia", "Filter by my allergy"))}</button>
        <button type="button" data-pestana="tabla">${esc(t("Tabla completa", "Full table"))}</button>
      </div>
      <div data-vista="select">
        <hr class="alerg-sep">
        <h3 class="alerg-title">${esc(t("Marca lo que NO puedes tomar", "Select what you CAN'T have"))}</h3>
        <p class="alerg-intro">${esc(t("Selecciona tus alérgenos y te diremos qué platos debes evitar.", "Select your allergens and we'll tell you which dishes to avoid."))}</p>
        <div class="alerg-chips">
          ${ALERGENOS.map((a) => `<button type="button" data-alergeno="${a.id}"${a.id === "frutos_cascara" ? ' class="nowrap-chip"' : ""}>${esc(al(a))}</button>`).join("\n          ")}
        </div>
        <div data-resultado hidden>
          <hr class="alerg-sep">
          <div class="alerg-result">
            <div data-hay>
              <div class="alerg-result-head">${esc(t("Estos son los productos que NO puedes tomar", "These are the dishes you CAN'T have"))}</div>
              <ul class="alerg-list">
                ${platos.map((p) => `<li data-alergenos="${esc(p.alergenos.join(","))}" hidden><span class="alerg-list-name">${esc(p.name)}</span><span class="alerg-list-sec">${esc(p.seccion)}</span></li>`).join("\n                ")}
              </ul>
            </div>
            <div class="alerg-result-ok" data-ninguno hidden>${esc(t("¡Buenas noticias! Ningún plato de la carta contiene los alérgenos que has marcado.", "Good news! No dish on the menu contains the allergens you selected."))}</div>
          </div>
        </div>
        ${legal}
      </div>
      <div data-vista="tabla" hidden>
        <hr class="alerg-sep">
        <h3 class="alerg-title">${esc(t("Tabla de alérgenos", "Allergen table"))}</h3>
        <div class="alerg-rotate-cta">
          <div class="alerg-rotate-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"></path><path d="M21 3v5h-5"></path></svg></div>
          <div class="alerg-rotate-txt">${esc(t("Gira el móvil para ver la tabla completa", "Rotate your phone to view the table"))}</div>
        </div>
        <div class="alerg-table-full"><div class="alerg-table-wrap">
          <table class="alerg-table">
            <colgroup><col class="alerg-col-plato">${ALERGENOS.map(() => '<col class="alerg-col-al">').join("")}</colgroup>
            <thead><tr><th class="alerg-namecol"></th>${ALERGENOS.map((a) => `<th class="alerg-al"><div class="alerg-vhead"><span>${esc(a.id === "frutos_cascara" ? t("Fr. de cáscara", "Tree nuts") : al(a))}</span></div></th>`).join("")}</tr></thead>
            <tbody>
              ${platos.map((p) => `<tr><td class="alerg-td-name">${esc(p.name)}</td>${ALERGENOS.map((a) => `<td class="alerg-td-dot">${p.alergenos.includes(a.id) ? '<span class="alerg-mark"></span>' : ""}</td>`).join("")}</tr>`).join("\n              ")}
            </tbody>
          </table>
        </div></div>
        ${legal}
      </div>
    </div>
  </div>
</div>`;
}

export function renderCarta(i, carta) {
  const { t } = i;
  const secciones = carta.sections || [];
  // Lista plana de platos disponibles con sus alérgenos, para la ventana.
  const platos = [];
  for (const sec of secciones) for (const it of sec.items || []) {
    if (it.available !== false && !it.archived) platos.push({ name: tf(i, it, "name"), seccion: tf(i, sec, "title"), alergenos: it.alergenos || [] });
  }
  const disclaimer = tf(i, carta, "disclaimer");
  const alergenosBtn = (cls, extra) => `<${cls.includes("fab") ? "button type=\"button\"" : 'a href="#"'} class="${cls}" data-alergenos${extra || ""}>`;
  return `<div data-screen-label="menu">
<div class="menu-shell">
  <div class="menu-head">
    <div class="row between menu-head-row">
      <div>
        <h1 class="menu-h">${esc(t("Carta", "Menu"))}</h1>
        <div class="menu-sub">${esc(t("DUM DUM™ · Actualizada", "DUM DUM™ · Updated"))} ${esc(mesEnCurso(i.lang))} ${esc(t("dosmil", "twenty") + anioYY())} ·<br class="m-only"> ${esc(t("IVA incluido", "VAT included"))}</div>
      </div>
      ${alergenosBtn("btn menu-foot-btn menu-alerg-desk")}${esc(t("Alérgenos", "Allergens"))} →</a>
    </div>
  </div>
${disclaimer ? `  <aside class="menu-disclaimer"><span class="menu-disclaimer-arrow" aria-hidden="true">→</span><div class="menu-disclaimer-bubble"><p>${sanearInline(disclaimer)}</p></div></aside>\n` : ""}
${secciones.map((sec) => seccion(i, sec)).join("\n")}

  <aside class="menu-chopsticks-note">
    <span class="menu-chopsticks-arrow" aria-hidden="true">→</span>
    <div class="menu-chopsticks-bubble"><p>${i.lang === "en"
      ? "<b>By the way!</b> We've got chopsticks for those who still can't eat with their hands. Although today might be a good day to learn 😉"
      : "<b>¡Por cierto!</b> Hay palillos para los que todavía no sepan comer con las manos. Aunque hoy podría ser un buen día para aprender 😉"}</p></div>
  </aside>
  <div class="menu-foot">
    <button class="btn menu-foot-btn menu-top-btn" type="button" data-arriba>${esc(t("Volver arriba", "Back to top"))} <span class="menu-top-arrow" aria-hidden="true">↑</span></button>
  </div>
</div>

${alergenosBtn("fab alerg-fab", ` data-alerg-fab aria-label="${esc(t("Ver alérgenos", "View allergens"))}"`)}
  <span class="fab-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></svg></span>
  <span>${esc(t("Alérgenos", "Allergens"))}</span>
</button>

${ventanaAlergenos(i, platos)}
</div>`;
}
