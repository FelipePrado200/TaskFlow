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
        { error: "Chave da API Groq não configurada. Configure GROQ_API_KEY no .env.local" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { task, type } = body

    if (!task) {
      return NextResponse.json({ error: "Tarefa é obrigatória" }, { status: 400 })
    }

    const prompts: Record<string, string> = {
      improvement: `Você é um consultor de produtividade. Analise a seguinte tarefa e sugira 3 MELHORIAS práticas e específicas para executá-la melhor:\n\nTítulo: ${task.title}\nDescrição: ${task.description}\nDepartamento: ${task.department}\nPrioridade: ${task.priority}\nStatus: ${task.status}\n\nResponda em português, de forma direta e objetiva, em formato de lista numerada.`,
      problem: `Você é um especialista em resolução de problemas. Analise a seguinte tarefa e descreva como ENFRENTAR os possíveis problemas e obstáculos:\n\nTítulo: ${task.title}\nDescrição: ${task.description}\nDepartamento: ${task.department}\nPrioridade: ${task.priority}\n\nResponda em português, listando os principais desafios e como superá-los.`,
      changes: `Você é um gerente de projetos. Sugira MUDANÇAS estratégicas que podem otimizar a execução desta tarefa:\n\nTítulo: ${task.title}\nDescrição: ${task.description}\nDepartamento: ${task.department}\nPrioridade: ${task.priority}\n\nResponda em português com sugestões claras e acionáveis.`
    }

    const prompt = prompts[type] || prompts.improvement

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Você é um assistente especialista em gestão de tarefas e produtividade. Responda sempre em português brasileiro de forma clara, objetiva e profissional." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: `Erro na API Groq: ${errText}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || "Sem resposta"

    return NextResponse.json({ content })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    )
  }
}
