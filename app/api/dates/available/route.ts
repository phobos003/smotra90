import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const rows = await prisma.ticketDate.findMany({
    where: {
      isActive: true,
      date: { gte: today },
    },
    orderBy: { date: "asc" },
    take: 90,
  })

  const dates = rows
    .filter((r) => r.soldCount < r.capacity)
    .map((r) => ({
      date: r.date.toISOString().slice(0, 10),
      available: r.capacity - r.soldCount,
    }))

  return NextResponse.json({ dates })
}
