/**
 * Pure functions to determine active section and navigation between sections.
 */

/**
 * Returns index of the active section based on scanline position in viewport.
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Section bounding rects.
 * @param {number} viewportHeight Viewport height in pixels.
 * @param {number} [ratio=0.4] Viewport fraction where scanline is placed.
 * @returns {number} Active section index (0 if empty or none matches).
 */
export function getActiveSectionIndex(rects, viewportHeight, ratio = 0.4) {
  if (!rects || rects.length === 0) return 0;
  const line = (viewportHeight ?? 0) * ratio;

  for (let i = 0; i < rects.length; i++) {
    if (rects[i].top <= line && rects[i].bottom > line) {
      return i;
    }
  }

  for (let i = rects.length - 1; i >= 0; i--) {
    if (rects[i].top <= line) {
      return i;
    }
  }

  return 0;
}

/**
 * Returns the last section index whose top edge is above the screen.
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Section bounding rects.
 * @param {number} [tolerance=4] Tolerance margin in pixels.
 * @returns {number} Target previous section index.
 */
export function getPrevSectionIndex(rects, tolerance = 4) {
  if (!rects || rects.length === 0) return 0;

  for (let i = rects.length - 1; i >= 0; i--) {
    if (rects[i].top < -tolerance) {
      return i;
    }
  }

  return 0;
}

/**
 * Returns the first section index whose top edge is below the top margin.
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Section bounding rects.
 * @param {number} [tolerance=4] Tolerance margin in pixels.
 * @returns {number} Target next section index.
 */
export function getNextSectionIndex(rects, tolerance = 4) {
  if (!rects || rects.length === 0) return 0;

  for (let i = 0; i < rects.length; i++) {
    if (rects[i].top > tolerance) {
      return i;
    }
  }

  return rects.length - 1;
}

/**
 * Indicates whether navigating back to a previous section is possible (any section top < -tolerance).
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Section bounding rects.
 * @param {number} [tolerance=4] Tolerance margin in pixels.
 * @returns {boolean}
 */
export function canGoPrev(rects, tolerance = 4) {
  if (!rects || rects.length === 0) return false;
  return rects.some((r) => r.top < -tolerance);
}

/**
 * Indicates whether navigating forward to a next section is possible (any section top > tolerance).
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Section bounding rects.
 * @param {number} [tolerance=4] Tolerance margin in pixels.
 * @returns {boolean}
 */
export function canGoNext(rects, tolerance = 4) {
  if (!rects || rects.length === 0) return false;
  return rects.some((r) => r.top > tolerance);
}
