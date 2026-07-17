// ─────────────────────────────────────────────────────────────
// CARTA DUM DUM™ — datos de RESPALDO
// La fuente de la verdad en producción es menu.json (editado en el CMS
// Sveltia y precargado en index.html como window.PUBLISHED_MENU). loadMenu()
// SOLO usa esta estructura si menu.json no cargó. Las `sections` de aquí son
// un placeholder mínimo a propósito: si falla menu.json NO queremos mostrar
// una carta antigua que parezca real. El resto (gallery, disclaimer, updated)
// sí se usa como base cuando el CMS no lo aporta.
// ─────────────────────────────────────────────────────────────

const INITIAL_MENU = {
  updated: "",
  header: {
    title: "Carta",
    subtitle: "DUM DUM™ · Actualizada",
    sideLine1: "",
    sideLine2: ""
  },
  disclaimer: "<strong>Cada ración son 6 dumplings. Para 2</strong> personas, <strong>4 raciones</strong> es la <strong>cantidad mágica. 5</strong> es que <strong>venís con hambre. 6… 112</strong> 💀<br/>Dadle una pensada, <strong>que es pedido único</strong> 😉",
  gallery: {
    espacio: [
      { src: "img/espacio/01-fachada.jpg", pos: "50% 50%" },
      { src: "img/espacio/02-barra-horizontal.jpg", pos: "50% 50%" },
      { src: "img/espacio/04-general-vertical.jpg", pos: "50% 50%" },
      { src: "img/espacio/05-barra-vertical.jpg", pos: "50% 50%" },
      { src: "img/espacio/06-horizontal-barra.jpg", pos: "50% 50%" },
      { src: "img/espacio/07-mesa-alta-fachada.jpg", pos: "50% 50%" },
      { src: "img/espacio/08-mesa-alta-juliette.jpg", pos: "50% 50%" },
      { src: "img/espacio/09-detalle-barra-alta.jpg", pos: "50% 50%" },
      { src: "img/espacio/10-detalle-mesa.jpg", pos: "50% 50%" },
      { src: "img/espacio/11-merchandising.jpg", pos: "50% 50%" },
      { src: "img/espacio/12-suelo-barra-alta.jpg", pos: "50% 50%" }
    ],
    producto: [
      { src: "img/dumplings/muay.jpg", pos: "50% 50%" },
      { src: "img/dumplings/burger.jpg", pos: "50% 50%" },
      { src: "img/dumplings/carbonara.jpg", pos: "50% 50%" },
      { src: "img/dumplings/pepito.jpg", pos: "50% 50%" },
      { src: "img/dumplings/castizo.jpg", pos: "50% 50%" },
      { src: "img/dumplings/moussaka.jpg", pos: "50% 50%" },
      { src: "img/dumplings/sweet.jpg", pos: "50% 50%" },
      { src: "img/dumplings/teriyaki.jpg", pos: "50% 50%" },
      { src: "img/dumplings/gamba.jpg", pos: "50% 50%" },
      { src: "img/dumplings/honey.jpg", pos: "50% 50%" }
    ],
    prensa: [
      { src: null, pos: "50% 50%", url: "" },
      { src: null, pos: "50% 50%", url: "" },
      { src: null, pos: "50% 50%", url: "" },
      { src: null, pos: "50% 50%", url: "" },
      { src: null, pos: "50% 50%", url: "" },
      { src: null, pos: "50% 50%", url: "" }
    ],
    redes: [
      { url: "https://www.instagram.com/reel/DEvEUOst0Wa/" },
      { url: "https://www.instagram.com/reel/DD4QwTxNkiT/" },
      { url: "https://www.instagram.com/p/DIG4_ssMih8/" },
      { url: "https://www.instagram.com/reel/DJR2Oe5i8Oz/" },
      { url: "https://www.instagram.com/p/DYC2JJqtDoN/" }
    ],
    universo: []
  },
  footer: [],
  sections: [
    {
      id: "no-disponible",
      title: "Carta no disponible",
      note: "Estamos actualizando la carta. Vuelve en un momento.",
      items: []
    }
  ]
};

// ─── Persistencia ─────────────────────────────────────────────
function loadMenu() {
  // El menu publicado por el editor (menu.json, precargado en
  // index.html) es la UNICA fuente de la verdad para secciones,
  // platos y disponibilidad. Solo tomamos del menu base (INITIAL_MENU)
  // las partes que el editor NO gestiona (galerias, footer, header...).
  try {
    if (window.PUBLISHED_MENU && Array.isArray(window.PUBLISHED_MENU.sections)) {
      var merged = Object.assign({}, INITIAL_MENU, window.PUBLISHED_MENU);
      // Forzar que sections venga EXACTAMENTE del menu publicado,
      // sin restos del menu viejo del codigo.
      merged.sections = window.PUBLISHED_MENU.sections;
      // Galerias: vienen de galerias.json (editable en Sveltia). Cada
      // galeria presente ahi manda; las que falten usan las del codigo.
      if (window.PUBLISHED_GALLERY) {
        merged.gallery = Object.assign({}, INITIAL_MENU.gallery, window.PUBLISHED_GALLERY);
      }
      return merged;
    }
  } catch (e) {}
  // Respaldo (solo si menu.json no carga): el menu del codigo.
  return INITIAL_MENU;
}

// ─── Logos "incrustados" como SVG inline ──────────────────────
// Marcadores visuales asociables a un plato (campo "logo"). Estos son los
// placeholders inline; si un plato trae una imagen propia, DishLogo usa <img>.
const PRESET_LOGOS = {
  kpop: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#FF001E"/><text x="30" y="38" font-family="JetBrains Mono,monospace" font-weight="600" font-size="16" fill="#fff" text-anchor="middle" letter-spacing="-0.5">K-POP</text></svg>`,
  cheese: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#FFC700"/><text x="30" y="26" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="11" fill="#ff001e" text-anchor="middle">CHEESE</text><text x="30" y="40" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="11" fill="#ff001e" text-anchor="middle">BURGER</text><circle cx="14" cy="50" r="3" fill="#ff001e"/><circle cx="46" cy="14" r="3" fill="#ff001e"/></svg>`,
  castizo: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#ff001e"/><text x="30" y="28" font-family="Space Grotesk,sans-serif" font-style="italic" font-weight="500" font-size="14" fill="#fff" text-anchor="middle">Castizo</text><line x1="10" y1="34" x2="50" y2="34" stroke="#fff" stroke-width="0.5"/><text x="30" y="46" font-family="JetBrains Mono,monospace" font-size="6" fill="#fff" text-anchor="middle" letter-spacing="2">MADRID·1925</text></svg>`,
  custom: null
};

// ─── Export global ────────────────────────────────────────────
// Solo lo que consume la web pública: el respaldo, el lector del menú y los
// logos preset. La auth y la persistencia en localStorage se retiraron junto
// con el panel admin.jsx (la edición real vive en el CMS Sveltia, /admin/).
window.DumDumData = {
  INITIAL_MENU,
  loadMenu,
  PRESET_LOGOS
};
