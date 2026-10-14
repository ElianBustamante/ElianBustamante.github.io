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

  it('alterna el aria-expanded del botón de menú', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    const menuButton = screen.getByRole('button', { name: /menú/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('cierra el panel con Escape y devuelve el foco', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    const menuButton = screen.getByRole('button', { name: /menú/i })
    await user.click(menuButton)
    
    // Panel should be open
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    
    // Foco debería estar en el primer enlace según el código de NavRail (el EB logo, o el primer item de la lista)
    const firstLink = screen.getAllByRole('link', { name: /inicio/i, hidden: true })[1] // The menu item
    // Wait, the code focuses `menuRef.current.querySelector('a')`, which is the first item inside rail-menu.
    expect(firstLink).toHaveFocus()
    
    // Press Escape
    await user.keyboard('{Escape}')
    
    // Panel should be closed
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    // Foco debe regresar al botón
    expect(menuButton).toHaveFocus()
  })

  it('contiene los 5 enlaces y el CTA', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    // Abrir menú para que renderice el panel
    const menuButton = screen.getByRole('button', { name: /menú/i })
    await user.click(menuButton)
    
    // 1 enlace EB en el riel
    // 5 enlaces en el panel: inicio, proyectos, fotografia, sobre mi, contacto
    // 1 CTA en el panel: contáctame
    
    expect(screen.getByRole('link', { name: /proyectos/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /fotografía/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sobre mí/i, hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contáctame/i, hidden: true })).toBeInTheDocument()
  })

  it('cambia de idioma con LanguageToggle', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)
    
    const langButton = screen.getByRole('button', { name: /cambiar idioma a inglés/i })
    expect(langButton).toBeInTheDocument()
    
    await user.click(langButton)
    
    // Al cambiar a inglés, el botón debe decir "Switch language to Spanish"
    expect(screen.getByRole('button', { name: /switch language to spanish/i })).toBeInTheDocument()
  })

  it('cierra el menú al hacer pointerdown fuera', async () => {
    const user = userEvent.setup()
    render(<NavRail activeId="inicio" />)

    const menuButton = screen.getByRole('button', { name: /menú/i })
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.pointerDown(document.body)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('cierra el menú cuando la media query del riel deja de cumplirse', async () => {
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

  it('SHORT_SCREEN_QUERY contiene ambas condiciones apaisadas (<=520px y <=1023px con <=660px)', () => {
    expect(SHORT_SCREEN_QUERY).toContain('(orientation: landscape) and (max-height: 520px)')
    expect(SHORT_SCREEN_QUERY).toContain('(orientation: landscape) and (max-width: 1023px) and (max-height: 660px)')
  })

  it('el riel incluye la clase short:flex y hidden', () => {
    const { container } = render(<NavRail activeId="inicio" />)
    const nav = container.querySelector('nav')
    expect(nav.className).toContain('short:flex')
    expect(nav.className).toContain('hidden')
  })

  it('en inicio, el botón anterior existe pero está disabled, invisible y con aria-hidden', () => {
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

  it('en contacto, el botón siguiente existe pero está disabled, invisible y con aria-hidden', () => {
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

  it('las flechas usan las animaciones correctas: ^ usa animate-bounce-up y v usa animate-bounce', () => {
    render(<NavRail activeId="proyectos" canPrev={true} canNext={true} />)
    const prevButton = screen.getByRole('button', { name: /sección anterior/i })
    const nextButton = screen.getByRole('button', { name: /siguiente sección/i })

    expect(prevButton.className).toContain('motion-safe:animate-bounce-up')
    expect(nextButton.className).toContain('motion-safe:animate-bounce')
    expect(nextButton.className).not.toContain('motion-safe:animate-bounce-up')
  })

  it('handlePrev y handleNext llaman a scrollToElement según las posiciones de las secciones', () => {
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
