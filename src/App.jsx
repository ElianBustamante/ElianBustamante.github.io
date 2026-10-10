import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section from './components/Section'
import Footer from './components/Footer'
import PhotoGallery from './components/PhotoGallery'
import ProjectsCarousel from './components/ProjectsCarousel'
import { useEffect, useRef } from 'react'
import AnimatedBackground from './components/AnimatedBackground'
import { scrollToElement } from './lib/scroll'
import {
  shouldInterceptKey,
  getKeyDirection,
  shouldInterceptWheel,
  findClosestSectionIndex,
  getSectionOnFocus,
  shouldRealignOnResize
} from './lib/slides'

function App() {
  const mainRef = useRef(null)
  const currentSectionRef = useRef(null)
  const resizingRef = useRef(false)

  // Enlace profundo y ScrollSpy
  useEffect(() => {
    const hash = window.location.hash ? window.location.hash.slice(1) : ''
    let initialElement = null
    if (hash) {
      const el = document.getElementById(hash)
      if (el && el.tagName === 'SECTION') {
        initialElement = el
        el.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
    }

    let observer = null
    const startScrollSpy = () => {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target.id) {
            window.history.replaceState(null, '', `#${entry.target.id}`)
          }
        })
      }, {
        rootMargin: '-50% 0px -50% 0px'
      })

      // Observa solo section[id] (no header)
      const sections = document.querySelectorAll('section[id]')
      sections.forEach(sec => observer.observe(sec))
    }

    // Inicia ScrollSpy después de que la posición inicial por hash se haya aplicado
    const spyTimer = setTimeout(startScrollSpy, initialElement ? 80 : 0)

    return () => {
      clearTimeout(spyTimer)
      if (observer) observer.disconnect()
    }
  }, [])

  // Controlador de Diapositivas
  useEffect(() => {
    let isTransitioning = false
    let scrollEnded = true
    let wheelQuiet = true
    let wheelTimeout = null
    let fallbackTimeout = null

    const checkUnlock = () => {
      if (scrollEnded && wheelQuiet) {
        isTransitioning = false
      }
    }

    const onScrollEnd = () => {
      clearTimeout(fallbackTimeout)
      scrollEnded = true
      checkUnlock()
    }

    const performScroll = (direction) => {
      if (isTransitioning) return

      const sections = Array.from(document.querySelectorAll('section, footer'))
      if (!sections.length) return

      const closestIndex = findClosestSectionIndex(sections)
      let nextIndex = closestIndex

      if (direction > 0 && closestIndex < sections.length - 1) {
        nextIndex++
      } else if (direction < 0 && closestIndex > 0) {
        nextIndex--
      }

      if (nextIndex !== closestIndex) {
        isTransitioning = true
        scrollEnded = false
        wheelQuiet = false

        if ('onscrollend' in window) {
          window.addEventListener('scrollend', onScrollEnd, { once: true })
        }
        clearTimeout(fallbackTimeout)
        fallbackTimeout = setTimeout(onScrollEnd, 800)

        scrollToElement(sections[nextIndex])
      }
    }

    const handleWheel = (e) => {
      if (window.innerWidth < 768) return

      const sections = Array.from(document.querySelectorAll('section, footer'))
      const closestIndex = findClosestSectionIndex(sections)
      const currentSection = sections[closestIndex]

      if (!shouldInterceptWheel(e, { currentSection, windowHeight: window.innerHeight })) {
        return
      }

      e.preventDefault()

      wheelQuiet = false
      clearTimeout(wheelTimeout)
      wheelTimeout = setTimeout(() => {
        wheelQuiet = true
        checkUnlock()
      }, 150)

      if (isTransitioning) return

      const direction = e.deltaY > 0 ? 1 : -1
      performScroll(direction)
    }

    const handleKeyDown = (e) => {
      if (window.innerWidth < 768) return
      if (!shouldInterceptKey(e)) return

      const direction = getKeyDirection(e)
      if (direction !== 0) {
        e.preventDefault()
        performScroll(direction)
      }
    }

    document.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('keydown', handleKeyDown, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleWheel)
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(wheelTimeout)
      clearTimeout(fallbackTimeout)
      window.removeEventListener('scrollend', onScrollEnd)
    }
  }, [])

  // Foco con teclado: alinear con el inicio de la sección en focusin
  useEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return

    const handleFocusIn = (e) => {
      const focusedElement = e.target
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const targetSection = getSectionOnFocus({
            focusedElement,
            windowHeight: window.innerHeight
          })

          if (targetSection) {
            scrollToElement(targetSection, { behavior: 'auto' })
          }
        })
      })
    }

    mainEl.addEventListener('focusin', handleFocusIn)
    return () => {
      mainEl.removeEventListener('focusin', handleFocusIn)
    }
  }, [])

  // Realinear la diapositiva actual cuando cambia el zoom o el tamaño de la ventana
  useEffect(() => {
    let prev = {
      width: typeof window !== 'undefined' ? window.innerWidth : 0,
      height: typeof window !== 'undefined' ? window.innerHeight : 0,
      dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 1
    }
    let resizeTimer = null
    let rafId = null

    const updateCurrentSection = () => {
      if (resizingRef.current) return
      const sections = Array.from(document.querySelectorAll('section, footer'))
      if (!sections.length) return
      const idx = findClosestSectionIndex(sections)
      currentSectionRef.current = sections[idx] || null
    }

    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        updateCurrentSection()
      })
    }

    const handleResize = () => {
      resizingRef.current = true
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const cur = {
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: window.devicePixelRatio
        }
        if (
          shouldRealignOnResize({ prev, cur }) &&
          currentSectionRef.current
        ) {
          scrollToElement(currentSectionRef.current, { behavior: 'auto' })
        }
        prev = cur
        resizingRef.current = false
      }, 150)
    }

    document.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    window.addEventListener('resize', handleResize)

    // Actualiza también una vez al montar, después de aplicar el enlace profundo
    updateCurrentSection()
    const mountTimer = setTimeout(updateCurrentSection, 100)

    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('resize', handleResize)
      clearTimeout(mountTimer)
      clearTimeout(resizeTimer)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen max-md:min-h-0 max-md:h-[100dvh] max-md:overflow-y-auto max-md:snap-y max-md:snap-mandatory [@media(max-height:600px)]:snap-none scroll-smooth">
      <AnimatedBackground />
      
      {/* Contenido protegido por encima del fondo */}
      <div className="relative z-10">
        <Navbar />
        <main ref={mainRef} className="pl-[var(--rail-w)]">
          <Hero />
          <ProjectsCarousel />
          <PhotoGallery />
          <Section id="sobre-mi" titleKey="about.title"></Section>
          <Section id="contacto" titleKey="contact.title"></Section>
        </main>
        <div className="pl-[var(--rail-w)]"><Footer /></div>
      </div>
    </div>
  )
}

export default App
