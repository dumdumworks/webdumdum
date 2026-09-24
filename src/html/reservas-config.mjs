// Choose the provider per location only after the public booking flow is verified.
// Existing bookings must be reconciled before switching a location from DISH.
export const RESERVAS = {
  chamberi: { proveedor: 'dish', url: '' },
  bernabeu: { proveedor: 'dish', url: '' },
};

export function configuracionReserva(slug) {
  const config = RESERVAS[slug];
  if (!config || !['dish', 'propio'].includes(config.proveedor)) throw new Error(`Proveedor de reservas inválido: ${slug}`);
  if (config.proveedor === 'propio') {
    const url = new URL(config.url);
    if (url.protocol !== 'https:' || url.username || url.password || /^\/admin(?:\/|$)/.test(url.pathname)) {
      throw new Error(`Se necesita una URL pública HTTPS de reservas para ${slug}`);
    }
  }
  return config;
}
