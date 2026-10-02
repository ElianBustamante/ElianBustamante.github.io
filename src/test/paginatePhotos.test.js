import { describe, it, expect } from 'vitest'
import { paginatePhotos } from '../lib/paginatePhotos'

describe('paginatePhotos', () => {
  const gap = 12
  const aspects = [3/2, 2/3, 2/3, 3/2, 3/2, 2/3, 2/3, 2/3, 3/2, 2/3, 3/2, 3/2]

  it('groups correctly with height 190 and width 640', () => {
    const pages = paginatePhotos(aspects, 190, 640, gap)
    // widths: 285, 126, 126, 285, 285, 126, 126, 126, 285, 126, 285, 285
    // p0: 285+12+126+12+126 = 561 <= 640 => [0,1,2]
    // p1: 285+12+285 = 582 <= 640 => [3,4]
    // p2: 126+12+126+12+126 = 402 <= 640 => [5,6,7]
    // p3: 285+12+126 = 423 <= 640 => [8,9]
    // p4: 285+12+285 = 582 <= 640 => [10,11]
    expect(pages).toEqual([[0,1,2], [3,4], [5,6,7], [8,9], [10,11]])
  })

  it('groups correctly with height 200 and width 300', () => {
    const pages = paginatePhotos(aspects, 200, 300, gap)
    // widths: 300, 133, 133, 300, 300, 133, 133, 133, 300, 133, 300, 300
    // p0: 300 => [0]
    // p1: 133+12+133 = 278 <= 300 => [1,2]
    // p2: 300 => [3]
    // p3: 300 => [4]
    // p4: 133+12+133 = 278 <= 300 => [5,6]
    // p5: 133 => [7]
    // p6: 300 => [8]
    // p7: 133 => [9]
    // p8: 300 => [10]
    // p9: 300 => [11]
    expect(pages).toEqual([[0], [1,2], [3], [4], [5,6], [7], [8], [9], [10], [11]])
  })

  it('puts a photo wider than container alone', () => {
    const pages = paginatePhotos([3], 200, 300, gap) // width 600 > 300
    expect(pages).toEqual([[0]])
  })

  it('returns [] for empty array', () => {
    expect(paginatePhotos([], 200, 300, gap)).toEqual([])
  })

  it('preserves order', () => {
    const pages = paginatePhotos([1, 2, 3], 100, 1000, gap)
    expect(pages).toEqual([[0, 1, 2]])
  })
})
