import { describe, it, expect } from 'vitest'
import { mergePhotos } from '../lib/mergePhotos'

describe('mergePhotos', () => {
  const basePhotos = [
    {
      id: '01',
      file: '01.jpg',
      thumb: { src: '/photos/01-thumb.webp', width: 800, height: 533 },
      large: { src: '/photos/01-large.webp', width: 2400, height: 1600 },
      exif: {
        camera: 'Canon EOS',
        lens: '24-70mm',
        focalLength: '35 mm',
        aperture: 'f/8',
        shutter: '1/250 s',
        iso: 100
      }
    },
    {
      id: '02',
      file: '02.jpg',
      thumb: { src: '/photos/02-thumb.webp', width: 800, height: 1200 },
      large: { src: '/photos/02-large.webp', width: 1600, height: 2400 },
      exif: {
        camera: 'Nikon D3200',
        lens: '35mm',
        focalLength: '35 mm',
        aperture: 'f/1.8',
        shutter: '1/500 s',
        iso: 200
      }
    }
  ]

  it('devuelve título y alt vacíos o ausentes como null y genera alt genérico con N correcto (1-based)', () => {
    const captions = {
      '01.jpg': {
        title: { es: '', en: '   ' },
        alt: { es: '  ', en: '' }
      }
      // '02.jpg' ausente por completo en captions
    }

    const merged = mergePhotos(basePhotos, captions)
    expect(merged).toHaveLength(2)

    // Foto 1
    expect(merged[0].title).toEqual({ es: null, en: null })
    expect(merged[0].alt).toEqual({
      es: 'Fotografía de paisaje 1',
      en: 'Landscape photograph 1'
    })

    // Foto 2
    expect(merged[1].title).toEqual({ es: null, en: null })
    expect(merged[1].alt).toEqual({
      es: 'Fotografía de paisaje 2',
      en: 'Landscape photograph 2'
    })
  })

  it('conserva títulos y alts válidos recortando espacios en blanco', () => {
    const captions = {
      '01.jpg': {
        title: { es: '  Volcán Llaima  ', en: 'Llaima Volcano' },
        alt: { es: 'Vista del volcán', en: '  Volcano view  ' }
      }
    }

    const merged = mergePhotos(basePhotos, captions)
    expect(merged[0].title).toEqual({
      es: 'Volcán Llaima',
      en: 'Llaima Volcano'
    })
    expect(merged[0].alt).toEqual({
      es: 'Vista del volcán',
      en: 'Volcano view'
    })
  })

  it('override de exif: gana captions solo en los campos definidos y no vacíos', () => {
    const captions = {
      '01.jpg': {
        exif: {
          lens: 'Canon EF 16-35mm',
          shutter: '  1/1000 s  ',
          aperture: '', // vacío: ignorado
          focalLength: '   ' // solo espacios: ignorado
        }
      }
    }

    const merged = mergePhotos(basePhotos, captions)
    expect(merged[0].exif).toEqual({
      camera: 'Canon EOS', // conserva original
      lens: 'Canon EF 16-35mm', // sobrescrito
      focalLength: '35 mm', // conserva original
      aperture: 'f/8', // conserva original
      shutter: '1/1000 s', // sobrescrito recortado
      iso: 100 // conserva original
    })
  })

  it('maneja iso como número, cadena numérica ("400" -> 400) e ignora cadenas no numéricas ("abc")', () => {
    const captions1 = {
      '01.jpg': { exif: { iso: '400' } }
    }
    const merged1 = mergePhotos(basePhotos, captions1)
    expect(merged1[0].exif.iso).toBe(400)

    const captions2 = {
      '01.jpg': { exif: { iso: 'abc' } }
    }
    const merged2 = mergePhotos(basePhotos, captions2)
    expect(merged2[0].exif.iso).toBe(100) // conserva original

    const captions3 = {
      '01.jpg': { exif: { iso: 640.4 } }
    }
    const merged3 = mergePhotos(basePhotos, captions3)
    expect(merged3[0].exif.iso).toBe(640)
  })

  it('ignora entradas huérfanas en captions que no corresponden a ninguna foto', () => {
    const captions = {
      'orphan.jpg': {
        title: { es: 'Huérfana', en: 'Orphan' },
        alt: { es: 'Alt', en: 'Alt' }
      }
    }
    const merged = mergePhotos(basePhotos, captions)
    expect(merged).toHaveLength(2)
    expect(merged.map((p) => p.id)).toEqual(['01', '02'])
  })

  it('parte con todos los campos exif en null si photo.exif falta', () => {
    const photosWithoutExif = [
      {
        id: 'no-exif',
        file: 'no-exif.jpg',
        thumb: { src: '/t.webp' },
        large: { src: '/l.webp' }
      }
    ]
    const captions = {
      'no-exif.jpg': {
        exif: { camera: 'Manual Camera' }
      }
    }
    const merged = mergePhotos(photosWithoutExif, captions)
    expect(merged[0].exif).toEqual({
      camera: 'Manual Camera',
      lens: null,
      focalLength: null,
      aperture: null,
      shutter: null,
      iso: null
    })
  })

  it('tolera entradas y tipos inesperados sin fallar', () => {
    expect(mergePhotos(null, {})).toEqual([])
    expect(mergePhotos(undefined, null)).toEqual([])
    expect(mergePhotos('invalid', 'invalid')).toEqual([])

    const weirdPhotos = [
      null,
      {
        id: '01',
        file: '01.jpg',
        thumb: { src: '/t.webp' },
        large: { src: '/l.webp' },
        exif: 'not an object'
      }
    ]
    const weirdCaptions = {
      '01.jpg': 'string caption',
      '02.jpg': ['array caption']
    }

    const merged = mergePhotos(weirdPhotos, weirdCaptions)
    expect(merged[0]).toBeNull()
    expect(merged[1].title).toEqual({ es: null, en: null })
    expect(merged[1].alt).toEqual({
      es: 'Fotografía de paisaje 2',
      en: 'Landscape photograph 2'
    })
    expect(merged[1].exif).toEqual({
      camera: null,
      lens: null,
      focalLength: null,
      aperture: null,
      shutter: null,
      iso: null
    })
  })
})
