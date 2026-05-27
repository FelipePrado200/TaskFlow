import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    console.log("POST /api/register - Iniciando")
    const body = await request.json()
    const { email, password, name, sector } = body

    console.log("Dados recebidos:", { email, name, sector })

    if (!email || !password || !name || !sector) {
      console.log("Erro: Campos faltando")
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    console.log("Verificando usuário existente...")
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log("Erro: Email já cadastrado")
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    console.log("Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log("Criando usuário...")
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        sector
      }
    })

    console.log("Usuário criado com sucesso:", user.id)
    return NextResponse.json(
      { message: "Usuário criado com sucesso", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json(
      { error: "Erro ao criar usuário", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
