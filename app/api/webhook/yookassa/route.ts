import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { prisma } from "@/lib/db"
import { sendMail } from "@/lib/mailer"
import { buildTicketEmail } from "@/lib/emailTemplate"

export const dynamic = "force-dynamic"

type YookassaEvent = {
  event?: string
  object?: {
    id?: string
    status?: string
    metadata?: { ticketId?: string }
  }
}

export async function POST(req: Request) {
  let body: YookassaEvent
  try {
    body = (await req.json()) as YookassaEvent
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const event = body.event
  const paymentId = body.object?.id
  const status = body.object?.status
  const ticketId = body.object?.metadata?.ticketId

  if (!paymentId || !ticketId) {
    return NextResponse.json({ error: "missing_ids" }, { status: 400 })
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) {
    return NextResponse.json({ error: "ticket_not_found" }, { status: 404 })
  }

  if (event === "payment.succeeded" && status === "succeeded") {
    if (ticket.status === "PAID" || ticket.status === "USED") {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: "PAID", paidAt: new Date(), paymentId },
      })
      await tx.ticketDate.update({
        where: { date: ticket.visitDate },
        data: { soldCount: { increment: 1 } },
      })
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const qrDataUrl = await QRCode.toDataURL(`${siteUrl}/ticket/${ticket.id}`, {
      margin: 1,
      width: 480,
      color: { dark: "#0F1117", light: "#FFFFFF" },
    })

    const { html, text } = buildTicketEmail({
      ticketId: ticket.id,
      type: ticket.type,
      price: ticket.price,
      visitDate: ticket.visitDate,
      siteUrl,
      qrDataUrl,
    })

    try {
      await sendMail({
        to: ticket.email,
        subject: "Ваш билет — Высота 90",
        html,
        text,
      })
    } catch (err) {
      console.error("[webhook] sendMail failed", err)
    }

    return NextResponse.json({ ok: true })
  }

  if (event === "payment.canceled" || status === "canceled") {
    if (ticket.status === "PENDING") {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: "CANCELLED" },
      })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true, ignored: true })
}
