import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Contact from './components/Contact'
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
import { createWheelGesture, normalizeWheelDelta } from './lib/wheelGesture'
import { usesInnerScroll } from './lib/media'

function App() {
  const mainRef = useRef(null)
  const currentSectionRef = useRef(null)
  const resizingRef = useRef(false)

  // Deep linking and ScrollSpy
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

      // Observe only section[id] (not header)
      const sections = document.querySelectorAll('section[id]')
      sections.forEach(sec => observer.observe(sec))
    }

    // Start ScrollSpy after the initial hash position has been applied
    const spyTimer = setTimeout(startScrollSpy, initialElement ? 80 : 0)

    return () => {
      clearTimeout(spyTimer)
      if (observer) observer.disconnect()
    }
  }, [])

  // Slide controller
  useEffect(() => {
    let isTransitioning = false
    let fallbackTimeout = null
    const gesture = createWheelGesture()

    const unlock = () => {
      clearTimeout(fallbackTimeout)
      window.removeEventListener('scrollend', unlock)
      isTransitioning = false
    }

    const performScroll = (direction) => {
      if (isTransitioning) return

      const sections = Array.from(document.querySelectorAll('section'))
      if (!sections.length) return

      const closestIndex = findClosestSectionIndex(sections)
      let nextIndex = closestIndex

      if (direction > 0 && closestIndex < sections.length - 1) {
        nextIndex++
      } else if (direction < 0 && closestIndex > 0) {
        nextIndex--
      }

      if (nextIndex === closestIndex) return

      isTransitioning = true
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', unlock, { once: true })
      }
      clearTimeout(fallbackTimeout)
      fallbackTimeout = setTimeout(unlock, 1000)

      scrollToElement(sections[nextIndex])
    }

    const handleWheel = (e) => {
      if (usesInnerScroll()) return

      const sections = Array.from(document.querySelectorAll('section'))
      const currentSection = sections[findClosestSectionIndex(sections)]
      const delta = normalizeWheelDelta(e, window.innerHeight)

      // minDelta: 0 -> we also handle small inertial tail events
      // so the browser never scrolls the page on its own in this mode
      if (!shouldInterceptWheel(e, { currentSection, windowHeight: window.innerHeight, minDelta: 0 })) {
        gesture.consume({ delta, time: e.timeStamp })
        return
      }

      e.preventDefault()
      const direction = gesture.push({ delta, time: e.timeStamp, busy: isTransitioning })
      if (direction !== 0) performScroll(direction)
    }

    const handleKeyDown = (e) => {
      if (usesInnerScroll()) return
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
      clearTimeout(fallbackTimeout)
      window.removeEventListener('scrollend', unlock)
    }
  }, [])

  // Keyboard focus: align with section start on focusin
  useEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return

    const handleFocusIn = (e) => {
      const focusedElement = e.target
      if (!focusedElement) return

      let isKeyboardFocus = true
      try {
        if (typeof focusedElement.matches === 'function') {
          isKeyboardFocus = focusedElement.matches(':focus-visible')
        }
      } catch {
        // Fall back to current behavior if :focus-visible is not supported
        isKeyboardFocus = true
      }

      if (!isKeyboardFocus) return

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (document.activeElement !== focusedElement) return

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

  // Realign current slide when zoom or window size changes
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
      const sections = Array.from(document.querySelectorAll('section'))
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
          shouldRealignOnResize({
            prev,
            cur,
            coarse: window.matchMedia?.('(pointer: coarse)').matches === true
          }) &&
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

    // Also update once on mount, after applying deep link
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
    <div className="w-full relative overflow-x-clip min-h-screen inner-scroll:min-h-0 inner-scroll:h-[100dvh] inner-scroll:overflow-y-auto inner-scroll:snap-y inner-scroll:snap-mandatory [@media(orientation:portrait)_and_(max-height:600px)]:snap-none scroll-smooth">
      <AnimatedBackground />
      
      {/* Protected content above the background */}
      <div className="relative z-10">
        <Navbar />
        <main ref={mainRef} className="pl-[var(--rail-w)]">
          <Hero />
          <ProjectsCarousel />
          <PhotoGallery />
          <About />
          <Contact />
        </main>
      </div>
    </div>
  )
}

export default App
