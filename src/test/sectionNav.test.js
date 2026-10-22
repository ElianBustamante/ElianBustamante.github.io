import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { goToPrevSection, goToNextSection } from '../lib/sectionNav'
import { scrollToElement, settleScroll } from '../lib/scroll'

vi.mock('../lib/scroll', () => ({
  scrollToElement: vi.fn(),
  settleScroll: vi.fn(),
}))

describe('sectionNav helpers', () => {
  let createdSections = []

  beforeEach(() => {
    vi.clearAllMocks()
    createdSections = []
  })

  afterEach(() => {
    createdSections.forEach((sec) => {
      if (sec.parentNode) {
        sec.parentNode.removeChild(sec)
      }
    })
    createdSections = []
  })

  it('does nothing when no section elements exist in DOM', () => {
    goToPrevSection()
    expect(scrollToElement).not.toHaveBeenCalled()
    expect(settleScroll).not.toHaveBeenCalled()

    goToNextSection()
    expect(scrollToElement).not.toHaveBeenCalled()
    expect(settleScroll).not.toHaveBeenCalled()
  })

  it('goToNextSection navigates to the next section and calls scrollToElement and settleScroll', () => {
    const sec1 = document.createElement('section')
    sec1.id = 'inicio'
    sec1.getBoundingClientRect = () => ({ top: 0, bottom: 800 })

    const sec2 = document.createElement('section')
    sec2.id = 'proyectos'
    sec2.getBoundingClientRect = () => ({ top: 800, bottom: 1600 })

    const sec3 = document.createElement('section')
    sec3.id = 'contacto'
    sec3.getBoundingClientRect = () => ({ top: 1600, bottom: 2400 })

    document.body.appendChild(sec1)
    document.body.appendChild(sec2)
    document.body.appendChild(sec3)
    createdSections = [sec1, sec2, sec3]

    goToNextSection()

    expect(scrollToElement).toHaveBeenCalledWith(sec2)
    expect(settleScroll).toHaveBeenCalledWith(sec2)
  })

  it('goToPrevSection navigates to the previous section and calls scrollToElement and settleScroll', () => {
    const sec1 = document.createElement('section')
    sec1.id = 'inicio'
    sec1.getBoundingClientRect = () => ({ top: -800, bottom: 0 })

    const sec2 = document.createElement('section')
    sec2.id = 'proyectos'
    sec2.getBoundingClientRect = () => ({ top: 0, bottom: 800 })

    const sec3 = document.createElement('section')
    sec3.id = 'contacto'
    sec3.getBoundingClientRect = () => ({ top: 800, bottom: 1600 })

    document.body.appendChild(sec1)
    document.body.appendChild(sec2)
    document.body.appendChild(sec3)
    createdSections = [sec1, sec2, sec3]

    goToPrevSection()

    expect(scrollToElement).toHaveBeenCalledWith(sec1)
    expect(settleScroll).toHaveBeenCalledWith(sec1)
  })
})
