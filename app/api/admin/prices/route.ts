import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const rows = await prisma.ticketPrice.findMany({ orderBy: { type: "asc" } })
  return NextResponse.json({
    prices: rows.map((r) => ({
      type: r.type,
      label: r.label,
      price: r.price,
    })),
  })
}

const patchSchema = z.object({
  type: z.enum(["ADULT", "CHILD", "FAMILY"]),
  label: z.string().min(1).max(100).optional(),
  price: z.number().int().min(0).max(100_000_000).optional(),
})

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 })

  const { type, ...data } = parsed.data

  const row = await prisma.ticketPrice.update({
    where: { type },
    data,
  })

  return NextResponse.json({
    type: row.type,
    label: row.label,
    price: row.price,
  })
}
