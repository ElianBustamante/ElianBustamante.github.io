import { render, screen, fireEvent, act } from '@testing-library/react'
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
    const { container } = render(<ProjectCard project={project} />)

    const visibleChips = Array.from(container.querySelectorAll('div.flex-nowrap > span')).map((s) => s.textContent.trim())
    expect(visibleChips).toEqual(['discord.py', 'aiohttp', 'curl-cffi'])
    expect(visibleChips).not.toContain('SQLite')
    expect(screen.getByRole('button', { name: /\+2|tecnologías más/i })).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /\+2|tecnologías más/i })
    fireEvent.mouseEnter(btn)

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('SQLite, pytest')
    expect(screen.getByRole('heading', { level: 3 })).toHaveAttribute('title', 'Games Deal Tracker')
  })

  it('con <640px muestra discord.py, aiohttp, "+3" y el tooltip "curl-cffi, SQLite, pytest"', () => {
    mockMatchMedia(false)
    const { container } = render(<ProjectCard project={project} />)

    const visibleChips = Array.from(container.querySelectorAll('div.flex-nowrap > span')).map((s) => s.textContent.trim())
    expect(visibleChips).toEqual(['discord.py', 'aiohttp'])
    expect(visibleChips).not.toContain('curl-cffi')
    expect(screen.getByRole('button', { name: /\+3|tecnologías más/i })).toBeInTheDocument()

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
    expect(desc.className).toContain('compact:flex-none')
  })

  it('limita la altura mínima en móvil con tope de 400px (clamp(340px,52dvh,400px))', () => {
    const { container } = render(<ProjectCard project={project} />)
    const article = container.querySelector('article')
    expect(article.className).toContain('max-md:min-h-[clamp(340px,52dvh,400px)]')
    expect(article.className).not.toContain('max-md:min-h-[clamp(340px,52dvh,520px)]')
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

  it('respaldo con clientWidth 0 sigue mostrando 3 o 2 chips según el ancho de la ventana', () => {
    mockMatchMedia(true)
    const { container: cDesktop } = render(<ProjectCard project={project} />)
    const desktopChips = Array.from(cDesktop.querySelectorAll('div.flex-nowrap > span')).map((s) => s.textContent.trim())
    expect(desktopChips).toHaveLength(3)
    expect(desktopChips).toEqual(['discord.py', 'aiohttp', 'curl-cffi'])

    mockMatchMedia(false)
    const { container: cMobile } = render(<ProjectCard project={project} />)
    const mobileChips = Array.from(cMobile.querySelectorAll('div.flex-nowrap > span')).map((s) => s.textContent.trim())
    expect(mobileChips).toHaveLength(2)
    expect(mobileChips).toEqual(['discord.py', 'aiohttp'])
  })

  it('el ResizeObserver observa el contenedor y todos los hijos de la fila de medición', () => {
    mockMatchMedia(true)
    const observeMock = vi.fn()
    const origRO = window.ResizeObserver
    window.ResizeObserver = class {
      observe = observeMock
      unobserve = vi.fn()
      disconnect = vi.fn()
    }

    render(<ProjectCard project={project} />)
    expect(observeMock).toHaveBeenCalled()
    // 1 contenedor + 5 chips + 1 indicador "+5" = 7 observaciones
    expect(observeMock.mock.calls.length).toBeGreaterThanOrEqual(7)

    window.ResizeObserver = origRO
  })

  it('al pasar el mouse sobre la tarjeta o sobre el botón +N, la cantidad de chips no cambia', () => {
    mockMatchMedia(true)
    const { container } = render(<ProjectCard project={project} />)
    const btn = screen.getByRole('button', { name: /\+2|tecnologías más/i })

    const getChips = () => Array.from(container.querySelectorAll('div.flex-nowrap > span')).map((s) => s.textContent.trim())
    expect(getChips()).toEqual(['discord.py', 'aiohttp', 'curl-cffi'])

    fireEvent.mouseEnter(btn)
    expect(getChips()).toEqual(['discord.py', 'aiohttp', 'curl-cffi'])
    expect(screen.getByRole('button', { name: /\+2|tecnologías más/i })).toBeInTheDocument()

    fireEvent.mouseLeave(btn)
    expect(getChips()).toEqual(['discord.py', 'aiohttp', 'curl-cffi'])
  })

  it('renderiza repoUrl y demoUrl solo si empiezan con https://', () => {
    const projectHttp = {
      id: 'gamesDealTracker',
      image: null,
      tags: ['Python'],
      repoUrl: 'http://insecure.com',
      demoUrl: 'ftp://insecure.com',
    }
    const { container: c1 } = render(<ProjectCard project={projectHttp} />)
    expect(c1.querySelector('a')).not.toBeInTheDocument()

    const projectHttps = {
      id: 'gamesDealTracker',
      image: null,
      tags: ['Python'],
      repoUrl: 'https://github.com/test',
      demoUrl: 'https://demo.com',
    }
    const { container: c2 } = render(<ProjectCard project={projectHttps} />)
    const links = c2.querySelectorAll('a')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://github.com/test')
    expect(links[1]).toHaveAttribute('href', 'https://demo.com')
  })

  it('muestra demoLabel desde i18n ("Invitar Bot" / "Invite bot") o fallback a viewDemo', () => {
    act(() => {
      i18n.changeLanguage('es')
    })
    const projectWithCustom = {
      id: 'gamesDealTracker',
      image: null,
      tags: ['Python'],
      repoUrl: null,
      demoUrl: 'https://discord.com',
    }
    const { rerender } = render(<ProjectCard project={projectWithCustom} />)
    expect(screen.getByRole('link', { name: 'Invitar Bot' })).toBeInTheDocument()

    act(() => {
      i18n.changeLanguage('en')
      rerender(<ProjectCard project={projectWithCustom} />)
    })
    expect(screen.getByRole('link', { name: 'Invite bot' })).toBeInTheDocument()

    const projectFallback = {
      id: 'aiMemoryAssistant',
      image: null,
      tags: ['Python'],
      repoUrl: null,
      demoUrl: 'https://demo.com',
    }
    act(() => {
      rerender(<ProjectCard project={projectFallback} />)
    })
    expect(screen.getByRole('link', { name: 'View demo' })).toBeInTheDocument()

    act(() => {
      i18n.changeLanguage('es')
      rerender(<ProjectCard project={projectFallback} />)
    })
    expect(screen.getByRole('link', { name: 'Ver demo' })).toBeInTheDocument()
  })

  it('renderiza el ícono IconChatSpark cuando project.icon es "chat"', () => {
    const projectChat = {
      id: 'aiMemoryAssistant',
      image: null,
      icon: 'chat',
      tags: ['Python'],
      repoUrl: null,
      demoUrl: null,
    }
    const { container } = render(<ProjectCard project={projectChat} />)
    const path = container.querySelector('path[d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"]')
    expect(path).toBeInTheDocument()
  })
})



