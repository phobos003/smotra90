import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function daysAgo(n: number) {
  const x = startOfDay()
  x.setDate(x.getDate() - n)
  return x
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const daysParam = Number(url.searchParams.get("days") || "30")
  const days = Math.min(365, Math.max(7, daysParam))

  const today = startOfDay()
  const weekStart = daysAgo(6)
  const monthStart = daysAgo(29)
  const chartStart = daysAgo(days - 1)

  const [
    allPaid,
    todayPaid,
    weekPaid,
    monthPaid,
    byType,
    chart,
    upcoming,
    pending,
    used,
  ] = await Promise.all([
    prisma.ticket.aggregate({
      where: { status: { in: ["PAID", "USED"] } },
      _count: true,
      _sum: { price: true },
    }),
    prisma.ticket.aggregate({
      where: { status: { in: ["PAID", "USED"] }, paidAt: { gte: today } },
      _count: true,
      _sum: { price: true },
    }),
    prisma.ticket.aggregate({
      where: { status: { in: ["PAID", "USED"] }, paidAt: { gte: weekStart } },
      _count: true,
      _sum: { price: true },
    }),
    prisma.ticket.aggregate({
      where: { status: { in: ["PAID", "USED"] }, paidAt: { gte: monthStart } },
      _count: true,
      _sum: { price: true },
    }),
    prisma.ticket.groupBy({
      by: ["type"],
      where: { status: { in: ["PAID", "USED"] } },
      _count: true,
      _sum: { price: true },
    }),
    prisma.$queryRaw<{ day: Date; count: bigint; revenue: bigint | null }[]>`
      SELECT
        date_trunc('day', "paidAt")::date AS day,
        COUNT(*)::bigint AS count,
        SUM(price)::bigint AS revenue
      FROM "Ticket"
      WHERE status IN ('PAID', 'USED')
        AND "paidAt" >= ${chartStart}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<{ visitDate: Date; count: bigint; revenue: bigint | null }[]>`
      SELECT
        "visitDate",
        COUNT(*)::bigint AS count,
        SUM(price)::bigint AS revenue
      FROM "Ticket"
      WHERE status IN ('PAID', 'USED')
        AND "visitDate" >= ${today}
      GROUP BY "visitDate"
      ORDER BY "visitDate" ASC
      LIMIT 30
    `,
    prisma.ticket.count({ where: { status: "PENDING" } }),
    prisma.ticket.count({ where: { status: "USED" } }),
  ])

  const chartMap = new Map<string, { count: number; revenue: number }>()
  for (const row of chart) {
    const key = new Date(row.day).toISOString().slice(0, 10)
    chartMap.set(key, { count: Number(row.count), revenue: Number(row.revenue || 0) })
  }
  const chartDays: { date: string; count: number; revenue: number }[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(chartStart)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const r = chartMap.get(key) || { count: 0, revenue: 0 }
    chartDays.push({ date: key, count: r.count, revenue: r.revenue })
  }

  return NextResponse.json({
    totals: {
      all: { count: allPaid._count, revenue: allPaid._sum.price || 0 },
      today: { count: todayPaid._count, revenue: todayPaid._sum.price || 0 },
      week: { count: weekPaid._count, revenue: weekPaid._sum.price || 0 },
      month: { count: monthPaid._count, revenue: monthPaid._sum.price || 0 },
    },
    counts: {
      pending,
      used,
    },
    byType: byType.map((t) => ({
      type: t.type,
      count: t._count,
      revenue: t._sum.price || 0,
    })),
    chart: chartDays,
    upcoming: upcoming.map((u) => ({
      visitDate: new Date(u.visitDate).toISOString().slice(0, 10),
      count: Number(u.count),
      revenue: Number(u.revenue || 0),
    })),
  })
}
