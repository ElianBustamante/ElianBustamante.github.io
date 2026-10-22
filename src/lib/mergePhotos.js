/**
 * Merges technical photo data from photosData with titles, alt text,
 * and optional EXIF metadata overrides from captions.
 *
 * @param {Array<Object>} photosData - List of photos with generated technical data.
 * @param {Record<string, Object>} captions - Captions dictionary indexed by filename ('file').
 * @returns {Array<Object>} List of merged photos matching the shape expected by components.
 */
export function mergePhotos(photosData, captions) {
  if (!Array.isArray(photosData)) return []
  const safeCaptions = captions && typeof captions === 'object' && !Array.isArray(captions)
    ? captions
    : {}

  return photosData.map((photo, index) => {
    if (!photo || typeof photo !== 'object') return photo
    const n = index + 1
    const file = photo.file || ''
    const rawCaption = file && typeof safeCaptions[file] === 'object' && safeCaptions[file] !== null && !Array.isArray(safeCaptions[file])
      ? safeCaptions[file]
      : {}

    // Title
    const rawTitle = rawCaption.title && typeof rawCaption.title === 'object' && !Array.isArray(rawCaption.title)
      ? rawCaption.title
      : {}
    const cleanTitleStr = (val) => (typeof val === 'string' && val.trim() ? val.trim() : null)
    const title = {
      es: cleanTitleStr(rawTitle.es),
      en: cleanTitleStr(rawTitle.en)
    }

    // Alt
    const rawAlt = rawCaption.alt && typeof rawCaption.alt === 'object' && !Array.isArray(rawCaption.alt)
      ? rawCaption.alt
      : {}
    const cleanAltStr = (val, fallback) => (typeof val === 'string' && val.trim() ? val.trim() : fallback)
    const alt = {
      es: cleanAltStr(rawAlt.es, `Fotografía de paisaje ${n}`),
      en: cleanAltStr(rawAlt.en, `Landscape photograph ${n}`)
    }

    // EXIF
    const baseExif = photo.exif && typeof photo.exif === 'object' && !Array.isArray(photo.exif)
      ? photo.exif
      : {}
    const rawCaptionExif = rawCaption.exif && typeof rawCaption.exif === 'object' && !Array.isArray(rawCaption.exif)
      ? rawCaption.exif
      : {}

    const exif = {
      camera: baseExif.camera ?? null,
      lens: baseExif.lens ?? null,
      focalLength: baseExif.focalLength ?? null,
      aperture: baseExif.aperture ?? null,
      shutter: baseExif.shutter ?? null,
      iso: baseExif.iso ?? null
    }

    const stringFields = ['camera', 'lens', 'focalLength', 'aperture', 'shutter']
    for (const field of stringFields) {
      if (field in rawCaptionExif) {
        const val = rawCaptionExif[field]
        if (typeof val === 'string' && val.trim()) {
          exif[field] = val.trim()
        }
      }
    }

    if ('iso' in rawCaptionExif) {
      const isoVal = rawCaptionExif.iso
      if (typeof isoVal === 'number' && Number.isFinite(isoVal)) {
        exif.iso = Math.round(isoVal)
      } else if (typeof isoVal === 'string' && isoVal.trim()) {
        const trimmed = isoVal.trim()
        if (/^-?\d+$/.test(trimmed)) {
          exif.iso = parseInt(trimmed, 10)
        }
      }
    }

    const result = {
      id: photo.id,
      thumb: photo.thumb,
      large: photo.large,
      alt,
      title,
      exif
    }
    if (photo.file !== undefined) {
      result.file = photo.file
    }
    return result
  })
}

export default mergePhotos
