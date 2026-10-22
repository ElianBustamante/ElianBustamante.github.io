/**
 * Validates whether a URL is a valid string starting with https://
 * @param {unknown} url
 * @returns {boolean}
 */
export function isHttpsUrl(url) {
  return typeof url === 'string' && url.startsWith('https://')
}
