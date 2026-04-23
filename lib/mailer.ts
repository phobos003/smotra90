import nodemailer from "nodemailer"

const host = process.env.SMTP_HOST || "smtp.mail.ru"
const port = Number(process.env.SMTP_PORT || 465)
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASSWORD
const from = process.env.SMTP_FROM || user

export const mailer = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user && pass ? { user, pass } : undefined,
})

export async function sendMail(opts: {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[]
}) {
  if (!user || !pass) {
    console.warn("[mailer] SMTP credentials missing — skipping send")
    return
  }
  return mailer.sendMail({ from, ...opts })
}
