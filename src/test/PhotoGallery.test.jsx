import { render, screen, cleanup, fireEvent, createEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import PhotoGallery from '../components/PhotoGallery'
import React from 'react'
import i18n from '../i18n'

const { mockPhotos } = vi.hoisted(() => ({
  mockPhotos: [
    { id: '1', thumb: { src: '/photos/1-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/1-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto uno', en: 'Photo one' }, exif: {} },
    { id: '2', thumb: { src: '/photos/2-thumb.webp', width: 533, height: 800 }, large: { src: '/photos/2-large.webp', width: 1600, height: 2400 }, alt: { es: 'Foto dos', en: 'Photo two' }, exif: {} },
    { id: '3', thumb: { src: '/photos/3-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/3-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto tres', en: 'Photo three' }, exif: {} }
  ]
}))

vi.mock('../data/photos.json', () => ({
  default: mockPhotos
}))

describe('PhotoGallery', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    await i18n.changeLanguage('es')
  })
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    mockPhotos.length = 3 // Restore mock array
    mockPhotos[0] = { id: '1', thumb: { src: '/photos/1-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/1-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto uno', en: 'Photo one' }, exif: {} }
    mockPhotos[1] = { id: '2', thumb: { src: '/photos/2-thumb.webp', width: 533, height: 800 }, large: { src: '/photos/2-large.webp', width: 1600, height: 2400 }, alt: { es: 'Foto dos', en: 'Photo two' }, exif: {} }
    mockPhotos[2] = { id: '3', thumb: { src: '/photos/3-thumb.webp', width: 800, height: 533 }, large: { src: '/photos/3-large.webp', width: 2400, height: 1600 }, alt: { es: 'Foto tres', en: 'Photo three' }, exif: {} }
    window.innerHeight = 768
  })

  it('renders one list item per photo with inline height style', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    const images = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    expect(images).toHaveLength(3)
    const firstLi = images[0].parentElement
    expect(firstLi.style.height).toBe('453.12px') // from W=1200, H=768 -> h=768*0.59
  })

  it('en modo pantalla baja calcula la altura con clientHeight del contenedor (mínimo 150px en jsdom)', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 0 })
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('landscape') || query.includes('max-height'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    render(<PhotoGallery />)
    const images = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    const firstLi = images[0].parentElement
    expect(firstLi.style.height).toBe('150px')
  })

  it('en modo pantalla baja usa clientHeight cuando es mayor a 150px (factor 1 si H<=520, factor 0.92 si H>520)', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 280 })
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('landscape') || query.includes('max-height'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    // Con H <= 520 (teléfonos): factor = 1 -> 280px
    window.innerHeight = 500
    const { unmount } = render(<PhotoGallery />)
    const images500 = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    expect(images500[0].parentElement.style.height).toBe('280px')
    unmount()

    // Con H > 520 (ventanas): factor = 0.92 -> Math.floor(280 * 0.92) = 257px
    window.innerHeight = 600
    render(<PhotoGallery />)
    const images600 = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    expect(images600[0].parentElement.style.height).toBe('257px')
  })

  it('el contenedor de fotos incluye las clases de centrado vertical para modo riel con alto mayor a 520px', () => {
    render(<PhotoGallery />)
    const containerDiv = screen.getByRole('list').parentElement
    expect(containerDiv.className).toContain('[@media(min-height:521px)]:short:flex')
    expect(containerDiv.className).toContain('[@media(min-height:521px)]:short:flex-col')
    expect(containerDiv.className).toContain('[@media(min-height:521px)]:short:justify-center')
  })

  it('renders alt in Spanish and changes to English', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    const { rerender } = render(<PhotoGallery />)
    expect(screen.getByAltText('Foto uno')).toBeInTheDocument()
    
    await act(async () => {
      await i18n.changeLanguage('en')
    })
    rerender(<PhotoGallery />)
    expect(screen.getByAltText('Photo one')).toBeInTheDocument()
  })

  it('actualiza visibilidad de botones al disparar resize mediante observeScrollState', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 })
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 1000 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })

    render(<PhotoGallery />)

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Más fotos' })).toBeInTheDocument()
    })
  })

  it('does not show buttons and counter when there is only 1 page', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 2000 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    expect(screen.queryByRole('button', { name: 'Fotos anteriores' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Más fotos' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Página/)).not.toBeInTheDocument()
  })

  it('shows buttons and counter when there are multiple pages', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 }) // h = 266, w1=399 > 400 => separate pages
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 1000 })
    const scrollByMock = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollBy', { configurable: true, value: scrollByMock })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    
    render(<PhotoGallery />)
    
    // Simulate checkScroll by calling fireEvent.scroll on the ul
    const list = screen.getByRole('list')
    fireEvent.scroll(list)
    
    const nextBtn = screen.getByRole('button', { name: 'Más fotos' })
    const prevBtn = screen.getByRole('button', { name: 'Fotos anteriores' })
    
    expect(prevBtn).toBeDisabled()
    expect(nextBtn).not.toBeDisabled()
    
    const user = userEvent.setup()
    await user.click(nextBtn)
    
    expect(scrollByMock).toHaveBeenCalledWith({ left: 400 * 0.8, behavior: 'smooth' })
  })

  it('opens dialog with counter on click', async () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    const images = screen.getAllByRole('button').filter(b => b.querySelector('img'))
    const user = userEvent.setup()
    
    await user.click(images[1])
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText('Foto 2 de 3')).toBeInTheDocument()
  })

  it('aligns all pages to flex-start', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 400 }) // Forces multiple pages
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    
    const lists = screen.getAllByRole('list').filter(ul => ul.style.justifyContent)
    
    lists.forEach(list => {
      expect(list.style.justifyContent).toBe('flex-start')
      expect(list.style.gap).toBe('12px')
    })
  })

  it('renders no list when photos is empty', () => {
    mockPhotos.length = 0
    render(<PhotoGallery />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('una foto tiene draggable="false" y un fireEvent.contextMenu sobre ella devuelve defaultPrevented', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    const img = screen.getByAltText('Foto uno')
    expect(img).toHaveAttribute('draggable', 'false')
    const event = createEvent.contextMenu(img)
    fireEvent(img, event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('el ul incluye las clases de difuminado mask-image', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1200 })
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 })
    render(<PhotoGallery />)
    const list = screen.getByRole('list')
    expect(list.className).toContain('[mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]')
    expect(list.className).toContain('[-webkit-mask-image:linear-gradient(to_right,transparent,black_1rem,black_calc(100%-1rem),transparent)]')
  })
})
