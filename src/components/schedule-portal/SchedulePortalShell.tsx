import { CalendarDays, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { getStaffClinicalHomePath } from "@/lib/staffPortalRouting";
import { getSchedulePortalLogin, isCalendarSubdomain, mainSiteUrl } from "@/lib/schedulePortalHost";

interface SchedulePortalShellProps {
  userEmail?: string | null;
  children: React.ReactNode;
}

const SchedulePortalShell = ({ userEmail, children }: SchedulePortalShellProps) => {
  const clinicalHome = getStaffClinicalHomePath(userEmail ?? undefined);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = getSchedulePortalLogin();
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F2EBDC] overflow-hidden">
      <header className="shrink-0 h-14 border-b border-[#2A2826]/10 bg-[#2A2826] text-[#F2EBDC] flex items-center gap-3 px-5 print:hidden shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-[#B8956A] flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-[#2A2826]" />
          </div>
          <div className="min-w-0">
            <p className="font-jost text-[10px] uppercase tracking-[0.2em] text-[#F2EBDC]/60 leading-none">
              Elevated Health Augusta
            </p>
            <h1 className="font-playfair text-lg text-[#F2EBDC] leading-tight truncate">Calendar</h1>
          </div>
        </div>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="font-jost max-w-[220px] truncate border-[#F2EBDC]/20 text-[#F2EBDC] hover:bg-[#F2EBDC]/10 hover:text-[#F2EBDC]">
              {userEmail ?? "Staff"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <a href={mainSiteUrl(clinicalHome)} className="flex items-center gap-2 cursor-pointer">
                <ExternalLink className="h-4 w-4" />
                Open clinical portal
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={mainSiteUrl("/office/dashboard")} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Office dashboard
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
};

export default SchedulePortalShell;
