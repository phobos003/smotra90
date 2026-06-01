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
const MONTHS_FULL = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"]
const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"]

function parseDate(d: string) {
  return new Date(d + "T00:00:00.000Z")
}

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthLabel(d: Date) {
  return `${MONTHS_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export default function AdminDatesPage() {
  const [rows, setRows] = useState<DateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newDate, setNewDate] = useState("")
  const [newCapacity, setNewCapacity] = useState(50)
  const [creating, setCreating] = useState(false)

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
    setCreating(true)
    await fetch("/api/admin/dates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: newDate, capacity: newCapacity }),
    })
    setNewDate("")
    setNewCapacity(50)
    await load()
    setCreating(false)
  }

  async function remove(id: string) {
    if (!confirm("Удалить дату? Билеты на эту дату останутся в базе.")) return
    await fetch(`/api/admin/dates/${id}`, { method: "DELETE" })
    await load()
  }

  const grouped: { key: string; label: string; items: DateRow[] }[] = []
  for (const r of rows) {
    const d = parseDate(r.date)
    const key = monthKey(d)
    let g = grouped.find((x) => x.key === key)
    if (!g) {
      g = { key, label: monthLabel(d), items: [] }
      grouped.push(g)
    }
    g.items.push(r)
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <>
      <AdminNav />
      <div className="adminContainer" style={{ maxWidth: 720 }}>
        <h1>Даты в продаже</h1>

        <div className="dateAddCard">
          <div className="dateAddTitle">Добавить дату</div>
          <div className="dateAddRow">
            <input
              type="date"
              min={todayStr}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder="Дата"
            />
            <div className="dateAddCapacityField">
              <input
                type="number"
                min={0}
                max={10000}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Math.max(0, Number(e.target.value)))}
              />
              <span>мест</span>
            </div>
            <button
              onClick={create}
              disabled={!newDate || creating}
              className="dateAddBtn"
            >
              {creating ? "Добавляем…" : "Добавить"}
            </button>
          </div>
        </div>

        {loading ? (
          <p>Загружаем…</p>
        ) : rows.length === 0 ? (
          <div className="dateEmpty">
            <p>Пока нет дат в продаже.</p>
            <p style={{ fontSize: 13, color: "#6B7280" }}>Добавьте первую выше — клиенты сразу увидят её при покупке.</p>
          </div>
        ) : (
          grouped.map((g) => (
            <div key={g.key} className="dateMonth">
              <h2 className="dateMonthTitle">{g.label}</h2>
              <div className="dateCards">
                {g.items.map((r) => {
                  const d = parseDate(r.date)
                  const day = d.getUTCDate()
                  const weekday = WEEKDAYS[d.getUTCDay()]
                  const month = MONTHS_SHORT[d.getUTCMonth()]
                  const sold = r.soldCount
                  const left = r.capacity - r.soldCount
                  const pct = r.capacity > 0 ? Math.min(100, (sold / r.capacity) * 100) : 0
                  const isFull = left <= 0
                  const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6

                  return (
                    <div
                      key={r.id}
                      className={`dateCard ${r.isActive ? "active" : "inactive"} ${isFull ? "full" : ""}`}
                    >
                      <div className="dateCardDate">
                        <div className={`dateCardDay ${isWeekend ? "weekend" : ""}`}>{day}</div>
                        <div className="dateCardMonth">{month}</div>
                        <div className="dateCardWeekday">{weekday}</div>
                      </div>

                      <div className="dateCardBody">
                        <div className="dateCardStats">
                          <span>
                            <strong>{sold}</strong>/{r.capacity} продано
                          </span>
                          <span className={isFull ? "soldOut" : ""}>
                            {isFull ? "мест нет" : `свободно ${left}`}
                          </span>
                        </div>
                        <div className="dateCardProgress">
                          <div className="dateCardProgressFill" style={{ width: `${pct}%` }} />
                        </div>

                        <div className="dateCardControls">
                          <label className="dateCardCapacity">
                            <input
                              type="number"
                              min={r.soldCount}
                              max={10000}
                              defaultValue={r.capacity}
                              onBlur={(e) => {
                                const v = Math.max(r.soldCount, Number(e.target.value))
                                if (v !== r.capacity) update(r.id, { capacity: v })
                              }}
                              disabled={saving === r.id}
                            />
                            <span>лимит</span>
                          </label>

                          <label className="adminToggle" title={r.isActive ? "Продаётся" : "Снято с продажи"}>
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
                            className="dateCardDelete"
                            title="Удалить"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
