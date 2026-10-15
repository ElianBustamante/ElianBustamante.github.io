import { describe, it, expect } from 'vitest'
import { isHttpsUrl } from '../lib/url'

describe('isHttpsUrl', () => {
  it('retorna true solo si la URL es un string que empieza con https://', () => {
    expect(isHttpsUrl('https://github.com')).toBe(true)
    expect(isHttpsUrl('https://discord.com/oauth2/authorize?client_id=123')).toBe(true)
    expect(isHttpsUrl('https://')).toBe(true)
    expect(isHttpsUrl('https://example.com/path?query=1#hash')).toBe(true)
  })

  it('retorna false para URLs con http:// u otros protocolos', () => {
    expect(isHttpsUrl('http://github.com')).toBe(false)
    expect(isHttpsUrl('ftp://example.com')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('data:text/plain;base64,SGVsbG8=')).toBe(false)
  })

  it('retorna false para valores nulos, no definidos o no-string', () => {
    expect(isHttpsUrl(null)).toBe(false)
    expect(isHttpsUrl(undefined)).toBe(false)
    expect(isHttpsUrl('')).toBe(false)
    expect(isHttpsUrl(123)).toBe(false)
    expect(isHttpsUrl({})).toBe(false)
    expect(isHttpsUrl([])).toBe(false)
  })

  it('retorna false si no empieza exactamente con https://', () => {
    expect(isHttpsUrl('HTTPS://github.com')).toBe(false)
    expect(isHttpsUrl(' https://github.com')).toBe(false)
    expect(isHttpsUrl('https:/github.com')).toBe(false)
    expect(isHttpsUrl('https:github.com')).toBe(false)
  })
})
