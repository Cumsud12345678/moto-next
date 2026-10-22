import type { Metadata } from "next"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import AdminGuard from "./components/AdminGuard"

// Admin səhifələri Google-da görünməsin
export const metadata: Metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <SidebarProvider>
        <AppSidebar />
        {/* min-w-0: geniş cədvəllər səhifəni yana itələməsin, öz içində sürüşsün */}
        <SidebarInset className="min-w-0 bg-gray-50">
          <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-white px-3">
            <SidebarTrigger />
            <span className="text-sm text-muted-foreground">Motoelan admin</span>
          </header>
          <div className="p-4 lg:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  )
}
