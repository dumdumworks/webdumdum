// ─────────────────────────────────────────────────────────────
// CARTA DUM DUM™ — datos
// Esta estructura es la "fuente de la verdad" cuando aún no se ha
// editado nada en /admin. En cuanto entras en el panel y guardas,
// se persiste en localStorage y la web lee desde allí.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "dumdum.menu.v1";
const AUTH_KEY = "dumdum.admin.v1";

const INITIAL_MENU = {
  updated: "Mayo dosmil26 · IVA incluido",
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
      id: "entrantes",
      title: "Para empezar",
      note: "Único entrante. De momento.",
      items: [
        {
          id: "beicondilla",
          n: 0,
          name: "Latindilla",
          tagline: "¡PUFF!!",
          ingredients: "Ensaladilla de bacon, salsa secreta, toppings umami.",
          price: "7,50",
          tags: [],
          logo: null,
          image: "img/dumplings/latindilla.jpg"
        }
      ]
    },
    {
      id: "dumplings",
      title: "Dumplings",
      note: "100% caseros. 0% convencionales.",
      items: [
        {
          id: "muaythai",
          n: 1,
          name: "Muay Thai",
          tagline: "PATADA VOLADORA!",
          ingredients: "Dumpling de pollo, salsa de cacahuete, cebolla roja, cilantro, maní crujiente.",
          price: "9,00",
          tags: ["PICANTE"],
          logo: null,
          image: "img/dumplings/muay.jpg"
        },
        {
          id: "pumpkin",
          n: 2,
          name: "Honey Pumpkin",
          tagline: "SE TE VA A OLVIDAR QUE ES VEGETARIANO",
          ingredients: "Dumpling de calabaza asada, gorgonzola, cheddar curado, miel, cúrcuma, pipas de calabaza.",
          price: "8,50",
          tags: ["VEG"],
          logo: null,
          image: "img/dumplings/honey.jpg"
        },
        {
          id: "cheeseburger",
          n: 3,
          name: "Cheese Burger",
          tagline: "JUSTO ESE BOCADO DEL CENTRO DE LA BURGER",
          ingredients: "Dumpling de ternera, cebolla pochada, cheddar, pepinillo, kétchup, mostaza.",
          price: "9,00",
          tags: [],
          logo: null,
          image: "img/dumplings/burger.jpg"
        },
        {
          id: "carbonara",
          n: 4,
          name: "Carbonara",
          tagline: "PURA CREMA!",
          ingredients: "Dumpling de bacon, salsa de yema, parmesano.",
          price: "9,00",
          tags: [],
          logo: null,
          image: "img/dumplings/carbonara.jpg"
        },
        {
          id: "pepito",
          n: 5,
          name: "Pepito de Ternera",
          tagline: "EL SABOR DEL BAR DE SIEMPRE",
          ingredients: "Dumpling de ternera, cebolla caramelizada, pimiento verde, mantequilla noisette, panko frito.",
          price: "9,50",
          tags: [],
          logo: null,
          image: "img/dumplings/pepito.jpg"
        },
        {
          id: "castiza",
          n: 6,
          name: "Castizo",
          tagline: "MADRID ME MATA",
          ingredients: "Dumpling de lomo adobado, salsa brava, torrezno.",
          price: "9,50",
          tags: ["POR TIEMPO LIMITADO"],
          featured: true,
          logo: null,
          image: "img/dumplings/castizo.jpg"
        },
        {
          id: "moussaka",
          n: 7,
          name: "Moussaka",
          tagline: "AKRÓPOLIS!",
          ingredients: "Dumpling de champiñón, shiitake, berenjena, gruyère, almendra frita.",
          price: "8,50",
          tags: ["VEG"],
          logo: null,
          image: "img/dumplings/moussaka.jpg"
        },
        {
          id: "sweetchili",
          n: 8,
          name: "Sweet Chilli Pork",
          tagline: "UN POCO DULCE · OTRO POCO HOT",
          ingredients: "Dumpling de cerdo, pimiento, salsa sweet chilli, sésamo, guindilla encurtida.",
          price: "9,00",
          tags: ["NEW", "PICANTE"],
          logo: null,
          image: "img/dumplings/sweet.jpg"
        },
        {
          id: "teriyaki",
          n: 9,
          name: "Chicken Teriyaki",
          tagline: "LA ROSALÍA!",
          ingredients: "Dumpling de pollo, puerro, salsa teriyaki, sésamo, cebolleta.",
          price: "9,00",
          tags: [],
          logo: null,
          image: "img/dumplings/teriyaki.jpg"
        },
        {
          id: "kpop",
          n: 10,
          name: "Gamba K-Pop",
          tagline: "NAMBER GUAN",
          ingredients: "Dumpling de gamba, col, mayo kimchi.",
          price: "9,50",
          tags: [],
          logo: null,
          image: "img/dumplings/gamba.jpg"
        }
      ]
    },
    {
      id: "postres",
      title: "Postres",
      note: "Mochis que también desobedecen.",
      items: [
        {
          id: "mochi-cheese",
          n: 11,
          name: "Mochi Tarta de Queso",
          tagline: "CREMOSO AL CUBO",
          ingredients: "Helado de tarta de queso envuelto en mochi.",
          price: "3,50",
          tags: [],
          logo: null
        },
        {
          id: "mochi-petit",
          n: 12,
          name: "Mochi Petit Suisse",
          tagline: "INFANCIA EN BOLA",
          ingredients: "Helado de petit suisse envuelto en mochi.",
          price: "3,50",
          tags: [],
          logo: null
        },
        {
          id: "mochi-turron",
          n: 13,
          name: "Mochi Turrón",
          tagline: "FUERA DE TEMPORADA",
          ingredients: "Helado de turrón envuelto en mochi.",
          price: "3,50",
          tags: ["NEW"],
          logo: null
        }
      ]
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
function saveMenu(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function resetMenu() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Auth (demo, no producción) ───────────────────────────────
const ADMIN_PASSWORD = "desobediencia";
function isLoggedIn() {
  return sessionStorage.getItem(AUTH_KEY) === "1";
}
function login(pw) {
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}
function logout() {
  sessionStorage.removeItem(AUTH_KEY);
}

// ─── Logos "incrustados" como SVG inline ──────────────────────
// Marcadores visuales que se pueden subir a un plato. Si el admin sube
// una imagen propia, se sustituye por <img>. Estos son los placeholders.
const PRESET_LOGOS = {
  kpop: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#FF001E"/><text x="30" y="38" font-family="JetBrains Mono,monospace" font-weight="600" font-size="16" fill="#fff" text-anchor="middle" letter-spacing="-0.5">K-POP</text></svg>`,
  cheese: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#FFC700"/><text x="30" y="26" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="11" fill="#ff001e" text-anchor="middle">CHEESE</text><text x="30" y="40" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="11" fill="#ff001e" text-anchor="middle">BURGER</text><circle cx="14" cy="50" r="3" fill="#ff001e"/><circle cx="46" cy="14" r="3" fill="#ff001e"/></svg>`,
  castizo: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#ff001e"/><text x="30" y="28" font-family="Space Grotesk,sans-serif" font-style="italic" font-weight="500" font-size="14" fill="#fff" text-anchor="middle">Castizo</text><line x1="10" y1="34" x2="50" y2="34" stroke="#fff" stroke-width="0.5"/><text x="30" y="46" font-family="JetBrains Mono,monospace" font-size="6" fill="#fff" text-anchor="middle" letter-spacing="2">MADRID·1925</text></svg>`,
  custom: null
};

// ─── Export global ────────────────────────────────────────────
window.DumDumData = {
  STORAGE_KEY, AUTH_KEY,
  INITIAL_MENU,
  loadMenu, saveMenu, resetMenu,
  isLoggedIn, login, logout,
  PRESET_LOGOS
};
