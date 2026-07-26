import { NextResponse } from "next/server"
import { z } from "zod"
import QRCode from "qrcode"
import { prisma } from "@/lib/db"
import { getCatalog } from "@/lib/tickets"
import { sendMail } from "@/lib/mailer"
import { buildMultiTicketEmail, buildTicketEmail } from "@/lib/emailTemplate"

export const dynamic = "force-dynamic"

const schema = z.object({
  type: z.enum(["ADULT", "CHILD", "FAMILY"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().int().min(1).max(50),
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  pricePerTicketOverride: z.number().int().min(0).max(100_000_000).nullable().optional(),
  sendEmail: z.boolean().optional().default(true),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", issues: parsed.error.flatten() }, { status: 400 })
  }

  const { type, date, count, email, name, phone, pricePerTicketOverride, sendEmail } = parsed.data
  const visitDate = new Date(`${date}T00:00:00.000Z`)

  const dateRow = await prisma.ticketDate.findUnique({ where: { date: visitDate } })
  if (!dateRow) return NextResponse.json({ error: "date_not_found" }, { status: 400 })
  if (dateRow.capacity - dateRow.soldCount < count) {
    return NextResponse.json({ error: "not_enough_capacity", available: dateRow.capacity - dateRow.soldCount }, { status: 400 })
  }

  const catalog = await getCatalog()
  const entry = catalog[type]
  const price = pricePerTicketOverride ?? entry.price

  const now = new Date()
  const tickets = await prisma.$transaction(async (tx) => {
    const created = []
    for (let i = 0; i < count; i++) {
      const t = await tx.ticket.create({
        data: {
          type,
          price,
          email,
          name,
          phone,
          visitDate,
          status: "PAID",
          paidAt: now,
        },
      })
      created.push(t)
    }
    await tx.ticketDate.update({
      where: { date: visitDate },
      data: { soldCount: { increment: count } },
    })
    return created
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (sendEmail) {
    try {
      const qrTickets = await Promise.all(
        tickets.map(async (t) => ({
          id: t.id,
          typeLabel: entry.label,
          qrDataUrl: await QRCode.toDataURL(`${siteUrl}/ticket/${t.id}`, {
            margin: 1,
            width: 480,
            color: { dark: "#0F1117", light: "#FFFFFF" },
          }),
        })),
      )

      const totalPrice = price * count
      const mail = count === 1
        ? buildTicketEmail({
            ticketId: qrTickets[0].id,
            typeLabel: entry.label,
            price,
            visitDate,
            siteUrl,
            qrDataUrl: qrTickets[0].qrDataUrl,
          })
        : buildMultiTicketEmail({
            tickets: qrTickets,
            visitDate,
            totalPrice,
            siteUrl,
          })

      await sendMail({
        to: email,
        subject: count === 1 ? "Ваш билет — Высота 90" : `Ваши билеты (${count}) — Высота 90`,
        html: mail.html,
        text: mail.text,
      })
      await prisma.ticket.updateMany({
        where: { id: { in: tickets.map((t) => t.id) } },
        data: { emailSent: true, emailSentAt: new Date(), emailError: null },
      })
    } catch (err) {
      console.error("[issue] sendMail failed", err)
      await prisma.ticket
        .updateMany({
          where: { id: { in: tickets.map((t) => t.id) } },
          data: { emailError: (err instanceof Error ? err.message : String(err)).slice(0, 500) },
        })
        .catch(() => {})
    }
  }

  return NextResponse.json({
    ok: true,
    tickets: tickets.map((t) => ({
      id: t.id,
      url: `${siteUrl}/ticket/${t.id}`,
    })),
    totalPrice: price * count,
  })
}
