/**
 * Pure logic for slide controller and navigation
 */

/**
 * Determines if a key event should be intercepted for slide navigation.
 */
export function shouldInterceptKey(e) {
  if (!e) return false;
  const { key, target, ctrlKey, metaKey, altKey, shiftKey } = e;
  if (ctrlKey || metaKey || altKey || shiftKey) return false;

  const validKeys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Spacebar'];
  if (!validKeys.includes(key)) return false;

  if (!target) return false;

  // Never if target is button, a, input, select, textarea, summary, [role=button], [role=slider] or [contenteditable]
  const interactiveSelector = 'button, a, input, select, textarea, summary, [role="button"], [role="slider"], [contenteditable]';
  if (target.matches?.(interactiveSelector) || target.closest?.(interactiveSelector) || target.isContentEditable) {
    return false;
  }

  // Only if e.target is document.body or main
  const isBody = target === target.ownerDocument?.body || target.tagName === 'BODY';
  const isMain = target.tagName === 'MAIN' || target.id === 'main';
  return isBody || isMain;
}

/**
 * Returns scroll direction for a key (+1 down, -1 up, 0 do not intercept).
 */
export function getKeyDirection(e) {
  if (!shouldInterceptKey(e)) return 0;
  if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) return 1;
  if (['ArrowUp', 'PageUp'].includes(e.key)) return -1;
  return 0;
}

/**
 * Checks if an ancestor of the element has vertical scroll available in the given direction.
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
 * Determines whether to advance/retreat slide or if current section
 * is taller than the screen and should continue native scrolling.
 */
export function canAdvanceSlide(section, direction, windowHeight) {
  if (!section) return true;
  const wHeight = windowHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
  const rect = typeof section.getBoundingClientRect === 'function' ? section.getBoundingClientRect() : section;

  if (!rect || typeof rect.height !== 'number') return true;

  if (rect.height > wHeight + 8) {
    // If section is taller than screen:
    if (direction > 0) {
      // Downward: only advance if bottom edge is already visible
      if (rect.bottom > wHeight + 8) {
        return false;
      }
    } else if (direction < 0) {
      // Upward: only advance if top edge is already on screen
      if (rect.top < -8) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Determines if a wheel event should be intercepted to change slides.
 */
export function shouldInterceptWheel(e, { isReducedMotion, windowHeight, currentSection, minDelta = 5 } = {}) {
  if (!e) return false;
  if (e.ctrlKey || e.metaKey) return false;

  const reduce = isReducedMotion ?? (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  if (reduce) return false;

  if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return false;
  if (Math.abs(e.deltaY) <= minDelta) return false;

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
 * Finds the index of the section currently dominating the screen.
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
 * Pure decision: which section to align window to when an element receives keyboard focus.
 * Returns target section if alignment is needed (|rect.top| > 2), or null if already aligned
 * or if section is taller than screen and element is already visible.
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
 * Determines whether to realign current slide after resize/zoom event.
 * prev and cur have the shape { width, height, dpr }.
 */
export function shouldRealignOnResize({ prev, cur, coarse = false } = {}) {
  if (!prev || !cur) return false;
  const desktop = cur.width >= 768;
  if ((prev.width >= 768) !== desktop) return true;
  if (cur.width !== prev.width || cur.dpr !== prev.dpr) return true;
  if (coarse) return false;
  if (desktop) {
    return cur.height !== prev.height;
  }
  return Math.abs(cur.height - prev.height) >= 96;
}
