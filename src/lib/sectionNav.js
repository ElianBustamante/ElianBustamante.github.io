import { scrollToElement, settleScroll } from './scroll'
import { getPrevSectionIndex, getNextSectionIndex } from './sections'

export function goToPrevSection() {
  const sections = Array.from(document.querySelectorAll('section[id]'))
  if (!sections.length) return
  const rects = sections.map((sec) => sec.getBoundingClientRect())
  const targetIdx = getPrevSectionIndex(rects)
  scrollToElement(sections[targetIdx])
  settleScroll(sections[targetIdx])
}

export function goToNextSection() {
  const sections = Array.from(document.querySelectorAll('section[id]'))
  if (!sections.length) return
  const rects = sections.map((sec) => sec.getBoundingClientRect())
  const targetIdx = getNextSectionIndex(rects)
  scrollToElement(sections[targetIdx])
  settleScroll(sections[targetIdx])
}
