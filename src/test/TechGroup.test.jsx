import { render, screen, cleanup, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import TechGroup from '../components/TechGroup'
import i18n from '../i18n'

describe('TechGroup', () => {
  const items = ['Python', 'JavaScript', 'TypeScript', 'SQL', 'HTML', 'CSS']
  const origClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
  const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

  beforeEach(async () => {
    await act(async () => {
      await i18n.changeLanguage('es')
    })
  })

  afterEach(() => {
    if (origClientWidth) {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', origClientWidth)
    } else {
      delete HTMLElement.prototype.clientWidth
    }
    if (origOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', origOffsetWidth)
    } else {
      delete HTMLElement.prototype.offsetWidth
    }
    cleanup()
  })

  it('in jsdom without layout (clientWidth = 0), shows all capsules and no "+N" button', () => {
    render(<TechGroup label="Lenguajes" items={items} maxLines={1} />)

    const visibleItems = screen.getAllByRole('listitem').map((li) => li.textContent)
    expect(visibleItems).toEqual(items)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('measurement container has aria-hidden="true" and overflow-hidden', () => {
    const { container } = render(<TechGroup label="Lenguajes" items={items} maxLines={1} />)

    const measureDiv = container.querySelector('[aria-hidden="true"]')
    expect(measureDiv).not.toBeNull()
    expect(measureDiv.className).toContain('overflow-hidden')
  })

  it('with mocked layout (container 200, capsules 60, +N 30, gap 8), shows subset + button with maxLines=1, more capsules with maxLines=2, and focus/Escape controls tooltip', () => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        if (this.tagName === 'DIV' && this.className.includes('relative')) {
          return 200
        }
        return 0
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() {
        if (this.tagName === 'LI') {
          return this.textContent.startsWith('+') ? 30 : 60
        }
        return 0
      },
    })

    const { rerender } = render(<TechGroup label="Lenguajes" items={items} maxLines={1} />)

    // With maxLines=1 and width 200: 60 + 8 + 60 + 8 + 30 = 166 <= 200 -> 2 visible capsules and "+4"
    const visibleLine1 = screen
      .getAllByRole('listitem')
      .map((li) => li.textContent)
      .filter((t) => !t.startsWith('+'))
    expect(visibleLine1).toEqual(['Python', 'JavaScript'])

    const plusBtn = screen.getByRole('button', {
      name: '4 tecnologías más: TypeScript, SQL, HTML, CSS',
    })
    expect(plusBtn).toHaveTextContent('+4')

    fireEvent.focus(plusBtn)
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip).toHaveTextContent('TypeScript, SQL, HTML, CSS')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // With maxLines=2: 3 fit on line 1 (196) and 3 on line 2 (196) -> all 6 capsules are visible
    rerender(<TechGroup label="Lenguajes" items={items} maxLines={2} />)
    const visibleLine2 = screen
      .getAllByRole('listitem')
      .map((li) => li.textContent)
      .filter((t) => !t.startsWith('+'))
    expect(visibleLine2.length).toBeGreaterThan(visibleLine1.length)
    expect(visibleLine2).toEqual(items)

    // Without passing maxLines: uses default value 1 and behaves identically to maxLines=1
    rerender(<TechGroup label="Lenguajes" items={items} />)
    const visibleDefault = screen
      .getAllByRole('listitem')
      .map((li) => li.textContent)
      .filter((t) => !t.startsWith('+'))
    expect(visibleDefault).toEqual(visibleLine1)
    expect(
      screen.getByRole('button', {
        name: '4 tecnologías más: TypeScript, SQL, HTML, CSS',
      })
    ).toHaveTextContent('+4')
  })
})
