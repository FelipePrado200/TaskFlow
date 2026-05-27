"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus, Trash2, MessageSquare, LogOut, Sparkles, BarChart3, X,
  Clock, CheckCircle2, AlertCircle, User, Calendar, Send, Filter, LayoutGrid
} from "lucide-react"
import FormattedAIResponse from "@/components/FormattedAIResponse"
import AITaskCreator from "@/components/AITaskCreator"
import MentionInput, { renderMentions } from "@/components/MentionInput"
import AppHeader from "@/components/AppHeader"

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  department: string
  createdAt?: string
  user: {
    id: string
    name: string
    email: string
    sector: string
  }
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  pending: { label: "Pendente", icon: Clock, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  in_progress: { label: "Em Progresso", icon: AlertCircle, color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  completed: { label: "Concluído", icon: CheckCircle2, color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "Alta", color: "text-red-300", bg: "bg-red-500/15" },
  medium: { label: "Média", color: "text-amber-300", bg: "bg-amber-500/15" },
  low: { label: "Baixa", color: "text-emerald-300", bg: "bg-emerald-500/15" }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [aiTask, setAiTask] = useState<Task | null>(null)
  const [aiResponse, setAiResponse] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiType, setAiType] = useState<string>("improvement")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    department: "",
    priority: "medium"
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchTasks()
    }
  }, [status, router])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks?limit=50")
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks || data)
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      })
      if (response.ok) {
        setShowCreateModal(false)
        setNewTask({ title: "", description: "", department: "", priority: "medium" })
        fetchTasks()
      }
    } catch (error) {
      console.error("Erro ao criar tarefa:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" })
      if (response.ok) {
        fetchTasks()
        setSelectedTask(null)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (response.ok) fetchTasks()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask || !newComment.trim()) return
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, taskId: selectedTask.id })
      })
      if (response.ok) {
        setNewComment("")
        const updated = await (await fetch("/api/tasks")).json()
        setTasks(updated)
        const refreshed = updated.find((t: Task) => t.id === selectedTask.id)
        if (refreshed) setSelectedTask(refreshed)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAskAI = async (task: Task, type: string) => {
    setAiTask(task)
    setAiType(type)
    setAiResponse("")
    setAiLoading(true)
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, type })
      })
      const data = await response.json()
      if (response.ok) setAiResponse(data.content)
      else setAiResponse(`Erro: ${data.error}`)
    } catch (error: any) {
      setAiResponse(`Erro: ${error.message}`)
    } finally {
      setAiLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Sparkles className="w-5 h-5 animate-pulse text-indigo-500" />
          Carregando...
        </div>
      </div>
    )
  }

  const filteredTasks = filterStatus === "all" ? tasks : tasks.filter(t => t.status === filterStatus)
  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Tarefas</h2>
            <p className="text-slate-400 mt-1">Gerencie suas tarefas e atribuições</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 gradient-bg text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nova Tarefa
          </button>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
          {[
            { key: "all", label: "Todas" },
            { key: "pending", label: "Pendentes" },
            { key: "in_progress", label: "Em Progresso" },
            { key: "completed", label: "Concluídas" }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === f.key
                  ? "gradient-bg text-white shadow-lg glow-indigo"
                  : "glass text-slate-300 hover:bg-slate-800/50 border border-slate-700"
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filterStatus === f.key ? "bg-white/20" : "bg-slate-700"
              }`}>
                {counts[f.key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="grid gap-3">
          {filteredTasks.map((task, idx) => {
            const StatusIcon = statusConfig[task.status]?.icon || Clock
            const sc = statusConfig[task.status]
            const pc = priorityConfig[task.priority]
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="group glass rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all animate-fade-in cursor-pointer"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${pc?.bg} ${pc?.color}`}>
                          {pc?.label}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                          {task.department}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc?.bg} ${sc?.color} border ${sc?.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc?.label}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3 text-sm leading-relaxed">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {task.user.name}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {task.comments.length} {task.comments.length === 1 ? "comentário" : "comentários"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-slate-700 transition-all"
                      >
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="completed">Concluído</option>
                      </select>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
                        title="Comentários"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAskAI(task, "improvement")}
                        className="p-2 text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
                        title="Assistente IA"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-20 glass rounded-2xl border border-dashed border-slate-700">
            <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-300 font-medium">Nenhuma tarefa encontrada</p>
            <p className="text-slate-500 text-sm mt-1">Crie uma nova tarefa para começar</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-strong rounded-2xl shadow-2xl glow-purple max-w-md w-full animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white">Nova Tarefa</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Título</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Ex: Atualizar landing page"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descrição</label>
                <textarea
                  required
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  rows={3}
                  placeholder="Descreva os detalhes da tarefa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Departamento</label>
                  <select
                    required
                    value={newTask.department}
                    onChange={(e) => setNewTask({ ...newTask, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">Selecione</option>
                    <option value="TI">TI</option>
                    <option value="RH">RH</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operações">Operações</option>
                    <option value="Vendas">Vendas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Prioridade</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-200 font-medium rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 gradient-bg text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {aiTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-strong rounded-2xl shadow-2xl glow-purple max-w-2xl w-full max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex justify-between items-start p-6 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Assistente IA</h3>
                  <p className="text-sm text-slate-400 truncate max-w-md">{aiTask.title}</p>
                </div>
              </div>
              <button
                onClick={() => setAiTask(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 px-6 pt-4 pb-3 border-b border-slate-800 flex-wrap">
              {[
                { key: "improvement", label: "💡 Melhorias" },
                { key: "problem", label: "🎯 Problemas" },
                { key: "changes", label: "🔄 Mudanças" }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => handleAskAI(aiTask, t.key)}
                  className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap font-medium transition-all ${
                    aiType === t.key
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg glow-purple"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {aiLoading ? (
                <div className="text-center py-16">
                  <div className="inline-flex w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl items-center justify-center mb-4 animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-300 font-medium">Analisando tarefa com IA...</p>
                  <p className="text-slate-500 text-sm mt-1">Isso pode levar alguns segundos</p>
                </div>
              ) : (
                <FormattedAIResponse response={aiResponse} type={aiType} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-strong rounded-2xl shadow-2xl glow-indigo max-w-2xl w-full max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex justify-between items-start p-6 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Detalhes da Tarefa</h3>
                  <p className="text-sm text-slate-400 truncate max-w-md">{selectedTask.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Task Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Descrição</h4>
                  <p className="text-slate-200 leading-relaxed">{selectedTask.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium ${
                      statusConfig[selectedTask.status]?.bg || statusConfig.pending.bg
                    } ${statusConfig[selectedTask.status]?.color || statusConfig.pending.color} border ${
                      statusConfig[selectedTask.status]?.border || statusConfig.pending.border
                    }`}>
                      {statusConfig[selectedTask.status]?.label || selectedTask.status}
                    </span>
                  </div>
                  
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Prioridade</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                      priorityConfig[selectedTask.priority]?.bg || priorityConfig.medium.bg
                    } ${priorityConfig[selectedTask.priority]?.color || priorityConfig.medium.color}`}>
                      {priorityConfig[selectedTask.priority]?.label || selectedTask.priority}
                    </span>
                  </div>
                  
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Departamento</span>
                    </div>
                    <span className="text-slate-200 font-medium">{selectedTask.department}</span>
                  </div>
                  
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400 uppercase tracking-wider">Criado em</span>
                    </div>
                    <span className="text-slate-200 font-medium">
                      {selectedTask.createdAt 
                        ? new Date(selectedTask.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-800 pt-6">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comentários ({selectedTask.comments.length})
                </h4>
                <div className="space-y-3">
                  {selectedTask.comments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>Nenhum comentário ainda.</p>
                      <p className="text-sm">Seja o primeiro a comentar!</p>
                    </div>
                  ) : (
                    selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-white">{comment.user.name}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(comment.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{renderMentions(comment.content)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleAddComment} className="p-4 border-t border-slate-800 flex gap-2">
              <MentionInput
                value={newComment}
                onChange={setNewComment}
                placeholder="Escreva um comentário... use @ para mencionar"
                className="w-full px-4 py-2.5 bg-slate-900/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2.5 gradient-bg text-white font-medium rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Floating Task Creator */}
      <AITaskCreator onTaskCreated={fetchTasks} />
    </div>
  )
}
