import { Suspense } from "react"
import FilteredUsersPage from "./FilteredUsersPage"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilteredUsersPage />
    </Suspense>
  )
}