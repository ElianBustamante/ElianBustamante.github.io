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

  it('about.p1..p3 and hero.subtitle/education/description exist, are non-empty, match the updated copy, do not contain job-seeking or experience words in es and en, and en.json does not contain Informatics Engineering', () => {
    expect(es.about.p1).toBe(
      'Vivo en el sur de Chile, donde me titulé en Ingeniería Informática en la Universidad de La Frontera.'
    )
    expect(es.about.p2).toBe(
      'Me gusta convertir ideas en herramientas que resuelvan problemas concretos. Dos de ellas están en este portafolio: un bot de Discord que sigue ofertas de videojuegos y otro de WhatsApp, de uso personal, que busca productos con descuento en tiendas en línea.'
    )
    expect(es.about.p3).toBe(
      'Fuera de la informática, mi pasatiempo principal es la fotografía, sobre todo de paisajes. La galería de esta página es una selección de mis fotos.'
    )
    expect(es.hero.subtitle).toBe('Software y fotografía de paisaje, desde el sur de Chile.')
    expect(es.hero.education).toBe(
      'Titulado de Ingeniería Informática, Universidad de La Frontera (Temuco).'
    )
    expect(es.hero.description).toBe(
      'A continuación, los proyectos que he desarrollado y una selección de mis fotografías.'
    )

    expect(en.about.p1).toBe(
      "I live in southern Chile, where I graduated with a bachelor's degree in Computer Engineering from Universidad de La Frontera."
    )
    expect(en.about.p2).toBe(
      'I like turning ideas into tools that solve real problems. Two of them are in this portfolio: a Discord bot that tracks video game deals and a WhatsApp bot for personal use that looks for discounted products in online stores.'
    )
    expect(en.about.p3).toBe(
      'Outside of computing, my main hobby is photography, especially landscapes. The gallery on this page is a selection of my photos.'
    )
    expect(en.hero.subtitle).toBe('Software and landscape photography, from southern Chile.')
    expect(en.hero.education).toBe(
      'Graduated in Computer Engineering, Universidad de La Frontera (Temuco).'
    )
    expect(en.hero.description).toBe(
      "Below are the projects I've developed and a selection of my photographs."
    )

    const esForbidden = ['experiencia', 'años', 'empleo', 'oportunidad', 'busco', 'buscando']
    const enForbidden = ['experience', 'years', 'job', 'opportunit', 'looking for']

    const esTexts = [
      es.about.p1,
      es.about.p2,
      es.about.p3,
      es.hero.subtitle,
      es.hero.education,
      es.hero.description,
    ]
    const enTexts = [
      en.about.p1,
      en.about.p2,
      en.about.p3,
      en.hero.subtitle,
      en.hero.education,
      en.hero.description,
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

  it('Hero renders education and description in two <p> with text-pretty (not text-balance) inside a space-y-3 container in es and en', async () => {
    render(<Hero />)

    const pEduEs = screen.getByText(es.hero.education)
    const pDescEs = screen.getByText(es.hero.description)
    const wrapper = pEduEs.parentElement

    expect(wrapper).toBe(pDescEs.parentElement)
    expect(wrapper.className).toContain('space-y-3')
    expect(wrapper.className).toContain('[@media(max-height:500px)]:space-y-1.5')
    expect(wrapper.querySelectorAll('p')[0]).toBe(pEduEs)
    expect(wrapper.querySelectorAll('p')[1]).toBe(pDescEs)

    for (const p of [pEduEs, pDescEs]) {
      expect(p.className).toContain('text-pretty')
      expect(p.className).not.toContain('text-balance')
    }

    await act(async () => {
      await i18n.changeLanguage('en')
    })

    const pEduEn = screen.getByText(en.hero.education)
    const pDescEn = screen.getByText(en.hero.description)
    expect(wrapper.querySelectorAll('p')[0]).toBe(pEduEn)
    expect(wrapper.querySelectorAll('p')[1]).toBe(pDescEn)
  })

  it('renders the 4 technology groups and all skill values without translating them', () => {
    render(<About />)

    expect(screen.getByRole('heading', { level: 3, name: es.about.skills.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.languages })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.frameworks })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.databases })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.tools })).toBeInTheDocument()

    expect(screen.getByText('FastAPI')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()

    const allSkills = [
      ...skills.languages,
      ...skills.frameworks,
      ...skills.databases,
      ...skills.tools,
    ]
    for (const tech of allSkills) {
      expect(screen.getByText(tech)).toBeInTheDocument()
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
