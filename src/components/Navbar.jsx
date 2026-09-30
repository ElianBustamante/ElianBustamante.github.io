import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import LanguageToggle from './LanguageToggle'
import { IconMenu, IconClose } from './icons'

const links = [
  { href: '#inicio', key: 'nav.home' },
  { href: '#proyectos', key: 'nav.projects' },
  { href: '#fotografia', key: 'nav.photography' },
  { href: '#sobre-mi', key: 'nav.about' },
  { href: '#contacto', key: 'nav.contact' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState('inicio')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 pt-4 px-4 md:px-6 lg:px-8 max-w-[1200px] mx-auto">
      <nav
        aria-label={t('nav.aria')}
        className="flex items-center justify-between rounded-[14px] bg-surface/80 backdrop-blur border border-border px-4 py-2"
      >
        <a href="#inicio" onClick={closeMenu} className="font-extrabold text-accent">
          ELIAN BUSTAMANTE
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = activeId === link.href.substring(1)
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={`text-sm hover:text-accent transition-colors ${
                  isActive ? 'text-accent font-semibold' : 'text-text'
                }`}
              >
                {t(link.key)}
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          
          <a
            href="#contacto"
            className="hidden md:flex items-center justify-center min-h-[44px] px-6 bg-accent text-on-accent rounded-full font-semibold hover:bg-accent-hover transition-colors"
          >
            {t('nav.cta')}
          </a>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] border border-border rounded-full hover:bg-surface-2 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
          >
            {menuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden mt-2 bg-surface border border-border rounded-[14px] p-4 flex flex-col gap-4">
          {links.map((link) => {
            const isActive = activeId === link.href.substring(1)
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive ? 'true' : undefined}
                className={`min-h-[44px] flex items-center px-4 rounded-lg hover:bg-surface-2 transition-colors ${
                  isActive ? 'text-accent font-semibold bg-surface-2' : 'text-text'
                }`}
              >
                {t(link.key)}
              </a>
            )
          })}
          <a
            href="#contacto"
            onClick={closeMenu}
            className="min-h-[44px] flex items-center justify-center bg-accent text-on-accent rounded-full font-semibold hover:bg-accent-hover transition-colors"
          >
            {t('nav.cta')}
          </a>
        </div>
      )}
    </header>
  )
}
