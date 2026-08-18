"use client"

import { useEffect, useState } from "react"
import { formatPrice, type Catalog } from "@/lib/tickets"

type TicketType = "ADULT" | "CHILD" | "FAMILY"

type AvailableDate = { date: string; available: number }

const TYPES: TicketType[] = ["ADULT", "CHILD", "FAMILY"]
const MAX_PER_ORDER = 10

const MONTH_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"]
const WEEKDAY_SHORT = ["вс","пн","вт","ср","чт","пт","сб"]

export default function BuyTicketModal({
  open,
  onClose,
  catalog,
  initialType,
}: {
  open: boolean
  onClose: () => void
  catalog: Catalog
  initialType: TicketType
}) {
  const [dates, setDates] = useState<AvailableDate[]>([])
  const [loadingDates, setLoadingDates] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [qty, setQty] = useState<Record<TicketType, number>>({ ADULT: 0, CHILD: 0, FAMILY: 0 })
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
    setQty({ ADULT: 0, CHILD: 0, FAMILY: 0, [initialType]: 1 })
    fetch("/api/dates/available")
      .then((r) => r.json())
      .then((d) => setDates(d.dates || []))
      .catch(() => setError("Не удалось загрузить даты"))
      .finally(() => setLoadingDates(false))
  }, [open, initialType])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  const totalCount = TYPES.reduce((s, t) => s + qty[t], 0)
  const totalPrice = TYPES.reduce((s, t) => s + qty[t] * catalog[t].price, 0)
  const selected = dates.find((d) => d.date === selectedDate)
  const overCapacity = !!selected && totalCount > selected.available

  function setCount(type: TicketType, next: number) {
    const clamped = Math.max(0, next)
    const others = totalCount - qty[type]
    if (others + clamped > MAX_PER_ORDER) return
    setQty((q) => ({ ...q, [type]: clamped }))
  }

  async function submit() {
    if (!selectedDate || !email || totalCount < 1) return
    setSubmitting(true)
    setError(null)
    try {
      const items = TYPES.filter((t) => qty[t] > 0).map((t) => ({ type: t, count: qty[t] }))
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date: selectedDate, email, name: name || undefined, phone: phone || undefined, items }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg: Record<string, string> = {
          date_unavailable: "Эта дата недоступна",
          sold_out: "На эту дату билеты закончились",
          not_enough_capacity: `Осталось мест: ${data.available ?? "?"}`,
          invalid_count: `Максимум ${MAX_PER_ORDER} билетов в заказе`,
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

  const canSubmit =
    !!selectedDate && /\S+@\S+\.\S+/.test(email) && totalCount >= 1 && !overCapacity && !submitting

  return (
    <div className="dateModalOverlay" onClick={onClose}>
      <div className="dateModal" onClick={(e) => e.stopPropagation()}>
        <div className="dateModalHeader">
          <h3>Покупка билетов</h3>
          <button className="dateModalClose" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <p className="dateModalSubtitle">Выберите количество</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {TYPES.map((t) => (
            <div
              key={t}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, padding: "10px 14px", border: "1px solid rgba(128,128,128,0.28)", borderRadius: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>{catalog[t].label}</span>
                <span style={{ fontSize: 13, opacity: 0.65 }}>{formatPrice(catalog[t].price)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  aria-label={`Меньше ${catalog[t].label}`}
                  onClick={() => setCount(t, qty[t] - 1)}
                  disabled={qty[t] === 0}
                  style={stepBtn(qty[t] === 0)}
                >−</button>
                <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700, fontSize: 16 }}>{qty[t]}</span>
                <button
                  type="button"
                  aria-label={`Больше ${catalog[t].label}`}
                  onClick={() => setCount(t, qty[t] + 1)}
                  disabled={totalCount >= MAX_PER_ORDER}
                  style={stepBtn(totalCount >= MAX_PER_ORDER)}
                >+</button>
              </div>
            </div>
          ))}
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
            {overCapacity && <p className="dateModalError">Осталось мест: {selected?.available}</p>}
            {error && <p className="dateModalError">{error}</p>}
            <button className="dateModalSubmit" disabled={!canSubmit} onClick={submit}>
              {submitting
                ? "Переходим к оплате…"
                : totalCount < 1
                ? "Выберите билеты"
                : `Оплатить ${formatPrice(totalPrice)} · ${totalCount} шт.`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function stepBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(128,128,128,0.4)",
    background: "transparent", color: "inherit", opacity: disabled ? 0.4 : 1,
    fontSize: 20, lineHeight: 1, cursor: disabled ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  }
}
