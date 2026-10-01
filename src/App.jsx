import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section from './components/Section'
import Footer from './components/Footer'
import PhotoGallery from './components/PhotoGallery'

const bgModules = import.meta.glob('./assets/hero-bg.webp', { eager: true, query: '?url', import: 'default' })
const bgUrl = bgModules['./assets/hero-bg.webp']

function App() {
  const backgroundStyle = bgUrl
    ? {
        backgroundImage: `linear-gradient(to right, rgba(10,10,10,0.95), rgba(10,10,10,0.6)), url(${bgUrl})`,
        backgroundSize: '100% 100svh',
        backgroundRepeat: 'no-repeat',
      }
    : {
        backgroundImage: 'radial-gradient(ellipse at top right, rgba(255,106,26,0.18), transparent 60%)',
        backgroundSize: '100% 100svh',
        backgroundRepeat: 'no-repeat',
      }

  return (
    <div style={backgroundStyle} className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Section id="proyectos" titleKey="projects.title"></Section>
        <PhotoGallery />
        <Section id="sobre-mi" titleKey="about.title"></Section>
        <Section id="contacto" titleKey="contact.title"></Section>
      </main>
      <Footer />
    </div>
  )
}

export default App
