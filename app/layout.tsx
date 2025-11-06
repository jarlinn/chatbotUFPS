import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ingeniería de Sistemas - Universidad UFPS",
  description: "Programa de Ingeniería de Sistemas de la Universidad UFPS",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Script
          id="n8n-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.N8N_BASE_URL = '${process.env.NEXT_PUBLIC_N8N_BASE_URL}';`,
          }}
        />
        <Script src="./chat-widget.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
