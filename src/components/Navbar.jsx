import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import LanguageToggle from './LanguageToggle'
import { IconMenu, IconClose } from './icons'
import NavRail from './NavRail'

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

  const closeMenu = () => {
    if (document.startViewTransition) {
      try {
        const transition = document.startViewTransition(() => setMenuOpen(false))
        transition.ready.catch(() => {})
      } catch {
        setMenuOpen(false)
      }
    } else {
      setMenuOpen(false)
    }
  }

  return (
    <>
      <NavRail activeId={activeId} />
      
      {menuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-[40] pointer-events-auto transition-opacity duration-300"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
      
      <header className="fixed top-0 right-0 z-50 w-full pointer-events-none animate-nav-in transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(max-height:520px)_and_(orientation:landscape)]:hidden">
        <div className="pt-4 pb-4 px-2 min-[400px]:px-4 md:px-6 lg:px-8 max-w-[1200px] mx-auto pointer-events-auto flex gap-2">
          
          {/* Main Navigation */}
          <nav
            aria-label={t('nav.aria')}
            className="flex items-center justify-between rounded-[22px] bg-surface-2 border border-border px-2 min-[400px]:px-3 py-2 w-full"
          >
          <a href="#inicio" onClick={closeMenu} className="flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[11px] pr-2">
            <div aria-hidden="true" className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-accent/15 rounded-[11px] text-accent font-bold text-[0.875rem]">
              EB
            </div>
            <span className="text-text font-semibold text-base whitespace-nowrap">
              <span className="hidden min-[300px]:inline">Elian</span> <span className="hidden min-[400px]:inline">Bustamante</span>
            </span>
          </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => {
            const isActive = activeId === link.href.substring(1)
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'true' : undefined}
                className={`rounded-full px-3.5 py-2 text-[0.9375rem] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive 
                    ? 'bg-accent/15 text-accent border-accent/40' 
                    : 'bg-surface-2 text-text border-transparent hover:border-border'
                }`}
              >
                {t(link.key)}
              </a>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          
          <a
            href="#contacto"
            className="hidden lg:flex items-center justify-center min-h-[44px] px-6 bg-accent text-on-accent rounded-full font-semibold hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {t('nav.cta')}
          </a>

          {/* Mobile menu button */}
          <button
            className="lg:hidden flex items-center justify-center min-h-[44px] min-w-[44px] border border-border rounded-full bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={() => {
              if (document.startViewTransition) {
                try {
                  const transition = document.startViewTransition(() => setMenuOpen(!menuOpen))
                  transition.ready.catch(() => {})
                } catch {
                  setMenuOpen(!menuOpen)
                }
              } else {
                setMenuOpen(!menuOpen)
              }
            }}
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
        <>
        <div 
          id="mobile-menu" 
          className="lg:hidden fixed top-[4.5rem] left-2 right-2 min-[400px]:left-4 min-[400px]:right-4 md:left-6 md:right-6 bg-surface-2 border border-border rounded-[22px] p-2 flex flex-col gap-1 pointer-events-auto max-h-[calc(100svh-5rem)] overflow-y-auto [scrollbar-width:none] z-[100] shadow-2xl"
        >
          {links.map((link, index) => {
            const isActive = activeId === link.href.substring(1)
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                aria-current={isActive ? 'true' : undefined}
                className={`hero-in min-h-[44px] w-full flex items-center px-4 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive 
                    ? 'bg-accent/15 text-accent border-accent/40' 
                    : 'bg-surface-2 text-text border-transparent'
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {t(link.key)}
              </a>
            )
          })}
          <a
            href="#contacto"
            onClick={closeMenu}
            className="hero-in min-h-[44px] w-full flex items-center justify-center bg-accent text-on-accent rounded-full font-semibold hover:bg-accent-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            style={{ animationDelay: `${links.length * 60}ms` }}
          >
            {t('nav.cta')}
          </a>
        </div>
        </>
      )}
      </div>
    </header>
    </>
  )
}
