import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import es from '../i18n/locales/es.json'
import en from '../i18n/locales/en.json'
import { projectsData } from '../data/projects'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '..')

function getNestedValue(obj, dottedKey) {
  return dottedKey.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

function collectSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'test') continue
      files.push(...collectSourceFiles(fullPath))
    } else if (entry.isFile() && /\.(js|jsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

describe('i18n keys usage and project items', () => {
  it('all literal t(...) keys in src/ (excluding test/) exist in es.json and en.json', () => {
    const files = collectSourceFiles(srcDir)
    const keyRegex = /\bt\(\s*['"]([^'"]+)['"]/g
    const extractedKeys = new Set()

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      let match
      while ((match = keyRegex.exec(content)) !== null) {
        const key = match[1]
        if (!key.includes('${')) {
          extractedKeys.add(key)
        }
      }
    }

    expect(extractedKeys.size).toBeGreaterThan(0)

    const missing = []
    for (const key of extractedKeys) {
      if (typeof getNestedValue(es, key) !== 'string') {
        missing.push(`es: ${key}`)
      }
      if (typeof getNestedValue(en, key) !== 'string') {
        missing.push(`en: ${key}`)
      }
    }

    expect(missing).toEqual([])
  })

  it('all projectsData items have name, category, and description in es.json and en.json', () => {
    const missing = []
    const fields = ['name', 'category', 'description']

    for (const project of projectsData) {
      for (const field of fields) {
        const key = `projects.items.${project.id}.${field}`
        if (typeof getNestedValue(es, key) !== 'string') {
          missing.push(`es: ${key}`)
        }
        if (typeof getNestedValue(en, key) !== 'string') {
          missing.push(`en: ${key}`)
        }
      }
    }

    expect(missing).toEqual([])
  })
})
