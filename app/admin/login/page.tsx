"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        setError("Неверный пароль")
        setLoading(false)
        return
      }
      router.push("/admin/scan")
      router.refresh()
    } catch {
      setError("Сеть недоступна")
      setLoading(false)
    }
  }

  return (
    <main className="adminLoginPage">
      <form className="adminLoginForm" onSubmit={submit}>
        <h1>Админка</h1>
        <p>Введите пароль для доступа</p>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
        {error && <p className="adminLoginError">{error}</p>}
        <button disabled={!password || loading} type="submit">
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
    </main>
  )
}
