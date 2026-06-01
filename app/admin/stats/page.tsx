"use client"

import { useEffect, useState } from "react"
import AdminNav from "../AdminNav"

type Stats = {
  totals: {
    all: { count: number; revenue: number }
    today: { count: number; revenue: number }
    week: { count: number; revenue: number }
    month: { count: number; revenue: number }
  }
  counts: { pending: number; used: number }
  byType: { type: string; count: number; revenue: number }[]
  chart: { date: string; count: number; revenue: number }[]
  upcoming: { visitDate: string; count: number; revenue: number }[]
}

const TYPE_LABEL: Record<string, string> = {
  ADULT: "Взрослый",
  CHILD: "Детский",
  FAMILY: "Семейный",
}

const MONTHS_SHORT = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"]

function rub(kopecks: number) {
  return (kopecks / 100).toLocaleString("ru-RU") + " ₽"
}

function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00.000Z")
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]}`
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/stats?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [days])

  if (loading || !stats) {
    return (
      <>
        <AdminNav />
        <div className="adminContainer">
          <h1>Аналитика</h1>
          <p>Загружаем…</p>
        </div>
      </>
    )
  }

  const maxRevenue = Math.max(1, ...stats.chart.map((c) => c.revenue))

  return (
    <>
      <AdminNav />
      <div className="adminContainer" style={{ maxWidth: 1000 }}>
        <h1>Аналитика</h1>

        <div className="kpiGrid">
          <Kpi label="Сегодня" count={stats.totals.today.count} revenue={stats.totals.today.revenue} color="#4FB6E8" />
          <Kpi label="7 дней" count={stats.totals.week.count} revenue={stats.totals.week.revenue} color="#10B981" />
          <Kpi label="30 дней" count={stats.totals.month.count} revenue={stats.totals.month.revenue} color="#8B5CF6" />
          <Kpi label="Всего" count={stats.totals.all.count} revenue={stats.totals.all.revenue} color="#F59E0B" />
        </div>

        <div className="statSecondary">
          <div className="statBadge">
            Ожидают оплаты: <strong>{stats.counts.pending}</strong>
          </div>
          <div className="statBadge">
            Использовано: <strong>{stats.counts.used}</strong>
          </div>
        </div>

        <div className="statSection">
          <div className="statSectionHeader">
            <h2>Продажи по дням</h2>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value="7">7 дней</option>
              <option value="14">14 дней</option>
              <option value="30">30 дней</option>
              <option value="90">90 дней</option>
              <option value="365">Год</option>
            </select>
          </div>

          <div className="chart">
            {stats.chart.map((c) => {
              const h = c.revenue > 0 ? Math.max(2, (c.revenue / maxRevenue) * 100) : 0
              const d = new Date(c.date + "T00:00:00.000Z")
              const showLabel = days <= 14 || d.getUTCDate() === 1 || d.getUTCDate() === 15
              return (
                <div key={c.date} className="chartCol" title={`${c.date}: ${c.count} билетов · ${rub(c.revenue)}`}>
                  <div className="chartBar" style={{ height: `${h}%` }}>
                    {c.count > 0 && <span className="chartBarValue">{c.count}</span>}
                  </div>
                  {showLabel && <div className="chartLabel">{shortDate(c.date)}</div>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="statSection">
          <h2>По типам билетов</h2>
          <div className="statTypeGrid">
            {stats.byType.length === 0 ? (
              <p style={{ color: "#6B7280" }}>Продаж пока нет.</p>
            ) : (
              stats.byType.map((t) => (
                <div key={t.type} className="statTypeCard">
                  <div className="statTypeLabel">{TYPE_LABEL[t.type] || t.type}</div>
                  <div className="statTypeCount">{t.count}</div>
                  <div className="statTypeRevenue">{rub(t.revenue)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="statSection">
          <h2>Будущие визиты</h2>
          {stats.upcoming.length === 0 ? (
            <p style={{ color: "#6B7280" }}>Ничего не запланировано.</p>
          ) : (
            <div className="upcomingList">
              {stats.upcoming.map((u) => (
                <div key={u.visitDate} className="upcomingRow">
                  <div className="upcomingDate">{shortDate(u.visitDate)}</div>
                  <div className="upcomingCount">{u.count} {u.count === 1 ? "билет" : u.count < 5 ? "билета" : "билетов"}</div>
                  <div className="upcomingRevenue">{rub(u.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Kpi({ label, count, revenue, color }: { label: string; count: number; revenue: number; color: string }) {
  return (
    <div className="kpiCard">
      <div className="kpiLabel">{label}</div>
      <div className="kpiCount" style={{ color }}>{count}</div>
      <div className="kpiRevenue">{rub(revenue)}</div>
    </div>
  )
}
