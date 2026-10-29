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

function getCanonicalHref() {
  const match = headContent.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)
    || headContent.match(/<link\s+href="([^"]*)"\s+rel="canonical"/i)
  return match?.[1]
}

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

describe('public/sitemap.xml and public/robots.txt', () => {
  const sitemapUrl = new URL('../../public/sitemap.xml', metaUrl)
  const robotsUrl = new URL('../../public/robots.txt', metaUrl)

  it('public/sitemap.xml exists, is valid XML, and contains <loc> matching the canonical href', () => {
    expect(fs.existsSync(sitemapUrl)).toBe(true)
    const sitemapContent = fs.readFileSync(sitemapUrl, 'utf8')

    const parser = new DOMParser()
    const doc = parser.parseFromString(sitemapContent, 'application/xml')
    const parserError = doc.querySelector('parsererror')
    expect(parserError).toBeNull()

    const canonicalHref = getCanonicalHref()
    expect(canonicalHref).toBe('https://elianbustamante.cl/')

    const locElement = doc.querySelector('urlset > url > loc')
    expect(locElement).not.toBeNull()
    expect(locElement?.textContent?.trim()).toBe('https://elianbustamante.cl/')
    expect(locElement?.textContent?.trim()).toBe(canonicalHref)
  })

  it('public/robots.txt contains the Sitemap directive', () => {
    expect(fs.existsSync(robotsUrl)).toBe(true)
    const robotsContent = fs.readFileSync(robotsUrl, 'utf8')
    expect(robotsContent).toContain('Sitemap: https://elianbustamante.cl/sitemap.xml')
    expect(robotsContent).toContain('User-agent: *')
    expect(robotsContent).toContain('Allow: /')
  })
})

describe('favicon and apple-touch-icon head links and public files', () => {
  const publicDirUrl = new URL('../../public/', metaUrl)

  const expectedLinks = [
    { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    { rel: 'icon', href: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  ]

  it('contains all required icon <link> tags in <head>', () => {
    for (const expected of expectedLinks) {
      const escapedHref = expected.href.replace(/[/.]/g, '\\$&')
      const tagPattern = new RegExp(`<link[^>]*href="${escapedHref}"[^>]*>`, 'i')
      const tagMatch = headContent.match(tagPattern)
      expect(tagMatch, `Missing <link> tag for ${expected.href}`).not.toBeNull()

      const tag = tagMatch[0]
      expect(tag).toContain(`rel="${expected.rel}"`)
      if (expected.sizes) {
        expect(tag).toContain(`sizes="${expected.sizes}"`)
      }
      if (expected.type) {
        expect(tag).toContain(`type="${expected.type}"`)
      }
    }
  })

  it('verifies every icon file referenced by the <link> tags exists in public/', () => {
    for (const expected of expectedLinks) {
      const relPath = expected.href.replace(/^\//, '')
      const fileUrl = new URL(relPath, publicDirUrl)
      expect(fs.existsSync(fileUrl), `Expected ${relPath} to exist in public/`).toBe(true)
      const stats = fs.statSync(fileUrl)
      expect(stats.size).toBeGreaterThan(0)
    }
  })

  it('verifies icon-512.png exists in public/ for PWA and high-res manifests', () => {
    const fileUrl = new URL('icon-512.png', publicDirUrl)
    expect(fs.existsSync(fileUrl)).toBe(true)
    const stats = fs.statSync(fileUrl)
    expect(stats.size).toBeGreaterThan(0)
  })

  it('verifies favicon.ico contains 16, 32, and 48 px icon sizes', () => {
    const icoPath = new URL('favicon.ico', publicDirUrl)
    const buffer = fs.readFileSync(icoPath)
    expect(buffer.readUInt16LE(0)).toBe(0)
    expect(buffer.readUInt16LE(2)).toBe(1)
    const imageCount = buffer.readUInt16LE(4)
    expect(imageCount).toBe(3)

    const sizes = []
    for (let i = 0; i < imageCount; i++) {
      const offset = 6 + i * 16
      const width = buffer.readUInt8(offset)
      const height = buffer.readUInt8(offset + 1)
      sizes.push({ width, height })
    }

    expect(sizes).toContainEqual({ width: 16, height: 16 })
    expect(sizes).toContainEqual({ width: 32, height: 32 })
    expect(sizes).toContainEqual({ width: 48, height: 48 })
  })
})


