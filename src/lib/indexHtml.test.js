import fs from 'node:fs'
import { describe, it, expect } from 'vitest'
import { site } from '../data/site'

const metaUrl = import.meta.url
const html = fs.readFileSync(new URL('../../index.html', metaUrl), 'utf8')
const noscriptMatch = html.match(/<noscript>([\s\S]*?)<\/noscript>/)
const noscriptContent = noscriptMatch ? noscriptMatch[1] : ''

describe('index.html <noscript>', () => {
  it('contains a <noscript> block before <div id="root">', () => {
    expect(noscriptMatch).not.toBeNull()
    const noscriptIndex = html.indexOf('<noscript>')
    const rootIndex = html.indexOf('<div id="root">')
    expect(noscriptIndex).toBeGreaterThan(-1)
    expect(rootIndex).toBeGreaterThan(-1)
    expect(noscriptIndex).toBeLessThan(rootIndex)
  })

  it('contains email, GitHub, and LinkedIn matching site.js', () => {
    expect(site.email).toBe('elian.bustamante.obreque@gmail.com')
    expect(site.githubUrl).toContain('github.com/ElianBustamante')
    expect(site.linkedinUrl).toContain('linkedin.com/in/elian-bustamante-4847a6299')

    expect(noscriptContent).toContain(site.email)
    expect(noscriptContent).toContain(`mailto:${site.email}`)
    expect(noscriptContent).toContain('github.com/ElianBustamante')
    expect(noscriptContent).toContain(site.githubUrl)
    expect(noscriptContent).toContain('linkedin.com/in/elian-bustamante-4847a6299')
    expect(noscriptContent).toContain(site.linkedinUrl)
  })

  it('does not contain any phone number or the word Villarrica', () => {
    const phoneRegex = /\+?\d[\d\s-]{7,}\d/
    expect(noscriptContent).not.toMatch(phoneRegex)
    expect(html).not.toMatch(phoneRegex)
    expect(html).not.toMatch(/villarrica/i)
  })
})
