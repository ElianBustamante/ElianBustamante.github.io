import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import About from '../components/About'
import i18n from '../i18n'
import es from '../i18n/locales/es.json'
import en from '../i18n/locales/en.json'
import { skills } from '../data/site'
import { ABOUT_PAGED_QUERY } from '../lib/media'

describe('About', () => {
  const originalMatchMedia = window.matchMedia

  beforeEach(async () => {
    window.matchMedia = originalMatchMedia
    await act(async () => {
      await i18n.changeLanguage('es')
    })
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
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

  it('in paged mode (matches=true), shows "1 / 2", disables prev button, and clicking next calls scrollIntoView on the second child', () => {
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
    const secondChild = pager.children[1]
    secondChild.scrollIntoView = vi.fn()

    fireEvent.click(nextBtn)
    expect(secondChild.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  })

  it('without matchMedia (normal two-column mode), the text column has class pt-4', () => {
    delete window.matchMedia
    render(<About />)
    const p1 = screen.getByText(es.about.p1)
    expect(p1.parentElement.className).toContain('pt-4')
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
})
