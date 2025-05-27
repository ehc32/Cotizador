"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="w-full bg-black/95 backdrop-blur-sm text-white py-4 px-6 relative border-b border-white/10">
      <div
        className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-300 ${isSearchOpen ? "relative z-10" : ""}`}
      >
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="mr-2">
              <Image
                src="https://www.saavearquitectos.com/wp-content/uploads/2024/06/004-Blanco-horizontal-2-e1718998326209.png"
                alt="SAAVE Arquitectos"
                width={120}
                height={90}
                className="h-auto"
              />
            </div>
          </Link>
        </div>

        {!isSearchOpen && (
          <>
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="hover:text-amber-400 transition-colors font-medium">
                INICIO
              </Link>
              <Link
                href="https://www.saavearquitectos.com/sobremi/"
                className="hover:text-amber-400 transition-colors font-medium"
              >
                NOSOTROS
              </Link>
              <Link
                href="https://www.saavearquitectos.com/servicios/"
                className="hover:text-amber-400 transition-colors font-medium"
              >
                SERVICIOS
              </Link>
              <Link
                href="https://www.saavearquitectos.com/proyectos/"
                className="hover:text-amber-400 transition-colors font-medium"
              >
                PROYECTOS
              </Link>
              <Link
                href="https://www.saavearquitectos.com/reservas/"
                className="hover:text-amber-400 transition-colors font-medium bg-amber-600 px-4 py-2 rounded-md"
              >
                ¡AGENDA TÚ CITA!
              </Link>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </>
        )}

        <div className="flex items-center">
          {isSearchOpen ? (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-sm px-6 py-4 z-20 flex items-center">
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full bg-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-white/60"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:text-amber-400 transition-colors hover:bg-white/10"
            >
              <Search size={20} />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-white/10 py-4">
          <div className="flex flex-col space-y-4 px-6">
            <Link href="/" className="hover:text-amber-400 transition-colors font-medium py-2">
              INICIO
            </Link>
            <Link
              href="https://www.saavearquitectos.com/sobremi/"
              className="hover:text-amber-400 transition-colors font-medium py-2"
            >
              NOSOTROS
            </Link>
            <Link
              href="https://www.saavearquitectos.com/servicios/"
              className="hover:text-amber-400 transition-colors font-medium py-2"
            >
              SERVICIOS
            </Link>
            <Link
              href="https://www.saavearquitectos.com/proyectos/"
              className="hover:text-amber-400 transition-colors font-medium py-2"
            >
              PROYECTOS
            </Link>
            <Link
              href="https://www.saavearquitectos.com/reservas/"
              className="bg-amber-600 text-white px-4 py-3 rounded-md font-medium text-center"
            >
              ¡AGENDA TÚ CITA!
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
