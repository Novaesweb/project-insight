import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import TopProgressBar from "@/components/TopProgressBar";
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
    <div className="flex h-screen text-foreground font-sora selection:bg-primary/30 overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}>
      
      {/* Desktop Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        branding={branding}
      />

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden fixed top-4 left-4 z-50">
          <Button variant="ghost" size="icon" className="rounded-xl"
            style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 overflow-hidden"
          style={{ background: 'hsl(var(--background))', borderRight: '1px solid hsl(var(--border))' }}>
          <div className="h-full flex flex-col">
            <MobileSidebar branding={branding} onClose={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Area */}
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
