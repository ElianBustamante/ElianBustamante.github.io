import { render, screen, cleanup, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Contact from '../components/Contact'
import i18n from '../i18n'
import { site } from '../data/site'

describe('Contact', () => {
  beforeEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('es')
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('email button and copyable email point to mailto:elian.bustamante.obreque@gmail.com', () => {
    render(<Contact />)

    const emailBtn = screen.getByRole('link', { name: 'Enviar correo' })
    expect(emailBtn).toHaveAttribute('href', 'mailto:elian.bustamante.obreque@gmail.com')

    const emailTextLink = screen.getByRole('link', { name: 'elian.bustamante.obreque@gmail.com' })
    expect(emailTextLink).toHaveAttribute('href', 'mailto:elian.bustamante.obreque@gmail.com')
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
  })

  it('email button has col-span-2 class and renders updated Spanish contact text', () => {
    render(<Contact />)

    const emailBtn = screen.getByRole('link', { name: 'Enviar correo' })
    expect(emailBtn.className).toContain('col-span-2')
    expect(
      screen.getByText('¿Quieres conversar sobre un proyecto o una colaboración? Escríbeme.')
    ).toBeInTheDocument()
  })
})
