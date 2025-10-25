import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-secondary py-14 md:py-26">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Bienvenido al Programa de Ingeniería de Sistemas
          </h1>
          <p className="mt-4 text-balance text-lg text-muted-foreground md:text-xl">Universidad Francisco de Paula Santander</p>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Descubre todo sobre nuestra carrera: planes de estudio, profesores, eventos y más
          </p>
          <div className="mt-10">
            <Button size="lg" className="text-base">
              Consulta ahora con nuestro chatbot
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/5" />
    </section>
  )
}
