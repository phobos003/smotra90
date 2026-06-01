"use client"

import { useEffect, useState } from "react"
import AdminNav from "../AdminNav"

type Ticket = {
  id: string
  type: string
  price: number
  email: string
  name: string | null
  phone: string | null
  visitDate: string
  status: string
  paymentId: string | null
  createdAt: string
  paidAt: string | null
  usedAt: string | null
}

const TYPE_LABEL: Record<string, string> = {
  ADULT: "Взрослый",
  CHILD: "Детский",
  FAMILY: "Семейный",
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Ожидает", color: "#F59E0B" },
  PAID: { text: "Оплачен", color: "#10B981" },
  USED: { text: "Пришёл", color: "#4FB6E8" },
  CANCELLED: { text: "Отменён", color: "#EF4444" },
  REFUNDED: { text: "Возврат", color: "#EF4444" },
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00.000Z")
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`
}

function rub(kopecks: number) {
  return (kopecks / 100).toLocaleString("ru-RU") + " ₽"
}

export default function AdminSalesPage() {
  const [items, setItems] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("ALL")
  const [type, setType] = useState("ALL")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [q, setQ] = useState("")

  function buildQuery() {
    const p = new URLSearchParams()
    if (status !== "ALL") p.set("status", status)
    if (type !== "ALL") p.set("type", type)
    if (from) p.set("from", from)
    if (to) p.set("to", to)
    if (q.trim()) p.set("q", q.trim())
    return p.toString()
  }

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/sales?${buildQuery()}&limit=500`, { cache: "no-store" })
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, from, to])

  function exportCsv() {
    window.open(`/api/admin/sales/export?${buildQuery()}`)
  }

  const totals = items.reduce(
    (acc, t) => {
      if (t.status === "PAID" || t.status === "USED") {
        acc.count += 1
        acc.revenue += t.price
      }
      if (t.status === "USED") acc.visited += 1
      return acc
    },
    { count: 0, revenue: 0, visited: 0 },
  )

  return (
    <>
      <AdminNav />
      <div className="adminContainer" style={{ maxWidth: 1200 }}>
        <div className="salesHeader">
          <h1>Продажи</h1>
          <button onClick={exportCsv} className="csvBtn">Скачать CSV</button>
        </div>

        <div className="salesFilters">
          <input
            type="search"
            placeholder="Поиск по email, имени, телефону или ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") load() }}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">Все статусы</option>
            <option value="PAID">Оплачен</option>
            <option value="USED">Пришёл</option>
            <option value="PENDING">Ожидает</option>
            <option value="CANCELLED">Отменён</option>
            <option value="REFUNDED">Возврат</option>
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ALL">Все типы</option>
            <option value="ADULT">Взрослый</option>
            <option value="CHILD">Детский</option>
            <option value="FAMILY">Семейный</option>
          </select>
          <label className="salesDateField">
            <span>С:</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="salesDateField">
            <span>По:</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>

        <div className="salesSummary">
          <span>Всего записей: <strong>{items.length}</strong></span>
          <span>Продано: <strong>{totals.count}</strong> на <strong>{rub(totals.revenue)}</strong></span>
          <span>Пришли: <strong>{totals.visited}</strong></span>
        </div>

        {loading ? (
          <p>Загружаем…</p>
        ) : items.length === 0 ? (
          <p style={{ color: "#6B7280", padding: "40px 0", textAlign: "center" }}>Ничего не найдено.</p>
        ) : (
          <div className="salesTableWrap">
            <table className="salesTable">
              <thead>
                <tr>
                  <th>Создан</th>
                  <th>Статус</th>
                  <th>Тип</th>
                  <th>Цена</th>
                  <th>Клиент</th>
                  <th>Визит</th>
                  <th>Оплачен</th>
                  <th>Пришёл</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const s = STATUS_LABEL[t.status] || { text: t.status, color: "#6B7280" }
                  return (
                    <tr key={t.id}>
                      <td>{formatDateTime(t.createdAt)}</td>
                      <td><span className="salesStatusPill" style={{ background: s.color }}>{s.text}</span></td>
                      <td>{TYPE_LABEL[t.type] || t.type}</td>
                      <td>{rub(t.price)}</td>
                      <td className="salesClient">
                        <div>{t.email}</div>
                        {(t.name || t.phone) && (
                          <div className="salesClientSub">
                            {t.name}{t.name && t.phone ? " · " : ""}{t.phone}
                          </div>
                        )}
                      </td>
                      <td>{formatDate(t.visitDate)}</td>
                      <td>{formatDateTime(t.paidAt)}</td>
                      <td>{formatDateTime(t.usedAt)}</td>
                      <td><a href={`/ticket/${t.id}`} target="_blank" rel="noreferrer" className="salesIdLink">{t.id.slice(0, 8)}…</a></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
