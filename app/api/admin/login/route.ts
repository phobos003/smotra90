import { NextResponse } from "next/server"
import { z } from "zod"
import { checkAdminPassword, setAdminCookie } from "@/lib/auth"

const schema = z.object({ password: z.string().min(1).max(200) })

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 })

  if (!checkAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 })
  }

  await setAdminCookie()
  return NextResponse.json({ ok: true })
}
