"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ListTodo, LayoutGrid, BarChart3, Sparkles, Clock, CheckCircle2,
  AlertCircle, TrendingUp, ArrowRight, MessageSquare, Wand2, Zap,
  Activity, Calendar, Target, Flame
} from "lucide-react"
import AppHeader from "@/components/AppHeader"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  department: string
  createdAt: string
  user: { id: string; name: string }
  comments: any[]
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending: { label: "Pendente", color: "text-amber-300", icon: Clock, bg: "bg-amber-500/10 border-amber-500/30" },
  in_progress: { label: "Em Progresso", color: "text-blue-300", icon: AlertCircle, bg: "bg-blue-500/10 border-blue-500/30" },
  completed: { label: "Concluído", color: "text-emerald-300", icon: CheckCircle2, bg: "bg-emerald-500/10 border-emerald-500/30" }
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  high: { label: "Alta", color: "text-red-300 bg-red-500/15" },
  medium: { label: "Média", color: "text-amber-300 bg-amber-500/15" },
  low: { label: "Baixa", color: "text-emerald-300 bg-emerald-500/15" }
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    else if (status === "authenticated") fetchTasks()
  }, [status, router])

  const fetchTasks = async () => {
    try {
      const r = await fetch("/api/tasks?limit=100")
      if (r.ok) {
        const data = await r.json()
        setTasks(data.tasks || data)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-6 h-6 animate-pulse text-purple-400" />
      </div>
    )
  }

  const total = tasks.length
  const completed = tasks.filter(t => t.status === "completed").length
  const inProgress = tasks.filter(t => t.status === "in_progress").length
  const pending = tasks.filter(t => t.status === "pending").length
  const myTasks = tasks.filter(t => t.user.id === (session?.user as any)?.id)
  const highPriority = tasks.filter(t => t.priority === "high" && t.status !== "completed")
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  const userName = session?.user?.name?.split(" ")[0] || "lá"
  
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Bom dia"
    if (h < 18) return "Boa tarde"
    return "Boa noite"
  })()

  // Departamentos mais ativos
  const deptCounts = tasks.reduce((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  const quickActions = [
    {
      href: "/dashboard",
      label: "Tarefas",
      desc: "Lista completa",
      icon: ListTodo,
      gradient: "from-indigo-500 to-purple-600",
      glow: "shadow-indigo-500/30"
    },
    {
      href: "/kanban",
      label: "Kanban",
      desc: "Quadro visual",
      icon: LayoutGrid,
      gradient: "from-purple-500 to-pink-600",
      glow: "shadow-purple-500/30"
    },
    {
      href: "/metrics",
      label: "Analytics",
      desc: "Métricas em tempo real",
      icon: BarChart3,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/30"
    }
  ]

  return (
    <div className="min-h-screen">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse shadow-lg shadow-purple-400/50" />
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              {greeting}, 
            </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent ml-2">
              {userName}
            </span>
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">!</span>
          </h1>
          <p className="text-slate-400 mt-2">Aqui está um resumo da sua produtividade hoje.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: total, icon: Target, gradient: "from-indigo-500 to-purple-600", color: "#a78bfa" },
            { label: "Em Progresso", value: inProgress, icon: Activity, gradient: "from-blue-500 to-cyan-600", color: "#22d3ee" },
            { label: "Concluídas", value: completed, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600", color: "#34d399" },
            { label: "Urgentes", value: highPriority.length, icon: Flame, gradient: "from-red-500 to-orange-600", color: "#f87171" }
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative overflow-hidden glass rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all animate-fade-in group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${stat.gradient} opacity-15 blur-3xl rounded-full group-hover:opacity-30 transition-opacity`} />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2" style={{ textShadow: `0 0 20px ${stat.color}40` }}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-50`} />
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Progress Hero */}
          <div className="lg:col-span-2 glass rounded-2xl border border-purple-500/20 p-6 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-500 to-pink-500 opacity-15 blur-3xl rounded-full" />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: "linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                    <h3 className="text-lg font-bold text-white">Seu Progresso</h3>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 ml-3">Taxa de conclusão geral</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 20px rgba(168, 139, 250, 0.4))" }}>
                    {completionRate}%
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-3 bg-slate-900/60 rounded-full overflow-hidden mb-6">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full transition-all duration-1000 shadow-lg shadow-purple-500/50"
                  style={{ width: `${completionRate}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pendente</p>
                  </div>
                  <p className="text-xl font-bold text-white">{pending}</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Progresso</p>
                  </div>
                  <p className="text-xl font-bold text-white">{inProgress}</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Concluído</p>
                  </div>
                  <p className="text-xl font-bold text-white">{completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Action */}
          <Link
            href="/dashboard"
            className="glass rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden hover:border-purple-500/60 transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" />
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl rounded-full group-hover:opacity-40 transition-opacity" />
            
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-4">
                <Wand2 className="w-6 h-6 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Criar com IA</h3>
              <p className="text-sm text-slate-400 mb-4">
                Descreva em linguagem natural e a IA estrutura o ticket pra você.
              </p>
              <div className="flex items-center gap-2 text-purple-300 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>Começar agora</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-50" />
          </Link>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`glass rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all group hover:shadow-2xl ${action.glow} animate-fade-in relative overflow-hidden`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br ${action.gradient} opacity-10 blur-3xl rounded-full group-hover:opacity-25 transition-opacity`} />
                <div className="relative flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white">{action.label}</h4>
                    <p className="text-xs text-slate-400">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent Tasks */}
          <div className="lg:col-span-2 glass rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
                <h3 className="text-lg font-bold text-white">Atividade Recente</h3>
              </div>
              <Link href="/dashboard" className="text-xs text-purple-300 hover:text-purple-200 font-medium flex items-center gap-1">
                Ver todas
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            {recentTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhuma tarefa ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map(task => {
                  const sc = statusConfig[task.status]
                  const SIcon = sc?.icon || Clock
                  const pc = priorityConfig[task.priority]
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 transition-all"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${sc?.bg} border`}>
                        <SIcon className={`w-4 h-4 ${sc?.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{task.user.name}</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-xs text-slate-500">{task.department}</span>
                          {task.comments.length > 0 && (
                            <>
                              <span className="text-slate-700">•</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {task.comments.length}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${pc?.color}`}>
                        {pc?.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top Departments */}
          <div className="glass rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
              <h3 className="text-lg font-bold text-white">Departamentos</h3>
            </div>
            
            {topDepts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Sem dados</div>
            ) : (
              <div className="space-y-3">
                {topDepts.map(([dept, count], i) => {
                  const max = topDepts[0][1]
                  const pct = (count / max) * 100
                  const colors = [
                    "from-purple-500 to-pink-500",
                    "from-cyan-500 to-blue-500",
                    "from-emerald-500 to-teal-500",
                    "from-amber-500 to-orange-500"
                  ]
                  return (
                    <div key={dept}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-white">{dept}</span>
                        <span className="text-xs text-slate-400 font-bold">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colors[i]} rounded-full transition-all duration-700 shadow-lg`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Suas tarefas</p>
                  <p className="text-2xl font-bold text-white mt-1">{myTasks.length}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
