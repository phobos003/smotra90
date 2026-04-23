import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"

const patchSchema = z.object({
  capacity: z.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 })

  const row = await prisma.ticketDate.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    isActive: row.isActive,
    capacity: row.capacity,
    soldCount: row.soldCount,
  })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await prisma.ticketDate.findUnique({ where: { id } })
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 })

  const hasTickets = await prisma.ticket.count({ where: { visitDate: row.date } })
  if (hasTickets > 0) {
    await prisma.ticketDate.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ ok: true, deactivated: true })
  }
  await prisma.ticketDate.delete({ where: { id } })
  return NextResponse.json({ ok: true, deleted: true })
}
