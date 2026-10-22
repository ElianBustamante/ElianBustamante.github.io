import { describe, it, expect } from 'vitest'
import { isHttpsUrl } from '../lib/url'

describe('isHttpsUrl', () => {
  it('returns true only if URL is a string starting with https://', () => {
    expect(isHttpsUrl('https://github.com')).toBe(true)
    expect(isHttpsUrl('https://discord.com/oauth2/authorize?client_id=123')).toBe(true)
    expect(isHttpsUrl('https://')).toBe(true)
    expect(isHttpsUrl('https://example.com/path?query=1#hash')).toBe(true)
  })

  it('returns false for URLs with http:// or other protocols', () => {
    expect(isHttpsUrl('http://github.com')).toBe(false)
    expect(isHttpsUrl('ftp://example.com')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('data:text/plain;base64,SGVsbG8=')).toBe(false)
  })

  it('returns false for null, undefined, or non-string values', () => {
    expect(isHttpsUrl(null)).toBe(false)
    expect(isHttpsUrl(undefined)).toBe(false)
    expect(isHttpsUrl('')).toBe(false)
    expect(isHttpsUrl(123)).toBe(false)
    expect(isHttpsUrl({})).toBe(false)
    expect(isHttpsUrl([])).toBe(false)
  })

  it('returns false if it does not start exactly with https://', () => {
    expect(isHttpsUrl('HTTPS://github.com')).toBe(false)
    expect(isHttpsUrl(' https://github.com')).toBe(false)
    expect(isHttpsUrl('https:/github.com')).toBe(false)
    expect(isHttpsUrl('https:github.com')).toBe(false)
  })
})
