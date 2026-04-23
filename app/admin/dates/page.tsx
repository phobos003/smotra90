"use client"

import { useEffect, useState } from "react"
import AdminNav from "../AdminNav"

type DateRow = {
  id: string
  date: string
  isActive: boolean
  capacity: number
  soldCount: number
}

const WEEKDAYS = ["вс","пн","вт","ср","чт","пт","сб"]
const MONTHS = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"]

function fmt(date: string) {
  const d = new Date(date + "T00:00:00.000Z")
  return {
    label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
    weekday: WEEKDAYS[d.getUTCDay()],
  }
}

export default function AdminDatesPage() {
  const [rows, setRows] = useState<DateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newDate, setNewDate] = useState("")

  async function load() {
    setLoading(true)
    const r = await fetch("/api/admin/dates", { cache: "no-store" })
    const d = await r.json()
    setRows(d.dates || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function update(id: string, patch: Partial<DateRow>) {
    setSaving(id)
    await fetch(`/api/admin/dates/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    })
    await load()
    setSaving(null)
  }

  async function create() {
    if (!newDate) return
    await fetch("/api/admin/dates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: newDate, capacity: 50 }),
    })
    setNewDate("")
    await load()
  }

  async function remove(id: string) {
    if (!confirm("Удалить дату? Билеты на эту дату останутся в базе.")) return
    await fetch(`/api/admin/dates/${id}`, { method: "DELETE" })
    await load()
  }

  return (
    <>
      <AdminNav />
      <div className="adminContainer">
        <h1>Даты в продаже</h1>

        <div className="adminDateRow" style={{ marginBottom: 20 }}>
          <div>
            <div className="adminDateLabel">Добавить дату</div>
            <div className="adminDateSub">YYYY-MM-DD</div>
          </div>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={{ width: 160 }}
          />
          <button
            onClick={create}
            disabled={!newDate}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#4FB6E8,#00D4FF)",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Добавить
          </button>
          <span />
        </div>

        {loading ? (
          <p>Загружаем…</p>
        ) : rows.length === 0 ? (
          <p>Пока нет дат. Добавьте первую выше.</p>
        ) : (
          <div className="adminDatesList">
            {rows.map((r) => {
              const f = fmt(r.date)
              return (
                <div key={r.id} className="adminDateRow">
                  <div>
                    <div className="adminDateLabel">{f.label} · {f.weekday}</div>
                    <div className="adminDateSub">Продано: {r.soldCount} из {r.capacity}</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    defaultValue={r.capacity}
                    onBlur={(e) => {
                      const v = Number(e.target.value)
                      if (v !== r.capacity) update(r.id, { capacity: v })
                    }}
                    disabled={saving === r.id}
                  />
                  <label className="adminToggle">
                    <input
                      type="checkbox"
                      checked={r.isActive}
                      onChange={(e) => update(r.id, { isActive: e.target.checked })}
                      disabled={saving === r.id}
                    />
                    <span className="slider" />
                  </label>
                  <button
                    onClick={() => remove(r.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: "transparent",
                      color: "#EF4444",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
