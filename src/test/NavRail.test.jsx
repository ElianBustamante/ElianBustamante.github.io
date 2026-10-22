import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import NavRail from '../components/NavRail'
import React from 'react'
import i18n from '../i18n'
import { SHORT_SCREEN_QUERY } from '../lib/media'

describe('NavRail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    i18n.changeLanguage('es')
  })

  it('toggles menu button aria-expanded', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    const menuButton = screen.getByRole('button', { name: /menú/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes panel with Escape and returns focus', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    const menuButton = screen.getByRole('button', { name: /menú/i })
    await user.click(menuButton)
    
    // Panel should be open
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    
    // Focus should be on first link per NavRail code (EB logo or first item in list)
    const firstLink = screen.getAllByRole('link', { name: /inicio/i, hidden: true })[1] // The menu item
    // Wait, the code focuses `menuRef.current.querySelector('a')`, which is the first item inside rail-menu.
    expect(firstLink).toHaveFocus()
    
    // Press Escape
    await user.keyboard('{Escape}')
    
    // Panel should be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    // Focus should return to button
    expect(menuButton).toHaveFocus()
  })

  it('contains the 5 links and CTA', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    // Open menu to render panel
    const menuButton = screen.getByRole('button', { name: /menú/i })
    await user.click(menuButton)
    
    // 1 EB link on the rail
    // 5 links in the panel: inicio, proyectos, fotografia, sobre mi, contacto
    // 1 CTA in the panel: contáctame
    
    expect(screen.getByRole('link', { name: /proyectos/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /fotografía/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sobre mí/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contáctame/i, hidden: true })).toBeInTheDocument()
  })

  it('switches language with LanguageToggle', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    const langButton = screen.getByRole('button', { name: 'EN: Cambiar idioma a inglés' })
    expect(langButton).toBeInTheDocument()
    
    await user.click(langButton)
    
    // When switching to English, button should say "ES: Switch language to Spanish"
    expect(screen.getByRole('button', { name: 'ES: Switch language to Spanish' })).toBeInTheDocument()
  })

  it('closes menu when pointerdown occurs outside', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)

    const menuButton = screen.getByRole('button', { name: /menú/i })
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.pointerDown(document.body)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes menu when rail media query no longer matches', async () => {
    let changeHandler = null
    const mqlMock = {
      matches: true,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') changeHandler = handler
      }),
      removeEventListener: vi.fn(),
    }
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === SHORT_SCREEN_QUERY) {
        return mqlMock
      }
      return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    })

    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)

    const menuButton = screen.getByRole('button', { name: /menú/i })
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    // Media query leaves
    act(() => {
      if (changeHandler) {
        changeHandler({ matches: false })
      }
    })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('SHORT_SCREEN_QUERY contains both landscape conditions (<=600px and <=1023px with <=660px)', () => {
    expect(SHORT_SCREEN_QUERY).toContain('(orientation: landscape) and (max-height: 600px)')
    expect(SHORT_SCREEN_QUERY).toContain('(orientation: landscape) and (max-width: 1023px) and (max-height: 660px)')
  })

  it('rail includes classes short:flex and hidden', () => {
    const { container } = render(<NavRail activeId="inicio" />)
    const nav = container.querySelector('nav')
    expect(nav.className).toContain('short:flex')
    expect(nav.className).toContain('hidden')
  })

  it('at start, previous button exists but is disabled, invisible, and with aria-hidden', () => {
    const { container } = render(<NavRail activeId="inicio" />)
    const prevButton = container.querySelector('button[aria-label="Sección anterior"]')
    expect(prevButton).toBeInTheDocument()
    expect(prevButton).toBeDisabled()
    expect(prevButton).toHaveAttribute('tabIndex', '-1')
    expect(prevButton).toHaveAttribute('aria-hidden', 'true')
    expect(prevButton.className).toContain('invisible')
    expect(prevButton.className).toContain('pointer-events-none')

    const nextButton = screen.getByRole('button', { name: /siguiente sección/i })
    expect(nextButton).not.toBeDisabled()
    expect(nextButton.className).not.toContain('invisible')
  })

  it('at contact, next button exists but is disabled, invisible, and with aria-hidden', () => {
    const { container } = render(<NavRail activeId="contacto" canPrev={true} canNext={false} />)
    const nextButton = container.querySelector('button[aria-label="Siguiente sección"]')
    expect(nextButton).toBeInTheDocument()
    expect(nextButton).toBeDisabled()
    expect(nextButton).toHaveAttribute('tabIndex', '-1')
    expect(nextButton).toHaveAttribute('aria-hidden', 'true')
    expect(nextButton.className).toContain('invisible')
    expect(nextButton.className).toContain('pointer-events-none')

    const prevButton = screen.getByRole('button', { name: /sección anterior/i })
    expect(prevButton).not.toBeDisabled()
    expect(prevButton.className).not.toContain('invisible')
  })

  it('arrows use correct animations: ^ uses animate-bounce-up and v uses animate-bounce', () => {
    render(<NavRail activeId="proyectos" canPrev={true} canNext={true} />)
    const prevButton = screen.getByRole('button', { name: /sección anterior/i })
    const nextButton = screen.getByRole('button', { name: /siguiente sección/i })

    expect(prevButton.className).toContain('motion-safe:animate-bounce-up')
    expect(nextButton.className).toContain('motion-safe:animate-bounce')
    expect(nextButton.className).not.toContain('motion-safe:animate-bounce-up')
  })

  it('handlePrev and handleNext call scrollToElement according to section positions', () => {
    const sec1 = document.createElement('section')
    sec1.id = 'inicio'
    sec1.getBoundingClientRect = () => ({ top: -800, bottom: 0 })
    sec1.scrollIntoView = vi.fn()

    const sec2 = document.createElement('section')
    sec2.id = 'proyectos'
    sec2.getBoundingClientRect = () => ({ top: 0, bottom: 800 })
    sec2.scrollIntoView = vi.fn()

    const sec3 = document.createElement('section')
    sec3.id = 'contacto'
    sec3.getBoundingClientRect = () => ({ top: 800, bottom: 1600 })
    sec3.scrollIntoView = vi.fn()

    document.body.appendChild(sec1)
    document.body.appendChild(sec2)
    document.body.appendChild(sec3)

    render(<NavRail activeId="proyectos" canPrev={true} canNext={true} />)

    const prevButton = screen.getByRole('button', { name: /sección anterior/i })
    fireEvent.click(prevButton)
    expect(sec1.scrollIntoView).toHaveBeenCalled()

    const nextButton = screen.getByRole('button', { name: /siguiente sección/i })
    fireEvent.click(nextButton)
    expect(sec3.scrollIntoView).toHaveBeenCalled()

    document.body.removeChild(sec1)
    document.body.removeChild(sec2)
    document.body.removeChild(sec3)
  })
})
