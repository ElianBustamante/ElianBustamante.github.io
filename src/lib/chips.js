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

function countLines(items, available, gap) {
  let lines = 1
  let used = 0
  for (const w of items) {
    if (used === 0) {
      used = w
    } else if (used + gap + w <= available) {
      used += gap + w
    } else {
      lines += 1
      used = w
    }
  }
  return lines
}

/**
 * Devuelve cuántos chips (0..widths.length) caben en hasta maxLines líneas.
 * Si todos caben en <= maxLines líneas, devuelve widths.length (sin "+N").
 * Si no, devuelve el mayor k (0 <= k < widths.length) tal que los k primeros
 * chips más plusWidth caben en <= maxLines líneas.
 *
 * @param {number[]} widths Anchos de cada chip en orden.
 * @param {number} plusWidth Ancho del chip indicador "+N".
 * @param {number} available Ancho disponible del contenedor.
 * @param {number} gap Espacio entre elementos en píxeles.
 * @param {number} maxLines Máximo de líneas permitidas.
 * @returns {number} Cantidad de chips visibles.
 */
export function fitChipLines(widths, plusWidth, available, gap = 8, maxLines = 1) {
  if (!widths || widths.length === 0) return 0
  if (available <= 0 || maxLines <= 0) return 0

  const n = widths.length
  if (countLines(widths, available, gap) <= maxLines) {
    return n
  }

  for (let k = n - 1; k >= 1; k--) {
    const candidate = [...widths.slice(0, k), plusWidth]
    if (countLines(candidate, available, gap) <= maxLines) {
      return k
    }
  }

  return 0
}
