import { describe, it, expect } from 'vitest'
import es from '../i18n/locales/es.json'
import en from '../i18n/locales/en.json'

function flattenKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenKeys(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }
    return acc
  }, {})
}

describe('Translations', () => {
  const esFlat = flattenKeys(es)
  const enFlat = flattenKeys(en)

  it('both locales should have exactly the same keys', () => {
    const esKeys = Object.keys(esFlat).sort()
    const enKeys = Object.keys(enFlat).sort()
    expect(esKeys).toEqual(enKeys)
  })

  it('no value should be an empty string', () => {
    Object.values(esFlat).forEach(value => {
      expect(value).not.toBe('')
    })
    Object.values(enFlat).forEach(value => {
      expect(value).not.toBe('')
    })
  })

  it('should have consistent markers ({{year}}, {{current}}, {{total}}) in both languages', () => {
    const markers = ['{{year}}', '{{current}}', '{{total}}']
    Object.keys(esFlat).forEach((key) => {
      const esVal = esFlat[key]
      const enVal = enFlat[key]
      
      markers.forEach(marker => {
        const esHas = typeof esVal === 'string' && esVal.includes(marker)
        const enHas = typeof enVal === 'string' && enVal.includes(marker)
        expect(esHas).toBe(enHas)
      })
    })
  })
})
