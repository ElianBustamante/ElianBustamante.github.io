import { describe, it, expect } from 'vitest'
import { createWheelGesture, normalizeWheelDelta } from './wheelGesture'

const ANIM = 600 // duración simulada de la transición de sección (ms)

// Reproduce una secuencia de eventos como lo hace App.jsx: busy mientras dura la transición
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

// Flick de touchpad: rampa de subida + cola de inercia que decae
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
  it('un flick fuerte con cola larga de inercia cambia una sola sección', () => {
    expect(run(flick(0).ev)).toHaveLength(1)
  })

  it('un flick suave cambia una sola sección', () => {
    expect(run(flick(0, { peak: 40, tailMs: 800 }).ev)).toHaveLength(1)
  })

  it('dos flicks separados por una pausa cambian dos secciones', () => {
    const a = flick(0)
    const b = flick(a.end + 300)
    expect(run([...a.ev, ...b.ev])).toHaveLength(2)
  })

  it('un segundo flick que empieza durante la cola del primero se reconoce como gesto nuevo', () => {
    const a = flick(0)
    const b = flick(900, { tailMs: 1200 })
    const events = [...a.ev.filter((e) => e.t < 900), ...b.ev]
    expect(run(events)).toHaveLength(2)
  })

  it('un arrastre lento de eventos pequeños (3px) cambia una sola sección', () => {
    const events = Array.from({ length: 60 }, (_, i) => ({ t: i * 16, d: 3 }))
    expect(run(events)).toHaveLength(1)
  })

  it('eventos pequeños aislados (ruido) no cambian de sección', () => {
    expect(run([{ t: 0, d: 2 }, { t: 500, d: 2 }, { t: 1000, d: -3 }])).toHaveLength(0)
  })

  it('un clic de rueda de mouse cambia una sección', () => {
    expect(run([{ t: 0, d: 100 }])).toEqual([{ t: 0, dir: 1 }])
  })

  it('un mouse girando rápido (5 clics en 160 ms) cambia una sola sección', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({ t: i * 40, d: 100 }))
    expect(run(events)).toHaveLength(1)
  })

  it('tres clics de mouse separados por 900 ms cambian tres secciones', () => {
    const events = Array.from({ length: 3 }, (_, i) => ({ t: i * 900, d: 100 }))
    expect(run(events)).toHaveLength(3)
  })

  it('bajar y luego subir respeta la dirección de cada gesto', () => {
    const a = flick(0)
    const b = flick(a.end + 300, { tailMs: 1000, sign: -1 })
    expect(run([...a.ev, ...b.ev]).map((x) => x.dir)).toEqual([1, -1])
  })

  it('un evento que dejamos pasar al navegador (consume) gasta el gesto en curso', () => {
    const g = createWheelGesture()
    g.consume({ delta: 40, time: 0 })
    expect(g.push({ delta: 40, time: 20 })).toBe(0)
    expect(g.push({ delta: 40, time: 400 })).toBe(1) // tras una pausa es un gesto nuevo
  })
})

describe('normalizeWheelDelta', () => {
  it('convierte líneas y páginas a píxeles', () => {
    expect(normalizeWheelDelta({ deltaMode: 0, deltaY: 53 })).toBe(53)
    expect(normalizeWheelDelta({ deltaMode: 1, deltaY: 3 })).toBe(120)
    expect(normalizeWheelDelta({ deltaMode: 2, deltaY: 1 }, 900)).toBe(900)
    expect(normalizeWheelDelta(undefined)).toBe(0)
  })
})
