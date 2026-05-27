import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey || apiKey.includes("cole-sua")) {
      return NextResponse.json(
        { error: "Chave da API Groq não configurada" },
        { status: 500 }
      )
    }

    const { description } = await request.json()
    if (!description || description.trim().length < 5) {
      return NextResponse.json({ error: "Descrição muito curta" }, { status: 400 })
    }

    const systemPrompt = `Você é um assistente que transforma descrições informais em tickets/tarefas estruturadas.
Sua resposta DEVE ser APENAS um JSON válido, sem markdown, sem explicação, sem texto adicional.

Formato esperado:
{
  "title": "título curto e claro, máximo 60 caracteres",
  "description": "descrição detalhada e profissional da tarefa",
  "department": "um dos: TI, RH, Financeiro, Marketing, Operações, Vendas",
  "priority": "um dos: low, medium, high"
}

Regras:
- Escolha o departamento mais adequado baseado no contexto
- Defina prioridade baseada na urgência percebida (alta = urgente/crítico, média = importante, baixa = pode esperar)
- O título deve ser objetivo e direto
- A descrição deve expandir e profissionalizar o pedido original`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json({ error: `Erro Groq: ${errText}` }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || "{}"

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: "IA retornou formato inválido" }, { status: 500 })
    }

    // Valida e normaliza
    const validDepts = ["TI", "RH", "Financeiro", "Marketing", "Operações", "Vendas"]
    const validPrios = ["low", "medium", "high"]

    const result = {
      title: String(parsed.title || "").slice(0, 100),
      description: String(parsed.description || ""),
      department: validDepts.includes(parsed.department) ? parsed.department : "Operações",
      priority: validPrios.includes(parsed.priority) ? parsed.priority : "medium"
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao processar" },
      { status: 500 }
    )
  }
}
