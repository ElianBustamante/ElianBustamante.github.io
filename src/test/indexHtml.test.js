import fs from 'node:fs'
import { describe, it, expect } from 'vitest'
import { site } from '../data/site'

const metaUrl = import.meta.url
const html = fs.readFileSync(new URL('../../index.html', metaUrl), 'utf8')
const headContent = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? ''
const bodyContent = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? ''
const headNoscriptMatch = headContent.match(/<noscript>([\s\S]*?)<\/noscript>/)
const noscriptMatch = bodyContent.match(/<noscript>([\s\S]*?)<\/noscript>/)
const noscriptContent = noscriptMatch ? noscriptMatch[1] : ''

describe('index.html <noscript>', () => {
  it('contains a <noscript> in <head> with background:#0a0a0a before </head>', () => {
    expect(headNoscriptMatch).not.toBeNull()
    expect(headNoscriptMatch[1]).toContain('background:#0a0a0a')
    const headNoscriptIndex = html.indexOf('<noscript><style>')
    const headCloseIndex = html.indexOf('</head>')
    expect(headNoscriptIndex).toBeGreaterThan(-1)
    expect(headCloseIndex).toBeGreaterThan(-1)
    expect(headNoscriptIndex).toBeLessThan(headCloseIndex)
  })

  it('contains a <noscript> block before <div id="root">', () => {
    expect(noscriptMatch).not.toBeNull()
    const noscriptIndex = bodyContent.indexOf('<noscript>')
    const rootIndex = bodyContent.indexOf('<div id="root">')
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

describe('index.html sharing meta tags and canonical link', () => {
  function getMetaContent(nameOrProperty) {
    const match = headContent.match(new RegExp(`<meta\\s+(?:property|name)="${nameOrProperty}"\\s+content="([^"]*)"`, 'i'))
      || headContent.match(new RegExp(`<meta\\s+content="([^"]*)"\\s+(?:property|name)="${nameOrProperty}"`, 'i'))
    return match?.[1]
  }

  function getCanonicalHref() {
    const match = headContent.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)
      || headContent.match(/<link\s+href="([^"]*)"\s+rel="canonical"/i)
    return match?.[1]
  }

  it('canonical, og:url, og:image, and twitter:image use the same origin https://elianbustamante.cl', () => {
    const canonicalHref = getCanonicalHref()
    expect(canonicalHref).toBe('https://elianbustamante.cl/')

    const ogUrl = getMetaContent('og:url')
    const ogImage = getMetaContent('og:image')
    const twitterImage = getMetaContent('twitter:image')

    expect(ogUrl).toBe('https://elianbustamante.cl/')
    expect(ogImage).toBe('https://elianbustamante.cl/og-image.png')
    expect(twitterImage).toBe('https://elianbustamante.cl/og-image.png')

    const origin = 'https://elianbustamante.cl'
    expect(new URL(canonicalHref).origin).toBe(origin)
    expect(new URL(ogUrl).origin).toBe(origin)
    expect(new URL(ogImage).origin).toBe(origin)
    expect(new URL(twitterImage).origin).toBe(origin)
  })

  it('does not contain the old elianbustamante.github.io origin in index.html', () => {
    expect(html).not.toContain('elianbustamante.github.io')
  })

  it('defines og:image:width and og:image:height as 1200 and 630 matching real dimensions of public/og-image.png', () => {
    const ogWidth = getMetaContent('og:image:width')
    const ogHeight = getMetaContent('og:image:height')
    expect(ogWidth).toBe('1200')
    expect(ogHeight).toBe('630')

    const pngBuffer = fs.readFileSync(new URL('../../public/og-image.png', metaUrl))
    const realWidth = pngBuffer.readUInt32BE(16)
    const realHeight = pngBuffer.readUInt32BE(20)

    expect(realWidth).toBe(1200)
    expect(realHeight).toBe(630)
    expect(Number(ogWidth)).toBe(realWidth)
    expect(Number(ogHeight)).toBe(realHeight)
  })

  it('sets twitter:card to summary_large_image and non-empty og:image:alt', () => {
    const twitterCard = getMetaContent('twitter:card')
    expect(twitterCard).toBe('summary_large_image')

    const ogImageAlt = getMetaContent('og:image:alt')
    expect(ogImageAlt).toBeDefined()
    expect(ogImageAlt.trim().length).toBeGreaterThan(0)
  })

  it('matches og:title with twitter:title and og:description with twitter:description', () => {
    const ogTitle = getMetaContent('og:title')
    const twitterTitle = getMetaContent('twitter:title')
    expect(ogTitle).toBeDefined()
    expect(twitterTitle).toBeDefined()
    expect(ogTitle).toBe(twitterTitle)

    const ogDescription = getMetaContent('og:description')
    const twitterDescription = getMetaContent('twitter:description')
    expect(ogDescription).toBeDefined()
    expect(twitterDescription).toBeDefined()
    expect(ogDescription).toBe(twitterDescription)
  })
})
