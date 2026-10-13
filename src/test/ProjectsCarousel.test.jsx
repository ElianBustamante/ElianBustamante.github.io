import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import i18n from '../i18n'
import ProjectsCarousel from '../components/ProjectsCarousel'

import ProjectCard from '../components/ProjectCard'

describe('ProjectsCarousel', () => {
  beforeEach(() => {
    i18n.changeLanguage('es')
    // Mock ResizeObserver
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  test('renderiza las 3 tarjetas con sus nombres en español', () => {
    render(<ProjectsCarousel />)
    expect(screen.getByText(/Games Deal Tracker/i)).toBeInTheDocument()
    expect(screen.getByText(/Price Alert Bot/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Pipeline/i)[0]).toBeInTheDocument()
  })

  test('al cambiar a inglés, los nombres y descripciones cambian', () => {
    render(<ProjectsCarousel />)
    act(() => {
      i18n.changeLanguage('en')
    })
    expect(screen.getByText(i18n.t('projects.items.pipeline3d.name'))).toBeInTheDocument()
  })

  test('con scrollWidth <= clientWidth, los botones anterior/siguiente no existen', () => {
    // Need to render and mock scrollWidth and clientWidth
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 1000 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1000 })
    fireEvent.scroll(list) // Trigger checkScroll
    expect(screen.queryByLabelText('Proyecto anterior')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Proyecto siguiente')).not.toBeInTheDocument()
  })

  test('con scrollWidth > clientWidth, el botón siguiente llama a scrollBy con un left positivo', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })
    
    const mockChild = { scrollIntoView: vi.fn() }
    
    // Also mock firstElementChild clientWidth for scroll amount
    Object.defineProperty(list, 'children', {
      configurable: true,
      value: [mockChild, mockChild, mockChild]
    })
    
    fireEvent.scroll(list) // Update state to show buttons
    
    const nextBtn = screen.getAllByRole('button', { name: /Siguiente/i })[0]
    fireEvent.click(nextBtn)
    
    expect(mockChild.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    }))
  })

  test('scrollIntoView se llama con inline: "start" para coincidir con snap-start', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })

    const mockChild0 = { scrollIntoView: vi.fn(), clientWidth: 200 }
    const mockChild1 = { scrollIntoView: vi.fn(), clientWidth: 200 }
    Object.defineProperty(list, 'children', {
      configurable: true,
      value: [mockChild0, mockChild1]
    })
    Object.defineProperty(list, 'firstElementChild', {
      configurable: true,
      value: mockChild0
    })

    fireEvent.scroll(list)

    const nextBtn = screen.getByRole('button', { name: 'Proyecto siguiente' })
    fireEvent.click(nextBtn)

    expect(mockChild1.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    })
  })

  test('tarjeta con repoUrl: null y demoUrl: null no renderiza pie, y con repoUrl renderiza el enlace con rel', () => {
    const projectEmpty = {
      id: 'gamesDealTracker',
      image: null,
      tags: ['T1'],
      repoUrl: null,
      demoUrl: null
    }
    const { container: c1 } = render(<ProjectCard project={projectEmpty} />)
    expect(c1.querySelector('a')).not.toBeInTheDocument()

    const projectLink = {
      id: 'gamesDealTracker',
      image: null,
      tags: ['T1'],
      repoUrl: 'https://github.com/test',
      demoUrl: null
    }
    const { container: c2 } = render(<ProjectCard project={projectLink} />)
    const link = c2.querySelector('a')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  test('el ul incluye las clases short:py-6, short:-mt-6 y short:-mb-6 para que el grupo termine en el borde inferior', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('short:py-6')
    expect(list.className).toContain('short:-mt-6')
    expect(list.className).toContain('short:-mb-6')
    expect(list.className).not.toContain('short:-mb-3')
    expect(list.className).not.toContain('short:my-auto')
    expect(list.className).toContain('scroll-px-4')
    expect(list.className).not.toContain('md:scroll-px-6')
    expect(list.className).not.toContain('lg:scroll-px-8')
    expect(list.className).toContain('[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]')
    expect(list.className).toContain('[-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]')
  })

  test('contador en pantalla baja: se oculta el inferior y se muestra en la cabecera entre las flechas', () => {
    const { container } = render(<ProjectsCarousel />)
    const section = container.querySelector('section#proyectos')
    expect(section.className).not.toContain('short:h-[100dvh]')
    expect(section.className).toContain('short:justify-center!')

    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })
    fireEvent.scroll(list)

    // Contador de abajo
    const bottomCounterDiv = container.querySelector('div.mt-4')
    expect(bottomCounterDiv.className).toContain('short:hidden')
    expect(bottomCounterDiv.className).not.toContain('short:block')
    expect(bottomCounterDiv.className).not.toContain('short:m-2')
    expect(bottomCounterDiv.className).not.toContain('[@media(max-height:330px)]:hidden')

    const bottomSpan = bottomCounterDiv.querySelector('span')
    expect(bottomSpan.className).not.toContain('short:text-xs')

    // Contador de la cabecera (actions)
    const headerCounter = container.querySelector('span.tabular-nums')
    expect(headerCounter).toBeInTheDocument()
    expect(headerCounter.className).toContain('hidden')
    expect(headerCounter.className).toContain('short:block')
    expect(headerCounter.className).toContain('min-w-[2.75rem]')
    expect(headerCounter.className).toContain('text-center')
    expect(headerCounter.className).toContain('text-xs')
    expect(headerCounter.className).toContain('font-medium')
    expect(headerCounter.className).toContain('text-muted')
    expect(headerCounter.className).toContain('tabular-nums')
    expect(headerCounter.textContent).toBe('1 / 3')
  })
})
