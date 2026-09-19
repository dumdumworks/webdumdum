// ─────────────────────────────────────────────────────────────
// Página pública que queda en React: Home. El resto ya son HTML (src/html/paginas/).
// ─────────────────────────────────────────────────────────────

// Nombre del mes en curso (SIEMPRE hora de Madrid, como el resto del sitio).
// Se usa en textos que deben seguir al mes actual sin tocar el código cada 30
// días. En español el mes va en minúscula ("mayo"); en inglés capitalizado
// ("May"), que es justo lo que devuelve Intl para cada locale.
function mesEnCurso(locale) {
  try {
    return new Intl.DateTimeFormat(locale, { timeZone: "Europe/Madrid", month: "long" }).format(new Date());
  } catch (e) {
    return new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date());
  }
}

// ── HOME ──────────────────────────────────────────────────────
function Home() {
  const lang = useLang();
  // Toast "Próximamente" (Take Away, Merch). Mensaje + visibilidad.
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };
  React.useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const UBER_URL = "https://www.ubereats.com/es/store/dum-dum-%7C-chamberi/7NGxIIg1XVmNEz9mAkgI7Q?diningMode=DELIVERY";
  // Take Away apunta a la tienda online de Square.
  const TAKEAWAY_URL = "https://dum-dumplings.square.site/";

  return (
    <div data-screen-label="home">
      <section className="home home-index">
        <div className="hero-index">
          <div className="hero-stage">
            {/* Bloque horario, pegado a la izda del logo */}
            <div className="hero-info hero-info-l">
              <div>{t("TODOS LOS DÍAS", "EVERY DAY")}</div>
              <div>13.00 – 15.39 &amp; 20.00 – 22.39</div>
            </div>

            {/* Logo central con claim incluido */}
            <div className="hero-logo">
              <img src="img/logos/dumdum-claim.svg" alt="DUM DUM™ · Dumplings &amp; Desobediencia" />
            </div>

            {/* Bloque direcciones, pegado a la dcha del logo */}
            <div className="hero-info hero-info-r">
              <div>BLASCO DE GARAY, 10 — MADRID</div>
              <div>INFANTA MERCEDES, 17 — MADRID</div>
            </div>
          </div>

          <div className="hero-actions hero-actions-4">
            <a className="btn" href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("dumdum:open-reserve")); }}>{t("Reservar", "Book")} →</a>
            <a className="btn" href="/locales">{t("Llegar", "Directions")} →</a>
            <a
              className="btn"
              href="#"
              onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event("dumdum:open-pide")); }}>
              {t("Pide ya!", "Order now!")} →
            </a>
            <a className="btn" href="/eventos">{t("Eventos", "Events")} →</a>
          </div>
          <button
            type="button"
            className="hero-scroll"
            aria-label="Bajar"
            onClick={() => {
              const start = window.scrollY;
              const distance = window.innerHeight * 1.05;
              const duration = 900;
              const t0 = performance.now();
              // easeOutCubic: arranca con ritmo y frena suave al final (grácil)
              const ease = (t) => 1 - Math.pow(1 - t, 3);
              const step = (now) => {
                const p = Math.min((now - t0) / duration, 1);
                window.scrollTo(0, start + distance * ease(p));
                if (p < 1) requestAnimationFrame(step);
              };
              requestAnimationFrame(step);
            }}>↓</button>
        </div>
      </section>

      {/* Feature strip */}
      <section className="feature-strip">
        <div>
          <div className="tiny muted" style={{ marginBottom: 16 }}>/ {t("CARTA", "MENU")}</div>
          <h2>{t("Una carta corta", "A short menu")}<br /><em style={{ color: 'var(--red)', fontStyle: 'normal', fontWeight: 'inherit' }}>{t("que cambia cada mes.", "that changes every month.")}</em></h2>
          <p className="body" style={{ marginTop: 24 }}>
            {t(
              <React.Fragment>Nueve dumplings. Uno nuevo cada mes. De los nueve, mínimo 2 vegetarianos. De los nueve, <strong style={{ fontWeight: 700 }}>ni uno convencional</strong>.</React.Fragment>,
              <React.Fragment>Nine dumplings. A new one every month. Of the nine, at least 2 vegetarian. Of the nine, <strong style={{ fontWeight: 700 }}>not one conventional</strong>.</React.Fragment>
            )}
          </p>
          <div className="sistema-ctas" style={{ marginTop: 32 }}>
            <a className="btn" href="/menu">{t("Leer carta de " + mesEnCurso("es-ES"), "Read " + mesEnCurso("en-US") + "'s menu")} →</a>
          </div>
        </div>
        <div>
          <div className="tiny muted" style={{ marginBottom: 16 }}>/ {t("LOCALES", "LOCATIONS")}</div>
          <h2>{t("Una casa en Chamberí.", "One home in Chamberí.")}<br /><em style={{ color: 'var(--red)', fontStyle: 'normal', fontWeight: 'inherit' }}>{t("Otra en Bernabéu.", "Another in Bernabéu.")}</em></h2>
          <p className="body" style={{ marginTop: 24 }}>
            {t(
              "Dos garitos distintos, pero igual de rico, igual de majos e igual de desobedientes.",
              "Two different spots, but equally tasty, equally lovely, and equally disobedient."
            )}
          </p>
          <div className="row gap-m sistema-ctas" style={{ marginTop: 32 }}>
            <a className="btn" href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("dumdum:open-reserve", { detail: { local: window.DUMDUM_LOCALES?.chamberi } })); }}>{t("Reservar en Chamberí", "Book at Chamberí")} →</a>
            <a className="btn" href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("dumdum:open-reserve", { detail: { local: window.DUMDUM_LOCALES?.bernabeu } })); }}>{t("Reservar en Bernabéu", "Book at Bernabéu")} →</a>
          </div>
        </div>
      </section>

      {/* Flat map nav · 9 celdas en 3 columnas */}
      <nav className="map-nav map-nav-3">
        <a className="map-cell" href="/menu">
          <div className="n">[01]</div>
          <div className="t">{t("La carta", "Menu")}</div>
          <div className="d">{t("ECHA UN VISTAZO", "TAKE A LOOK")}</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("dumdum:open-pide", { detail: { step: "domicilio" } })); }}>
          <div className="n">[02]</div>
          <div className="t">{t("A domicilio", "Delivery")}</div>
          <div className="d">{t("NI TE MUEVAS", "DON'T EVEN MOVE")}</div>
        </a>
        <a className="map-cell" href={TAKEAWAY_URL} target="_blank" rel="noreferrer">
          <div className="n">[03]</div>
          <div className="t">Take Away</div>
          <div className="d">{t("PIDE ONLINE", "ORDER ONLINE")}</div>
        </a>
        <a className="map-cell" href="/locales">
          <div className="n">[04]</div>
          <div className="t">{t("Locales", "Locations")}</div>
          <div className="d">CHAMBERÍ #015 + BERNABÉU #020</div>
        </a>
        <a className="map-cell" href="/eventos">
          <div className="n">[05]</div>
          <div className="t">{t("Eventos", "Events")}</div>
          <div className="d">{t("AFTER WORKS · CUMPLES · DIVORCIOS?", "AFTER WORKS · BIRTHDAYS · DIVORCES?")}</div>
        </a>
        <a className="map-cell" href="/contacto">
          <div className="n">[06]</div>
          <div className="t">{t("Contacto", "Contact")}</div>
          <div className="d">{t("SALÚDAME SIEMPRE", "SAY HI ANYTIME")}</div>
        </a>
        <a className="map-cell" href="https://www.instagram.com/dumdum.plings" target="_blank" rel="noreferrer">
          <div className="n">[07]</div>
          <div className="t">Instagram</div>
          <div className="d">@DUMDUM.PLINGS</div>
        </a>
        <a className="map-cell" href="https://open.spotify.com/playlist/75oqGRFz3CXErzrfBQTuVd?si=62f669c4e6674ff1" target="_blank" rel="noreferrer">
          <div className="n">[08]</div>
          <div className="t">DD*Radio</div>
          <div className="d">SPOTIFY</div>
        </a>
        <a className="map-cell" href="#" onClick={(e) => { e.preventDefault(); showToast("soon"); }}>
          <div className="n">[09]</div>
          <div className="t">DD*Mer®ch</div>
          <div className="d">{t("PRÓXIMAMENTE", "COMING SOON")}</div>
        </a>
        {/* Celda-sello · rellena el hueco de la rejilla en móvil (2 col).
            Al pinchar/hover invierte colores como el resto de celdas. */}
        <div className="map-cell map-cell-seal" aria-hidden="true">
          <span className="seal-mark" />
        </div>
      </nav>

      {/* Spec footer */}
      <section className="spec-foot" id="home-end">
        <div>
          <b>{t("Año", "Year")}</b>
          © {window.i18n.autoLocalize("DOSMIL24")}
        </div>
        <div>
          <b>{t("Locales", "Locations")}</b>
          <a className="spec-link" href="/locales">
            <strong style={{ fontWeight: 700 }}>Madrid</strong> {"→"} Chamberí | Bernabéu
          </a>
        </div>
        <div>
          <b>{t("Horario", "Hours")}</b>
          <a className="spec-link" href="/locales">
            {t("L-D / 13.00 - 15.39 / 20.00 - 22.39", "Mon-Sun / 13.00 - 15.39 / 20.00 - 22.39")}
          </a>
        </div>
        <div>
          <b>{t("Carta", "Menu")}</b>
          <a className="spec-link" href="/menu">
            {t("Una vez al mes, un dumpling nuevo", "Once a month, a new dumpling")}
          </a>
        </div>
      </section>

      {/* Toast flotante "Próximamente" (Take Away / Merch) · fijo abajo */}
      {toast &&
        <div className="home-toast" role="status">
          {toast === "uber" ?
            <span>{t("Próximamente. De momento puedes pedir para recoger en ", "Coming soon. For now you can order pickup on ")}<a href={UBER_URL} target="_blank" rel="noreferrer">Uber Eats →</a></span> :
            <span>{t("Próximamente.", "Coming soon.")}</span>}
        </div>
      }
    </div>);

}

