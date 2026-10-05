import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section from './components/Section'
import Footer from './components/Footer'
import PhotoGallery from './components/PhotoGallery'
import ProjectsCarousel from './components/ProjectsCarousel'

function App() {
  const backgroundStyle = {
    backgroundImage: 'radial-gradient(ellipse at top right, rgba(255,106,26,0.18), transparent 60%)',
    backgroundSize: '100% 100svh',
    backgroundRepeat: 'no-repeat',
  }

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
