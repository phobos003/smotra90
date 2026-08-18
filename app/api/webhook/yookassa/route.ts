import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { prisma } from "@/lib/db"
import { sendMail } from "@/lib/mailer"
import { buildTicketEmail, buildMultiTicketEmail } from "@/lib/emailTemplate"
import { getCatalog, formatPrice, formatVisitDate } from "@/lib/tickets"
import { sendTelegram, buildSaleMessage } from "@/lib/telegram"

export const dynamic = "force-dynamic"

type YookassaEvent = {
  event?: string
  object?: {
    id?: string
    status?: string
    metadata?: { ticketId?: string; ticketIds?: string }
  }
}

const QR_OPTS = { margin: 1, width: 480, color: { dark: "#0F1117", light: "#FFFFFF" } }

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
  const meta = body.object?.metadata || {}

  if (!paymentId) {
    return NextResponse.json({ error: "missing_ids" }, { status: 400 })
  }

  // Tickets of this order: prefer explicit ids from metadata (ticketIds new / ticketId old),
  // fall back to grouping by the shared paymentId.
  let ids: string[] = []
  if (meta.ticketIds) ids = meta.ticketIds.split(",").map((s) => s.trim()).filter(Boolean)
  else if (meta.ticketId) ids = [meta.ticketId]

  const tickets = ids.length
    ? await prisma.ticket.findMany({ where: { id: { in: ids } } })
    : await prisma.ticket.findMany({ where: { paymentId } })

  if (tickets.length === 0) {
    return NextResponse.json({ error: "ticket_not_found" }, { status: 404 })
  }

  const visitDate = tickets[0].visitDate
  const email = tickets[0].email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  if (event === "payment.succeeded" && status === "succeeded") {
    const pending = tickets.filter((t) => t.status === "PENDING")
    if (pending.length === 0) {
      return NextResponse.json({ ok: true, duplicate: true })
    }
    const pendingIds = pending.map((t) => t.id)

    // Idempotent: only the invocation that actually flips PENDING→PAID increments
    // soldCount and sends the email. A concurrent/duplicate webhook gets count 0.
    const paidCount = await prisma.$transaction(async (tx) => {
      const r = await tx.ticket.updateMany({
        where: { id: { in: pendingIds }, status: "PENDING" },
        data: { status: "PAID", paidAt: new Date(), paymentId },
      })
      if (r.count > 0) {
        await tx.ticketDate.update({
          where: { date: visitDate },
          data: { soldCount: { increment: r.count } },
        })
      }
      return r.count
    })
    if (paidCount === 0) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    const catalog = await getCatalog()
    const qrTickets = await Promise.all(
      pending.map(async (t) => ({
        id: t.id,
        typeLabel: catalog[t.type].label,
        qrDataUrl: await QRCode.toDataURL(`${siteUrl}/ticket/${t.id}`, QR_OPTS),
      })),
    )
    const totalPrice = pending.reduce((sum, t) => sum + t.price, 0)

    const mail =
      pending.length === 1
        ? buildTicketEmail({
            ticketId: qrTickets[0].id,
            typeLabel: qrTickets[0].typeLabel,
            price: pending[0].price,
            visitDate,
            siteUrl,
            qrDataUrl: qrTickets[0].qrDataUrl,
          })
        : buildMultiTicketEmail({ tickets: qrTickets, visitDate, totalPrice, siteUrl })

    try {
      await sendMail({
        to: email,
        subject:
          pending.length === 1
            ? "Ваш билет — Высота 90"
            : `Ваши билеты (${pending.length}) — Высота 90`,
        html: mail.html,
        text: mail.text,
      })
      await prisma.ticket.updateMany({
        where: { id: { in: pendingIds } },
        data: { emailSent: true, emailSentAt: new Date(), emailError: null },
      })
    } catch (err) {
      console.error("[webhook] sendMail failed", err)
      await prisma.ticket
        .updateMany({
          where: { id: { in: pendingIds } },
          data: { emailError: (err instanceof Error ? err.message : String(err)).slice(0, 500) },
        })
        .catch(() => {})
    }

    // "2×Взрослый, 1×Детский"
    const summary = (["ADULT", "CHILD", "FAMILY"] as const)
      .map((type) => ({ type, n: pending.filter((t) => t.type === type).length }))
      .filter((x) => x.n > 0)
      .map((x) => `${x.n}×${catalog[x.type].label}`)
      .join(", ")

    await sendTelegram(
      buildSaleMessage({
        typeLabel: summary,
        priceLabel: formatPrice(totalPrice),
        visitDateLabel: formatVisitDate(visitDate),
        email,
        ticketUrl: `${siteUrl}/ticket/${pending[0].id}`,
        source: "Сайт (оплата)",
      }),
    )

    return NextResponse.json({ ok: true })
  }

  if (event === "payment.canceled" || status === "canceled") {
    const pendingIds = tickets.filter((t) => t.status === "PENDING").map((t) => t.id)
    if (pendingIds.length) {
      await prisma.ticket.updateMany({ where: { id: { in: pendingIds } }, data: { status: "CANCELLED" } })
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true, ignored: true })
}
