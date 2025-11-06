import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center">
            <Image src="/logo-ufps.png" alt="Logo UFPS" width={150} height={50} className="h-16 w-auto" />
          </Link>
          {/* # todo remove */}
          {/* <Image
            src="/logo-ingenieria-sistemas.png"
            alt="Logo Ingeniería de Sistemas"
            width={150}
            height={50}
            className="hidden h-16 w-auto md:block"
          /> */}
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#inicio" className="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="#programa" className="text-sm font-medium transition-colors hover:text-primary">
            Programa
          </Link>
          <Link href="#contacto" className="text-sm font-medium transition-colors hover:text-primary">
            Contacto
          </Link>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span className="sr-only">Abrir menú</span>
        </Button>
      </div>
    </header>
  )
}
