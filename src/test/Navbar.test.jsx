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

  it('when opening mobile menu, focus moves to first link in panel; Escape closes and returns focus to button', async () => {
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

    // Escape closes and returns focus
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveFocus()
  })

  it('closes mobile menu on outside touch (pointerdown)', async () => {
    const user = userEvent.setup()
    const { container } = render(<Navbar />)

    const menuButton = container.querySelector('header button[aria-controls="mobile-menu"]')
    await user.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')

    fireEvent.pointerDown(document.body)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('top header includes class short:hidden', () => {
    const { container } = render(<Navbar />)
    const header = container.querySelector('header')
    expect(header.className).toContain('short:hidden')
  })
})
