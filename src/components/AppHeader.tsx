"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard, ListTodo, LayoutGrid, BarChart3,
  LogOut, ChevronDown
} from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import ThemeToggle from "./ThemeToggle"

const navItems = [
  { href: "/home", label: "Início", icon: LayoutDashboard },
  { href: "/dashboard", label: "Tarefas", icon: ListTodo },
  { href: "/kanban", label: "Kanban", icon: LayoutGrid },
  { href: "/metrics", label: "Analytics", icon: BarChart3 },
]

export default function AppHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const userName = session?.user?.name || "User"
  const sector = (session?.user as any)?.sector

  return (
    <header className="sticky top-0 z-30">
      <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80" />
      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      
      <nav className="relative max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-auto py-2">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 group-hover:scale-110 transition-transform duration-200">
              <Image
                src="/taskflow.png?v=7"
                alt="TaskFlow logo"
                width={80}
                height={80}
                className="object-contain w-full h-full group-hover:scale-125 transition-all"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5 bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
            {navItems.map(item => {
              const Icon = item.icon
              const active = pathname === item.href || (item.href === "/dashboard" && pathname?.startsWith("/dashboard"))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    active
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/40 rounded-md shadow-lg shadow-purple-500/10" />
                  )}
                  <Icon className="relative w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="relative hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Theme Toggle + User Menu */}
          <div className="flex items-center gap-1.5" ref={menuRef}>
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 pl-1.5 pr-2 py-1 bg-slate-100/60 dark:bg-slate-900/40 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg transition-all"
              >
                <div className="relative w-7 h-7 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-purple-500/20">
                  {userName.charAt(0).toUpperCase()}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border-2 border-white dark:border-slate-950 rounded-full shadow-lg shadow-emerald-400/50" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{userName}</p>
                  {sector && <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">{sector}</p>}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xl overflow-hidden animate-fade-in">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-purple-500/10 to-pink-500/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-lg shadow-purple-500/30">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{session?.user?.email}</p>
                        {sector && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                            {sector}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile nav items */}
                  <div className="md:hidden py-1 border-b border-slate-200 dark:border-slate-800">
                    {navItems.map(item => {
                      const Icon = item.icon
                      const active = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all ${
                            active ? "text-purple-700 dark:text-purple-300 bg-purple-500/10" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
