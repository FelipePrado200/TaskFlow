import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { content, taskId } = body

    if (!content || !taskId) {
      return NextResponse.json(
        { error: "Conteúdo e ID da tarefa são obrigatórios" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: (session.user as any).id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 }
    )
  }
}
