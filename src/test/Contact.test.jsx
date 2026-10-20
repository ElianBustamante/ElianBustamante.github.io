import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Contact from '../components/Contact'
import i18n from '../i18n'
import { site } from '../data/site'

describe('Contact', () => {
  const originalClipboard = navigator.clipboard

  beforeEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('es')
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true,
    })
    cleanup()
  })

  it('renders only one mailto link (the main email button) and shows the plain email address', () => {
    const { container } = render(<Contact />)

    const emailBtn = screen.getByRole('link', { name: 'Enviar correo' })
    expect(emailBtn).toHaveAttribute('href', 'mailto:elian.bustamante.obreque@gmail.com')

    const mailtoLinks = container.querySelectorAll('a[href^="mailto:"]')
    expect(mailtoLinks).toHaveLength(1)

    expect(screen.getByText('elian.bustamante.obreque@gmail.com')).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'elian.bustamante.obreque@gmail.com' })
    ).not.toBeInTheDocument()
  })

  it('GitHub and LinkedIn buttons open in new tab with rel="noopener noreferrer"', () => {
    render(<Contact />)

    const githubLink = screen.getByRole('link', { name: 'GitHub' })
    expect(githubLink).toHaveAttribute('href', site.githubUrl)
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')

    const linkedinLink = screen.getByRole('link', { name: 'LinkedIn' })
    expect(linkedinLink).toHaveAttribute('href', site.linkedinUrl)
    expect(linkedinLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render buttons when URL or email is invalid', () => {
    render(
      <Contact
        siteData={{
          name: 'Elian Bustamante',
          email: 'invalid-email',
          githubUrl: 'http://insecure.example.com',
          linkedinUrl: null,
        }}
      />
    )

    expect(screen.queryByRole('link', { name: 'Enviar correo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copiar correo' })).not.toBeInTheDocument()
  })

  it('email button has col-span-2 class and renders updated Spanish contact text', () => {
    render(<Contact />)

    const emailBtn = screen.getByRole('link', { name: 'Enviar correo' })
    expect(emailBtn.className).toContain('col-span-2')
    expect(
      screen.getByText('¿Quieres conversar sobre un proyecto o una colaboración? Escríbeme.')
    ).toBeInTheDocument()
  })

  it('contact card has border-accent/40', () => {
    render(<Contact />)
    const text = screen.getByText(
      '¿Quieres conversar sobre un proyecto o una colaboración? Escríbeme.'
    )
    expect(text.parentElement.className).toContain('border-accent/40')
  })

  it('clicking "Copiar correo" calls navigator.clipboard.writeText, shows "Copiado", and resets after 2s', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(<Contact />)

    const copyBtn = screen.getByRole('button', { name: 'Copiar correo' })
    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(writeText).toHaveBeenCalledWith('elian.bustamante.obreque@gmail.com')
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByRole('button', { name: 'Copiar correo' })).toBeInTheDocument()
  })

  it('if writeText rejects, does not show "Copiado" and does not throw an error', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Clipboard denied'))
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    })

    render(<Contact />)

    const copyBtn = screen.getByRole('button', { name: 'Copiar correo' })
    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(writeText).toHaveBeenCalledWith('elian.bustamante.obreque@gmail.com')
    expect(screen.queryByRole('button', { name: 'Copiado' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar correo' })).toBeInTheDocument()
  })

  it('email row does not have -mb-2.5, has gap-y-3, and copy button has -my-3 and min-h-[44px]', () => {
    render(<Contact />)

    const copyBtn = screen.getByRole('button', { name: 'Copiar correo' })
    expect(copyBtn.className).not.toContain('px-3')
    expect(copyBtn.className).not.toContain('rounded-full')
    expect(copyBtn.className).toContain('px-0')
    expect(copyBtn.className).toContain('rounded-md')
    expect(copyBtn.className).toContain('-my-3')
    expect(copyBtn.className).toContain('min-h-[44px]')
    expect(copyBtn.parentElement.className).not.toContain('-mb-2.5')
    expect(copyBtn.parentElement.className).toContain('gap-y-3')
  })
})
