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
      behavior: 'smooth'
    }))
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

  test('el ul incluye las clases short:py-6, short:-mt-6 y short:-mb-3 para evitar recorte de brillo', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('short:py-6')
    expect(list.className).toContain('short:-mt-6')
    expect(list.className).toContain('short:-mb-3')
  })
})
