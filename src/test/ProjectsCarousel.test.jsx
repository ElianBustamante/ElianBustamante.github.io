import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
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

  test('renders the 3 cards with their names in Spanish', () => {
    render(<ProjectsCarousel />)
    expect(screen.getByText(/Games Deal Tracker/i)).toBeInTheDocument()
    expect(screen.getByText(/Price Alert Bot/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Memory Assistant/i)).toBeInTheDocument()
  })

  test('when switching to English, names and descriptions change', () => {
    render(<ProjectsCarousel />)
    act(() => {
      i18n.changeLanguage('en')
    })
    expect(screen.getByText(i18n.t('projects.items.aiMemoryAssistant.name'))).toBeInTheDocument()
  })

  test('with scrollWidth <= clientWidth, prev/next buttons do not exist', () => {
    // Need to render and mock scrollWidth and clientWidth
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 1000 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1000 })
    fireEvent.scroll(list) // Trigger checkScroll
    expect(screen.queryByLabelText('Proyecto anterior')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Proyecto siguiente')).not.toBeInTheDocument()
  })

  test('arrows update after resize event via observeScrollState', async () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Proyecto siguiente' })).toBeInTheDocument()
    })
  })

  test('with scrollWidth > clientWidth, next button calls scrollBy with positive left', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })
    
    const mockChild0 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 16 }) }
    const mockChild1 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 200 }) }
    const mockChild2 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 400 }) }
    
    // Also mock firstElementChild clientWidth for scroll amount
    Object.defineProperty(list, 'children', {
      configurable: true,
      value: [mockChild0, mockChild1, mockChild2]
    })
    
    fireEvent.scroll(list) // Update state to show buttons
    
    const nextBtn = screen.getAllByRole('button', { name: /Siguiente/i })[0]
    fireEvent.click(nextBtn)
    
    expect(mockChild1.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    }))
  })

  test('scrollIntoView is called with inline: "start" to match snap-start', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })

    const mockChild0 = { scrollIntoView: vi.fn(), clientWidth: 200, getBoundingClientRect: () => ({ left: 16 }) }
    const mockChild1 = { scrollIntoView: vi.fn(), clientWidth: 200, getBoundingClientRect: () => ({ left: 200 }) }
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

  test('card with repoUrl: null and demoUrl: null does not render footer, and with repoUrl renders link with rel', () => {
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

  test('ul includes classes short:py-6, short:-mt-6, and short:-mb-3', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('short:py-6')
    expect(list.className).toContain('short:-mt-6')
    expect(list.className).toContain('short:-mb-3')
    expect(list.className).not.toContain('short:-mb-6')
    expect(list.className).not.toContain('short:my-auto')
    expect(list.className).toContain('scroll-px-4')
    expect(list.className).not.toContain('md:scroll-px-6')
    expect(list.className).not.toContain('lg:scroll-px-8')
    expect(list.className).toContain('[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]')
    expect(list.className).toContain('[-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]')
  })

  test('li cards include short:w-[58%], short:lg:w-[calc((100%-3rem)/3)], short:min-[960px]:max-lg:w-[calc((100%-1.5rem)/2)] and class for landscape 768-1023px at 521-660px', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    const items = list.querySelectorAll('li')
    expect(items.length).toBe(3)
    items.forEach((item) => {
      expect(item.className).toContain('short:w-[58%]')
      expect(item.className).toContain('short:lg:w-[calc((100%-3rem)/3)]')
      expect(item.className).toContain('short:min-[960px]:max-lg:w-[calc((100%-1.5rem)/2)]')
      expect(item.className).toContain('[@media(orientation:landscape)_and_(min-width:768px)_and_(max-width:1023px)_and_(min-height:521px)_and_(max-height:660px)]:w-[calc((100%-1.5rem)/2)]')
    })
  })

  test('counter on short screen: bottom counter hides and header counter displays between arrows', () => {
    const { container } = render(<ProjectsCarousel />)
    const section = container.querySelector('section#proyectos')
    expect(section.className).not.toContain('short:h-[100dvh]')
    expect(section.className).toContain('short:justify-center!')

    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })
    fireEvent.scroll(list)

    // Bottom counter
    const bottomCounterDiv = container.querySelector('div.mt-4')
    expect(bottomCounterDiv.className).toContain('short:hidden')
    expect(bottomCounterDiv.className).not.toContain('short:block')
    expect(bottomCounterDiv.className).not.toContain('short:m-2')
    expect(bottomCounterDiv.className).not.toContain('[@media(max-height:330px)]:hidden')

    const bottomSpan = bottomCounterDiv.querySelector('span')
    expect(bottomSpan.className).not.toContain('short:text-xs')

    // Header counter (actions)
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

  test('at the end of scroll, counter displays the last one ("3 / 3")', () => {
    const { container } = render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })
    Object.defineProperty(list, 'scrollLeft', { configurable: true, value: 1000 })

    const mockChild0 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: -450 }) }
    const mockChild1 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 8 }) }
    const mockChild2 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 260 }) }
    Object.defineProperty(list, 'children', {
      configurable: true,
      value: [mockChild0, mockChild1, mockChild2]
    })

    fireEvent.scroll(list)

    const bottomSpan = container.querySelector('div.mt-4 span')
    expect(bottomSpan.textContent).toBe('3 / 3')

    const headerCounter = container.querySelector('span.tabular-nums')
    expect(headerCounter.textContent).toBe('3 / 3')
  })

  test('from the end, prev targets card 2 and not card 1', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })
    Object.defineProperty(list, 'scrollLeft', { configurable: true, value: 1000 })

    const mockChild0 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: -450 }) }
    const mockChild1 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 8 }) }
    const mockChild2 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 260 }) }
    Object.defineProperty(list, 'children', {
      configurable: true,
      value: [mockChild0, mockChild1, mockChild2]
    })

    fireEvent.scroll(list)

    const prevBtn = screen.getByRole('button', { name: 'Proyecto anterior' })
    expect(prevBtn).not.toBeDisabled()
    fireEvent.click(prevBtn)

    expect(mockChild1.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    }))
    expect(mockChild0.scrollIntoView).not.toHaveBeenCalled()
  })

  test('next does nothing at the end', () => {
    render(<ProjectsCarousel />)
    const list = screen.getByRole('list')
    Object.defineProperty(list, 'clientWidth', { configurable: true, value: 500 })
    Object.defineProperty(list, 'scrollWidth', { configurable: true, value: 1500 })
    Object.defineProperty(list, 'scrollLeft', { configurable: true, value: 1000 })

    const mockChild0 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: -450 }) }
    const mockChild1 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 8 }) }
    const mockChild2 = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ left: 260 }) }
    Object.defineProperty(list, 'children', {
      configurable: true,
      value: [mockChild0, mockChild1, mockChild2]
    })

    fireEvent.scroll(list)

    const nextBtn = screen.getByRole('button', { name: 'Proyecto siguiente' })
    expect(nextBtn).toBeDisabled()
    fireEvent.click(nextBtn)

    expect(mockChild0.scrollIntoView).not.toHaveBeenCalled()
    expect(mockChild1.scrollIntoView).not.toHaveBeenCalled()
    expect(mockChild2.scrollIntoView).not.toHaveBeenCalled()
  })
})
