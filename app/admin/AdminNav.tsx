"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <nav className="adminNav">
      <Link href="/admin/scan" className={pathname === "/admin/scan" ? "active" : ""}>Сканер</Link>
      <Link href="/admin/dates" className={pathname === "/admin/dates" ? "active" : ""}>Даты</Link>
      <Link href="/admin/prices" className={pathname === "/admin/prices" ? "active" : ""}>Цены</Link>
      <button className="adminLogout" onClick={logout}>Выйти</button>
    </nav>
  )
}
