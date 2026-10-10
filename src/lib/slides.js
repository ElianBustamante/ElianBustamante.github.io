/**
 * Lógica pura del controlador de diapositivas y navegación
 */

/**
 * Determina si una tecla debe ser interceptada para navegar entre diapositivas.
 */
export function shouldInterceptKey(e) {
  if (!e) return false;
  const { key, target, ctrlKey, metaKey, altKey, shiftKey } = e;
  if (ctrlKey || metaKey || altKey || shiftKey) return false;

  const validKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Spacebar'];
  if (!validKeys.includes(key)) return false;

  if (!target) return false;

  // Nunca si el target es button, a, input, select, textarea, summary, [role=button], [role=slider] o [contenteditable]
  const interactiveSelector = 'button, a, input, select, textarea, summary, [role="button"], [role="slider"], [contenteditable]';
  if (target.matches?.(interactiveSelector) || target.closest?.(interactiveSelector) || target.isContentEditable) {
    return false;
  }

  // Solo si e.target es document.body o main
  const isBody = target === target.ownerDocument?.body || target.tagName === 'BODY';
  const isMain = target.tagName === 'MAIN' || target.id === 'main';
  return isBody || isMain;
}

/**
 * Devuelve la dirección de desplazamiento de una tecla (+1 abajo, -1 arriba, 0 no interceptar).
 */
export function getKeyDirection(e) {
  if (!shouldInterceptKey(e)) return 0;
  if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) return 1;
  if (['ArrowUp', 'PageUp'].includes(e.key)) return -1;
  return 0;
}

/**
 * Comprueba si un ancestro del elemento tiene scroll vertical disponible en la dirección indicada.
 */
export function canElementScroll(target, direction) {
  if (!target) return false;
  let curr = target;

  while (curr && curr !== curr.ownerDocument?.body && curr !== curr.ownerDocument?.documentElement) {
    const isScrollable = curr.scrollHeight > curr.clientHeight;
    if (isScrollable) {
      const style = typeof window !== 'undefined' ? window.getComputedStyle(curr) : curr.style || {};
      const overflowY = style.overflowY || '';
      if (['auto', 'scroll'].includes(overflowY)) {
        if (direction > 0 && curr.scrollTop + curr.clientHeight < curr.scrollHeight - 1) {
          return true;
        }
        if (direction < 0 && curr.scrollTop > 1) {
          return true;
        }
      }
    }
    curr = curr.parentElement;
  }

  return false;
}

/**
 * Determina si se puede avanzar/retroceder de diapositiva o si la sección actual
 * es más alta que la pantalla y debe continuar su scroll nativo.
 */
export function canAdvanceSlide(section, direction, windowHeight) {
  if (!section) return true;
  const wHeight = windowHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
  const rect = typeof section.getBoundingClientRect === 'function' ? section.getBoundingClientRect() : section;

  if (!rect || typeof rect.height !== 'number') return true;

  if (rect.height > wHeight + 8) {
    // Si la sección es más alta que la pantalla:
    if (direction > 0) {
      // Hacia abajo: solo salta si el borde inferior ya es visible
      if (rect.bottom > wHeight + 8) {
        return false;
      }
    } else if (direction < 0) {
      // Hacia arriba: solo salta si el borde superior ya está en pantalla
      if (rect.top < -8) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Determina si un evento de rueda (wheel) debe interceptarse para cambiar de diapositiva.
 */
export function shouldInterceptWheel(e, { isReducedMotion, windowHeight, currentSection } = {}) {
  if (!e) return false;
  if (e.ctrlKey || e.metaKey) return false;

  const reduce = isReducedMotion ?? (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  if (reduce) return false;

  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return false;
  if (Math.abs(e.deltaY) <= 5) return false;

  const direction = e.deltaY > 0 ? 1 : -1;

  if (e.target?.closest?.('[role="dialog"], dialog')) return false;

  if (canElementScroll(e.target, direction)) return false;

  if (currentSection) {
    const wHeight = windowHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
    if (!canAdvanceSlide(currentSection, direction, wHeight)) {
      return false;
    }
  }

  return true;
}

/**
 * Encuentra el índice de la sección que actualmente domina la pantalla.
 */
export function findClosestSectionIndex(sections) {
  if (!sections || !sections.length) return 0;
  let closestIndex = 0;
  let minDistance = Infinity;

  sections.forEach((sec, index) => {
    const rect = typeof sec.getBoundingClientRect === 'function' ? sec.getBoundingClientRect() : sec;
    const distance = Math.abs(rect.top);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

/**
 * Decisión pura: a qué sección alinear la ventana cuando un elemento recibe foco con teclado.
 * Devuelve la sección objetivo si se debe alinear (|rect.top| > 2), o null si ya está alineada
 * o si la sección es más alta que la pantalla y el elemento ya está visible.
 */
export function getSectionOnFocus({ focusedElement, windowHeight }) {
  if (!focusedElement) return null;

  const focusedSection = focusedElement.closest?.('section[id]') || focusedElement.closest?.('section');
  if (!focusedSection) return null;

  const secRect = typeof focusedSection.getBoundingClientRect === 'function' ? focusedSection.getBoundingClientRect() : { top: 0, height: 0 };
  if (Math.abs(secRect.top) <= 2) {
    return null;
  }

  const wHeight = windowHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 800);

  if (secRect.height > wHeight + 8) {
    const elRect = typeof focusedElement.getBoundingClientRect === 'function' ? focusedElement.getBoundingClientRect() : { top: 0, bottom: 0 };
    const isVisible = elRect.top >= 0 && elRect.bottom <= wHeight;
    if (isVisible) {
      return null;
    }
  }

  return focusedSection;
}

/**
 * Determina si se debe realinear la diapositiva actual tras un evento resize/zoom.
 * Devuelve true solo si width >= 768 y (width !== prevWidth o dpr !== prevDpr).
 */
export function shouldRealignOnResize({ prevWidth, width, prevDpr, dpr } = {}) {
  return Boolean(width >= 768 && (width !== prevWidth || dpr !== prevDpr));
}
