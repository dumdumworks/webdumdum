# Cómo añadir una página nueva (sin romper nada)

La web usa **URLs limpias** (`/menu`, no `/#/menu`) y un router central.
Para añadir una página nueva en el futuro, sigue estos 3 pasos. Si los
respetas, la navegación, el botón atrás, el SEO y mobile/desktop funcionan solos.

## Paso 1 — Crear el componente (en `src/pages.jsx`)
Escribe tu componente como los demás, por ejemplo:

    function Merch() {
      const lang = useLang();
      return (
        <div data-screen-label="merch">
          ...tu contenido...
        </div>
      );
    }

Y al final de `pages.jsx`, añádelo al `Object.assign(window, { ... })`:

    Object.assign(window, { Home, Menu, Locales, Quienes, Contacto, Eventos, Merch });

## Paso 2 — Registrar la ruta (en `src/app.jsx`)
En la función `getRoutesTable()`, añade UNA línea con su URL, título y descripción SEO:

    { prefix: "/merch", exact: false, component: "Merch",
      title: "DUM DUM™ — Merch",
      desc: "Camisetas y merch de DUM DUM." },

Eso es todo: el router, el scroll al cambiar de página, el `<title>` y la
`meta-description` se actualizan solos.

## Paso 3 — Enlazar a la página
Usa siempre rutas que empiezan por `/` (sin `#`):

    <a href="/merch">Merch →</a>

El interceptor de clics la hará navegar sin recargar automáticamente.
Para enlaces EXTERNOS (Instagram, Uber, etc.) usa la URL completa y
`target="_blank"` — el interceptor los respeta y abre en pestaña nueva.

## Reglas de oro (para no romper nada)
- **Enlaces internos**: `href="/loquesea"` (empieza por `/`). NUNCA `href="#/loquesea"`.
- **Enlaces externos**: URL completa `https://...` + `target="_blank"`.
- **Botones que no navegan** (abren un toast, etc.): `href="#"` + `onClick` con `e.preventDefault()`.
- No uses `window.location.hash` para navegar: usa `nav("/ruta")` o un `<a href="/ruta">`.
- Las imágenes van como `img/...` (el `<base href="/">` del index las resuelve desde la raíz).

## Cosas que ya están listas para el futuro
- URLs limpias + History API (atrás/adelante del navegador funciona).
- `_redirects` en la raíz: Cloudflare sirve cualquier ruta sin dar 404 al recargar.
- `<base href="/">`: las rutas relativas funcionan entren por donde entren.
- Título y descripción SEO por página (en la tabla de rutas).
- Match de rutas estricto: páginas con nombres parecidos no colisionan.

## Pendiente / mejora futura conocida
- La web compila en el navegador (sin build). Para SEO máximo, algún día
  convendría migrar a una web con pre-renderizado. No es urgente, pero queda anotado.
- El componente `Quienes` existe en pages.jsx pero no está en el router.
  Si lo quieres accesible, añádelo en getRoutesTable() (Paso 2) y tradúcelo.
