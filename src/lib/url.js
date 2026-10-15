/**
 * Valida si una URL es una cadena válida y comienza con el protocolo https://
 * @param {unknown} url
 * @returns {boolean}
 */
export function isHttpsUrl(url) {
  return typeof url === 'string' && url.startsWith('https://')
}
