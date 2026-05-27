"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts"
import {
  TrendingUp, CheckCircle, Clock, AlertCircle,
  MessageSquare, Sparkles, Activity, Zap, Target, Users
} from "lucide-react"
import AppHeader from "@/components/AppHeader"

interface Metrics {
  summary: {
    total: number
    completed: number
    inProgress: number
    pending: number
    completionRate: number
    totalComments: number
    avgCommentsPerTask: string
  }
  byStatus: { name: string; value: number; color: string }[]
  byDepartment: { name: string; value: number }[]
  byPriority: { name: string; value: number; color: string }[]
  productivity: { date: string; criadas: number; concluidas: number }[]
}

// Tooltip futurístico customizado
const FuturisticTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-xl shadow-2xl px-4 py-3 glow-purple">
      {label && <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">{label}</p>}
      {payload.map((p: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full shadow-lg" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function MetricsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    else if (status === "authenticated") fetchMetrics()
  }, [status, router])

  const fetchMetrics = async () => {
    try {
      const r = await fetch("/api/metrics")
      if (r.ok) setMetrics(await r.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Sparkles className="w-5 h-5 animate-pulse text-indigo-500" />
          Carregando métricas...
        </div>
      </div>
    )
  }

  const kpis = [
    { label: "Total de Tarefas", value: metrics.summary.total, icon: Target, gradient: "from-indigo-500 to-purple-600", glow: "shadow-indigo-500/30", color: "#a78bfa" },
    { label: "Taxa de Conclusão", value: `${metrics.summary.completionRate}%`, icon: Zap, gradient: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/30", color: "#34d399" },
    { label: "Em Progresso", value: metrics.summary.inProgress, icon: Activity, gradient: "from-blue-500 to-cyan-600", glow: "shadow-blue-500/30", color: "#22d3ee" },
    { label: "Pendentes", value: metrics.summary.pending, icon: AlertCircle, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/30", color: "#fbbf24" }
  ]

  // Dados radiais para taxa de conclusão
  const radialData = [
    { name: "Conclusão", value: metrics.summary.completionRate, fill: "url(#radialGradient)" }
  ]

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50" />
              Live Analytics
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Métricas de Produção
          </h2>
          <p className="text-slate-400 mt-1">Acompanhe o desempenho e produtividade da equipe em tempo real</p>
        </div>

        {/* KPIs Futurísticos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <div
                key={kpi.label}
                className={`relative overflow-hidden glass rounded-2xl border border-slate-800 p-6 hover:border-slate-700 transition-all animate-fade-in group hover:shadow-2xl ${kpi.glow}`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Glow effect */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${kpi.gradient} opacity-20 blur-3xl rounded-full group-hover:opacity-40 transition-opacity`} />
                
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `linear-gradient(${kpi.color} 1px, transparent 1px), linear-gradient(90deg, ${kpi.color} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px"
                }} />
                
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-4xl font-bold text-white mt-2 tracking-tight" style={{ textShadow: `0 0 20px ${kpi.color}40` }}>
                      {kpi.value}
                    </p>
                  </div>
                  <div className={`relative w-12 h-12 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center shadow-2xl ${kpi.glow}`}>
                    <Icon className="w-6 h-6 text-white" />
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${kpi.gradient} blur-md opacity-50 -z-10`} />
                  </div>
                </div>
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.gradient} opacity-50`} />
              </div>
            )
          })}
        </div>

        {/* Productivity Chart - Wide */}
        <div className="glass rounded-2xl border border-slate-800 p-6 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: "linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                  <h3 className="text-lg font-bold text-white">Produtividade</h3>
                </div>
                <p className="text-sm text-slate-400 mt-1 ml-3">Últimos 7 dias</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                  <span className="text-slate-400">Criadas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  <span className="text-slate-400">Concluídas</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.productivity}>
                <defs>
                  <linearGradient id="colorCriadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConcluidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.6}/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<FuturisticTooltip />} cursor={{ stroke: "#a78bfa", strokeWidth: 1, strokeDasharray: "5 5" }} />
                <Area type="monotone" dataKey="criadas" stroke="#a78bfa" strokeWidth={2.5} fill="url(#colorCriadas)" name="Criadas" filter="url(#glow)" />
                <Area type="monotone" dataKey="concluidas" stroke="#34d399" strokeWidth={2.5} fill="url(#colorConcluidas)" name="Concluídas" filter="url(#glow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Radial Completion Rate */}
          <div className="glass rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 blur-3xl rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
                <h3 className="text-lg font-bold text-white">Taxa de Conclusão</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadialBarChart innerRadius="65%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <defs>
                    <linearGradient id="radialGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: "#1e293b" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-6 text-center pointer-events-none">
                <p className="text-4xl font-bold text-white" style={{ textShadow: "0 0 30px #34d39960" }}>
                  {metrics.summary.completionRate}%
                </p>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Concluídas</p>
              </div>
            </div>
          </div>

          {/* Status Donut */}
          <div className="glass rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 opacity-10 blur-3xl rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                <h3 className="text-lg font-bold text-white">Por Status</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {metrics.byStatus.map((entry, i) => (
                      <linearGradient key={i} id={`statusGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={metrics.byStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={55}
                    dataKey="value"
                    paddingAngle={4}
                    stroke="none"
                  >
                    {metrics.byStatus.map((entry, i) => (
                      <Cell key={i} fill={`url(#statusGrad${i})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<FuturisticTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {metrics.byStatus.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                    <span className="text-slate-400">{s.name}: <span className="text-white font-bold">{s.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priority Donut */}
          <div className="glass rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-br from-amber-500 to-red-500 opacity-10 blur-3xl rounded-full" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-red-500 rounded-full" />
                <h3 className="text-lg font-bold text-white">Por Prioridade</h3>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {metrics.byPriority.map((entry, i) => (
                      <linearGradient key={i} id={`prioGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={metrics.byPriority}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={55}
                    dataKey="value"
                    paddingAngle={4}
                    stroke="none"
                  >
                    {metrics.byPriority.map((entry, i) => (
                      <Cell key={i} fill={`url(#prioGrad${i})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<FuturisticTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {metrics.byPriority.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                    <span className="text-slate-400">{p.name}: <span className="text-white font-bold">{p.value}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="glass rounded-2xl border border-slate-800 p-6 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <h3 className="text-lg font-bold text-white">Distribuição por Departamento</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={metrics.byDepartment}>
                <defs>
                  <linearGradient id="barGradientNeon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={1} />
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                  </linearGradient>
                  <filter id="barGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<FuturisticTooltip />} cursor={{ fill: "#a78bfa", fillOpacity: 0.05 }} />
                <Bar dataKey="value" fill="url(#barGradientNeon)" name="Tarefas" radius={[12, 12, 0, 0]} filter="url(#barGlow)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engajamento - Cards Futurísticos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass rounded-2xl border border-purple-500/20 p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <MessageSquare className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 -z-10" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total de Comentários</p>
                <p className="text-4xl font-bold text-white mt-1" style={{ textShadow: "0 0 20px #a78bfa60" }}>
                  {metrics.summary.totalComments}
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
          </div>

          <div className="glass rounded-2xl border border-cyan-500/20 p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-20 blur-3xl rounded-full group-hover:opacity-30 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                <Users className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-50 -z-10" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Média por Tarefa</p>
                <p className="text-4xl font-bold text-white mt-1" style={{ textShadow: "0 0 20px #22d3ee60" }}>
                  {metrics.summary.avgCommentsPerTask}
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  )
}
