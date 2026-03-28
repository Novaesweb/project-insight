import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TopProgressBar } from "@/components/TopProgressBar";
import { SupabaseHeartbeat } from "./SupabaseHeartbeat";
import { ReloadPrompt } from "./ReloadPrompt";
import { useBranding } from "@/hooks/useBranding";
import { useUI } from "@/store";
import { Menu } from "lucide-react";
import AdminSidebar from "./admin/AdminSidebar";
import AdminHeader from "./admin/AdminHeader";
import AdminMainContent from "./admin/AdminMainContent";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed } = useUI();
  const branding = useBranding();

  return (
    <div className="flex h-screen bg-[var(--admin-bg)] text-foreground font-sora selection:bg-primary/30 overflow-hidden">
      {/* Sidebar Desktop */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        branding={branding}
      />

      {/* Mobile Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
          <Button variant="ghost" size="icon" className="bg-[var(--admin-surface)] border border-white/10 rounded-xl">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-[var(--admin-surface)] border-r border-white/10 p-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-[#7b1fa2] via-[#c2185b] to-[#FFB800] opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#7b1fa2]/[0.04] via-transparent to-[#FFB800]/[0.03] pointer-events-none" />
          <div className="p-8 relative">
            <AdminSidebar
              isCollapsed={false}
              onToggle={() => {}}
              branding={branding}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0">
        <SupabaseHeartbeat />
        <TopProgressBar />
        <AdminHeader />
        <AdminMainContent pathname={pathname}>
          {children}
        </AdminMainContent>
      </main>
      
      <ReloadPrompt />
    </div>
  );
}
