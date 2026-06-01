import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const type = url.searchParams.get("type")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const search = url.searchParams.get("q")
  const limit = Math.min(500, Math.max(10, Number(url.searchParams.get("limit") || "200")))
  const cursor = url.searchParams.get("cursor")

  const where: Record<string, unknown> = {}

  if (status && status !== "ALL") where.status = status
  if (type && type !== "ALL") where.type = type
  if (from || to) {
    const range: Record<string, Date> = {}
    if (from) range.gte = new Date(from + "T00:00:00.000Z")
    if (to) {
      const d = new Date(to + "T00:00:00.000Z")
      d.setUTCDate(d.getUTCDate() + 1)
      range.lt = d
    }
    where.createdAt = range
  }
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { id: { contains: search, mode: "insensitive" } },
    ]
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const hasMore = tickets.length > limit
  const items = hasMore ? tickets.slice(0, limit) : tickets

  return NextResponse.json({
    items: items.map((t) => ({
      id: t.id,
      type: t.type,
      price: t.price,
      email: t.email,
      name: t.name,
      phone: t.phone,
      visitDate: t.visitDate.toISOString().slice(0, 10),
      status: t.status,
      paymentId: t.paymentId,
      createdAt: t.createdAt.toISOString(),
      paidAt: t.paidAt?.toISOString() || null,
      usedAt: t.usedAt?.toISOString() || null,
    })),
    nextCursor: hasMore ? items[items.length - 1].id : null,
  })
}
