"use client"

import { useEffect, useRef, useState } from "react"
import AdminNav from "../AdminNav"

type TicketData = {
  id: string
  type: string
  typeLabel: string
  visitDate: string
  email: string
  status: string
  usedAt: string | null
}

type VerifyResult =
  | { ok: true; ticket: TicketData; alreadyUsed: boolean; wrongDate: boolean }
  | { ok: false; error: string }

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Не оплачен",
  PAID: "Оплачен",
  USED: "Использован",
  CANCELLED: "Отменён",
  REFUNDED: "Возврат",
}

export default function AdminScanPage() {
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [busy, setBusy] = useState(false)
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null)
  const startedRef = useRef(false)

  async function stopScanner() {
    const s = scannerRef.current
    if (!s) return
    try {
      await s.stop()
    } catch {}
    try {
      await s.clear()
    } catch {}
    scannerRef.current = null
    startedRef.current = false
  }

  async function startScanner() {
    if (startedRef.current) return
    const { Html5Qrcode } = await import("html5-qrcode")
    const el = document.getElementById("qr-reader")
    if (!el) return
    const s = new Html5Qrcode("qr-reader")
    scannerRef.current = s
    startedRef.current = true
    try {
      await s.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText) => {
          await stopScanner()
          await handleScan(decodedText)
        },
        () => {},
      )
    } catch (err) {
      console.error(err)
      startedRef.current = false
    }
  }

  async function handleScan(text: string) {
    const id = text.split("/ticket/")[1]?.split(/[/?#]/)[0] || text
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/ticket/${encodeURIComponent(id)}`, { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setResult({ ok: false, error: data.error || "unknown" })
      } else {
        setResult({ ok: true, ticket: data.ticket, alreadyUsed: data.ticket.status === "USED", wrongDate: data.wrongDate })
      }
    } catch {
      setResult({ ok: false, error: "network" })
    }
    setBusy(false)
  }

  async function useTicket() {
    if (!result?.ok) return
    setBusy(true)
    const res = await fetch(`/api/admin/ticket/${encodeURIComponent(result.ticket.id)}/use`, { method: "POST" })
    const data = await res.json()
    if (res.ok) {
      setResult({ ok: true, ticket: { ...result.ticket, status: "USED", usedAt: new Date().toISOString() }, alreadyUsed: true, wrongDate: result.wrongDate })
    } else {
      alert(`Ошибка: ${data.error}`)
    }
    setBusy(false)
  }

  function reset() {
    setResult(null)
    startScanner()
  }

  useEffect(() => {
    startScanner()
    return () => { stopScanner() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const statusBlock = (() => {
    if (!result) return null
    if (!result.ok) {
      const errMap: Record<string, string> = {
        not_found: "Билет не найден",
        network: "Нет сети",
      }
      return (
        <div className="scanResult bad">
          <h2>Ошибка</h2>
          <p>{errMap[result.error] || result.error}</p>
          <div className="scanBtns">
            <button className="resetBtn" onClick={reset}>Сканировать ещё</button>
          </div>
        </div>
      )
    }
    const t = result.ticket
    const cls = t.status === "PAID" && !result.wrongDate ? "ok" : "bad"
    return (
      <div className={`scanResult ${cls}`}>
        <h2>{t.typeLabel}</h2>
        <p><b>Статус:</b> {STATUS_LABEL[t.status] || t.status}</p>
        <p><b>Дата визита:</b> {new Date(t.visitDate).toLocaleDateString("ru-RU", { timeZone: "UTC" })}</p>
        <p><b>Email:</b> {t.email}</p>
        <p style={{ fontSize: 12, color: "#6B7280", wordBreak: "break-all" }}><b>ID:</b> {t.id}</p>
        {result.wrongDate && <p style={{ color: "#EF4444", fontWeight: 600 }}>⚠ Билет на другую дату!</p>}
        {t.status === "USED" && <p style={{ color: "#6B7280", fontWeight: 600 }}>Уже использован</p>}
        <div className="scanBtns">
          <button className="useBtn" onClick={useTicket} disabled={busy || t.status !== "PAID" || result.wrongDate}>
            {t.status === "PAID" && !result.wrongDate ? "Пропустить" : "Нельзя пропустить"}
          </button>
          <button className="resetBtn" onClick={reset}>Сканировать ещё</button>
        </div>
      </div>
    )
  })()

  return (
    <>
      <AdminNav />
      <div className="scanWrap">
        <h1>Сканер билетов</h1>
        {!result && <div id="qr-reader" />}
        {statusBlock}
      </div>
    </>
  )
}
