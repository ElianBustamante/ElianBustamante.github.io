import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import LanguageToggle from './LanguageToggle'
import { IconMenu, IconClose } from './icons'
import { scrollToElement } from '../lib/scroll'

const links = [
  { href: '#inicio', key: 'nav.home' },
  { href: '#proyectos', key: 'nav.projects' },
  { href: '#fotografia', key: 'nav.photography' },
  { href: '#sobre-mi', key: 'nav.about' },
  { href: '#contacto', key: 'nav.contact' },
]

export default function NavRail({ activeId }) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        buttonRef.current?.focus()
      }
    }
    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(max-height: 520px) and (orientation: landscape)')
    const handleChange = (e) => {
      if (!e.matches) {
        setMenuOpen(false)
      }
    }
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange)
    } else if (mql.addListener) {
      mql.addListener(handleChange)
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleChange)
      } else if (mql.removeListener) {
        mql.removeListener(handleChange)
      }
    }
  }, [])

  useEffect(() => {
    if (menuOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a')
      if (firstLink) firstLink.focus()
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const toggleMenu = () => setMenuOpen((prev) => !prev)

  const isFirst = !activeId || activeId === 'inicio'
  const isLast = activeId === 'contacto'

  const handlePrev = () => {
    const sections = Array.from(document.querySelectorAll('section[id]'))
    if (!sections.length) return
    const currentIdx = Math.max(0, sections.findIndex((s) => s.id === activeId))
    const targetIdx = Math.max(0, currentIdx - 1)
    scrollToElement(sections[targetIdx])
  }

  const handleNext = () => {
    const sections = Array.from(document.querySelectorAll('section[id]'))
    if (!sections.length) return
    const currentIdx = Math.max(0, sections.findIndex((s) => s.id === activeId))
    const targetIdx = Math.min(sections.length - 1, currentIdx + 1)
    scrollToElement(sections[targetIdx])
  }

  return (
    <>
      <nav 
        aria-label={t('nav.aria')}
        className="hidden [@media(max-height:520px)_and_(orientation:landscape)]:flex fixed left-[max(0.5rem,env(safe-area-inset-left))] top-2 bottom-2 w-[56px] z-[60] flex-col justify-between items-center py-2 bg-surface/80 backdrop-blur-md border border-border rounded-[22px]"
      >
        <a 
          href="#inicio" 
          onClick={closeMenu}
          aria-label={t('nav.home')}
          className="flex items-center justify-center w-10 h-10 min-h-[44px] min-w-[44px] rounded-[11px] bg-accent/15 text-accent font-bold text-[0.875rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          EB
        </a>

        {!isFirst ? (
          <button
            type="button"
            onClick={handlePrev}
            aria-label={t('nav.prevSection')}
            className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] p-2 text-muted hover:text-accent transition-colors motion-safe:animate-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
          </button>
        ) : (
          <div className="w-11 h-11" aria-hidden="true" />
        )}

        <button
          ref={buttonRef}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] border border-border rounded-full bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="rail-menu"
          aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={handleNext}
            aria-label={t('nav.nextSection')}
            className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] p-2 text-muted hover:text-accent transition-colors motion-safe:animate-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        ) : (
          <div className="w-11 h-11" aria-hidden="true" />
        )}

        <LanguageToggle compact={true} />
      </nav>

      {/* Panel del menú */}
      {menuOpen && (
        <div 
          id="rail-menu"
          ref={menuRef}
          className="hidden [@media(max-height:520px)_and_(orientation:landscape)]:flex fixed top-2 left-[calc(max(0.5rem,env(safe-area-inset-left))+56px+0.5rem)] w-[240px] max-h-[calc(100dvh-1rem)] overflow-y-auto [scrollbar-width:none] z-[100] flex-col gap-1 p-2 bg-surface/80 backdrop-blur-md border border-border rounded-[22px] shadow-2xl"
        >
          {links.map((link, index) => {
            const isActive = activeId === link.href.substring(1)
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive ? 'true' : undefined}
                className={`hero-in min-h-[44px] text-sm w-full flex items-center px-4 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive 
                    ? 'bg-accent/15 text-accent border-accent/40' 
                    : 'bg-surface-2 text-text border-transparent hover:border-border'
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {t(link.key)}
              </a>
            )
          })}
          <a
            href="#contacto"
            onClick={closeMenu}
            className="hero-in min-h-[44px] text-sm w-full mt-1 flex items-center justify-center bg-accent text-on-accent rounded-full font-semibold hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            style={{ animationDelay: `${links.length * 40}ms` }}
          >
            {t('nav.cta')}
          </a>
        </div>
      )}
    </>
  )
}
