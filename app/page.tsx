import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ContentSection } from "@/components/content-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ContentSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
