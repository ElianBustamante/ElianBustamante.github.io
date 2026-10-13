import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Section from '../components/Section'
import React from 'react'
import '../i18n'

describe('Section', () => {
  it('sin fill incluye short:justify-start! y short:pb-3, sin clases fill', () => {
    const { container } = render(
      <Section id="test-sec" titleKey="photography.title">
        <div>Contenido</div>
      </Section>
    )
    const section = container.querySelector('section')
    expect(section.className).toContain('short:justify-start!')
    expect(section.className).toContain('short:pb-3')
    expect(section.className).not.toContain('short:h-[100dvh]')
    expect(section.className).not.toContain('short:pb-6')

    const innerDiv = section.firstElementChild
    expect(innerDiv.className).not.toContain('short:flex-1')
  })

  it('con fill incluye short:h-[100dvh] short:min-h-[300px] short:pb-6 y no incluye short:pb-3', () => {
    const { container } = render(
      <Section id="test-sec-fill" titleKey="photography.title" fill>
        <div data-testid="child">Contenido con fill</div>
      </Section>
    )
    const section = container.querySelector('section')
    expect(section.className).toContain('short:justify-start!')
    expect(section.className).toContain('short:h-[100dvh]')
    expect(section.className).toContain('short:min-h-[300px]')
    expect(section.className).toContain('short:pb-6')
    expect(section.className).not.toContain('short:pb-3')

    const innerDiv = section.firstElementChild
    expect(innerDiv.className).toContain('short:flex-1')
    expect(innerDiv.className).toContain('short:min-h-0')
    expect(innerDiv.className).toContain('short:flex')
    expect(innerDiv.className).toContain('short:flex-col')

    const child = screen.getByTestId('child')
    const revealContainer = child.parentElement
    expect(revealContainer.className).toContain('short:flex-1')
    expect(revealContainer.className).toContain('short:min-h-0')
    expect(revealContainer.className).toContain('short:flex')
    expect(revealContainer.className).toContain('short:flex-col')
  })
})
