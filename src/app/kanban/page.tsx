"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Sparkles, Clock, AlertCircle, CheckCircle2,
  MessageSquare, GripVertical
} from "lucide-react"
import AppHeader from "@/components/AppHeader"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  department: string
  user: { id: string; name: string; email: string; sector: string }
  comments: any[]
}

const columns = [
  {
    key: "pending",
    label: "Pendente",
    icon: Clock,
    color: "amber",
    headerGradient: "from-amber-500/20 to-orange-500/10",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-300",
    glow: "shadow-amber-500/10"
  },
  {
    key: "in_progress",
    label: "Em Progresso",
    icon: AlertCircle,
    color: "blue",
    headerGradient: "from-blue-500/20 to-cyan-500/10",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-300",
    glow: "shadow-blue-500/10"
  },
  {
    key: "completed",
    label: "Concluído",
    icon: CheckCircle2,
    color: "emerald",
    headerGradient: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-300",
    glow: "shadow-emerald-500/10"
  }
]

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "Alta", color: "text-red-300", bg: "bg-red-500/15 border-red-500/30" },
  medium: { label: "Média", color: "text-amber-300", bg: "bg-amber-500/15 border-amber-500/30" },
  low: { label: "Baixa", color: "text-emerald-300", bg: "bg-emerald-500/15 border-emerald-500/30" }
}

export default function KanbanPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchTasks()
    }
  }, [status, router])

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks?limit=100")
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks || data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    setDragOverColumn(columnKey)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, columnKey: string) => {
    e.preventDefault()
    setDragOverColumn(null)
    if (!draggedTask || draggedTask.status === columnKey) return

    // Otimistic update
    setTasks(prev => prev.map(t => t.id === draggedTask.id ? { ...t, status: columnKey } : t))
    
    try {
      await fetch(`/api/tasks/${draggedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: columnKey })
      })
    } catch (e) {
      console.error(e)
      fetchTasks() // rollback
    }
    setDraggedTask(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Sparkles className="w-5 h-5 animate-pulse text-indigo-500" />
          Carregando...
        </div>
      </div>
    )
  }

  const tasksByStatus = (key: string) => tasks.filter(t => t.status === key)

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">Quadro Kanban</h2>
          <p className="text-slate-400 mt-1">Visualize e organize suas tarefas por status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {columns.map(col => {
            const Icon = col.icon
            const colTasks = tasksByStatus(col.key)
            const isDragOver = dragOverColumn === col.key
            
            return (
              <div
                key={col.key}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`glass rounded-2xl border-2 transition-all ${
                  isDragOver
                    ? `${col.borderColor} bg-slate-900/60 scale-[1.02] shadow-2xl ${col.glow}`
                    : "border-slate-800"
                }`}
              >
                {/* Column Header */}
                <div className={`bg-gradient-to-br ${col.headerGradient} rounded-t-2xl px-4 py-3 border-b ${col.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${col.iconColor}`} />
                      <h3 className="font-bold text-white">{col.label}</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900/60 ${col.iconColor} border ${col.borderColor}`}>
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-3 min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-sm">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                        <Icon className="w-5 h-5 opacity-50" />
                      </div>
                      Nenhuma tarefa
                      {isDragOver && <p className="mt-2 text-purple-400 font-medium">Solte aqui</p>}
                    </div>
                  ) : (
                    colTasks.map((task, idx) => {
                      const pc = priorityConfig[task.priority]
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task)}
                          onDragEnd={handleDragEnd}
                          className={`group bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:-translate-y-0.5 animate-fade-in ${
                            draggedTask?.id === task.id ? "opacity-40 scale-95" : ""
                          }`}
                          style={{ animationDelay: `${idx * 40}ms` }}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <GripVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-400 mt-0.5 flex-shrink-0 transition-colors" />
                            <h4 className="text-sm font-semibold text-white flex-1 leading-tight">{task.title}</h4>
                          </div>
                          
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2 ml-6">{task.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-1.5 ml-6 mb-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${pc?.bg} ${pc?.color}`}>
                              {pc?.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                              {task.department}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between ml-6 pt-2 border-t border-slate-800">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <div className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center text-white font-semibold text-[10px]">
                                {task.user.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[100px]">{task.user.name}</span>
                            </div>
                            {task.comments.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <MessageSquare className="w-3 h-3" />
                                {task.comments.length}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
