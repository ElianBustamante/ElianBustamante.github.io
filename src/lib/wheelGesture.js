/**
 * Detección de gestos de rueda/touchpad para cambiar de diapositiva.
 * Una rueda o un touchpad generan decenas de eventos por gesto (con "cola" de inercia).
 * Esta máquina de estados decide cuándo un evento inicia un cambio de sección
 * y cuándo es solo la continuación (inercia) del gesto anterior.
 */

export const WHEEL = {
  IDLE_MS: 120, // una pausa mayor a esto separa dos gestos
  TRIGGER_PX: 30, // recorrido acumulado mínimo para que un gesto cambie de sección
  ACCEL_MIN_PX: 24, // un evento más grande que esto y que crece rápido = nuevo gesto
  ACCEL_RATIO: 1.8, // cuánto debe superar al promedio reciente (la inercia siempre decrece)
  EMA_ALPHA: 0.3
}

/** Normaliza deltaY a píxeles (deltaMode: 0 píxeles, 1 líneas, 2 páginas). */
export function normalizeWheelDelta(e, pageHeight = 800) {
  const mode = e?.deltaMode ?? 0
  const dy = e?.deltaY ?? 0
  if (mode === 1) return dy * 40
  if (mode === 2) return dy * pageHeight
  return dy
}

export function createWheelGesture(opts = {}) {
  const cfg = { ...WHEEL, ...opts }
  let lastTime = -Infinity
  let ema = 0 // promedio móvil del tamaño reciente de los eventos
  let lastDir = 0
  let acc = 0
  let handled = false

  const reset = () => {
    handled = false
    acc = 0
  }

  return {
    /**
     * Evento que controlamos nosotros (preventDefault).
     * busy = hay una transición en curso. Devuelve +1/-1 si debe cambiar de sección, 0 si no.
     */
    push({ delta, time, busy = false }) {
      const abs = Math.abs(delta)
      const dir = Math.sign(delta)
      const gap = time - lastTime
      const accelerating = abs >= cfg.ACCEL_MIN_PX && abs > ema * cfg.ACCEL_RATIO
      const reversed = lastDir !== 0 && dir !== 0 && dir !== lastDir && abs >= cfg.ACCEL_MIN_PX
      lastTime = time
      ema = gap > cfg.IDLE_MS ? abs : ema + cfg.EMA_ALPHA * (abs - ema)
      if (dir !== 0) lastDir = dir

      if (busy) {
        // Todo lo que llega durante la transición (incluida la inercia) se descarta
        handled = true
        acc = 0
        return 0
      }
      if (gap > cfg.IDLE_MS || accelerating || reversed) reset()
      if (handled) return 0

      acc += abs
      if (acc < cfg.TRIGGER_PX) return 0
      handled = true
      return dir
    },

    /** Evento que dejamos pasar al navegador (scroll interno, sección alta, diálogo...). */
    consume({ delta = 0, time }) {
      lastTime = time
      ema = Math.abs(delta)
      if (delta !== 0) lastDir = Math.sign(delta)
      handled = true
      acc = 0
    }
  }
}
