"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  pulse: number
  pulseSpeed: number
  hue: number
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  twinkle: number
  twinkleSpeed: number
}

export default function NeuralBackground({ density = 80 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const { resolvedTheme } = useTheme()
  const isDarkRef = useRef(resolvedTheme === "dark")

  useEffect(() => {
    isDarkRef.current = resolvedTheme === "dark"
  }, [resolvedTheme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let nodes: Node[] = []
    let stars: Star[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initNodes()
      initStars()
    }

    const initNodes = () => {
      const count = Math.floor((canvas.width * canvas.height) / (15000 - density * 100))
      nodes = []
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 0.5,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.025,
          hue: [260, 280, 300, 190, 320][Math.floor(Math.random() * 5)]
        })
      }
    }

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 35000)
      stars = []
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 0.02 + 0.005,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.015 + Math.random() * 0.03
        })
      }
    }

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
    }

    const hsl = (h: number, s: number, l: number, a: number) => `hsla(${h}, ${s}%, ${l}%, ${a})`

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const maxDist = 160
      const mouseDist = 200

      const isDark = isDarkRef.current

      // draw stars first (background layer)
      stars.forEach(star => {
        star.twinkle += star.twinkleSpeed
        const tw = Math.sin(star.twinkle) * 0.5 + 0.5
        const alpha = star.opacity * (0.4 + tw * 0.6) * (isDark ? 1 : 0.7)

        if (isDark) {
          ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`
        } else {
          ctx.fillStyle = `rgba(124, 58, 237, ${alpha})`
        }
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * (0.7 + tw * 0.3), 0, Math.PI * 2)
        ctx.fill()

        // star glow for larger ones
        if (star.size > 1) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 5)
          if (isDark) {
            glow.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.3})`)
            glow.addColorStop(1, "rgba(200, 220, 255, 0)")
          } else {
            glow.addColorStop(0, `rgba(124, 58, 237, ${alpha * 0.25})`)
            glow.addColorStop(1, "rgba(124, 58, 237, 0)")
          }
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // update + move nodes
      nodes.forEach(node => {
        node.x += node.vx
        node.y += node.vy
        node.pulse += node.pulseSpeed

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        const mdx = mouseRef.current.x - node.x
        const mdy = mouseRef.current.y - node.y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < mouseDist && md > 0) {
          node.x += (mdx / md) * 0.35
          node.y += (mdy / md) * 0.35
        }
      })

      // draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * (isDark ? 0.35 : 0.55)
            const midHue = (nodes[i].hue + nodes[j].hue) / 2
            const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y)
            gradient.addColorStop(0, hsl(nodes[i].hue, 80, isDark ? 65 : 45, opacity))
            gradient.addColorStop(0.5, hsl(midHue, 85, isDark ? 70 : 50, opacity * 0.8))
            gradient.addColorStop(1, hsl(nodes[j].hue, 80, isDark ? 65 : 45, opacity))
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.6 + (1 - dist / maxDist) * (isDark ? 0.8 : 1.2)
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }

        // connection to mouse
        const mdx = mouseRef.current.x - nodes[i].x
        const mdy = mouseRef.current.y - nodes[i].y
        const md = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < mouseDist) {
          const opacity = (1 - md / mouseDist) * (isDark ? 0.5 : 0.7)
          ctx.strokeStyle = hsl(nodes[i].hue, 90, isDark ? 75 : 45, opacity)
          ctx.lineWidth = isDark ? 1.2 : 1.6
          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y)
          ctx.stroke()
        }
      }

      // draw nodes (pulsing with multi-color glow)
      nodes.forEach(node => {
        const pulse = Math.sin(node.pulse) * 0.5 + 0.5
        const r = node.radius + pulse * 1.5

        // outer glow
        const outerGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 5)
        outerGlow.addColorStop(0, hsl(node.hue, 90, isDark ? 60 : 45, 0.25 * pulse + (isDark ? 0.08 : 0.15)))
        outerGlow.addColorStop(0.5, hsl(node.hue, 85, isDark ? 50 : 40, 0.1 * pulse + (isDark ? 0.03 : 0.08)))
        outerGlow.addColorStop(1, `hsla(${node.hue}, 80%, ${isDark ? 50 : 40}%, 0)`)
        ctx.fillStyle = outerGlow
        ctx.beginPath()
        ctx.arc(node.x, node.y, r * 5, 0, Math.PI * 2)
        ctx.fill()

        // inner glow
        const innerGlow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2)
        innerGlow.addColorStop(0, hsl(node.hue, 95, isDark ? 85 : 55, 0.9))
        innerGlow.addColorStop(1, hsl(node.hue, 90, isDark ? 60 : 45, 0))
        ctx.fillStyle = innerGlow
        ctx.beginPath()
        ctx.arc(node.x, node.y, r * 2, 0, Math.PI * 2)
        ctx.fill()

        // core
        ctx.fillStyle = `hsla(${node.hue}, 100%, ${isDark ? 95 : 40}%, ${isDark ? 0.85 + pulse * 0.15 : 0.7 + pulse * 0.2})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, r * 0.6, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouse)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [density])

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Deep space base - dark only */}
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_top,_#0f0c29_0%,_#1a1033_25%,_#0d1117_60%,_#020617_100%)]" />
      
      {/* Light mode soft gradient */}
      <div className="absolute inset-0 dark:hidden bg-gradient-to-br from-slate-50 via-indigo-100/40 to-cyan-100/30" />

      {/* Aurora-like color washes - dark */}
      <div className="absolute inset-0 hidden dark:block opacity-30"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139, 92, 246, 0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(6, 182, 212, 0.12), transparent), radial-gradient(ellipse 50% 50% at 50% 10%, rgba(236, 72, 153, 0.08), transparent)`
        }}
      />

      {/* Light mode vibrant aurora */}
      <div className="absolute inset-0 dark:hidden opacity-60"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 30% 30%, rgba(124, 58, 237, 0.12), transparent), radial-gradient(ellipse 50% 50% at 70% 70%, rgba(2, 132, 199, 0.1), transparent), radial-gradient(ellipse 60% 50% at 50% 80%, rgba(219, 39, 119, 0.08), transparent)`
        }}
      />

      {/* Canvas for particles */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Bottom vignette - dark */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      
      {/* Bottom vignette - light */}
      <div className="absolute inset-0 dark:hidden bg-gradient-to-t from-white/60 via-transparent to-transparent" />

      {/* Top vignette for depth - dark */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-slate-950/40 via-transparent to-transparent" />
      
      {/* Top vignette - light */}
      <div className="absolute inset-0 dark:hidden bg-gradient-to-b from-white/40 via-transparent to-transparent" />
    </div>
  )
}
