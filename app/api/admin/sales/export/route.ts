import { prisma } from "@/lib/db"
import { getCatalog } from "@/lib/tickets"

export const dynamic = "force-dynamic"

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  USED: "Использован",
  CANCELLED: "Отменён",
  REFUNDED: "Возврат",
}

function csvEscape(v: string | null | undefined) {
  if (v == null) return ""
  const s = String(v)
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function formatRu(iso: string | null | undefined) {
  if (!iso) return ""
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const type = url.searchParams.get("type")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const search = url.searchParams.get("q")

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

  const [tickets, catalog] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    getCatalog(),
  ])

  const header = [
    "ID",
    "Тип",
    "Цена ₽",
    "Email",
    "Имя",
    "Телефон",
    "Дата визита",
    "Статус",
    "Создан",
    "Оплачен",
    "Использован",
    "ЮKassa ID",
  ]

  const rows = tickets.map((t) => [
    t.id,
    catalog[t.type]?.label || t.type,
    (t.price / 100).toFixed(2),
    t.email,
    t.name || "",
    t.phone || "",
    new Date(t.visitDate).toLocaleDateString("ru-RU", { timeZone: "UTC" }),
    STATUS_LABEL[t.status] || t.status,
    formatRu(t.createdAt.toISOString()),
    formatRu(t.paidAt?.toISOString()),
    formatRu(t.usedAt?.toISOString()),
    t.paymentId || "",
  ])

  // BOM + ; separator for Excel RU
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvEscape).join(";")).join("\r\n")
  const filename = `sales-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
