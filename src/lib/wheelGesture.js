/**
 * Detection of wheel/touchpad gestures for slide navigation.
 * A wheel or touchpad emits dozens of events per gesture (with inertial tail).
 * This state machine decides when an event starts a section change
 * and when it is merely continuation (inertia) of the previous gesture.
 */

export const WHEEL = {
  IDLE_MS: 120, // pause longer than this separates two gestures
  TRIGGER_PX: 30, // minimum accumulated travel for a gesture to trigger a section change
  ACCEL_MIN_PX: 24, // an event larger than this that accelerates = new gesture
  ACCEL_RATIO: 1.8, // threshold ratio over recent average (inertia always decays)
  EMA_ALPHA: 0.3
}

/** Normalizes deltaY to pixels (deltaMode: 0 pixels, 1 lines, 2 pages). */
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
  let ema = 0 // exponential moving average of recent event magnitude
  let lastDir = 0
  let acc = 0
  let handled = false

  const reset = () => {
    handled = false
    acc = 0
  }

  return {
    /**
     * Event handled by our controller (preventDefault).
     * busy = transition in progress. Returns +1/-1 to change section, 0 otherwise.
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
        // Everything arriving during transition (including inertia) is discarded
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

    /** Event passed through to the browser (inner scroll, tall section, dialog...). */
    consume({ delta = 0, time }) {
      lastTime = time
      ema = Math.abs(delta)
      if (delta !== 0) lastDir = Math.sign(delta)
      handled = true
      acc = 0
    }
  }
}
