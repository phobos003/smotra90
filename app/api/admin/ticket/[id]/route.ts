import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { TICKET_CATALOG } from "@/lib/tickets"

export const dynamic = "force-dynamic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await prisma.ticket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const visitUtc = new Date(ticket.visitDate)
  visitUtc.setUTCHours(0, 0, 0, 0)
  const wrongDate = visitUtc.getTime() !== today.getTime()

  return NextResponse.json({
    ticket: {
      id: ticket.id,
      type: ticket.type,
      typeLabel: TICKET_CATALOG[ticket.type].label,
      visitDate: ticket.visitDate.toISOString(),
      email: ticket.email,
      status: ticket.status,
      usedAt: ticket.usedAt?.toISOString() || null,
    },
    wrongDate,
  })
}
