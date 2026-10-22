/**
 * Returns how many chips (0..widths.length) fit on a single line.
 * If all fit together, returns widths.length (without a "+N" chip).
 * If not all fit, returns the largest k (0 <= k < widths.length) such that
 * k chips + gap + plusWidth fit within the available width.
 *
 * @param {number[]} widths Widths of each chip in order.
 * @param {number} plusWidth Width of the "+N" indicator chip.
 * @param {number} available Available container width.
 * @param {number} gap Gap between elements in pixels.
 * @returns {number} Number of visible chips.
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
 * Returns how many chips (0..widths.length) fit in up to maxLines lines.
 * If all fit in <= maxLines lines, returns widths.length (without "+N").
 * Otherwise, returns the largest k (0 <= k < widths.length) such that the first
 * k chips plus plusWidth fit in <= maxLines lines.
 *
 * @param {number[]} widths Widths of each chip in order.
 * @param {number} plusWidth Width of the "+N" indicator chip.
 * @param {number} available Available container width.
 * @param {number} gap Gap between elements in pixels.
 * @param {number} maxLines Maximum allowed lines.
 * @returns {number} Number of visible chips.
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
