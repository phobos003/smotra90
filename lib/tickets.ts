import type { TicketType } from "@prisma/client"
import { prisma } from "./db"

export type CatalogEntry = { label: string; price: number }
export type Catalog = Record<TicketType, CatalogEntry>

export const TICKET_CATALOG_FALLBACK: Catalog = {
  ADULT: { label: "Взрослый", price: 180000 },
  CHILD: { label: "Детский", price: 100000 },
  FAMILY: { label: "Семейный", price: 400000 },
}

export async function getCatalog(): Promise<Catalog> {
  const rows = await prisma.ticketPrice.findMany()
  const out: Catalog = { ...TICKET_CATALOG_FALLBACK }
  for (const r of rows) {
    out[r.type] = { label: r.label, price: r.price }
  }
  return out
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
