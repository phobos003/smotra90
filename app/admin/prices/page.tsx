"use client"

import { useEffect, useState } from "react"
import AdminNav from "../AdminNav"

type PriceRow = { type: "ADULT" | "CHILD" | "FAMILY"; label: string; price: number }

export default function AdminPricesPage() {
  const [rows, setRows] = useState<PriceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const r = await fetch("/api/admin/prices", { cache: "no-store" })
    const d = await r.json()
    setRows(d.prices || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save(type: string, patch: { label?: string; price?: number }) {
    setSaving(type)
    await fetch("/api/admin/prices", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, ...patch }),
    })
    await load()
    setSaving(null)
  }

  return (
    <>
      <AdminNav />
      <div className="adminContainer">
        <h1>Цены на билеты</h1>
        <p style={{ color: "#6B7280", marginBottom: 24, fontSize: 14 }}>
          Цены вводите в рублях. Они обновятся на главной странице и в оплате сразу.
        </p>

        {loading ? (
          <p>Загружаем…</p>
        ) : (
          <div className="adminDatesList">
            {rows.map((r) => {
              const rubles = r.price / 100
              return (
                <div key={r.type} className="adminDateRow" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
                  <div>
                    <input
                      type="text"
                      defaultValue={r.label}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v && v !== r.label) save(r.type, { label: v })
                      }}
                      disabled={saving === r.type}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        border: "1.5px solid #E5E7EB",
                        borderRadius: 8,
                        fontSize: 15,
                        fontFamily: "inherit",
                      }}
                    />
                    <div className="adminDateSub" style={{ marginTop: 4 }}>{r.type}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      defaultValue={rubles}
                      onBlur={(e) => {
                        const v = Number(e.target.value)
                        if (!Number.isNaN(v) && v * 100 !== r.price) save(r.type, { price: Math.round(v * 100) })
                      }}
                      disabled={saving === r.type}
                      style={{ width: 120 }}
                    />
                    <span style={{ fontSize: 14, color: "#6B7280" }}>₽</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280", minWidth: 80, textAlign: "right" }}>
                    {saving === r.type ? "Сохраняем…" : "✓"}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
