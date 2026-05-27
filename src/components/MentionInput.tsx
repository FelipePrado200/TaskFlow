"use client"

import { useEffect, useRef, useState } from "react"
import { AtSign } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  sector?: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function MentionInput({ value, onChange, placeholder, className, disabled }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [query, setQuery] = useState("")
  const [mentionStart, setMentionStart] = useState(-1)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.ok ? r.json() : [])
      .then(setUsers)
      .catch(() => {})
  }, [])

  const filtered = query.length > 0
    ? users.filter(u => u.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : users.slice(0, 5)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0
    onChange(newValue)

    // Detecta @ antes do cursor
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (atMatch) {
      setMentionStart(cursorPos - atMatch[0].length)
      setQuery(atMatch[1])
      setShowSuggestions(true)
      setActiveIndex(0)
    } else {
      setShowSuggestions(false)
    }
  }

  const insertMention = (user: User) => {
    if (mentionStart < 0) return
    const before = value.slice(0, mentionStart)
    const cursorPos = inputRef.current?.selectionStart || 0
    const after = value.slice(cursorPos)
    const mention = `@${user.name.replace(/\s+/g, "")} `
    const newValue = before + mention + after
    onChange(newValue)
    setShowSuggestions(false)
    setQuery("")
    setMentionStart(-1)
    
    // Restaura foco
    setTimeout(() => {
      const newPos = before.length + mention.length
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filtered.length === 0) return
    
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % filtered.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex(i => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      insertMention(filtered[activeIndex])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute bottom-full mb-2 left-0 right-0 max-w-sm bg-slate-900 border border-purple-500/40 rounded-xl shadow-2xl glow-purple overflow-hidden z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
            <AtSign className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-400 font-medium">Mencionar usuário</span>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filtered.map((user, idx) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); insertMention(user) }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-all ${
                  activeIndex === idx
                    ? "bg-purple-500/20 border-l-2 border-purple-400"
                    : "hover:bg-slate-800/60"
                }`}
              >
                <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  {user.sector && <p className="text-xs text-slate-400 truncate">{user.sector}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper: renderiza menções como pills nos comentários
export function renderMentions(text: string): React.ReactNode {
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, idx) => {
    if (part.startsWith("@")) {
      return (
        <span
          key={idx}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-purple-500/20 text-purple-300 font-medium text-xs border border-purple-500/30"
        >
          {part}
        </span>
      )
    }
    return <span key={idx}>{part}</span>
  })
}
