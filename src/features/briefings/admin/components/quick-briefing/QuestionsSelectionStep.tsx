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
    <Card className="glass-premium overflow-hidden border-[#D4AF37]/10 transition-all duration-500">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#D4AF37]/5 bg-white/[0.01] p-8">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient text-black shadow-lg shadow-[#D4AF37]/20">
            <LayoutList className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Diretrizes <span className="text-gold-gradient italic">Prontas</span>
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Composição do Briefing</CardDescription>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onSelectAll}
          className="h-10 px-6 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all"
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
                  ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 shadow-[0_10px_30px_-10px_rgba(212,175,55,0.2)]" 
                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#D4AF37]/20"
                }
              `}
            >
              {selectedTemplateIds.includes(template.id) && (
                <div className="absolute top-0 right-0 p-2">
                  <CheckCircle2 size={14} className="text-[#D4AF37]" />
                </div>
              )}
              <div className="mt-1">
                <Checkbox
                  checked={selectedTemplateIds.includes(template.id)}
                  onCheckedChange={() => onToggle(template.id)}
                  className="h-5 w-5 border-white/20 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">{template.label}</p>
                <p className="text-[11px] text-white/40 leading-relaxed font-medium">{template.help_text}</p>
                <div className="mt-3 inline-flex rounded-lg bg-white/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#D4AF37]/40 border border-white/5">
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
