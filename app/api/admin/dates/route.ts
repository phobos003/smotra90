import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const dates = await prisma.ticketDate.findMany({
    orderBy: { date: "asc" },
  })
  return NextResponse.json({
    dates: dates.map((d) => ({
      id: d.id,
      date: d.date.toISOString().slice(0, 10),
      isActive: d.isActive,
      capacity: d.capacity,
      soldCount: d.soldCount,
    })),
  })
}

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  capacity: z.number().int().min(0).max(10000).optional(),
  isActive: z.boolean().optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 })

  const { date, capacity = 50, isActive = true } = parsed.data

  const row = await prisma.ticketDate.upsert({
    where: { date: new Date(`${date}T00:00:00.000Z`) },
    create: { date: new Date(`${date}T00:00:00.000Z`), capacity, isActive },
    update: { capacity, isActive },
  })

  return NextResponse.json({
    id: row.id,
    date: row.date.toISOString().slice(0, 10),
    isActive: row.isActive,
    capacity: row.capacity,
    soldCount: row.soldCount,
  })
}
