import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProjectCard from '../components/ProjectCard'
import i18n from '../i18n'

describe('ProjectCard +N tooltip', () => {
  const project = {
    id: 'gamesDealTracker',
    image: null,
    tags: ['Python 3.11+', 'discord.py', 'aiohttp', 'curl-cffi', 'SQLite', 'pytest'],
    repoUrl: 'https://github.com/test',
    demoUrl: null,
  }

  const mockMatchMedia = (matches) => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(min-width: 640px)' ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  }

  beforeEach(() => {
    i18n.changeLanguage('es')
    vi.clearAllMocks()
  })

  it('con >=640px muestra discord.py, aiohttp, curl-cffi, "+2" y el tooltip dice "SQLite, pytest"', () => {
    mockMatchMedia(true)
    render(<ProjectCard project={project} />)

    expect(screen.getByText('discord.py')).toBeInTheDocument()
    expect(screen.getByText('aiohttp')).toBeInTheDocument()
    expect(screen.getByText('curl-cffi')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /\+2|tecnologías más/i })
    fireEvent.mouseEnter(btn)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('SQLite, pytest')
    expect(screen.getByRole('heading', { level: 3 })).toHaveAttribute('title', 'Games Deal Tracker')
  })

  it('con <640px muestra discord.py, aiohttp, "+3" y el tooltip "curl-cffi, SQLite, pytest"', () => {
    mockMatchMedia(false)
    render(<ProjectCard project={project} />)

    expect(screen.getByText('discord.py')).toBeInTheDocument()
    expect(screen.getByText('aiohttp')).toBeInTheDocument()
    expect(screen.queryByText('curl-cffi')).not.toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /\+3|tecnologías más/i })
    fireEvent.mouseEnter(btn)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('curl-cffi, SQLite, pytest')
  })

  it('comportamiento: hover no cierra con clic, mouseleave cierra; focus abre, click alterna, blur cierra; toque alterna; escape, click fuera, scroll y resize cierran', () => {
    mockMatchMedia(true)
    render(<ProjectCard project={project} />)

    const btn = screen.getByRole('button', { name: /\+2|tecnologías más/i })

    // 1. Hover abre
    fireEvent.mouseEnter(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 2. Clic con mouse tras hover NO lo cierra
    fireEvent.click(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 3. Mouseleave cierra
    fireEvent.mouseLeave(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 4. Foco abre
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 5. Clic con teclado/foco alterna (cierra)
    fireEvent.click(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // Clic alterna de nuevo (abre)
    fireEvent.click(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 6. Blur cierra
    fireEvent.blur(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 7. Toque abre y cierra (alterna)
    fireEvent.touchStart(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.touchStart(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 8. Escape cierra
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 9. Clic fuera cierra
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 10. Scroll cierra
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.scroll(document)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 11. Resize cierra
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent(window, new Event('resize'))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
