import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import About from '../components/About'
import Hero from '../components/Hero'
import i18n from '../i18n'
import es from '../i18n/locales/es.json'
import en from '../i18n/locales/en.json'
import { skills } from '../data/site'
import { ABOUT_PAGED_QUERY } from '../lib/media'

describe('About', () => {
  const originalMatchMedia = window.matchMedia
  const originalScrollTo = HTMLElement.prototype.scrollTo

  beforeEach(async () => {
    window.matchMedia = originalMatchMedia
    HTMLElement.prototype.scrollTo = vi.fn()
    await act(async () => {
      await i18n.changeLanguage('es')
    })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
    HTMLElement.prototype.scrollTo = originalScrollTo
    cleanup()
  })

  it('renders the 3 paragraphs in Spanish and switches to English when language changes', async () => {
    render(<About />)

    expect(screen.getByText(es.about.p1)).toBeInTheDocument()
    expect(screen.getByText(es.about.p2)).toBeInTheDocument()
    expect(screen.getByText(es.about.p3)).toBeInTheDocument()

    await act(async () => {
      await i18n.changeLanguage('en')
    })

    expect(screen.getByText(en.about.p1)).toBeInTheDocument()
    expect(screen.getByText(en.about.p2)).toBeInTheDocument()
    expect(screen.getByText(en.about.p3)).toBeInTheDocument()
  })

  it('does not have or render about.p4 text', () => {
    expect(es.about).not.toHaveProperty('p4')
    expect(en.about).not.toHaveProperty('p4')

    const { container } = render(<About />)
    expect(container.textContent).not.toMatch(/Busco oportunidades|looking for junior opportunities/i)
  })

  it('about.p1..p3 and hero.subtitle/education exist, are non-empty, match the updated copy, do not contain job-seeking or experience words in es and en, and en.json does not contain Informatics Engineering', () => {
    expect(es.about.p1).toBe(
      'Actualmente vivo en el sur de Chile, donde me titulé en Ingeniería Informática en la Universidad de La Frontera, en Temuco.'
    )
    expect(es.about.p2).toBe(
      'Me gusta convertir ideas en herramientas que resuelvan problemas concretos. Algunas de ellas están en este portafolio.'
    )
    expect(es.about.p3).toBe(
      'Fuera de la informática, mi pasatiempo principal es la fotografía, sobre todo de paisajes. La galería de esta página es una selección de algunas de mis fotografías.'
    )
    expect(es.hero.subtitle).toBe('Software y fotografía de paisaje, desde el sur de Chile.')
    expect(es.hero.education).toBe(
      'Titulado de Ingeniería Informática, Universidad de La Frontera.'
    )
    expect(es.hero).not.toHaveProperty('description')

    expect(en.about.p1).toBe(
      "I currently live in southern Chile, where I graduated with a bachelor's degree in Computer Engineering from Universidad de La Frontera, in Temuco."
    )
    expect(en.about.p2).toBe(
      'I like turning ideas into tools that solve real problems. Some of them are in this portfolio.'
    )
    expect(en.about.p3).toBe(
      'Outside of computing, my main hobby is photography, especially landscapes. The gallery on this page is a selection of some of my photographs.'
    )
    expect(en.hero.subtitle).toBe('Software and landscape photography, from southern Chile.')
    expect(en.hero.education).toBe(
      'Graduated in Computer Engineering, Universidad de La Frontera.'
    )
    expect(en.hero).not.toHaveProperty('description')

    const esForbidden = ['experiencia', 'años', 'empleo', 'oportunidad', 'busco', 'buscando']
    const enForbidden = ['experience', 'years', 'job', 'opportunit', 'looking for']

    const esTexts = [
      es.about.p1,
      es.about.p2,
      es.about.p3,
      es.hero.subtitle,
      es.hero.education,
    ]
    const enTexts = [
      en.about.p1,
      en.about.p2,
      en.about.p3,
      en.hero.subtitle,
      en.hero.education,
    ]

    for (const text of esTexts) {
      expect(typeof text).toBe('string')
      expect(text.trim().length).toBeGreaterThan(0)
      for (const word of esForbidden) {
        expect(text.toLowerCase()).not.toContain(word)
      }
    }

    for (const text of enTexts) {
      expect(typeof text).toBe('string')
      expect(text.trim().length).toBeGreaterThan(0)
      for (const word of enForbidden) {
        expect(text.toLowerCase()).not.toContain(word)
      }
    }

    expect(JSON.stringify(en)).not.toMatch(/informatics engineering/i)
  })

  it('Hero renders education in a single <p> with text-pretty (not text-balance) and hero-in in es and en, keeps subtitle and both buttons, and includes short-portrait spacing classes', async () => {
    const { container } = render(<Hero />)

    const section = container.querySelector('#inicio')
    expect(section.className).toContain('pt-32')
    expect(section.className).toContain('pb-20')
    expect(section.className).toContain('short:pb-8')
    expect(section.className).toContain('short:pt-3')
    expect(section.className).toContain('[@media(orientation:portrait)_and_(max-height:700px)]:pt-24')
    expect(section.className).toContain('[@media(orientation:portrait)_and_(max-height:700px)]:pb-16')

    const subtitle = screen.getByText(es.hero.subtitle)
    expect(subtitle.className).toContain('mt-6')
    expect(subtitle.className).toContain('[@media(orientation:portrait)_and_(max-height:700px)]:mt-4')

    const ctaBtn = screen.getByRole('link', { name: es.hero.ctaProjects })
    const photoBtn = screen.getByRole('link', { name: es.hero.ctaPhotography })
    expect(ctaBtn).toBeInTheDocument()
    expect(photoBtn).toBeInTheDocument()
    const buttonsContainer = ctaBtn.parentElement
    expect(buttonsContainer.className).toContain('mt-8')
    expect(buttonsContainer.className).toContain(
      '[@media(orientation:portrait)_and_(max-height:700px)]:mt-6'
    )

    const pEduEs = screen.getByText(es.hero.education)
    expect(pEduEs.tagName).toBe('P')
    expect(pEduEs.className).toContain('text-pretty')
    expect(pEduEs.className).not.toContain('text-balance')
    expect(pEduEs.className).toContain('hero-in')
    expect(pEduEs.className).toContain('mt-4')
    expect(pEduEs.className).toContain('[@media(max-height:500px)]:mt-2')
    expect(section.querySelectorAll('p')).toHaveLength(2)

    await act(async () => {
      await i18n.changeLanguage('en')
    })

    const pEduEn = screen.getByText(en.hero.education)
    expect(pEduEn).toBe(pEduEs)
    expect(section.querySelectorAll('p')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /siguiente sección/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sección anterior/i })).not.toBeInTheDocument()
  })

  it('renders the 4 technology groups and all skill values without translating them', () => {
    render(<About />)

    expect(screen.getByRole('heading', { level: 3, name: es.about.skills.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.languages })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.frameworks })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.databases })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.tools })).toBeInTheDocument()

    const visibleItems = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(visibleItems).toContain('FastAPI')
    expect(visibleItems).toContain('PostgreSQL')
    expect(visibleItems).toContain('TypeScript')
    expect(visibleItems).toContain('ChromaDB')
    expect(visibleItems).toContain('Node.js')

    const allSkills = [
      ...skills.languages,
      ...skills.frameworks,
      ...skills.databases,
      ...skills.tools,
    ]
    for (const tech of allSkills) {
      expect(visibleItems).toContain(tech)
    }
  })

  it('site.js skills groups have no duplicates (case-insensitive) and do not contain Structured Text', () => {
    for (const group of Object.values(skills)) {
      const lowered = group.map((item) => item.toLowerCase())
      expect(new Set(lowered).size).toBe(group.length)
      for (const item of group) {
        expect(item.toLowerCase()).not.toContain('structured text')
      }
    }
  })

  it('with mocked layout (container 200, capsules 60, +N 30, gap 8), each technology group renders a single-line subset of capsules and a "+N" button', () => {
    const origClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
    const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        if (this.tagName === 'DIV' && this.className.includes('relative')) {
          return 200
        }
        return 0
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        if (this.tagName === 'LI') {
          return this.textContent.startsWith('+') ? 30 : 60
        }
        return 0
      },
    })

    try {
      const { container } = render(<About />)

      // At container width 200 with 60px capsules, 30px +N button, and gap of 8 (maxLines=1):
      // each of the 4 groups renders 2 visible capsules and a "+N" button
      const plusButtons = [
        screen.getByRole('button', {
          name: `${skills.languages.length - 2} tecnologías más: ${skills.languages.slice(2).join(', ')}`,
        }),
        screen.getByRole('button', {
          name: `${skills.frameworks.length - 2} tecnologías más: ${skills.frameworks.slice(2).join(', ')}`,
        }),
        screen.getByRole('button', {
          name: `${skills.databases.length - 2} tecnologías más: ${skills.databases.slice(2).join(', ')}`,
        }),
        screen.getByRole('button', {
          name: `${skills.tools.length - 2} tecnologías más: ${skills.tools.slice(2).join(', ')}`,
        }),
      ]
      expect(plusButtons).toHaveLength(4)

      const visibleLists = container.querySelectorAll('ul[role="list"]')
      expect(visibleLists).toHaveLength(4)
      const groups = [skills.languages, skills.frameworks, skills.databases, skills.tools]
      visibleLists.forEach((ul, i) => {
        const chipTexts = Array.from(ul.querySelectorAll('li'))
          .map((li) => li.textContent)
          .filter((t) => !t.startsWith('+'))
        expect(chipTexts).toEqual(groups[i].slice(0, 2))
      })
    } finally {
      if (origClientWidth) {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', origClientWidth)
      } else {
        delete HTMLElement.prototype.clientWidth
      }
      if (origOffsetWidth) {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', origOffsetWidth)
      } else {
        delete HTMLElement.prototype.offsetWidth
      }
    }
  })

  it('in non-paged mode (matches=false), does not render prev/next buttons', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    render(<About />)

    expect(screen.queryByRole('button', { name: es.about.prev })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: es.about.next })).not.toBeInTheDocument()
  })

  it('in paged mode (matches=true), shows "1 / 2", uses scrollTo with top 0 on next/prev without calling scrollIntoView, and resets scrollTop to 0 on scroll', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === ABOUT_PAGED_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { container } = render(<About />)

    expect(screen.getAllByText('1 / 2').length).toBeGreaterThan(0)

    const prevBtn = screen.getByRole('button', { name: es.about.prev })
    const nextBtn = screen.getByRole('button', { name: es.about.next })

    expect(prevBtn).toBeDisabled()
    expect(nextBtn).not.toBeDisabled()

    const pager = container.querySelector('.snap-x')
    Object.defineProperty(pager, 'scrollWidth', { value: 800, configurable: true })
    Object.defineProperty(pager, 'clientWidth', { value: 400, configurable: true })
    let scrollLeftValue = 0
    let scrollTopValue = 48
    Object.defineProperty(pager, 'scrollLeft', {
      get: () => scrollLeftValue,
      set: (v) => {
        scrollLeftValue = v
      },
      configurable: true,
    })
    Object.defineProperty(pager, 'scrollTop', {
      get: () => scrollTopValue,
      set: (v) => {
        scrollTopValue = v
      },
      configurable: true,
    })

    const secondChild = pager.children[1]
    secondChild.scrollIntoView = vi.fn()

    fireEvent.click(nextBtn)
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
      left: 800,
      top: 0,
      behavior: 'smooth',
    })
    expect(secondChild.scrollIntoView).not.toHaveBeenCalled()

    scrollLeftValue = 400
    fireEvent.scroll(pager)
    expect(pager.scrollTop).toBe(0)
    expect(prevBtn).not.toBeDisabled()

    fireEvent.click(prevBtn)
    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 0,
      behavior: 'smooth',
    })
  })

  it('without matchMedia (normal two-column mode), the text column has class pt-2.5', () => {
    delete window.matchMedia
    render(<About />)
    const p1 = screen.getByText(es.about.p1)
    expect(p1.parentElement.className).toContain('pt-2.5')
  })

  it('with matchMedia mocked to matches=true (paged mode), the text column does not have class pt-4', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === ABOUT_PAGED_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    render(<About />)
    const p1 = screen.getByText(es.about.p1)
    expect(p1.parentElement.className).not.toContain('pt-4')
  })

  it('the three paragraphs have class max-w-[65ch] and the text column does not have it', () => {
    render(<About />)
    const p1 = screen.getByText(es.about.p1)
    const p2 = screen.getByText(es.about.p2)
    const p3 = screen.getByText(es.about.p3)

    expect(p1.className).toContain('max-w-[65ch]')
    expect(p2.className).toContain('max-w-[65ch]')
    expect(p3.className).toContain('max-w-[65ch]')
    expect(p1.parentElement.className).not.toContain('max-w-[65ch]')
  })

  it('with matchMedia mocked to matches=true (paged mode), the container has class gap-8', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === ABOUT_PAGED_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { container } = render(<About />)
    const pager = container.querySelector('.snap-x')
    expect(pager.className).toContain('gap-8')
  })

  it('the skills panel has compact:px-4 and [@media(min-height:441px)]:compact:p-4', () => {
    render(<About />)
    const heading = screen.getByRole('heading', { level: 3, name: es.about.skills.title })
    const panel = heading.parentElement
    expect(panel.className).toContain('compact:px-4')
    expect(panel.className).toContain('[@media(min-height:441px)]:compact:p-4')
  })

  it('text card has border-accent/40 and backdrop-blur-[6px], and shares pt-2.5 and compact:pt-2 with skills panel', () => {
    render(<About />)
    const p1 = screen.getByText(es.about.p1)
    const textCard = p1.parentElement
    const heading = screen.getByRole('heading', { level: 3, name: es.about.skills.title })
    const panel = heading.parentElement

    expect(textCard.className).toContain('border-accent/40')
    expect(textCard.className).toContain('backdrop-blur-[6px]')
    expect(textCard.className).toContain('pt-2.5')
    expect(panel.className).toContain('pt-2.5')
    expect(textCard.className).toContain('compact:pt-2')
    expect(panel.className).toContain('compact:pt-2')
  })

  it('container has items-start in both normal two-column mode and paged mode', () => {
    delete window.matchMedia
    const { unmount } = render(<About />)
    const textCardNormal = screen.getByText(es.about.p1).parentElement
    expect(textCardNormal.parentElement.className).toContain('items-start')
    expect(textCardNormal.parentElement.className).not.toContain('items-stretch')
    unmount()

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === ABOUT_PAGED_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    render(<About />)
    const textCardPaged = screen.getByText(es.about.p1).parentElement
    expect(textCardPaged.parentElement.className).toContain('items-start')
  })

  it('paragraphs have short:text-[clamp( and max-[400px]:text-[0.9375rem]', () => {
    render(<About />)
    const paragraphs = [
      screen.getByText(es.about.p1),
      screen.getByText(es.about.p2),
      screen.getByText(es.about.p3),
    ]
    for (const p of paragraphs) {
      expect(p.className).toContain('short:text-[clamp(')
      expect(p.className).toContain('max-[400px]:text-[0.9375rem]')
    }
  })

  it('in paged mode, the bottom counter has portrait max-height 760px sr-only class', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === ABOUT_PAGED_QUERY,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    render(<About />)
    const counters = screen.getAllByText('1 / 2')
    const bottomCounter = counters[counters.length - 1]
    expect(bottomCounter.className).toContain(
      '[@media(orientation:portrait)_and_(max-height:760px)]:sr-only'
    )
    expect(bottomCounter.parentElement.className).toContain(
      '[@media(orientation:portrait)_and_(max-height:760px)]:sr-only'
    )
  })
})
