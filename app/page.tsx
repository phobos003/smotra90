import { getCatalog } from "@/lib/tickets"
import HomeClient from "./HomeClient"

export const dynamic = "force-dynamic"

export default async function Page() {
  const catalog = await getCatalog()
  return <HomeClient catalog={catalog} />
}
