# dev/

Herramientas para revisar la web en local. **No se publican**: `build.mjs` solo
las copia a `dist/` cuando el build corre fuera de Cloudflare (ver `esLocal`).

## marco.html

La web dentro del aparato dibujado, para revisarla sin que la página se funda
con el fondo del panel.

    http://127.0.0.1:8788/marco.html

- **Aparato:** móvil (iPhone con bisel, isla y barra de gestos) u ordenador
  (monitor con la barra del navegador y la URL). Al cambiar se entra por la
  medida de en medio de cada uno.
- **Pantalla / Ventana:** 375 · 390 · 430 en móvil; 1280 · 1440 · 1920 en
  ordenador. Cambia el ancho REAL del iframe, así que la maquetación es la de
  ese aparato, no una foto reducida.
- **Escala:** "que quepa" encoge el conjunto para verlo entero; "1:1 real" lo
  deja a tamaño natural y se desplaza, que es como hay que juzgar si un texto
  se lee o un botón se toca bien.
- **Ruta:** las dos fichas de local, Locales, Carta, Eventos y Home.

Dos cosas que hubo que resolver y conviene no deshacer:

- Lo que no es web se descuenta del alto del iframe: en el móvil la barra de
  estado y la del gesto (59 y 34), en el ordenador la del navegador (44). Si el
  iframe ocupara los 844 enteros, la isla taparía la topbar y parecería un fallo
  nuestro; y el alto que anuncia el visor sería mayor que el que de verdad ves.
- `transform: scale()` no cambia el sitio que ocupa un elemento en el flujo, así
  que el teléfono va dentro de un envoltorio que mide lo escalado. Sin él, la
  escena cuenta el tamaño sin escalar, genera scroll y corta el teléfono por
  arriba.
