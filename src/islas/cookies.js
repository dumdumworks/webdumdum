// ─────────────────────────────────────────────────────────────
// Textos del banner de cookies. Cookiebot trae los suyos (853 caracteres, y
// "Mejor no" / "Permitir todas" / "Detalles") y su panel no deja cambiarlos, así
// que al aparecer el banner se escriben aquí los nuestros. Solo cambia el
// TEXTO: los botones, las categorías y el consentimiento los sigue gestionando
// Cookiebot. Idioma: el de la página (en las /en/ el banner ya sale en inglés).
// ─────────────────────────────────────────────────────────────
const TEXTOS = {
  es: {
    titulo: "USAMOS COOKIES PERO NO DAMOS LA TURRA",
    frases: ["Esta web usa las cookies para analizar el uso y recoger datos.", "Si quieres saber más, visitas ", "estos detalles", "."],
    permitir: "Permitir", rechazar: "Rechazar", ajustes: "Ajustes",
  },
  en: {
    titulo: "WE USE COOKIES BUT WE WON'T BUG YOU",
    frases: ["This site uses cookies to analyse usage and collect data.", "If you want to know more, check out ", "these details", "."],
    permitir: "Allow", rechazar: "Reject", ajustes: "Settings",
  },
};

// Escribe el texto solo si es distinto: así se puede llamar las veces que
// haga falta (Cookiebot repinta al cambiar de pestaña) sin entrar en bucle con
// el observador.
function poner(el, texto) {
  if (el && el.textContent !== texto) el.textContent = texto;
}

function escribir(dialogo, t) {
  poner(dialogo.querySelector("#CybotCookiebotDialogBodyContentTitle"), t.titulo);
  poner(dialogo.querySelector("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll"), t.permitir);
  poner(dialogo.querySelector("#CybotCookiebotDialogBodyButtonDecline"), t.rechazar);
  poner(dialogo.querySelector("#CybotCookiebotDialogNavDetails"), t.ajustes);

  const texto = dialogo.querySelector("#CybotCookiebotDialogBodyContentText");
  if (!texto || texto.dataset.dd) return;
  texto.dataset.dd = "1";
  const enlace = document.createElement("a");
  enlace.href = "#";
  enlace.textContent = t.frases[2];
  // El enlace lleva a las categorías, igual que la pestaña "Ajustes".
  enlace.addEventListener("click", (e) => {
    e.preventDefault();
    const pestana = dialogo.querySelector("#CybotCookiebotDialogNavDetails");
    if (pestana) pestana.click();
  });
  texto.replaceChildren(t.frases[0], document.createElement("br"), t.frases[1], enlace, t.frases[3]);
}

export function cookies() {
  const t = TEXTOS[document.documentElement.lang === "en" ? "en" : "es"];
  let vigilando = null;
  const mirar = () => {
    const dialogo = document.getElementById("CybotCookiebotDialog");
    if (!dialogo || dialogo === vigilando) return;
    vigilando = dialogo;
    escribir(dialogo, t);
    // Cookiebot rellena el diálogo después de insertarlo y lo repinta al
    // cambiar de vista: se vigila hasta que desaparece.
    new MutationObserver(() => escribir(dialogo, t)).observe(dialogo, { childList: true, subtree: true });
  };
  // El diálogo cuelga directamente del <body>.
  new MutationObserver(mirar).observe(document.body, { childList: true });
  mirar();
}
