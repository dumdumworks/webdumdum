// Shared URL contract for the public guest widget. Contains no staff credentials.
export function urlReserva(base, local, idioma, origen = 'web') {
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || /^\/admin(?:\/|$)/.test(url.pathname)) throw new Error('Invalid public booking URL');
  url.searchParams.set('local', local);
  url.searchParams.set('lang', idioma === 'en' ? 'en' : 'es');
  url.searchParams.set('origen', origen === 'google' ? 'google' : 'web');
  return url;
}
