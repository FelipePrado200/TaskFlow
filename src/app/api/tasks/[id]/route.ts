import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, priority } = body

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            sector: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar tarefa" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    await prisma.comment.deleteMany({
      where: { taskId: id }
    })

    await prisma.task.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Tarefa deletada com sucesso" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao deletar tarefa" },
      { status: 500 }
    )
  }
}
