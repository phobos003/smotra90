import { formatPrice, formatVisitDate } from "./tickets"

export function buildTicketEmail(opts: {
  ticketId: string
  typeLabel: string
  price: number
  visitDate: Date
  siteUrl: string
  qrDataUrl: string
}) {
  const { ticketId, typeLabel, price, visitDate, siteUrl, qrDataUrl } = opts
  const ticketUrl = `${siteUrl}/ticket/${ticketId}`

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Ваш билет — Высота 90</title>
</head>
<body style="margin:0;padding:0;background:#FAFCFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFCFF;padding:40px 20px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:white;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#4FB6E8,#00D4FF);padding:40px 32px;text-align:center;color:white;">
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Ваш билет готов</h1>
            <p style="margin:0;font-size:16px;opacity:0.95;">Высота 90 — смотровая площадка в Москва‑Сити</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Оплата прошла успешно. Покажите этот QR‑код на входе — сотрудник его отсканирует.</p>
            <div style="text-align:center;margin:24px 0;">
              <img src="${qrDataUrl}" alt="QR-код билета" width="240" height="240" style="display:inline-block;border:8px solid #F3F9FE;border-radius:16px;">
            </div>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;border-top:1px solid #E5E7EB;border-bottom:1px solid #E5E7EB;">
              <tr>
                <td style="padding:14px 0;color:#6B7280;font-size:14px;">Тип билета</td>
                <td style="padding:14px 0;text-align:right;font-weight:600;">${typeLabel}</td>
              </tr>
              <tr>
                <td style="padding:14px 0;color:#6B7280;font-size:14px;border-top:1px solid #F3F4F6;">Дата визита</td>
                <td style="padding:14px 0;text-align:right;font-weight:600;border-top:1px solid #F3F4F6;">${formatVisitDate(visitDate)}</td>
              </tr>
              <tr>
                <td style="padding:14px 0;color:#6B7280;font-size:14px;border-top:1px solid #F3F4F6;">Сумма</td>
                <td style="padding:14px 0;text-align:right;font-weight:600;border-top:1px solid #F3F4F6;">${formatPrice(price)}</td>
              </tr>
              <tr>
                <td style="padding:14px 0;color:#6B7280;font-size:14px;border-top:1px solid #F3F4F6;">Номер билета</td>
                <td style="padding:14px 0;text-align:right;font-family:monospace;font-size:13px;border-top:1px solid #F3F4F6;">${ticketId}</td>
              </tr>
            </table>
            <div style="text-align:center;margin:32px 0 8px;">
              <a href="${ticketUrl}" style="display:inline-block;padding:14px 32px;border-radius:12px;background:linear-gradient(135deg,#4FB6E8,#00D4FF);color:white;text-decoration:none;font-weight:600;font-size:16px;">Открыть билет</a>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#6B7280;text-align:center;line-height:1.6;">Вход строго в указанную дату. Билет действителен один раз.<br>По вопросам — info@visota90.ru</p>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:20px 32px;text-align:center;font-size:12px;color:#9CA3AF;">
            © Высота 90 · Москва‑Сити, Пресненская набережная
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`.trim()

  const text = [
    "Ваш билет — Высота 90",
    `Тип: ${typeLabel}`,
    `Дата визита: ${formatVisitDate(visitDate)}`,
    `Сумма: ${formatPrice(price)}`,
    `Номер: ${ticketId}`,
    `Ссылка: ${ticketUrl}`,
  ].join("\n")

  return { html, text }
}

export function buildMultiTicketEmail(opts: {
  tickets: { id: string; typeLabel: string; qrDataUrl: string }[]
  visitDate: Date
  totalPrice: number
  siteUrl: string
}) {
  const { tickets, visitDate, totalPrice, siteUrl } = opts
  const count = tickets.length

  const ticketBlocks = tickets
    .map(
      (t, i) => `
            <div style="margin:24px 0;padding:24px;background:#F3F9FE;border-radius:16px;text-align:center;">
              <p style="margin:0 0 12px;font-size:14px;color:#4FB6E8;font-weight:700;letter-spacing:1px;">БИЛЕТ ${i + 1} ИЗ ${count} · ${t.typeLabel}</p>
              <img src="${t.qrDataUrl}" alt="QR-код" width="220" height="220" style="display:inline-block;border:6px solid white;border-radius:14px;">
              <p style="margin:12px 0 4px;font-family:monospace;font-size:11px;color:#6B7280;word-break:break-all;">${t.id}</p>
              <a href="${siteUrl}/ticket/${t.id}" style="font-size:13px;color:#4FB6E8;text-decoration:none;">Открыть билет →</a>
            </div>`,
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Ваши билеты — Высота 90</title>
</head>
<body style="margin:0;padding:0;background:#FAFCFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FAFCFF;padding:40px 20px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:white;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#4FB6E8,#00D4FF);padding:40px 32px;text-align:center;color:white;">
            <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Ваши билеты готовы</h1>
            <p style="margin:0;font-size:16px;opacity:0.95;">${count} ${count === 1 ? "билет" : count < 5 ? "билета" : "билетов"} · Высота 90</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Каждый QR‑код — отдельный вход. На входе сотрудник отсканирует каждый.</p>
            <p style="margin:0 0 16px;font-size:15px;"><b>Дата визита:</b> ${formatVisitDate(visitDate)}</p>
            <p style="margin:0 0 8px;font-size:15px;"><b>Сумма:</b> ${formatPrice(totalPrice)}</p>
            ${ticketBlocks}
            <p style="margin:24px 0 0;font-size:13px;color:#6B7280;text-align:center;line-height:1.6;">Вход строго в указанную дату. Каждый билет действителен один раз.<br>По вопросам — info@visota90.ru</p>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:20px 32px;text-align:center;font-size:12px;color:#9CA3AF;">
            © Высота 90 · Москва‑Сити, Пресненская набережная
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`.trim()

  const text = [
    `Ваши билеты — Высота 90 (${count} шт.)`,
    `Дата визита: ${formatVisitDate(visitDate)}`,
    `Сумма: ${formatPrice(totalPrice)}`,
    "",
    ...tickets.map((t, i) => `${i + 1}. ${t.typeLabel} — ${siteUrl}/ticket/${t.id}`),
  ].join("\n")

  return { html, text }
}
