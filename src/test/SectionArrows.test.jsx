import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SectionArrows from '../components/SectionArrows'
import { goToPrevSection, goToNextSection } from '../lib/sectionNav'
import '../i18n'

vi.mock('../lib/sectionNav', () => ({
  goToPrevSection: vi.fn(),
  goToNextSection: vi.fn(),
}))

describe('SectionArrows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders both buttons with accessible labels, fixed positioning, short:hidden, and bounce animations', () => {
    render(<SectionArrows canPrev={true} canNext={true} />)

    const prevBtn = screen.getByRole('button', { name: /sección anterior/i })
    const nextBtn = screen.getByRole('button', { name: /siguiente sección/i })

    expect(prevBtn).toBeInTheDocument()
    expect(nextBtn).toBeInTheDocument()

    expect(prevBtn.className).toContain('fixed')
    expect(prevBtn.className).toContain('short:hidden')
    expect(prevBtn.className).toContain('motion-safe:animate-bounce-up')
    expect(prevBtn.className).toContain('opacity-100')

    expect(nextBtn.className).toContain('fixed')
    expect(nextBtn.className).toContain('short:hidden')
    expect(nextBtn.className).toContain('motion-safe:animate-bounce')
    expect(nextBtn.className).toContain('opacity-100')
  })

  it('hides top button when canPrev is false (disabled, tabIndex -1, aria-hidden, hidden classes)', () => {
    const { container } = render(<SectionArrows canPrev={false} canNext={true} />)

    const prevBtn = container.querySelector('button[aria-label="Sección anterior"]')
    expect(prevBtn).toBeInTheDocument()
    expect(prevBtn).toBeDisabled()
    expect(prevBtn).toHaveAttribute('tabIndex', '-1')
    expect(prevBtn).toHaveAttribute('aria-hidden', 'true')
    expect(prevBtn.className).toContain('opacity-0')
    expect(prevBtn.className).toContain('invisible')
    expect(prevBtn.className).toContain('pointer-events-none')

    const nextBtn = container.querySelector('button[aria-label="Siguiente sección"]')
    expect(nextBtn).toBeInTheDocument()
    expect(nextBtn).not.toBeDisabled()
    expect(nextBtn.className).toContain('opacity-100')
  })

  it('hides bottom button when canNext is false (disabled, tabIndex -1, aria-hidden, hidden classes)', () => {
    const { container } = render(<SectionArrows canPrev={true} canNext={false} />)

    const nextBtn = container.querySelector('button[aria-label="Siguiente sección"]')
    expect(nextBtn).toBeInTheDocument()
    expect(nextBtn).toBeDisabled()
    expect(nextBtn).toHaveAttribute('tabIndex', '-1')
    expect(nextBtn).toHaveAttribute('aria-hidden', 'true')
    expect(nextBtn.className).toContain('opacity-0')
    expect(nextBtn.className).toContain('invisible')
    expect(nextBtn.className).toContain('pointer-events-none')

    const prevBtn = container.querySelector('button[aria-label="Sección anterior"]')
    expect(prevBtn).toBeInTheDocument()
    expect(prevBtn).not.toBeDisabled()
    expect(prevBtn.className).toContain('opacity-100')
  })

  it('shows both buttons when canPrev and canNext are both true', () => {
    render(<SectionArrows canPrev={true} canNext={true} />)

    const prevBtn = screen.getByRole('button', { name: /sección anterior/i })
    const nextBtn = screen.getByRole('button', { name: /siguiente sección/i })

    expect(prevBtn).not.toBeDisabled()
    expect(prevBtn.className).toContain('opacity-100')
    expect(nextBtn).not.toBeDisabled()
    expect(nextBtn.className).toContain('opacity-100')
  })

  it('clicking arrows invokes goToPrevSection and goToNextSection', () => {
    render(<SectionArrows canPrev={true} canNext={true} />)

    const prevBtn = screen.getByRole('button', { name: /sección anterior/i })
    const nextBtn = screen.getByRole('button', { name: /siguiente sección/i })

    fireEvent.click(prevBtn)
    expect(goToPrevSection).toHaveBeenCalledTimes(1)

    fireEvent.click(nextBtn)
    expect(goToNextSection).toHaveBeenCalledTimes(1)
  })
})
