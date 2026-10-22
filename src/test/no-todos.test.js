import { describe, it, expect } from 'vitest'
import es from '../i18n/locales/es.json'
import en from '../i18n/locales/en.json'
import captions from '../data/captions.json'

const dataModules = import.meta.glob('../data/*.js', { eager: true })

function findForbiddenStrings(obj, path = '') {
  const matches = []
  if (typeof obj === 'string') {
    if (obj.includes('TODO') || obj.includes('FIXME')) {
      matches.push({ path, value: obj })
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      matches.push(...findForbiddenStrings(item, `${path}[${index}]`))
    })
  } else if (obj !== null && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, val]) => {
      matches.push(...findForbiddenStrings(val, path ? `${path}.${key}` : key))
    })
  }
  return matches
}

describe('Content cleanliness (no TODO or FIXME)', () => {
  it('es.json contains no TODO or FIXME', () => {
    const matches = findForbiddenStrings(es, 'es.json')
    expect(matches).toEqual([])
  })

  it('en.json contains no TODO or FIXME', () => {
    const matches = findForbiddenStrings(en, 'en.json')
    expect(matches).toEqual([])
  })

  it('captions.json contains no TODO or FIXME', () => {
    const matches = findForbiddenStrings(captions, 'captions.json')
    expect(matches).toEqual([])
  })

  it('src/data/*.js exports contain no TODO or FIXME', () => {
    expect(Object.keys(dataModules).length).toBeGreaterThan(0)
    for (const [filepath, mod] of Object.entries(dataModules)) {
      for (const [exportName, exportVal] of Object.entries(mod)) {
        const matches = findForbiddenStrings(exportVal, `${filepath}:${exportName}`)
        expect(matches).toEqual([])
      }
    }
  })

  it('findForbiddenStrings correctly flags test objects with TODO or FIXME', () => {
    const dirty = {
      nested: {
        item: 'TODO(elian): write this',
        arr: ['clean', 'FIXME: later']
      }
    }
    const matches = findForbiddenStrings(dirty, 'root')
    expect(matches).toHaveLength(2)
    expect(matches[0].value).toContain('TODO')
    expect(matches[1].value).toContain('FIXME')
  })
})
