import { LayoutList, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  templates: any[];
  selectedTemplateIds: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}

export function QuestionsSelectionStep({ templates, selectedTemplateIds, onToggle, onSelectAll }: Props) {
  return (
    <Card className="glass-premium overflow-hidden border-slate-200 transition-all duration-500">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 p-8">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-[#7C3AED]/20">
            <LayoutList className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-light text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Diretrizes <span className="text-brand-gradient italic">Prontas</span>
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Composição do Briefing</CardDescription>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSelectAll}
          className="h-10 px-6 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#7C3AED] hover:bg-[#7C3AED]/5 transition-all"
        >
          {selectedTemplateIds.length === templates.length ? "Desmarcar tudo" : "Selecionar todas"}
        </Button>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onToggle(template.id)}
              className={`
                flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition-all duration-500 group relative overflow-hidden
                ${selectedTemplateIds.includes(template.id) 
                  ? "border-[#7C3AED]/50 bg-[#7C3AED]/5 shadow-[0_10px_30px_-10px_rgba(124,58,237,0.1)]" 
                  : "border-slate-100 bg-white hover:bg-slate-50 hover:border-[#7C3AED]/20"
                }
              `}
            >
              {selectedTemplateIds.includes(template.id) && (
                <div className="absolute top-0 right-0 p-2">
                  <CheckCircle2 size={14} className="text-[#7C3AED]" />
                </div>
              )}
              <div className="mt-1">
                <Checkbox
                  checked={selectedTemplateIds.includes(template.id)}
                  onCheckedChange={() => onToggle(template.id)}
                  className="h-5 w-5 border-slate-300 data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED]"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors">{template.label}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{template.help_text}</p>
                <div className="mt-3 inline-flex rounded-lg bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#7C3AED]/60 border border-slate-200">
                  {template.section_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
