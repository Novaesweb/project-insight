import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_COLORS = ['#7b1fa2', '#c2185b', '#e8334a', '#FFB800', '#ff3366', '#9c27b0', '#e91e63', '#FFD700', '#ff5252', '#ff9800'];

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <Card className="border-white/[0.06] bg-[var(--admin-surface)] lg:col-span-2 overflow-hidden relative group">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#7C3AED] to-[#DC2626] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/[0.03] via-transparent to-[#DC2626]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#c2185b]" /> Visão Financeira (Últimos 6 Meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0 pb-1">
        <div className="h-[180px] w-full text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.25)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0b12', borderColor: 'rgba(123,31,162,0.3)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase' }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
              />
              <Area type="monotone" dataKey="total" stroke="url(#strokeGradient)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ModulesChart({ data }: { data: any[] }) {
  return (
    <Card className="border-white/[0.06] bg-[var(--admin-surface)] lg:col-span-1 overflow-hidden relative group">
      {/* Top gradient line - gold */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FFB800] to-[#FFD700] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFB800]/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FFB800]" /> Módulos Mais Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-0 pb-2">
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0d0b12', borderColor: 'rgba(255,184,0,0.3)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                formatter={(value: number) => [`${value} vendas`, 'Qtd']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full mt-2 grid grid-cols-2 gap-x-2 gap-y-2">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
              <span className="text-[10px] text-muted-foreground truncate" title={entry.name}>{entry.name} ({entry.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
