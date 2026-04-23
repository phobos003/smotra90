import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (ticket.status === "USED") return NextResponse.json({ error: "already_used" }, { status: 409 })
  if (ticket.status !== "PAID") return NextResponse.json({ error: "not_paid" }, { status: 409 })

  const updated = await prisma.ticket.update({
    where: { id },
    data: { status: "USED", usedAt: new Date() },
  })

  return NextResponse.json({ ok: true, usedAt: updated.usedAt })
}
