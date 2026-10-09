import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section from './components/Section'
import Footer from './components/Footer'
import PhotoGallery from './components/PhotoGallery'
import ProjectsCarousel from './components/ProjectsCarousel'
import { useEffect } from 'react'
import AnimatedBackground from './components/AnimatedBackground'
import { scrollToElement } from './lib/scroll'

function App() {
  // Controlador Profesional de Diapositivas
  useEffect(() => {
    let isAnimating = false;

    const performScroll = (direction) => {
      if (isAnimating) return;

      const sections = Array.from(document.querySelectorAll('section, footer'));
      if (!sections.length) return;

      // Buscar qué sección está dominando la pantalla
      let closestIndex = 0;
      let minDistance = Infinity;
      sections.forEach((sec, index) => {
        const rect = sec.getBoundingClientRect();
        const distance = Math.abs(rect.top);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      let nextIndex = closestIndex;

      if (direction > 0 && closestIndex < sections.length - 1) {
        nextIndex++;
      } else if (direction < 0 && closestIndex > 0) {
        nextIndex--;
      }

      if (nextIndex !== closestIndex) {
        isAnimating = true;
        scrollToElement(sections[nextIndex]);
        
        // Tiempo de bloqueo reducido para mayor agilidad sin sacrificar la protección anti-rebote
        setTimeout(() => {
          isAnimating = false;
        }, 450);
      }
    };

    const handleWheel = (e) => {
      // 0. Si el usuario está usando la rueda dentro de un Lightbox abierto, ignorar salto de sección
      if (e.target.closest('[role="dialog"]') || e.target.closest('dialog')) return;

      // 1. En móviles, dejamos el scroll libre nativo para poder leer tarjetas largas
      if (window.innerWidth < 768) return;

      // 2. Ignorar scroll horizontal (para que el carrusel de proyectos funcione con trackpad)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      // 3. Bloqueamos el scroll tosco del navegador
      e.preventDefault();
      
      // Con apenas un toque de la rueda (delta > 5), disparamos el salto
      if (e.deltaY > 5) performScroll(1);
      else if (e.deltaY < -5) performScroll(-1);
    };

    const handleKeyDown = (e) => {
      if (e.target.closest('[role="dialog"]') || e.target.closest('dialog')) return;
      if (window.innerWidth < 768) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        // Permitimos que la barra espaciadora funcione igual
        e.preventDefault();
        performScroll(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        performScroll(-1);
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ScrollSpy para actualizar la URL automáticamente al deslizar
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          // Reemplaza la URL sin añadir basura al historial de retroceso
          window.history.replaceState(null, '', `#${entry.target.id}`);
        }
      });
    }, {
      rootMargin: '-50% 0px -50% 0px' // Se activa exactamente cuando la sección cruza la mitad de la pantalla, sin importar su altura
    });

    const sections = document.querySelectorAll('section, header');
    sections.forEach(sec => observer.observe(sec));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen max-md:min-h-0 max-md:h-[100dvh] max-md:overflow-y-auto max-md:snap-y max-md:snap-mandatory [@media(max-height:600px)]:snap-none scroll-smooth">
      <AnimatedBackground />
      
      {/* Contenido protegido por encima del fondo */}
      <div className="relative z-10">
        <Navbar />
        <main className="pl-[var(--rail-w)]">
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
