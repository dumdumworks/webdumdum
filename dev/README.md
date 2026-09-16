# dev/

Herramientas para revisar la web en local. **No se publican**: `build.mjs` solo
las copia a `dist/` cuando el build corre fuera de Cloudflare (ver `esLocal`).

## marco.html

La web dentro de un iPhone dibujado: bisel, isla dinámica y barra de gestos.
Sirve para revisar móvil sin que la página se funda con el fondo del panel.

    http://127.0.0.1:8788/marco.html

- **Pantalla:** 375 (SE), 390 (15) y 430 (Pro Max). Cambia el ancho real del
  iframe, así que la maquetación es la de ese teléfono, no una foto reducida.
- **Escala:** "que quepa" encoge el conjunto para verlo entero; "1:1 real" lo
  deja a tamaño natural y se desplaza, que es como hay que juzgar si un texto
  se lee o un botón se toca bien.
- **Ruta:** las dos fichas de local, Locales, Carta, Eventos y Home.

Dos cosas que hubo que resolver y conviene no deshacer:

- La web empieza DEBAJO de la barra de estado (59px arriba, 34 abajo). Si el
  iframe ocupara los 844 enteros, la isla taparía la topbar y parecería un
  fallo nuestro.
- `transform: scale()` no cambia el sitio que ocupa un elemento en el flujo, así
  que el teléfono va dentro de un envoltorio que mide lo escalado. Sin él, la
  escena cuenta el tamaño sin escalar, genera scroll y corta el teléfono por
  arriba.
