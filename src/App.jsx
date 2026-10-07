import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section from './components/Section'
import Footer from './components/Footer'
import PhotoGallery from './components/PhotoGallery'
import ProjectsCarousel from './components/ProjectsCarousel'
import { useEffect } from 'react'
import AnimatedBackground from './components/AnimatedBackground'

function App() {
  // Controlador Profesional de Diapositivas
  useEffect(() => {
    let isAnimating = false;

    const handleWheel = (e) => {
      // 0. Si el usuario está usando la rueda dentro de un Lightbox abierto, ignorar salto de sección
      if (e.target.closest('dialog')) return;

      // 1. En móviles, dejamos el scroll libre nativo para poder leer tarjetas largas
      if (window.innerWidth < 768) return;

      // 2. Ignorar scroll horizontal (para que el carrusel de proyectos funcione con trackpad)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      // 3. Bloqueamos el scroll tosco del navegador
      e.preventDefault();
      
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

      // Con apenas un toque de la rueda (delta > 5), disparamos el salto
      if (e.deltaY > 5 && closestIndex < sections.length - 1) {
        nextIndex++;
      } else if (e.deltaY < -5 && closestIndex > 0) {
        nextIndex--;
      }

      if (nextIndex !== closestIndex) {
        isAnimating = true;
        sections[nextIndex].scrollIntoView({ behavior: 'smooth' });
        
        // Tiempo de bloqueo para que la animación termine suavemente
        setTimeout(() => {
          isAnimating = false;
        }, 850);
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="w-full relative overflow-x-hidden min-h-screen max-md:min-h-0 max-md:h-[100dvh] max-md:overflow-y-auto max-md:snap-y max-md:snap-mandatory scroll-smooth">
      <AnimatedBackground />
      
      {/* Contenido protegido por encima del fondo */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ProjectsCarousel />
          <PhotoGallery />
          <Section id="sobre-mi" titleKey="about.title"></Section>
          <Section id="contacto" titleKey="contact.title"></Section>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
