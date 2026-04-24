import { notFound } from "next/navigation"
import QRCode from "qrcode"
import { prisma } from "@/lib/db"
import { formatPrice, formatVisitDate, getCatalog } from "@/lib/tickets"

export const dynamic = "force-dynamic"

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await prisma.ticket.findUnique({ where: { id } })

  if (!ticket) return notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const qr = await QRCode.toDataURL(`${siteUrl}/ticket/${ticket.id}`, {
    margin: 1,
    width: 480,
    color: { dark: "#0F1117", light: "#FFFFFF" },
  })

  const catalog = await getCatalog()
  const typeLabel = catalog[ticket.type].label

  const statusLabel: Record<string, { text: string; color: string }> = {
    PENDING: { text: "Ожидает оплаты", color: "#F59E0B" },
    PAID: { text: "Оплачен", color: "#10B981" },
    USED: { text: "Использован", color: "#6B7280" },
    CANCELLED: { text: "Отменён", color: "#EF4444" },
    REFUNDED: { text: "Возврат", color: "#EF4444" },
  }
  const status = statusLabel[ticket.status]

  return (
    <main className="ticketPage">
      <div className="ticketCardView">
        <div className="ticketHeader">
          <h1>Ваш билет</h1>
          <span className="ticketStatus" style={{ background: status.color }}>
            {status.text}
          </span>
        </div>

        {ticket.status === "PAID" ? (
          <div className="ticketQr">
            <img src={qr} alt="QR-код билета" />
          </div>
        ) : ticket.status === "PENDING" ? (
          <div className="ticketPending">
            <p>Оплата ещё не прошла. QR появится после подтверждения.</p>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
              Если платёж уже завершён, обнови страницу через минуту.
            </p>
          </div>
        ) : ticket.status === "USED" ? (
          <div className="ticketUsed">
            <p>Билет уже был использован.</p>
          </div>
        ) : (
          <div className="ticketPending">
            <p>Билет недействителен.</p>
          </div>
        )}

        <div className="ticketDetails">
          <div>
            <span>Тип</span>
            <strong>{typeLabel}</strong>
          </div>
          <div>
            <span>Дата</span>
            <strong>{formatVisitDate(ticket.visitDate)}</strong>
          </div>
          <div>
            <span>Сумма</span>
            <strong>{formatPrice(ticket.price)}</strong>
          </div>
          <div>
            <span>Номер</span>
            <strong className="ticketId">{ticket.id}</strong>
          </div>
        </div>

        <p className="ticketNote">
          Покажите QR‑код на входе. Билет действителен один раз.
        </p>
      </div>
    </main>
  )
}
