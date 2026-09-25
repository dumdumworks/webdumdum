# Integración del motor de reservas

Esta rama prepara la web para un widget propio. DISH sigue activo en ambos locales.

## Configuración

`src/html/reservas-config.mjs` permite cambiar el proveedor por local. El proveedor
`propio` requiere una URL HTTPS pública del formulario de clientes. Nunca usar la
URL privada del prototipo ni una ruta de administración. Los botones existentes
siguen usando `data-reservar`; no hay que cambiarlos individualmente.

El iframe transmite `local=chamberi|bernabeu`, `lang=es|en` y
`origen=web|google`. El formulario público debe implementar este contrato,
consultar el mismo inventario que Hoy y admitir su inclusión desde `dum-dum.es`.
No se pasa ninguna credencial de administración al navegador.

## Enlaces previstos para Google Business

Una vez fusionada y publicada esta rama, estos enlaces abrirán el proveedor activo:

- Chamberí: https://dum-dum.es/locales/chamberi?reservar=chamberi&origen=google
- Bernabéu: https://dum-dum.es/locales/bernabeu?reservar=bernabeu&origen=google

Mientras la configuración siga en `dish`, estos enlaces abren DISH. No son enlaces
al motor propio hasta completar los requisitos de activación.

## Pendiente antes de activar el motor propio

1. Publicar el formulario de clientes y sus APIs públicas por separado del panel
   privado. No abrir el Site administrativo al público.
2. Verificar disponibilidad, reserva/solicitud, confirmación, comunicaciones,
   modificación y cancelación; comprobar la entrada en Hoy y el idioma del enlace.
3. Confirmar que las políticas mostradas reflejan los pagos realmente implementados.
4. Reconciliar las reservas futuras de DISH y acordar el corte por local: hoy no hay
   sincronización de disponibilidad entre los dos motores.
5. Configurar la URL pública verificada, cambiar el proveedor del local y publicar.
6. Actualizar el enlace de cada ficha de Google Business y verificarlo sin sesión.

El alcance de esta rama es la conexión del widget y los enlaces directos; no
implementa el endpoint público, la migración de reservas ni la sincronización con DISH.
