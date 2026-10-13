/**
 * Devuelve cuántos chips (0..widths.length) caben en una sola línea.
 * Si todos caben juntos, devuelve widths.length (sin chip "+N").
 * Si no todos caben, devuelve el mayor k (0 <= k < widths.length) tal que
 * k chips + gap + plusWidth caben en el ancho disponible.
 *
 * @param {number[]} widths Anchos de cada chip en orden.
 * @param {number} plusWidth Ancho del chip indicador "+N".
 * @param {number} available Ancho disponible del contenedor.
 * @param {number} gap Espacio entre elementos en píxeles.
 * @returns {number} Cantidad de chips visibles.
 */
export function fitChipCount(widths, plusWidth, available, gap = 8) {
  if (!widths || widths.length === 0) return 0
  if (available <= 0) return 0

  const n = widths.length
  const totalAll = widths.reduce((sum, w) => sum + w, 0) + (n - 1) * gap
  if (totalAll <= available) {
    return n
  }

  for (let k = n - 1; k >= 1; k--) {
    let widthK = 0
    for (let i = 0; i < k; i++) {
      widthK += widths[i]
    }
    const totalWithPlus = widthK + k * gap + plusWidth
    if (totalWithPlus <= available) {
      return k
    }
  }

  return 0
}
