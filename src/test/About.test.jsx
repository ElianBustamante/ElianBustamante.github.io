import { render, screen, cleanup, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import About from '../components/About'
import i18n from '../i18n'
import es from '../i18n/locales/es.json'
import en from '../i18n/locales/en.json'
import { skills } from '../data/site'

describe('About', () => {
  beforeEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('es')
    })
  })

  afterEach(() => {
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

  it('renders the 3 technology groups and all skill values without translating them', () => {
    render(<About />)

    expect(screen.getByRole('heading', { level: 3, name: es.about.skills.title })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.languages })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.databases })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: es.about.skills.tools })).toBeInTheDocument()

    const allSkills = [...skills.languages, ...skills.databases, ...skills.tools]
    for (const tech of allSkills) {
      expect(screen.getByText(tech)).toBeInTheDocument()
    }
  })
})
