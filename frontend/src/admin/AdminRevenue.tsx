import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { adminHeaders } from './adminAuth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

const monthName = (isoDate: string) => {
  const d = new Date(isoDate);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

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

export function AdminRevenue() {
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(12);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jewelry-sales?months=${period}`, { headers: adminHeaders('joalheria') });
      const data = res.ok ? await res.json() : {};
      setMonthly(Array.isArray(data.monthly) ? data.monthly : []);
      setRecentSales(Array.isArray(data.recentSales) ? data.recentSales : []);
    } catch (err) {
      console.error('Erro ao carregar faturamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = monthly.reduce((s, m) => s + m.ordersCount, 0);
  const avgRevenue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = monthly.map((m) => ({
    month: monthName(m.month),
    revenue: Number(m.revenue.toFixed(2)),
    ordersCount: m.ordersCount,
  }));

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {[3, 6, 12].map((m) => (
          <button
            key={m}
            onClick={() => setPeriod(m)}
            className={`px-4 py-1.5 rounded-full text-xs border transition ${
              period === m
                ? 'bg-white text-black border-white font-medium'
                : 'border-white/15 text-white/60 hover:bg-white/5'
            }`}
          >
            {m} meses
          </button>
        ))}
      </div>

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

      {/* Monthly revenue chart */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-300" />
            Faturamento mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-white/40 text-sm text-center py-10">Carregando...</p>}
          {!loading && chartData.length === 0 && (
            <p className="text-white/40 text-sm text-center py-10">
              Nenhuma venda concluída neste período.
              <br />
              <span className="text-xs mt-1 block text-white/30">
                Altere o status de pedidos para "Concluído" para registrar o faturamento.
              </span>
            </p>
          )}
          {!loading && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar
                  dataKey="revenue"
                  radius={[8, 8, 0, 0]}
                  fill="url(#goldGradient)"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
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
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="text-white/70 hover:text-white transition">
                      <td className="py-3 pr-4 font-medium">{sale.customerName}</td>
                      <td className="py-3 pr-4 text-white/50 text-xs max-w-[200px]">
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
                      <td className="py-3 text-right font-semibold text-amber-300">
                        {currency.format(sale.total)}
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
