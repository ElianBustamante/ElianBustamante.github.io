import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section from './components/Section'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Section id="proyectos" titleKey="projects.title"></Section>
        <Section id="fotografia" titleKey="photography.title"></Section>
        <Section id="sobre-mi" titleKey="about.title"></Section>
        <Section id="contacto" titleKey="contact.title"></Section>
      </main>
      <Footer />
    </>
  )
}

export default App
