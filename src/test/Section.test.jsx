import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Section from '../components/Section'
import React from 'react'
import '../i18n'

describe('Section', () => {
  it('without fill includes short:justify-center! and short:pb-3, without fill classes', () => {
    const { container } = render(
      <Section id="test-sec" titleKey="photography.title">
        <div>Contenido</div>
      </Section>
    )
    const section = container.querySelector('section')
    expect(section.className).toContain('short:justify-center!')
    expect(section.className).not.toContain('short:justify-start!')
    expect(section.className).toContain('short:pb-3')
    expect(section.className).not.toContain('short:h-[100dvh]')
    expect(section.className).not.toContain('short:pb-6')

    const innerDiv = section.firstElementChild
    expect(innerDiv.className).not.toContain('short:flex-1')
  })

  it('with fill includes short:h-[100dvh] short:min-h-[300px] short:pb-6 and does not include short:pb-3', () => {
    const { container } = render(
      <Section id="test-sec-fill" titleKey="photography.title" fill>
        <div data-testid="child">Contenido con fill</div>
      </Section>
    )
    const section = container.querySelector('section')
    expect(section.className).toContain('compact:justify-start!')
    expect(section.className).toContain('[@media(min-height:521px)]:short:justify-center!')
    expect(section.className).toContain('short:h-[100dvh]')
    expect(section.className).toContain('short:min-h-[300px]')
    expect(section.className).toContain('short:pb-6')
    expect(section.className).not.toContain('short:pb-3')

    const innerDiv = section.firstElementChild
    expect(innerDiv.className).toContain('compact:flex-1')
    expect(innerDiv.className).toContain('compact:min-h-0')
    expect(innerDiv.className).toContain('short:flex')
    expect(innerDiv.className).toContain('short:flex-col')

    const child = screen.getByTestId('child')
    const revealContainer = child.parentElement
    expect(revealContainer.className).toContain('compact:flex-1')
    expect(revealContainer.className).toContain('compact:min-h-0')
    expect(revealContainer.className).toContain('short:flex')
    expect(revealContainer.className).toContain('short:flex-col')
  })

  it('does not contain previous or next section navigation buttons', () => {
    render(
      <Section id="proyectos" titleKey="projects.title">
        <div>Contenido</div>
      </Section>
    )
    expect(screen.queryByRole('button', { name: /sección anterior/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /siguiente sección/i })).not.toBeInTheDocument()
  })

  it('without footer does not change: retains same classes, without pb-0! or my-auto container', () => {
    const { container } = render(
      <Section id="test-no-footer" titleKey="photography.title">
        <div data-testid="inner-child">Contenido</div>
      </Section>
    )
    const section = container.querySelector('section')
    expect(section.className).toContain('pb-8')
    expect(section.className).toContain('short:pb-3')
    expect(section.className).not.toContain('pb-0!')
    expect(section.className).not.toContain('short:pb-0!')
    expect(section.querySelector('.my-auto')).toBeNull()
    expect(section.firstElementChild.className).toContain('max-w-site')
  })

  it('with footer renders footer inside <section>, wraps content in my-auto, and adds pb-0! short:pb-0!', () => {
    const { container } = render(
      <Section
        id="contacto"
        titleKey="contact.title"
        footer={<footer data-testid="custom-footer">Pie de prueba</footer>}
      >
        <div data-testid="contact-body">Contenido de contacto</div>
      </Section>
    )
    const section = container.querySelector('section#contacto')
    expect(section.className).toContain('pb-0!')
    expect(section.className).toContain('short:pb-0!')

    const myAutoWrapper = section.firstElementChild
    expect(myAutoWrapper.className).toBe('my-auto')
    expect(myAutoWrapper.firstElementChild.className).toContain('max-w-site')
    expect(myAutoWrapper).toContainElement(screen.getByTestId('contact-body'))

    const footerEl = screen.getByTestId('custom-footer')
    expect(section).toContainElement(footerEl)
    expect(myAutoWrapper.nextElementSibling).toBe(footerEl)
  })
})
