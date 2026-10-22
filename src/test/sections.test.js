import { describe, it, expect } from 'vitest'
import {
  getActiveSectionIndex,
  getPrevSectionIndex,
  getNextSectionIndex,
  canGoPrev,
  canGoNext,
} from '../lib/sections'

describe('sections pure navigation logic', () => {
  it('empty or null array returns 0 and false without throwing error', () => {
    expect(getActiveSectionIndex([], 800)).toBe(0)
    expect(getActiveSectionIndex(null, 800)).toBe(0)
    expect(getPrevSectionIndex([])).toBe(0)
    expect(getPrevSectionIndex(null)).toBe(0)
    expect(getNextSectionIndex([])).toBe(0)
    expect(getNextSectionIndex(null)).toBe(0)
    expect(canGoPrev([])).toBe(false)
    expect(canGoPrev(null)).toBe(false)
    expect(canGoNext([])).toBe(false)
    expect(canGoNext(null)).toBe(false)
  })

  it('aligned exactly on a section', () => {
    // Viewport 800, line at 800 * 0.4 = 320
    const rects = [
      { top: -800, bottom: 0 },
      { top: 0, bottom: 800 },
      { top: 800, bottom: 1600 },
    ]

    // Section 1 covers 0 <= 320 and 800 > 320
    expect(getActiveSectionIndex(rects, 800)).toBe(1)
    // Last index with top < -4 is 0
    expect(getPrevSectionIndex(rects)).toBe(0)
    // First index with top > 4 is 2
    expect(getNextSectionIndex(rects)).toBe(2)
    expect(canGoPrev(rects)).toBe(true)
    expect(canGoNext(rects)).toBe(true)
  })

  it('halfway between two sections', () => {
    // Scrolling down: section 0 is exiting (top: -500, bottom: 300)
    // Section 1 is entering (top: 300, bottom: 1100). Viewport 800, line = 320.
    // Section 0: top <= 320 but bottom 300 is NOT > 320.
    // Section 1: top 300 <= 320 and bottom 1100 > 320 -> active is index 1.
    const rects = [
      { top: -500, bottom: 300 },
      { top: 300, bottom: 1100 },
      { top: 1100, bottom: 1900 },
    ]

    expect(getActiveSectionIndex(rects, 800)).toBe(1)
    // getPrevSectionIndex: last with top < -4 is 0
    expect(getPrevSectionIndex(rects)).toBe(0)
    // getNextSectionIndex: first with top > 4 is 1 (its start is down at 300px)
    expect(getNextSectionIndex(rects)).toBe(1)
    expect(canGoPrev(rects)).toBe(true)
    expect(canGoNext(rects)).toBe(true)
  })

  it('viewing only bottom part of a section taller than screen (canGoPrev must be true)', () => {
    // For example on short screen (viewportHeight 400), a 1000px high section
    // scrolled to the end: top = -600, bottom = 400.
    // The next section starts at 400.
    const rects = [
      { top: -600, bottom: 400 },
      { top: 400, bottom: 800 },
    ]

    // Line at 400 * 0.4 = 160. Section 0: -600 <= 160 and 400 > 160 -> active is 0
    expect(getActiveSectionIndex(rects, 400)).toBe(0)
    // Since top = -600 < -4, canGoPrev must be true to allow returning to start of section
    expect(canGoPrev(rects)).toBe(true)
    // getPrevSectionIndex returns index 0 to return to its start
    expect(getPrevSectionIndex(rects)).toBe(0)
    // Next section has top = 400 > 4 -> canGoNext is true and points to 1
    expect(canGoNext(rects)).toBe(true)
    expect(getNextSectionIndex(rects)).toBe(1)
  })

  it('first section: canGoPrev is false, canGoNext is true', () => {
    const rects = [
      { top: 0, bottom: 800 },
      { top: 800, bottom: 1600 },
      { top: 1600, bottom: 2400 },
    ]

    expect(getActiveSectionIndex(rects, 800)).toBe(0)
    expect(canGoPrev(rects)).toBe(false)
    expect(canGoNext(rects)).toBe(true)
    expect(getPrevSectionIndex(rects)).toBe(0)
    expect(getNextSectionIndex(rects)).toBe(1)
  })

  it('last section: canGoPrev is true, canGoNext is false', () => {
    const rects = [
      { top: -1600, bottom: -800 },
      { top: -800, bottom: 0 },
      { top: 0, bottom: 800 },
    ]

    expect(getActiveSectionIndex(rects, 800)).toBe(2)
    expect(canGoPrev(rects)).toBe(true)
    expect(canGoNext(rects)).toBe(false)
    expect(getPrevSectionIndex(rects)).toBe(1)
    expect(getNextSectionIndex(rects)).toBe(2)
  })

  it('fallback if no section crosses the line but there are sections above', () => {
    // If for any reason there is a gap or jump and none covers the line (e.g. line = 400, rects end earlier)
    const rects = [
      { top: -800, bottom: -400 },
      { top: -400, bottom: 100 },
    ]
    // Last with top <= 400 is index 1
    expect(getActiveSectionIndex(rects, 1000)).toBe(1)
  })
})
