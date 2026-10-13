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

  it('resaltado de tarjeta: usa has-[:focus-visible] y no focus-within; tras clic con mouse en "+N", la tarjeta no tiene clases de foco persistente con mouse', () => {
    mockMatchMedia(true)
    const { container } = render(<ProjectCard project={project} />)
    const article = container.querySelector('article')
    const btn = screen.getByRole('button', { name: /\+2|tecnologías más/i })

    // 1. La tarjeta tiene clases de foco condicional por teclado (:focus-visible), no focus-within
    expect(article.className).toContain('has-[:focus-visible]:border-accent')
    expect(article.className).not.toContain('focus-within:border-accent')
    expect(article.className).not.toContain('focus-within:')

    // 2. Tras clic con mouse en "+N", la tarjeta no adquiere ninguna clase o atributo de resaltado persistente
    fireEvent.click(btn)
    expect(article.className).not.toContain('focus-within:border-accent')
    expect(article.classList.contains('border-accent')).toBe(false)
    expect(article.className).toContain('has-[:focus-visible]:border-accent')

    // 3. Con foco en un elemento interactivo (teclado), el botón está enfocado dentro de la tarjeta
    btn.focus()
    expect(document.activeElement).toBe(btn)
    expect(article.contains(btn)).toBe(true)
    expect(article.className).toContain('has-[:focus-visible]:border-accent')
  })

  it('incluye clases compact prioritarias con modificador ! en article y descripción', () => {
    const { container } = render(<ProjectCard project={project} />)
    const article = container.querySelector('article')
    expect(article.className).not.toContain('compact:h-auto!')
    expect(article.className).toContain('compact:min-h-0!')

    const desc = container.querySelector('p.text-muted')
    expect(desc.className).toContain('compact:line-clamp-2!')
  })

  it('el contenedor del cuerpo incluye [@media(max-height:360px)]:p-3.5!', () => {
    const { container } = render(<ProjectCard project={project} />)
    const body = container.querySelector('div.flex-1.flex-col')
    expect(body.className).toContain('[@media(max-height:360px)]:p-3.5!')
  })

  it('oculta chips de tecnologías solo en landscape con max-height:420px', () => {
    const { container } = render(<ProjectCard project={project} />)
    const chipsWrapper = container.querySelector('div.flex-nowrap')
    expect(chipsWrapper.className).toContain('[@media(orientation:landscape)_and_(max-height:420px)]:hidden')
    expect(chipsWrapper.className).not.toContain('compact:hidden')
  })

  it('usa la sombra reducida shadow-[0_8px_20px_rgba(255,106,26,0.12)] en hover, foco y tarjeta activa', () => {
    const { container, rerender } = render(<ProjectCard project={project} isActive={false} />)
    const article = container.querySelector('article')
    expect(article.className).toContain('has-[:focus-visible]:shadow-[0_8px_20px_rgba(255,106,26,0.12)]')
    expect(article.className).toContain('lg:hover:shadow-[0_8px_20px_rgba(255,106,26,0.12)]')
    expect(article.className).not.toContain('shadow-[0_12px_32px_rgba(255,106,26,0.12)]')

    rerender(<ProjectCard project={project} isActive={true} />)
    expect(article.className).toContain('max-lg:shadow-[0_8px_20px_rgba(255,106,26,0.12)]')
  })
})

