import photos from './photos.json'
import captions from './captions.json'
import { mergePhotos } from '../lib/mergePhotos'

export const gallery = mergePhotos(photos, captions)

export default gallery
