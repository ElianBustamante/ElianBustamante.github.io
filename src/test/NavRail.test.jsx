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
})
