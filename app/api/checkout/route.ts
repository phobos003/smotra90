import { NextResponse } from "next/server"
import { z } from "zod"
import { randomUUID } from "crypto"
import { prisma } from "@/lib/db"
import { yookassa } from "@/lib/yookassa"
import { getCatalog } from "@/lib/tickets"

const schema = z.object({
  type: z.enum(["ADULT", "CHILD", "FAMILY"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
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

  const { type, date, email, name, phone } = parsed.data
  const visitDate = new Date(`${date}T00:00:00.000Z`)

  const dateRow = await prisma.ticketDate.findUnique({ where: { date: visitDate } })
  if (!dateRow || !dateRow.isActive) {
    return NextResponse.json({ error: "date_unavailable" }, { status: 400 })
  }
  if (dateRow.soldCount >= dateRow.capacity) {
    return NextResponse.json({ error: "sold_out" }, { status: 400 })
  }

  const catalog = await getCatalog()
  const entry = catalog[type]
  const price = entry.price

  const ticket = await prisma.ticket.create({
    data: {
      type,
      price,
      email,
      name,
      phone,
      visitDate,
      status: "PENDING",
    },
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  try {
    const payment = await yookassa.createPayment(
      {
        amount: { value: (price / 100).toFixed(2), currency: "RUB" },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `${siteUrl}/ticket/${ticket.id}`,
        },
        description: `${entry.label} · ${date} · ${ticket.id}`,
        metadata: { ticketId: ticket.id },
        receipt: {
          customer: { email },
          items: [
            {
              description: `Билет «${entry.label}» на ${date}`,
              quantity: "1.00",
              amount: { value: (price / 100).toFixed(2), currency: "RUB" },
              vat_code: 1,
              payment_mode: "full_prepayment",
              payment_subject: "service",
            },
          ],
        },
      },
      randomUUID(),
    )

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { paymentId: payment.id },
    })

    return NextResponse.json({
      ticketId: ticket.id,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation.confirmation_url,
    })
  } catch (err) {
    console.error("[checkout] YooKassa error", err)
    await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "CANCELLED" } })
    return NextResponse.json({ error: "payment_create_failed" }, { status: 502 })
  }
}
