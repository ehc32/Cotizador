import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { Navbar } from "@/components/navbar"
import Image from "next/image"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SAAVE | Arquitectos",
  description: "SAAVE Arquitectos - Diseño y construcción de proyectos arquitectónicos",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-[#F2F2F2]`}>
        <div className="min-h-screen relative">
          {/* Background image */}
          <Image
            src="/background.jpg"
            alt="Background image"
            fill
            className="object-cover"
          />

          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

          {/* Content */}
          <div className="relative z-10">
            <Navbar />
            <div className="bg-white/90 backdrop-blur-sm min-h-[calc(100vh-80px)]">
              {children}
              <Toaster />
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
