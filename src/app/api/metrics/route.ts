import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Contagem por status usando agregação Prisma
    const statusCounts = await prisma.task.groupBy({
      by: ['status'],
      _count: true
    })

    const statusMap = new Map(statusCounts.map(s => [s.status, s._count]))
    const total = statusCounts.reduce((acc, s) => acc + s._count, 0)
    const completed = statusMap.get('completed') || 0
    const inProgress = statusMap.get('in_progress') || 0
    const pending = statusMap.get('pending') || 0

    const byStatus = [
      { name: "Pendente", value: pending, color: "#f59e0b" },
      { name: "Em Progresso", value: inProgress, color: "#3b82f6" },
      { name: "Concluído", value: completed, color: "#10b981" }
    ]

    // Agrupamento por departamento
    const departmentGroups = await prisma.task.groupBy({
      by: ['department'],
      _count: true
    })
    const byDepartment = departmentGroups.map(g => ({ name: g.department, value: g._count }))

    // Agrupamento por prioridade
    const priorityGroups = await prisma.task.groupBy({
      by: ['priority'],
      _count: true
    })
    const priorityMap = new Map(priorityGroups.map(p => [p.priority, p._count]))
    const byPriority = [
      { name: "Alta", value: priorityMap.get('high') || 0, color: "#ef4444" },
      { name: "Média", value: priorityMap.get('medium') || 0, color: "#f59e0b" },
      { name: "Baixa", value: priorityMap.get('low') || 0, color: "#10b981" }
    ]

    // Produtividade dos últimos 7 dias usando queries otimizadas
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentTasks = await prisma.task.findMany({
      where: {
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { 
            status: 'completed',
            updatedAt: { gte: sevenDaysAgo }
          }
        ]
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true
      }
    })

    const productivityData: { date: string; criadas: number; concluidas: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(now.getDate() - i)
      day.setHours(0, 0, 0, 0)
      const nextDay = new Date(day)
      nextDay.setDate(day.getDate() + 1)

      const criadas = recentTasks.filter(t => {
        const c = new Date(t.createdAt)
        return c >= day && c < nextDay
      }).length

      const concluidas = recentTasks.filter(t => {
        const u = new Date(t.updatedAt)
        return t.status === "completed" && u >= day && u < nextDay
      }).length

      productivityData.push({
        date: day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        criadas,
        concluidas
      })
    }

    // Contagem de comentários usando _count
    const commentCount = await prisma.comment.count()
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const avgCommentsPerTask = total > 0 ? (commentCount / total).toFixed(1) : "0"

    return NextResponse.json({
      summary: {
        total,
        completed,
        inProgress,
        pending,
        completionRate,
        totalComments: commentCount,
        avgCommentsPerTask
      },
      byStatus,
      byDepartment,
      byPriority,
      productivity: productivityData
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar métricas" },
      { status: 500 }
    )
  }
}
