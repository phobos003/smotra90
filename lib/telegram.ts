const token = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * Sends an HTML message to the configured Telegram chat.
 * Never throws — logs and returns on any failure, so callers (e.g. the payment
 * webhook) are never broken by a notification problem. No-ops if env is unset.
 */
export async function sendTelegram(text: string) {
  if (!token || !chatId) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing — skipping")
    return
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })
    if (!res.ok) {
      console.error("[telegram] send failed", res.status, await res.text().catch(() => ""))
    }
  } catch (err) {
    console.error("[telegram] send error", err)
  }
}

/** Escapes each field and builds the "new sale" notification body. */
export function buildSaleMessage(opts: {
  typeLabel: string
  priceLabel: string
  visitDateLabel: string
  email: string
  ticketUrl: string
  source: string
}) {
  return [
    "🎟 <b>Куплен билет</b>",
    ``,
    `Тип: <b>${escapeHtml(opts.typeLabel)}</b>`,
    `Дата визита: <b>${escapeHtml(opts.visitDateLabel)}</b>`,
    `Сумма: <b>${escapeHtml(opts.priceLabel)}</b>`,
    `Почта: ${escapeHtml(opts.email)}`,
    `Источник: ${escapeHtml(opts.source)}`,
    ``,
    `<a href="${escapeHtml(opts.ticketUrl)}">Открыть билет</a>`,
  ].join("\n")
}
