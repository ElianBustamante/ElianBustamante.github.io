import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import en from './locales/en.json'

function readStoredLang() {
  try {
    return localStorage.getItem('lang')
  } catch {
    return null
  }
}

const initialLang = readStoredLang() === 'en' ? 'en' : 'es'

function syncDocument(lang) {
  document.documentElement.lang = lang
  document.title = i18n.t('meta.title')
  const meta = document.querySelector('meta[name="description"]')
  if (meta) meta.setAttribute('content', i18n.t('meta.description'))
}

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: initialLang,
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
})

syncDocument(initialLang)

i18n.on('languageChanged', (lang) => {
  try {
    localStorage.setItem('lang', lang)
  } catch {
    /* storage unavailable: ignore */
  }
  syncDocument(lang)
})

export default i18n
