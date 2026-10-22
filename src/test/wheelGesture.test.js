import { describe, it, expect } from 'vitest'
import { createWheelGesture, normalizeWheelDelta } from '../lib/wheelGesture'

const ANIM = 600 // simulated section transition duration (ms)

// Replays an event sequence like App.jsx: busy during transition duration
function run(events) {
  const g = createWheelGesture()
  let busyUntil = -1
  const triggers = []
  for (const ev of events) {
    const dir = g.push({ delta: ev.d, time: ev.t, busy: ev.t < busyUntil })
    if (dir !== 0) {
      triggers.push({ t: ev.t, dir })
      busyUntil = ev.t + ANIM
    }
  }
  return triggers
}

// Touchpad flick: ramp up + decaying inertia tail
function flick(t0, { peak = 100, tailMs = 1500, step = 8, sign = 1 } = {}) {
  const ev = []
  let t = t0
  for (const d of [1, 2, 4, 7, 12, 20, 32, 48, 70, 90, peak]) {
    ev.push({ t, d: sign * d })
    t += step
  }
  const tau = tailMs / 6
  for (let ms = 0; ms < tailMs; ms += step) {
    ev.push({ t, d: sign * Math.max(1, Math.round(peak * Math.exp(-ms / tau))) })
    t += step
  }
  return { ev, end: t }
}

describe('createWheelGesture', () => {
  it('strong flick with long inertia tail changes a single section', () => {
    expect(run(flick(0).ev)).toHaveLength(1)
  })

  it('gentle flick changes a single section', () => {
    expect(run(flick(0, { peak: 40, tailMs: 800 }).ev)).toHaveLength(1)
  })

  it('two flicks separated by a pause change two sections', () => {
    const a = flick(0)
    const b = flick(a.end + 300)
    expect(run([...a.ev, ...b.ev])).toHaveLength(2)
  })

  it('second flick starting during first flick tail is recognized as new gesture', () => {
    const a = flick(0)
    const b = flick(900, { tailMs: 1200 })
    const events = [...a.ev.filter((e) => e.t < 900), ...b.ev]
    expect(run(events)).toHaveLength(2)
  })

  it('slow drag of small events (3px) changes a single section', () => {
    const events = Array.from({ length: 60 }, (_, i) => ({ t: i * 16, d: 3 }))
    expect(run(events)).toHaveLength(1)
  })

  it('isolated small events (noise) do not change section', () => {
    expect(run([{ t: 0, d: 2 }, { t: 500, d: 2 }, { t: 1000, d: -3 }])).toHaveLength(0)
  })

  it('single mouse wheel tick changes one section', () => {
    expect(run([{ t: 0, d: 100 }])).toEqual([{ t: 0, dir: 1 }])
  })

  it('mouse wheel spinning fast (5 ticks in 160 ms) changes only one section', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({ t: i * 40, d: 100 }))
    expect(run(events)).toHaveLength(1)
  })

  it('three mouse wheel ticks separated by 900 ms change three sections', () => {
    const events = Array.from({ length: 3 }, (_, i) => ({ t: i * 900, d: 100 }))
    expect(run(events)).toHaveLength(3)
  })

  it('scrolling down then up respects direction of each gesture', () => {
    const a = flick(0)
    const b = flick(a.end + 300, { tailMs: 1000, sign: -1 })
    expect(run([...a.ev, ...b.ev]).map((x) => x.dir)).toEqual([1, -1])
  })

  it('event passed through to browser (consume) exhausts active gesture', () => {
    const g = createWheelGesture()
    g.consume({ delta: 40, time: 0 })
    expect(g.push({ delta: 40, time: 20 })).toBe(0)
    expect(g.push({ delta: 40, time: 400 })).toBe(1) // after a pause it is a new gesture
  })
})

describe('normalizeWheelDelta', () => {
  it('converts lines and pages to pixels', () => {
    expect(normalizeWheelDelta({ deltaMode: 0, deltaY: 53 })).toBe(53)
    expect(normalizeWheelDelta({ deltaMode: 1, deltaY: 3 })).toBe(120)
    expect(normalizeWheelDelta({ deltaMode: 2, deltaY: 1 }, 900)).toBe(900)
    expect(normalizeWheelDelta(undefined)).toBe(0)
  })
})
