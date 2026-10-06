import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section from './components/Section'
import Footer from './components/Footer'
import PhotoGallery from './components/PhotoGallery'
import ProjectsCarousel from './components/ProjectsCarousel'
import { useEffect } from 'react'
import { slowScrollTo } from './lib/smoothScroll'

function App() {
  const backgroundStyle = {
    backgroundImage: 'radial-gradient(ellipse at top right, rgba(255,106,26,0.18), transparent 60%)',
    backgroundSize: '100% 100svh',
    backgroundRepeat: 'no-repeat',
  }

  // Controlador Profesional de Diapositivas
  useEffect(() => {
    let isAnimating = false;

    const handleWheel = (e) => {
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
        slowScrollTo(sections[nextIndex]);
        
        // Tiempo de bloqueo para que la animación termine suavemente
        setTimeout(() => {
          isAnimating = false;
        }, 1300);
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div style={backgroundStyle} className="min-h-screen overflow-x-hidden w-full">
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
  )
}

export default App
