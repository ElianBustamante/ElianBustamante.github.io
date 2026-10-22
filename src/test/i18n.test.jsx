import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'

describe('i18n functionality', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = ''
    vi.resetModules()
  })

  afterEach(() => {
    cleanup()
  })

  it('defaults to Spanish and can switch to English', async () => {
    const { default: App } = await import('../App')
    await import('../i18n/index') // trigger i18n init

    render(<App />)

    // Check defaults
    expect(document.documentElement.lang).toBe('es')
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Capturando paisajes.')

    // Find and click language toggle (there are two, one mobile, one desktop, so we getAll and click the first)
    const user = userEvent.setup()
    const toggles = screen.getAllByRole('button', { name: 'EN: Cambiar idioma a inglés' })
    await user.click(toggles[0])

    // Check English
    expect(document.documentElement.lang).toBe('en')
    expect(h1).toHaveTextContent('Capturing landscapes.')
    expect(localStorage.getItem('lang')).toBe('en')
  })

  it('starts in English if localStorage has lang=en', async () => {
    localStorage.setItem('lang', 'en')
    const { default: App } = await import('../App')
    await import('../i18n/index') // trigger i18n init

    render(<App />)

    expect(document.documentElement.lang).toBe('en')
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Capturing landscapes.')
  })
})
