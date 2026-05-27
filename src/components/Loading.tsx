"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export default function Loading() {
  const [fadeOut, setFadeOut] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200)
    const hideTimer = setTimeout(() => setHidden(true), 1600)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
      </div>

      {/* Logo container */}
      <div className="relative flex items-center justify-center">
        {/* Rotating ring */}
        <div className="absolute w-28 h-28 rounded-full border-2 border-transparent border-t-purple-500 border-r-pink-500 animate-spin" />
        {/* Pulse ring */}
        <div className="absolute w-20 h-20 rounded-full border border-purple-500/30 animate-ping" />
        {/* Logo */}
        <div className="w-16 h-16 relative z-10">
          <Image
            src="/taskflow.png"
            alt="TaskFlow"
            width={64}
            height={64}
            className="object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
            priority
          />
        </div>
      </div>

      {/* Brand name */}
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-wide">
          TaskFlow
        </h1>
        <p className="mt-1 text-xs text-slate-500 uppercase tracking-[0.2em] font-medium">
          Carregando...
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-40 h-0.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-[loading_1.4s_ease-in-out_forwards]" />
      </div>

      <style jsx>{`
        @keyframes loading {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </div>
  )
}
