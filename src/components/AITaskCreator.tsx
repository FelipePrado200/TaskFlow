"use client"

import { useState } from "react"
import { Sparkles, X, Send, Wand2, Check, Loader2, RefreshCw } from "lucide-react"

interface GeneratedTask {
  title: string
  description: string
  department: string
  priority: string
}

interface Props {
  onTaskCreated: () => void
}

const priorityLabels: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "text-emerald-300 bg-emerald-500/15" },
  medium: { label: "Média", color: "text-amber-300 bg-amber-500/15" },
  high: { label: "Alta", color: "text-red-300 bg-red-500/15" }
}

export default function AITaskCreator({ onTaskCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedTask | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!input.trim() || input.trim().length < 5) {
      setError("Descreva com mais detalhes")
      return
    }
    setError("")
    setGenerating(true)
    setGenerated(null)
    try {
      const res = await fetch("/api/ai/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao gerar")
      } else {
        setGenerated(data)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleCreate = async () => {
    if (!generated) return
    setCreating(true)
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generated)
      })
      if (res.ok) {
        onTaskCreated()
        setOpen(false)
        setInput("")
        setGenerated(null)
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao criar tarefa")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const handleReset = () => {
    setGenerated(null)
    setError("")
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      setInput("")
      setGenerated(null)
      setError("")
    }, 200)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-5 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all glow-purple ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        title="Criar tarefa com IA"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
        <Wand2 className="w-5 h-5 animate-pulse" />
        <span className="hidden sm:inline">Criar com IA</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in">
          <div className="glass-strong w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl glow-purple max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex justify-between items-start p-5 border-b border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Criar Tarefa com IA</h3>
                  <p className="text-sm text-slate-400">Descreva o que precisa ser feito</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Sua descrição
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={generating || creating}
                  placeholder="Ex: precisa instalar memória ram no notebook da maria, ela trabalha no marketing e tá urgente"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none disabled:opacity-50"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-slate-500">
                    {input.length} caracteres
                  </span>
                  <button
                    onClick={() => setInput("")}
                    disabled={!input || generating}
                    className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Examples */}
              {!generated && !generating && input.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Exemplos rápidos
                  </p>
                  {[
                    "Notebook do Pedro do financeiro está travando muito, precisa formatar",
                    "Configurar nova impressora na sala de reuniões do RH",
                    "Atualizar landing page do site com novas promoções"
                  ].map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(ex)}
                      className="w-full text-left px-3 py-2 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-purple-500/40 rounded-lg text-sm text-slate-300 transition-all"
                    >
                      <Sparkles className="w-3 h-3 inline mr-2 text-purple-400" />
                      {ex}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading */}
              {generating && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-300 font-medium">A IA está estruturando sua tarefa...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Generated Preview */}
              {generated && !generating && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
                    <Check className="w-4 h-4" />
                    Tarefa estruturada pela IA
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Título</label>
                      <input
                        type="text"
                        value={generated.title}
                        onChange={(e) => setGenerated({ ...generated, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                      <textarea
                        value={generated.description}
                        onChange={(e) => setGenerated({ ...generated, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Departamento</label>
                        <select
                          value={generated.department}
                          onChange={(e) => setGenerated({ ...generated, department: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="TI">TI</option>
                          <option value="RH">RH</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Operações">Operações</option>
                          <option value="Vendas">Vendas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Prioridade</label>
                        <select
                          value={generated.priority}
                          onChange={(e) => setGenerated({ ...generated, priority: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900/70 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="low">Baixa</option>
                          <option value="medium">Média</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-slate-400">Preview:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {generated.department}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityLabels[generated.priority]?.color}`}>
                        {priorityLabels[generated.priority]?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 flex gap-2">
              {!generated ? (
                <button
                  onClick={handleGenerate}
                  disabled={generating || !input.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Gerar com IA
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReset}
                    disabled={creating}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-slate-200 font-medium rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refazer
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Criar Tarefa
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
