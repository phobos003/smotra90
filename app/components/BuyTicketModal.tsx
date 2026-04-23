"use client"

import { useEffect, useState } from "react"

type TicketType = "ADULT" | "CHILD" | "FAMILY"

type AvailableDate = { date: string; available: number }

const MONTH_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"]
const WEEKDAY_SHORT = ["вс","пн","вт","ср","чт","пт","сб"]

export default function BuyTicketModal({
  open,
  onClose,
  type,
  typeLabel,
  price,
}: {
  open: boolean
  onClose: () => void
  type: TicketType
  typeLabel: string
  price: string
}) {
  const [dates, setDates] = useState<AvailableDate[]>([])
  const [loadingDates, setLoadingDates] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoadingDates(true)
    setError(null)
    setSelectedDate(null)
    fetch("/api/dates/available")
      .then((r) => r.json())
      .then((d) => setDates(d.dates || []))
      .catch(() => setError("Не удалось загрузить даты"))
      .finally(() => setLoadingDates(false))
  }, [open])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  async function submit() {
    if (!selectedDate || !email) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, date: selectedDate, email, name: name || undefined, phone: phone || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg: Record<string, string> = {
          date_unavailable: "Эта дата недоступна",
          sold_out: "На эту дату билеты закончились",
          payment_create_failed: "Не удалось создать платёж. Попробуйте позже.",
          invalid_input: "Проверьте введённые данные",
        }
        setError(msg[data.error] || "Ошибка. Попробуйте позже.")
        setSubmitting(false)
        return
      }
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      }
    } catch {
      setError("Сеть недоступна")
      setSubmitting(false)
    }
  }

  const canSubmit = selectedDate && /\S+@\S+\.\S+/.test(email) && !submitting

  return (
    <div className="dateModalOverlay" onClick={onClose}>
      <div className="dateModal" onClick={(e) => e.stopPropagation()}>
        <div className="dateModalHeader">
          <h3>{typeLabel} · {price}</h3>
          <button className="dateModalClose" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        <p className="dateModalSubtitle">Выберите дату посещения</p>

        {loadingDates ? (
          <div className="dateModalEmpty">Загружаем даты…</div>
        ) : dates.length === 0 ? (
          <div className="dateModalEmpty">Пока нет дат в продаже. Загляните позже.</div>
        ) : (
          <div className="dateGrid">
            {dates.map((d) => {
              const dt = new Date(d.date + "T00:00:00.000Z")
              const day = dt.getUTCDate()
              const month = MONTH_SHORT[dt.getUTCMonth()]
              const weekday = WEEKDAY_SHORT[dt.getUTCDay()]
              return (
                <button
                  key={d.date}
                  className={`dateOption ${selectedDate === d.date ? "selected" : ""}`}
                  onClick={() => setSelectedDate(d.date)}
                  type="button"
                >
                  <span className="dayNum">{day}</span>
                  <span className="monthName">{month}</span>
                  <span className="weekday">{weekday}</span>
                </button>
              )
            })}
          </div>
        )}

        {selectedDate && (
          <div className="dateModalForm">
            <input
              type="email"
              placeholder="Email для получения билета"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Имя (необязательно)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Телефон (необязательно)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && <p className="dateModalError">{error}</p>}
            <button className="dateModalSubmit" disabled={!canSubmit} onClick={submit}>
              {submitting ? "Переходим к оплате…" : `Оплатить ${price}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
