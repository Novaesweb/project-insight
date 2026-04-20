import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, FilePlus2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BriefingsQuickQuestionCard({
  title,
  description,
  icon,
  to,
}: {
  title: string;
  description: string;
  icon?: "draft" | "sent" | "library";
  to: string;
}) {
  const Icon = icon === "draft" ? FilePlus2 : icon === "sent" ? ClipboardList : FileText;

  return (
    <Button
      asChild
      variant="outline"
      className="h-auto justify-start rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-left transition-all hover:border-fuchsia-500/30 hover:bg-white/[0.06] group"
    >
      <Link to={to}>
        <div>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black/30 text-white/60 transition-colors group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-400">
            <Icon className="h-6 w-6" />
          </div>
          <p className="text-lg font-black text-white">{title}</p>
          <p className="mt-2 text-sm text-white/50">{description}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">
            Abrir
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </Button>
  );
}