// ── CARTA (mobile QR) ─────────────────────────────────────────
// Lightbox tipo carrusel: muestra la foto del plato y permite deslizar
// izquierda/derecha (swipe en móvil, flechas y teclado en general) para
// navegar por toda la galería de platos con foto.
function DishLightbox({ items, index, onPrev, onNext, onClose }) {
  const [drag, setDrag] = React.useState(0);   // desplazamiento actual del dedo (px)
  const [animating, setAnimating] = React.useState(false);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const width = React.useRef(typeof window !== "undefined" ? window.innerWidth : 360);
  const locked = React.useRef(null); // "x" o "y" según la dirección del gesto

  const item = items[index];
  const trapRef = useFocusTrap(true); // el lightbox solo existe montado = abierto

  // Teclado (Esc/flechas) y bloqueo del scroll de fondo VIVEN AQUÍ, no en quien
  // lo abre: antes se los prestaba Menu, así que el visor de Eventos→Producto
  // (que lo monta GallerySlider) se abría sin Escape, sin flechas y con el fondo
  // scrolleable. Al bloquear el scroll compensamos el ancho de la barra con
  // padding-right para que la página no dé un salto lateral.
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = scrollbarW + "px";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [onClose, onPrev, onNext]);

  const onTouchStart = (e) => {
    const tch = e.touches[0];
    startX.current = tch.clientX;
    startY.current = tch.clientY;
    locked.current = null;
    width.current = window.innerWidth;
    setAnimating(false);
  };
  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    // Decidir si el gesto es horizontal (navegar) o vertical (ignorar/cerrar)
    if (locked.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      locked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (locked.current === "x") {
      setDrag(dx);
    }
  };
  const onTouchEnd = () => {
    if (locked.current === "x") {
      const threshold = width.current * 0.2;
      if (drag <= -threshold) { onNext(); }
      else if (drag >= threshold) { onPrev(); }
    }
    setAnimating(true);
    setDrag(0);
    startX.current = null;
    locked.current = null;
  };

  return (
    <div className="dish-lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={item ? item.name : "Foto"} ref={trapRef}>
      <button type="button" className="dish-lightbox-close" aria-label="Cerrar" onClick={onClose}>✕</button>

      <button type="button" className="dish-lightbox-nav prev" aria-label="Anterior"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}>‹</button>
      <button type="button" className="dish-lightbox-nav next" aria-label="Siguiente"
        onClick={(e) => { e.stopPropagation(); onNext(); }}>›</button>

      <figure
        className="dish-lightbox-fig"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${drag}px)`,
          transition: animating ? "transform 0.25s cubic-bezier(0.16,1,0.3,1)" : "none"
        }}>
        <img src={item.src} alt={item.name} draggable="false" />
        <figcaption>
          <span className="dish-lightbox-name">{item.name}</span>
          <span className="dish-lightbox-count">{index + 1} / {items.length}</span>
        </figcaption>
      </figure>
    </div>
  );
}

// ── Slider genérico ───────────────────────────────────────────
function GallerySlider({ photos, visible = 2, label = "Galería", placeholderLabel = "Espacio", cta = null, ratio = "4 / 3", lightboxStyle = "default", rueda = false }) {
  const total = photos.length;
  const [idx, setIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(null); // índice de foto ampliada, o null

  // Detectar móvil (≤879px): en móvil la galería es un carrusel deslizable
  // (scroll horizontal con snap, de una en una); en desktop, slice + flechas.
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" && window.matchMedia("(max-width: 879px)").matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 879px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // En móvil: ref a la pista para mover el scroll con las flechas y para
  // saber qué foto está centrada (actualiza el contador "01 / NN").
  const trackRef = React.useRef(null);
  // Lo que avanza una foto: en móvil el slot ocupa la pista entera y en el
  // carril de escritorio media, así que se mide del propio slot en vez de dar
  // por hecho que es el ancho del contenedor.
  const paso = () => {
    const el = trackRef.current;
    if (!el || !el.firstElementChild) return 1;
    const a = el.firstElementChild.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return a + gap;
  };
  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    // Solo se reengancha el destino cuando NO hay animación en curso. Si no, la
    // propia animación dispara este scroll, el destino se iguala a la posición
    // actual y el movimiento se frena a sí mismo: 1300px de rueda avanzaban 234.
    if (!animando.current) destino.current = el.scrollLeft;
    const i = Math.round(el.scrollLeft / paso());
    const n = Math.max(0, Math.min(total - 1, i));
    setIdx(n);
    setHasta((h) => Math.max(h, n + 2));
  };
  const scrollAFoto = (i) => {
    const el = trackRef.current;
    if (!el) return;
    animando.current = false;   // manda la flecha, no lo que quedara rodando
    destino.current = i * paso();
    el.scrollTo({ left: destino.current, behavior: "smooth" });
  };

  // ── Rueda sobre la galería (solo con `rueda` y en escritorio) ──
  // Convierte el scroll vertical del ratón en desplazamiento horizontal de las
  // fotos. Se anima hacia un destino con rAF en vez de sumar el delta directo:
  // un ratón de rueda salta de 100 en 100 y sin esto iría a tirones, mientras
  // que un trackpad ya va suave. Así los dos se mueven igual.
  const destino = React.useRef(0);
  const animando = React.useRef(false);
  const ultimo = React.useRef(-1);   // dónde dejó el scroll el último fotograma
  const carril = rueda && !isMobile;
  React.useEffect(() => {
    const el = trackRef.current;
    if (!el || !carril) return;
    const parar = () => { animando.current = false; ultimo.current = -1; };
    const avanzar = () => {
      const t = trackRef.current;
      if (!t) { parar(); return; }
      // Si el scroll no está donde lo dejó el fotograma anterior, lo ha movido
      // otra cosa —las flechas, un arrastre de la barra— y manda ella: la
      // animación se abandona en vez de pelearse y devolverlo a su destino.
      if (ultimo.current >= 0 && Math.abs(t.scrollLeft - ultimo.current) > 2) {
        destino.current = t.scrollLeft; parar(); return;
      }
      const dif = destino.current - t.scrollLeft;
      if (Math.abs(dif) < 0.5) { t.scrollLeft = destino.current; parar(); return; }
      t.scrollLeft += dif * 0.18;
      ultimo.current = t.scrollLeft;
      requestAnimationFrame(avanzar);
    };
    const onWheel = (e) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      // El gesto horizontal del trackpad también vale.
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      // En los extremos NO se captura: el scroll sigue a la página. Atrapar la
      // rueda al final del carril convierte la galería en una trampa.
      if ((d < 0 && el.scrollLeft <= 0) || (d > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      destino.current = Math.max(0, Math.min(max, destino.current + d));
      if (!animando.current) { animando.current = true; requestAnimationFrame(avanzar); }
    };
    // passive: false porque hay que poder frenar el scroll de la página; React
    // registra los wheel como pasivos y allí el preventDefault no surte efecto.
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [carril, total]);

  if (total === 0) {
    return (
      <div className="ev-slider">
        <div className="ev-slider-head">
          {label && <div className="tiny muted">{label} · 00 / 00</div>}
        </div>
        <div className={`ev-slider-track ev-slider-cols-${visible}`}>
          {Array.from({ length: visible }, (_, i) =>
          <div className="ev-slider-slot" key={i} style={{ aspectRatio: ratio }}>
              <div className="ev-slider-ph">
                <span>[ {placeholderLabel} · sin fotos ]</span>
              </div>
            </div>
          )}
        </div>
      </div>);

  }

  // En móvil la pista lleva TODAS las fotos en una fila horizontal, así que
  // loading="lazy" no sirve de nada: el navegador las da por visibles y las pide
  // al abrir la página (3 MB en la ficha de Bernabéu, con una sola foto a la
  // vista). El HUECO se mantiene siempre —el ancho de la pista y el scroll-snap
  // dependen de él—, pero la imagen se monta solo hasta dos por delante de donde
  // has llegado; el resto entra conforme avanzas.
  // El límite solo sube, nunca baja: desmontar las de atrás cancelaba descargas
  // a medias, y al retroceder había que volver a pedirlas.
  const [hasta, setHasta] = React.useState(2);
  // Vale para el carril de escritorio igual que para el carrusel de móvil: en
  // los dos están las fotos en una fila y el navegador las pediría todas.
  const enVentana = (i) => !(isMobile || carril) || i <= hasta;

  const step = Math.min(visible, total);
  const prev = () => setIdx((i) => (i - step + total) % total);
  const next = () => setIdx((i) => (i + step) % total);

  const slice = Array.from({ length: Math.min(visible, total) }, (_, i) => ({
    item: photos[(idx + i) % total],
    n: (idx + i) % total + 1
  }));

  // Navegación de las flechas: en móvil mueve el scroll de la pista;
  // en desktop avanza el slice como antes.
  const desliza = isMobile || carril;
  const goPrev = () => { if (desliza) scrollAFoto(Math.max(0, idx - 1)); else prev(); };
  const goNext = () => { if (desliza) scrollAFoto(Math.min(total - 1, idx + 1)); else next(); };

  return (
    <div className={`ev-slider ev-slider-cols-${visible}`}>
      <div className="ev-slider-head">
        {/* label=null → sin rótulo ni contador (p. ej. en la ficha de un local,
            donde ya se sabe de qué son las fotos). Solo quedan las flechas. */}
        {label && <div className="tiny muted">{label} · {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>}
        <div className="ev-slider-ctrls">
          <button onClick={goPrev} aria-label="Anterior" className="ev-slider-btn">←</button>
          <button onClick={goNext} aria-label="Siguiente" className="ev-slider-btn">→</button>
        </div>
      </div>

      {desliza ?
      // ── Pista deslizable: carrusel con snap en móvil, carril libre movido
      //    con la rueda en escritorio. El marcado es el mismo. ──
      <div className={"ev-slider-track " + (isMobile ? "ev-slider-track-mobile" : "ev-slider-carril")}
        ref={trackRef} onScroll={onTrackScroll}>
          {photos.map((item, i) =>
        <div className="ev-slider-slot" key={i} style={{ aspectRatio: ratio }}>
              {item.src && enVentana(i) ?
          <img src={item.src} alt={item.name || ""} loading="lazy" decoding="async" style={{ objectPosition: item.pos || "50% 50%", cursor: "pointer" }}
            onClick={() => setLightbox(i)} /> :
          item.src ?
          /* Hueco liso, no el marcador de rayas: aquí SÍ hay foto, solo que
             todavía no se ha pedido. Las rayas dirían "no hay foto". */
          <div className="ev-slider-espera" aria-hidden="true" /> :

          <div className="ev-slider-ph">
                  <span>[ {placeholderLabel} · {String(i + 1).padStart(2, "0")} ]</span>
                </div>
          }
              {cta &&
          <a className="ev-slider-cta"
          href={item.url || "#"}
          target={item.url ? "_blank" : undefined}
          rel="noreferrer"
          onClick={(e) => {if (!item.url) e.preventDefault();}}>
                  {cta}
                </a>
          }
            </div>
        )}
        </div> :

      // ── DESKTOP: slice + flechas (como antes) ──
      <div className="ev-slider-track">
          {slice.map(({ item, n }, i) =>
        <div className="ev-slider-slot" key={`${idx}-${i}`} style={{ aspectRatio: ratio }}>
              {item.src ?
          <img src={item.src} alt={item.name || ""} loading="lazy" decoding="async" style={{ objectPosition: item.pos || "50% 50%", cursor: "pointer" }}
            onClick={() => setLightbox((idx + i) % total)} /> :

          <div className="ev-slider-ph">
                  <span>[ {placeholderLabel} · {String(n).padStart(2, "0")} ]</span>
                </div>
          }
              {cta &&
          <a className="ev-slider-cta"
          href={item.url || "#"}
          target={item.url ? "_blank" : undefined}
          rel="noreferrer"
          onClick={(e) => {if (!item.url) e.preventDefault();}}>
                  {cta}
                </a>
          }
            </div>
        )}
        </div>
      }

      {lightboxStyle === "dish" ?
        (lightbox !== null &&
          <DishLightbox
            items={photos.map((p, i) => ({ id: i, src: p.src, name: p.name || "" }))}
            index={lightbox}
            onPrev={() => setLightbox((p) => (p - 1 + total) % total)}
            onNext={() => setLightbox((p) => (p + 1) % total)}
            onClose={() => setLightbox(null)}
          />) :
        <Lightbox
          photos={photos}
          index={lightbox}
          label={label}
          onClose={() => setLightbox(null)}
          onNav={(d) => setLightbox((p) => (p + d + total) % total)}
        />
      }
    </div>);

}

// ── Lightbox · visor de galería ampliada ──────────────────────
// Se abre al hacer clic en una foto. Navega con flechas, se cierra
// con la X, con clic en el fondo y con la tecla Escape. Respeta el
// diseño del sitio (rojo, mono, transiciones suaves).
function Lightbox({ photos, index, label = "Galería", onClose, onNav }) {
  const open = index !== null && index !== undefined;
  const trapRef = useFocusTrap(open); // accesibilidad (llamado antes de cualquier return)

  // Swipe táctil (móvil): deslizar izquierda/derecha para navegar,
  // igual que el carrusel de la carta.
  const [drag, setDrag] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const width = React.useRef(typeof window !== "undefined" ? window.innerWidth : 360);
  const locked = React.useRef(null);

  const onTouchStart = (e) => {
    const tch = e.touches[0];
    startX.current = tch.clientX;
    startY.current = tch.clientY;
    locked.current = null;
    width.current = window.innerWidth;
    setAnimating(false);
  };
  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (locked.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      locked.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (locked.current === "x") setDrag(dx);
  };
  const onTouchEnd = () => {
    if (locked.current === "x") {
      const threshold = width.current * 0.2;
      if (drag <= -threshold) onNav(1);
      else if (drag >= threshold) onNav(-1);
    }
    setAnimating(true);
    setDrag(0);
    startX.current = null;
    locked.current = null;
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNav(-1);
      else if (e.key === "ArrowRight") onNav(1);
    };
    document.addEventListener("keydown", onKey);
    // Bloquear el scroll del fondo SIN que la página salte:
    // al ocultar la barra de scroll, compensamos su ancho con
    // un padding-right equivalente, así nada se mueve.
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = scrollbarW + "px";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
    };
  }, [open, onClose, onNav]);

  if (!open) return null;
  const total = photos.length;
  const item = photos[index] || {};
  if (!item.src) return null;

  return (
    <div className="lb-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={label} ref={trapRef}>
      <div className="lb-head" onClick={(e) => e.stopPropagation()}>
        <span className="tiny">{label} · {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <button className="lb-close" onClick={onClose} aria-label="Cerrar">✕</button>
      </div>

      <button className="lb-nav lb-prev" onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Anterior">←</button>

      <div
        className="lb-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateX(${drag}px)`,
          transition: animating ? "transform 0.25s cubic-bezier(0.16,1,0.3,1)" : "none"
        }}>
        {item.src &&
          <img src={item.src} alt="" className="lb-img" draggable="false" style={{ objectPosition: item.pos || "50% 50%" }} />}
      </div>

      <button className="lb-nav lb-next" onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Siguiente">→</button>
    </div>);

}
Object.assign(window, { Home });
