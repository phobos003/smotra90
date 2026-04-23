import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

const COOKIE_NAME = "visota_admin"
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7

function getSecret() {
  const secret = process.env.ADMIN_COOKIE_SECRET
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_COOKIE_SECRET must be set and >= 16 chars")
  }
  return secret
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex")
}

export function buildAdminCookieValue() {
  const issuedAt = Date.now().toString()
  const signature = sign(issuedAt)
  return `${issuedAt}.${signature}`
}

export function verifyAdminCookieValue(raw: string | undefined) {
  if (!raw) return false
  const [issuedAt, signature] = raw.split(".")
  if (!issuedAt || !signature) return false
  const expected = sign(issuedAt)
  const a = Buffer.from(signature, "hex")
  const b = Buffer.from(expected, "hex")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function isAdminAuthed() {
  const jar = await cookies()
  const raw = jar.get(COOKIE_NAME)?.value
  return verifyAdminCookieValue(raw)
}

export async function setAdminCookie() {
  const jar = await cookies()
  jar.set(COOKIE_NAME, buildAdminCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK_SECONDS,
  })
}

export async function clearAdminCookie() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}

export function checkAdminPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  if (input.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(input), Buffer.from(expected))
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME }
