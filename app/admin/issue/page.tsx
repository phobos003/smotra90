"use client"

import { useEffect, useState } from "react"
import AdminNav from "../AdminNav"

type DateRow = { id: string; date: string; isActive: boolean; capacity: number; soldCount: number }
type CatalogItem = { type: "ADULT" | "CHILD" | "FAMILY"; label: string; price: number }

const TYPE_OPTIONS: { value: "ADULT" | "CHILD" | "FAMILY" }[] = [
  { value: "ADULT" },
  { value: "CHILD" },
  { value: "FAMILY" },
]

export default function AdminIssuePage() {
  const [dates, setDates] = useState<DateRow[]>([])
  const [catalog, setCatalog] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)

  const [type, setType] = useState<"ADULT" | "CHILD" | "FAMILY">("ADULT")
  const [date, setDate] = useState("")
  const [count, setCount] = useState(1)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [priceOverride, setPriceOverride] = useState<string>("")
  const [sendEmail, setSendEmail] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ tickets: { id: string; url: string }[]; totalPrice: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/dates", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/prices", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([d, p]) => {
        setDates(d.dates || [])
        setCatalog(p.prices || [])
        if (d.dates?.length) setDate(d.dates.find((x: DateRow) => x.isActive)?.date || d.dates[0].date)
      })
      .finally(() => setLoading(false))
  }, [])

  const catalogPrice = catalog.find((c) => c.type === type)?.price ?? 0
  const finalPrice = priceOverride !== "" ? Math.round(Number(priceOverride) * 100) : catalogPrice
  const total = finalPrice * count
  const selectedDate = dates.find((d) => d.date === date)
  const available = selectedDate ? selectedDate.capacity - selectedDate.soldCount : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/admin/tickets/issue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          date,
          count,
          email,
          name: name || undefined,
          phone: phone || undefined,
          pricePerTicketOverride: priceOverride !== "" ? Math.round(Number(priceOverride) * 100) : null,
          sendEmail,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg: Record<string, string> = {
          date_not_found: "Дата не найдена",
          not_enough_capacity: `Недостаточно мест (свободно: ${data.available})`,
          invalid_input: "Проверьте введённые данные",
        }
        setError(msg[data.error] || "Ошибка")
      } else {
        setResult({ tickets: data.tickets, totalPrice: data.totalPrice })
      }
    } catch {
      setError("Сеть недоступна")
    }
    setSubmitting(false)
  }

  function resetForm() {
    setResult(null)
    setName("")
    setEmail("")
    setPhone("")
    setPriceOverride("")
    setCount(1)
  }

  return (
    <>
      <AdminNav />
      <div className="adminContainer" style={{ maxWidth: 600 }}>
        <h1>Выдать билеты</h1>
        <p style={{ color: "#6B7280", marginBottom: 24, fontSize: 14 }}>
          Создаст билеты вручную, без оплаты через ЮKassa. Каждый билет — отдельный QR.
        </p>

        {loading ? (
          <p>Загружаем…</p>
        ) : result ? (
          <div className="issueResult">
            <h2>Готово · {result.tickets.length} билет(ов) на сумму {(result.totalPrice / 100).toLocaleString("ru-RU")} ₽</h2>
            {sendEmail && <p style={{ color: "#10B981" }}>Письмо отправлено на {email}</p>}
            <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
              {result.tickets.map((t, i) => (
                <li key={t.id} style={{ marginBottom: 8 }}>
                  <a href={t.url} target="_blank" rel="noreferrer" style={{ color: "#4FB6E8", textDecoration: "none" }}>
                    Билет {i + 1} → {t.url}
                  </a>
                </li>
              ))}
            </ul>
            <button onClick={resetForm} className="dateModalSubmit" style={{ marginTop: 24 }}>Выдать ещё</button>
          </div>
        ) : (
          <form onSubmit={submit} className="issueForm">
            <label>
              <span>Тип билета</span>
              <select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                {TYPE_OPTIONS.map((opt) => {
                  const c = catalog.find((x) => x.type === opt.value)
                  return (
                    <option key={opt.value} value={opt.value}>
                      {c?.label || opt.value} — {(c?.price ?? 0) / 100} ₽
                    </option>
                  )
                })}
              </select>
            </label>

            <label>
              <span>Дата визита</span>
              <select value={date} onChange={(e) => setDate(e.target.value)}>
                {dates.map((d) => (
                  <option key={d.id} value={d.date} disabled={!d.isActive || d.capacity - d.soldCount === 0}>
                    {new Date(d.date + "T00:00:00.000Z").toLocaleDateString("ru-RU", { timeZone: "UTC" })}
                    {!d.isActive ? " (выключена)" : ""}
                    {" · своб. " + (d.capacity - d.soldCount)}
                  </option>
                ))}
              </select>
              {selectedDate && <small>Свободных мест: {available}</small>}
            </label>

            <label>
              <span>Количество билетов</span>
              <input type="number" min={1} max={Math.min(50, available)} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} />
            </label>

            <label>
              <span>Цена за билет (₽) <small>необязательно — для скидок / спецтарифов</small></span>
              <input
                type="number"
                min={0}
                step={50}
                placeholder={`По умолчанию ${catalogPrice / 100}`}
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
              />
            </label>

            <label>
              <span>Email клиента</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>
              <span>Имя</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label>
              <span>Телефон</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>

            <label className="issueCheckbox">
              <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
              <span>Отправить QR на email</span>
            </label>

            <div className="issueSummary">
              <span>Итого:</span>
              <strong>{(total / 100).toLocaleString("ru-RU")} ₽</strong>
            </div>

            {error && <p className="dateModalError">{error}</p>}

            <button className="dateModalSubmit" disabled={submitting || !email || count < 1 || count > available}>
              {submitting ? "Создаём…" : `Создать ${count > 1 ? `${count} билетов` : "билет"}`}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
