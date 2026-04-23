import type { TicketType } from "@prisma/client"

export const TICKET_CATALOG: Record<TicketType, { label: string; price: number }> = {
  ADULT: { label: "Взрослый", price: 180000 },
  CHILD: { label: "Детский", price: 100000 },
  FAMILY: { label: "Семейный", price: 400000 },
}

export function formatPrice(kopecks: number) {
  return (kopecks / 100).toLocaleString("ru-RU") + " ₽"
}

export function formatVisitDate(date: Date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}
