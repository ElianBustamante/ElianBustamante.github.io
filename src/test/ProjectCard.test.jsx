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

  it('with >=640px shows discord.py, aiohttp, curl-cffi, "+2" and tooltip says "SQLite, pytest"', () => {
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

  it('with <640px shows discord.py, aiohttp, "+3" and tooltip "curl-cffi, SQLite, pytest"', () => {
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

  it('behavior: hover does not close on click, mouseleave closes; focus opens, click toggles, blur closes; touch toggles; escape, outside click, scroll, and resize close', () => {
    mockMatchMedia(true)
    render(<ProjectCard project={project} />)

    const btn = screen.getByRole('button', { name: /\+2|tecnologías más/i })

    // 1. Hover opens
    fireEvent.mouseEnter(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 2. Mouse click after hover does NOT close it
    fireEvent.click(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 3. Mouseleave closes
    fireEvent.mouseLeave(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 4. Focus opens
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 5. Keyboard/focus click toggles (closes)
    fireEvent.click(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // Click toggles again (opens)
    fireEvent.click(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // 6. Blur closes
    fireEvent.blur(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 7. Touch opens and closes (toggles)
    fireEvent.touchStart(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.touchStart(btn)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 8. Escape closes
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 9. Click outside closes
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 10. Scroll closes
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent.scroll(document)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // 11. Resize closes
    fireEvent.focus(btn)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    fireEvent(window, new Event('resize'))
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('card highlighting: uses has-[:focus-visible] and not focus-within; after mouse click on "+N", card does not have persistent mouse focus classes', () => {
    mockMatchMedia(true)
    const { container } = render(<ProjectCard project={project} />)
    const article = container.querySelector('article')
    const btn = screen.getByRole('button', { name: /\+2|tecnologías más/i })

    // 1. Card has keyboard conditional focus classes (:focus-visible), not focus-within
    expect(article.className).toContain('has-[:focus-visible]:border-accent')
    expect(article.className).not.toContain('focus-within:border-accent')
    expect(article.className).not.toContain('focus-within:')

    // 2. After mouse click on "+N", card does not acquire any persistent highlight class or attribute
    fireEvent.click(btn)
    expect(article.className).not.toContain('focus-within:border-accent')
    expect(article.classList.contains('border-accent')).toBe(false)
    expect(article.className).toContain('has-[:focus-visible]:border-accent')

    // 3. With focus on an interactive element (keyboard), button is focused inside the card
    btn.focus()
    expect(document.activeElement).toBe(btn)
    expect(article.contains(btn)).toBe(true)
    expect(article.className).toContain('has-[:focus-visible]:border-accent')
  })

  it('includes compact priority classes with ! modifier on article and description', () => {
    const { container } = render(<ProjectCard project={project} />)
    const article = container.querySelector('article')
    expect(article.className).not.toContain('compact:h-auto!')
    expect(article.className).toContain('compact:min-h-0!')

    const desc = container.querySelector('p.text-muted')
    expect(desc.className).toContain('compact:line-clamp-2!')
    expect(desc.className).toContain('compact:flex-none')
  })

  it('limits minimum height on mobile capped at 400px (clamp(340px,52dvh,400px))', () => {
    const { container } = render(<ProjectCard project={project} />)
    const article = container.querySelector('article')
    expect(article.className).toContain('max-md:min-h-[clamp(340px,52dvh,400px)]')
    expect(article.className).not.toContain('max-md:min-h-[clamp(340px,52dvh,520px)]')
  })

  it('body container includes [@media(max-height:360px)]:p-3.5!', () => {
    const { container } = render(<ProjectCard project={project} />)
    const body = container.querySelector('div.flex-1.flex-col')
    expect(body.className).toContain('[@media(max-height:360px)]:p-3.5!')
  })

  it('hides technology chips only in landscape with max-height:420px', () => {
    const { container } = render(<ProjectCard project={project} />)
    const chipsWrapper = container.querySelector('div.flex-nowrap')
    expect(chipsWrapper.className).toContain('[@media(orientation:landscape)_and_(max-height:420px)]:hidden')
    expect(chipsWrapper.className).not.toContain('compact:hidden')
  })

  it('uses reduced box-shadow shadow-[0_8px_20px_rgba(255,106,26,0.12)] on hover, focus, and active card', () => {
    const { container, rerender } = render(<ProjectCard project={project} isActive={false} />)
    const article = container.querySelector('article')
    expect(article.className).toContain('has-[:focus-visible]:shadow-[0_8px_20px_rgba(255,106,26,0.12)]')
    expect(article.className).toContain('lg:hover:shadow-[0_8px_20px_rgba(255,106,26,0.12)]')
    expect(article.className).not.toContain('shadow-[0_12px_32px_rgba(255,106,26,0.12)]')

    rerender(<ProjectCard project={project} isActive={true} />)
    expect(article.className).toContain('max-lg:shadow-[0_8px_20px_rgba(255,106,26,0.12)]')
  })

  it('fallback with clientWidth 0 still displays 3 or 2 chips based on window width', () => {
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

  it('ResizeObserver observes container and all children of measurement row', () => {
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
    // 1 container + 5 chips + 1 "+5" indicator = 7 observations
    expect(observeMock.mock.calls.length).toBeGreaterThanOrEqual(7)

    window.ResizeObserver = origRO
  })

  it('hovering over card or +N button does not change chip count', () => {
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

  it('renders repoUrl and demoUrl only if they start with https://', () => {
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

  it('displays demoLabel from i18n ("Invitar Bot" / "Invite bot") or falls back to viewDemo', () => {
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

  it('renders IconChatSpark icon when project.icon is "chat"', () => {
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



