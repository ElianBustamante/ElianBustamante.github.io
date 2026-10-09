import { render, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Navbar from '../components/Navbar'
import i18n from '../i18n'

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    i18n.changeLanguage('es')
    // Mock IntersectionObserver
    global.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it('al abrir el menú móvil, el foco va al primer enlace del panel; Escape cierra y devuelve el foco al botón', async () => {
    const user = userEvent.setup()
    const { container } = render(<Navbar />)

    const menuButton = container.querySelector('header button[aria-controls="mobile-menu"]')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    const mobileMenu = document.getElementById('mobile-menu')
    expect(mobileMenu).toBeInTheDocument()

    const firstLink = mobileMenu.querySelector('a')
    expect(firstLink).toHaveFocus()

    // Escape cierra y devuelve el foco
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveFocus()
  })

  it('cierra el menú móvil al tocar fuera (pointerdown)', async () => {
    const user = userEvent.setup()
    const { container } = render(<Navbar />)

    const menuButton = container.querySelector('header button[aria-controls="mobile-menu"]')
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.pointerDown(document.body)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
