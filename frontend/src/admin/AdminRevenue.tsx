import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { adminHeaders } from './adminAuth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type MonthlyStat = { month: string; ordersCount: number; revenue: number };
type RecentSale = {
  id: string;
  customerName: string;
  total: number;
  paidAt: string;
  deliveryMethod: string;
  itemsSummary: string[];
};

const cardCls = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/15 bg-[#0d0d0d] px-4 py-3 shadow-xl text-sm">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="text-amber-300 font-semibold">{currency.format(payload[0]?.value || 0)}</p>
      <p className="text-white/50 text-xs">{payload[0]?.payload?.ordersCount} pedidos</p>
    </div>
  );
};

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function AdminRevenue() {
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [manualForm, setManualForm] = useState({ customerName: '', description: '', total: '', paidAt: '' });
  const [manualSaving, setManualSaving] = useState(false);
  const [manualStatus, setManualStatus] = useState('');
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jewelry-sales?year=${selectedYear}`, { headers: adminHeaders('joalheria') });
      const data = res.ok ? await res.json() : {};
      setMonthly(Array.isArray(data.monthly) ? data.monthly : []);
      setRecentSales(Array.isArray(data.recentSales) ? data.recentSales : []);
    } catch (err) {
      console.error('Erro ao carregar faturamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveManual = async () => {
    if (!manualForm.total || isNaN(Number(manualForm.total.replace(',', '.')))) {
      setManualStatus('Informe um valor válido');
      return;
    }
    setManualSaving(true);
    setManualStatus('');
    try {
      const res = await fetch('/api/jewelry-sales/manual', {
        method: 'POST',
        headers: adminHeaders('joalheria'),
        body: JSON.stringify({
          customerName: manualForm.customerName || 'Venda manual',
          description: manualForm.description || 'Lançamento manual',
          total: Number(manualForm.total.replace(',', '.')),
          paidAt: manualForm.paidAt || undefined,
        }),
      });
      if (res.ok) {
        setManualForm({ customerName: '', description: '', total: '', paidAt: '' });
        setManualStatus('Lançado com sucesso!');
        loadData();
        setTimeout(() => setManualStatus(''), 3000);
      } else {
        const err = await res.json();
        setManualStatus(err.error || 'Erro ao lançar');
      }
    } catch {
      setManualStatus('Erro ao lançar');
    } finally {
      setManualSaving(false);
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!confirm('Excluir esta venda?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/jewelry-sales/${id}`, { method: 'DELETE', headers: adminHeaders('joalheria') });
      loadData();
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setEditingStatusId(id);
    try {
      await fetch(`/api/jewelry-sales/${id}/status`, {
        method: 'PUT',
        headers: { ...adminHeaders('joalheria'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      loadData();
    } finally {
      setEditingStatusId(null);
    }
  };

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = monthly.reduce((s, m) => s + m.ordersCount, 0);
  const avgRevenue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = monthly.map((m, i) => ({
    month: MONTH_LABELS[i] ?? MONTH_LABELS[new Date(m.month).getMonth()],
    revenue: Number(m.revenue.toFixed(2)),
    ordersCount: m.ordersCount,
  }));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={cardCls}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10">
              <DollarSign className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest">Faturamento total</p>
              <p className="text-xl font-bold text-white mt-0.5">{currency.format(totalRevenue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cardCls}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10">
              <ShoppingBag className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest">Pedidos concluídos</p>
              <p className="text-xl font-bold text-white mt-0.5">{totalOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cardCls}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10">
              <TrendingUp className="h-6 w-6 text-blue-300" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-widest">Ticket médio</p>
              <p className="text-xl font-bold text-white mt-0.5">{currency.format(avgRevenue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual sale entry */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-amber-300" />
            Lançar venda manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-white/45">Para vendas feitas fora do sistema (dinheiro, presencial, etc.).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Nome do cliente (opcional)"
              value={manualForm.customerName}
              onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
            <Input
              placeholder="Descrição (ex: Anel de ouro)"
              value={manualForm.description}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 h-10 text-white/50 text-sm whitespace-nowrap">R$</div>
              <Input
                placeholder="Valor (ex: 350,00)"
                value={manualForm.total}
                onChange={(e) => setManualForm({ ...manualForm, total: e.target.value })}
                className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
              />
            </div>
            <Input
              type="date"
              value={manualForm.paidAt}
              onChange={(e) => setManualForm({ ...manualForm, paidAt: e.target.value })}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
          </div>
          <Button
            onClick={saveManual}
            disabled={manualSaving}
            className="rounded-full border border-white/10 bg-white px-6 text-black hover:bg-white/90 disabled:opacity-50"
          >
            {manualSaving ? 'Salvando...' : 'Lançar venda'}
          </Button>
          {manualStatus && (
            <p className={`text-xs ${manualStatus.includes('sucesso') ? 'text-emerald-400' : 'text-red-400'}`}>
              {manualStatus}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly revenue chart */}
      <Card className={cardCls}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-300" />
              Faturamento mensal
            </CardTitle>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none rounded-full border border-white/15 bg-white/5 px-4 py-1.5 pr-8 text-sm text-white/80 hover:bg-white/10 transition cursor-pointer outline-none"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y} className="bg-[#111] text-white">
                    {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-white/40 text-sm text-center py-10">Carregando...</p>}
          {!loading && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? 'R$0' : `R$${(v / 1000).toFixed(0)}k`}
                  label={{ value: 'Valor faturado', angle: -90, position: 'insideLeft', offset: -2, style: { fill: 'rgba(255,255,255,0.25)', fontSize: 10 } }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar
                  dataKey="revenue"
                  radius={[8, 8, 0, 0]}
                  fill="url(#goldGradient)"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent sales table */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-white text-lg">Vendas recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-white/40 text-sm">Carregando...</p>}
          {!loading && recentSales.length === 0 && (
            <p className="text-white/40 text-sm text-center py-6">Nenhuma venda concluída ainda.</p>
          )}
          {recentSales.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs uppercase tracking-widest border-b border-white/8">
                    <th className="text-left py-2 pr-4">Cliente</th>
                    <th className="text-left py-2 pr-4">Itens</th>
                    <th className="text-left py-2 pr-4">Entrega</th>
                    <th className="text-left py-2 pr-4">Data</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-right py-2 pr-4">Total</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="text-white/70 hover:text-white transition">
                      <td className="py-3 pr-4 font-medium">{sale.customerName}</td>
                      <td className="py-3 pr-4 text-white/50 text-xs max-w-[160px]">
                        {sale.itemsSummary.slice(0, 2).join(', ')}
                        {sale.itemsSummary.length > 2 && ` +${sale.itemsSummary.length - 2}`}
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          sale.deliveryMethod === 'delivery'
                            ? 'bg-blue-500/15 text-blue-300'
                            : 'bg-white/10 text-white/50'
                        }`}>
                          {sale.deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-white/40">{fmt(sale.paidAt)}</td>
                      <td className="py-3 pr-4">
                        <select
                          disabled={editingStatusId === sale.id}
                          defaultValue="done"
                          onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                          className="rounded-lg border border-white/10 bg-black px-2 py-1 text-xs text-white/80 cursor-pointer outline-none disabled:opacity-50"
                        >
                          <option value="done" className="bg-black text-white">Concluído</option>
                          <option value="confirmed" className="bg-black text-white">Confirmado</option>
                          <option value="pending" className="bg-black text-white">Pendente</option>
                          <option value="cancelled" className="bg-black text-white">Cancelado</option>
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-amber-300">
                        {currency.format(sale.total)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          disabled={deletingId === sale.id}
                          className="text-white/25 hover:text-red-400 transition disabled:opacity-40"
                          title="Excluir venda"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
