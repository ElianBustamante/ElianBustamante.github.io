import { describe, test, expect } from 'vitest'
import photosData from '../data/gallery'

describe('photos.json data validation', () => {
  if (!photosData || photosData.length === 0) {
    test.skip('No photos data to test')
    return
  }

  test('Each element has id, thumb and large with valid properties', () => {
    photosData.forEach(photo => {
      expect(photo.id).toBeTypeOf('string')
      expect(photo.thumb.src.startsWith('/photos/')).toBe(true)
      expect(photo.thumb.width).toBeGreaterThan(0)
      expect(photo.thumb.height).toBeGreaterThan(0)
      expect(photo.large.src.startsWith('/photos/')).toBe(true)
      expect(photo.large.width).toBeGreaterThan(0)
      expect(photo.large.height).toBeGreaterThan(0)
    })
  })

  test('Each alt is a non-empty string for es and en', () => {
    photosData.forEach(photo => {
      expect(typeof photo.alt.es).toBe('string')
      expect(photo.alt.es.length).toBeGreaterThan(0)
      expect(typeof photo.alt.en).toBe('string')
      expect(photo.alt.en.length).toBeGreaterThan(0)
    })
  })

  test('No GPS keys exist anywhere', () => {
    const checkNoGps = (obj) => {
      if (!obj || typeof obj !== 'object') return
      expect(obj).not.toHaveProperty('gps')
      expect(obj).not.toHaveProperty('latitude')
      expect(obj).not.toHaveProperty('longitude')
      Object.values(obj).forEach(checkNoGps)
    }
    checkNoGps(photosData)
  })

  test('IDs are unique', () => {
    const ids = photosData.map(p => p.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })
})
