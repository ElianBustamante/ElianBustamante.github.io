/**
 * Funciones puras para determinar la sección activa y la navegación entre secciones.
 */

/**
 * Devuelve el índice de la sección activa según la posición de una línea de escaneo en el viewport.
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Rectángulos de las secciones.
 * @param {number} viewportHeight Altura del viewport en píxeles.
 * @param {number} [ratio=0.4] Fracción del viewport para situar la línea de escaneo.
 * @returns {number} Índice de la sección activa (0 si lista vacía o ninguna cumple).
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
 * Devuelve el último índice de sección cuyo top haya quedado por encima de la pantalla.
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Rectángulos de las secciones.
 * @param {number} [tolerance=4] Margen de tolerancia en píxeles.
 * @returns {number} Índice de la sección anterior destino.
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
 * Devuelve el primer índice de sección cuyo top esté por debajo del margen superior.
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Rectángulos de las secciones.
 * @param {number} [tolerance=4] Margen de tolerancia en píxeles.
 * @returns {number} Índice de la siguiente sección destino.
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
 * Indica si es posible retroceder a una sección anterior (alguna sección tiene top < -tolerance).
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Rectángulos de las secciones.
 * @param {number} [tolerance=4] Margen de tolerancia en píxeles.
 * @returns {boolean}
 */
export function canGoPrev(rects, tolerance = 4) {
  if (!rects || rects.length === 0) return false;
  return rects.some((r) => r.top < -tolerance);
}

/**
 * Indica si es posible avanzar a una sección siguiente (alguna sección tiene top > tolerance).
 * 
 * @param {Array<{ top: number, bottom: number }>} rects Rectángulos de las secciones.
 * @param {number} [tolerance=4] Margen de tolerancia en píxeles.
 * @returns {boolean}
 */
export function canGoNext(rects, tolerance = 4) {
  if (!rects || rects.length === 0) return false;
  return rects.some((r) => r.top > tolerance);
}
