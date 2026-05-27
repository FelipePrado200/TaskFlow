"use client"

import { Lightbulb, Target, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

interface Props {
  response: string
  type: string
}

// Renderiza inline markdown (negrito **texto** e itálico *texto*)
function renderInline(text: string): React.ReactNode {
  // Remove asteriscos isolados/duplos no início e fim que vêm como ruído
  const cleaned = text.replace(/\*{3,}/g, "**")
  
  const parts: React.ReactNode[] = []
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let lastIndex = 0
  let match
  let key = 0
  
  while ((match = regex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cleaned.slice(lastIndex, match.index))
    }
    if (match[1]) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {match[1]}
        </strong>
      )
    } else if (match[2]) {
      parts.push(
        <em key={key++} className="italic text-purple-200">
          {match[2]}
        </em>
      )
    }
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < cleaned.length) {
    parts.push(cleaned.slice(lastIndex))
  }
  
  return parts.length > 0 ? parts : cleaned
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string; bgGradient: string }> = {
  improvement: {
    icon: Lightbulb,
    label: "Sugestões de Melhoria",
    color: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-500/10 via-orange-500/5 to-pink-500/10",
  },
  problem: {
    icon: Target,
    label: "Problemas e Soluções",
    color: "from-red-400 to-pink-500",
    bgGradient: "from-red-500/10 via-pink-500/5 to-purple-500/10",
  },
  changes: {
    icon: RefreshCw,
    label: "Mudanças Sugeridas",
    color: "from-blue-400 to-purple-500",
    bgGradient: "from-blue-500/10 via-purple-500/5 to-pink-500/10",
  },
}

export default function FormattedAIResponse({ response, type }: Props) {
  const config = typeConfig[type] || typeConfig.improvement
  const Icon = config.icon
  
  // Limpa o texto removendo ruído de markdown mal formatado
  const cleanedResponse = response
    .replace(/\*{4,}/g, "**")
    .replace(/^\s*\*\s*$/gm, "") // remove linhas só com *
  
  const lines = cleanedResponse.split("\n")
  
  // Detecta blocos de "Solução:" para destacar como cards
  const renderedBlocks: React.ReactNode[] = []
  let i = 0
  let key = 0
  
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Pula linhas vazias múltiplas
    if (trimmed === "") {
      renderedBlocks.push(<div key={key++} className="h-1" />)
      i++
      continue
    }
    
    // Título principal: **Título** sozinho na linha ou *Título*
    const mainTitleMatch = trimmed.match(/^\*+([^*]+)\*+:?$/)
    if (mainTitleMatch && mainTitleMatch[1].length < 80) {
      const titleText = mainTitleMatch[1].replace(/:$/, "").trim()
      // Detecta se é um título de seção principal (Conclusão, Estratégias, etc)
      const isMainSection = /^(análise|conclusão|estratégias?|principais|sugestões?|recomendações?|introdução)/i.test(titleText)
      
      if (isMainSection) {
        renderedBlocks.push(
          <div key={key++} className="flex items-center gap-3 mt-6 mb-4 first:mt-0">
            <div className={`w-1.5 h-8 bg-gradient-to-b ${config.color} rounded-full`} />
            <h3 className="text-xl font-bold text-white">{titleText}</h3>
          </div>
        )
      } else {
        renderedBlocks.push(
          <h4 key={key++} className="text-base font-bold text-purple-200 mt-4 mb-2 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
            {titleText}
          </h4>
        )
      }
      i++
      continue
    }
    
    // Item numerado (1., 2., etc) — pode ter título em negrito
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s*(.+)$/)
    if (numberedMatch) {
      const itemContent = numberedMatch[2]
      // Coleta sub-bullets que vêm depois
      const subItems: string[] = []
      let j = i + 1
      while (j < lines.length) {
        const next = lines[j].trim()
        if (next === "") {
          j++
          continue
        }
        if (next.startsWith("*") && !next.match(/^\*+[^*]+\*+:?$/)) {
          subItems.push(next.replace(/^\*\s*/, ""))
          j++
        } else {
          break
        }
      }
      
      renderedBlocks.push(
        <div
          key={key++}
          className="group flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/60 transition-all"
        >
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0 shadow-lg font-bold text-white text-sm`}>
            {numberedMatch[1]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-100 leading-relaxed">{renderInline(itemContent)}</p>
            {subItems.length > 0 && (
              <ul className="mt-3 space-y-2">
                {subItems.map((sub, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 leading-relaxed">{renderInline(sub)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )
      i = j
      continue
    }
    
    // Bullet com asterisco isolado (sub-item órfão)
    if (trimmed.startsWith("*") && !trimmed.match(/^\*+[^*]+\*+:?$/)) {
      renderedBlocks.push(
        <div key={key++} className="flex items-start gap-2 ml-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
          <span className="text-slate-300 leading-relaxed">{renderInline(trimmed.replace(/^\*\s*/, ""))}</span>
        </div>
      )
      i++
      continue
    }
    
    // Bullets padrão
    if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
      renderedBlocks.push(
        <div key={key++} className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 mt-2 rounded-full bg-purple-400 flex-shrink-0" />
          <span className="text-slate-200 leading-relaxed">{renderInline(trimmed.replace(/^[•\-]\s*/, ""))}</span>
        </div>
      )
      i++
      continue
    }
    
    // Texto normal — parágrafo
    renderedBlocks.push(
      <p key={key++} className="text-slate-300 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    )
    i++
  }
  
  return (
    <div className="max-w-none">
      {/* Header com tipo */}
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r ${config.bgGradient} border border-purple-500/20 mb-5`}>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Análise da IA</p>
          <h3 className="text-base font-bold text-white">{config.label}</h3>
        </div>
      </div>
      
      {/* Conteúdo formatado */}
      <div className="space-y-2">
        {renderedBlocks}
      </div>
      
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Sugestões geradas por IA — revise antes de aplicar</span>
      </div>
    </div>
  )
}
