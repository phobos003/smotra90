import { NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/db"
import { yookassa } from "@/lib/yookassa"
import { getCatalog } from "@/lib/tickets"

const MAX_PER_ORDER = 10

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  items: z
    .array(
      z.object({
        type: z.enum(["ADULT", "CHILD", "FAMILY"]),
        count: z.number().int().min(1).max(MAX_PER_ORDER),
      }),
    )
    .min(1)
    .max(MAX_PER_ORDER),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 })
  }

  const { date, email, name, phone, items } = parsed.data
  const visitDate = new Date(`${date}T00:00:00.000Z`)

  // Merge counts per type (a client could send the same type twice)
  const counts: Record<string, number> = {}
  for (const it of items) counts[it.type] = (counts[it.type] || 0) + it.count
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0)
  if (totalCount < 1 || totalCount > MAX_PER_ORDER) {
    return NextResponse.json({ error: "invalid_count", max: MAX_PER_ORDER }, { status: 400 })
  }

  const dateRow = await prisma.ticketDate.findUnique({ where: { date: visitDate } })
  if (!dateRow || !dateRow.isActive) {
    return NextResponse.json({ error: "date_unavailable" }, { status: 400 })
  }
  const available = dateRow.capacity - dateRow.soldCount
  if (available <= 0) {
    return NextResponse.json({ error: "sold_out" }, { status: 400 })
  }
  if (available < totalCount) {
    return NextResponse.json({ error: "not_enough_capacity", available }, { status: 400 })
  }

  const catalog = await getCatalog()

  // Expand into one ticket row per seat
  const toCreate: { type: "ADULT" | "CHILD" | "FAMILY"; price: number }[] = []
  for (const type of ["ADULT", "CHILD", "FAMILY"] as const) {
    const n = counts[type] || 0
    for (let i = 0; i < n; i++) toCreate.push({ type, price: catalog[type].price })
  }
  const totalPrice = toCreate.reduce((sum, t) => sum + t.price, 0)

  const tickets = await prisma.$transaction(
    toCreate.map((t) =>
      prisma.ticket.create({
        data: { type: t.type, price: t.price, email, name, phone, visitDate, status: "PENDING" },
      }),
    ),
  )
  const ticketIds = tickets.map((t) => t.id)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  // One receipt line per ticket type (quantity = number of that type)
  const receiptItems = (["ADULT", "CHILD", "FAMILY"] as const)
    .filter((type) => (counts[type] || 0) > 0)
    .map((type) => ({
      description: `Билет «${catalog[type].label}» на ${date}`,
      quantity: String(counts[type]) + ".00",
      amount: { value: (catalog[type].price / 100).toFixed(2), currency: "RUB" },
      vat_code: 1,
      payment_mode: "full_prepayment" as const,
      payment_subject: "service" as const,
    }))

  const summary = (["ADULT", "CHILD", "FAMILY"] as const)
    .filter((type) => (counts[type] || 0) > 0)
    .map((type) => `${counts[type]}×${catalog[type].label}`)
    .join(", ")

  try {
    const payment = await yookassa.createPayment(
      {
        amount: { value: (totalPrice / 100).toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `${siteUrl}/ticket/${ticketIds[0]}`,
        },
        description: `${summary} · ${date}`,
        metadata: { ticketIds: ticketIds.join(",") },
        receipt: {
          customer: { email },
          items: receiptItems,
        },
      },
      randomUUID(),
    )

    await prisma.ticket.updateMany({
      where: { id: { in: ticketIds } },
      data: { paymentId: payment.id },
    })

    return NextResponse.json({
      ticketIds,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
    })
  } catch (err) {
    console.error("[checkout] YooKassa error", err)
    await prisma.ticket.updateMany({ where: { id: { in: ticketIds } }, data: { status: "CANCELLED" } })
    return NextResponse.json({ error: "payment_create_failed" }, { status: 502 })
  }
}
