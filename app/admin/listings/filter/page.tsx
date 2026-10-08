import { Suspense } from "react"
import ListingsFilterClient from "./ListingsFilterClient"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingsFilterClient />
    </Suspense>
  )
}