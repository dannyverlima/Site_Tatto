import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Check, Clock, Package, Truck, X } from 'lucide-react';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type OrderItem = { name: string; price: number; quantity: number };
type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryMethod: 'delivery' | 'pickup';
  addressLine1: string;
  city: string;
  state: string;
  notes: string;
  status: 'new' | 'processing' | 'completed' | 'cancelled';
  shippingFee: number;
  total: number;
  submittedAt: string;
  items: OrderItem[];
};

const cardCls = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';
const inputCls = 'border-white/10 bg-white/5 text-white placeholder:text-white/35';

const statusConfig: Record<Order['status'], { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'Novo', color: 'bg-blue-500/20 text-blue-300 border-blue-500/20', icon: <Clock className="h-3 w-3" /> },
  processing: { label: 'Em andamento', color: 'bg-amber-500/20 text-amber-300 border-amber-500/20', icon: <Package className="h-3 w-3" /> },
  completed: { label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20', icon: <Check className="h-3 w-3" /> },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-300 border-red-500/20', icon: <X className="h-3 w-3" /> },
};

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const cfg = statusConfig[status] || statusConfig.new;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState('');
  const [feeStatus, setFeeStatus] = useState('');
  const [savingFee, setSavingFee] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, settingsRes] = await Promise.all([
        fetch('/api/jewelry-orders'),
        fetch('/api/site-settings?keys=jewelry_shipping_fee'),
      ]);
      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const settingsData = settingsRes.ok ? await settingsRes.json() : {};
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setShippingFee(settingsData.jewelry_shipping_fee || '');
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Order['status']) => {
    try {
      await fetch(`/api/jewelry-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOrders((cur) => cur.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const saveFee = async () => {
    setSavingFee(true);
    setFeeStatus('');
    try {
      const val = Number(shippingFee.replace(',', '.'));
      if (isNaN(val) || val < 0) {
        setFeeStatus('Valor inválido');
        return;
      }
      await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jewelry_shipping_fee: String(val) }),
      });
      setFeeStatus('Salvo!');
      setTimeout(() => setFeeStatus(''), 3000);
    } catch {
      setFeeStatus('Erro ao salvar');
    } finally {
      setSavingFee(false);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Shipping fee config */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Truck className="h-5 w-5 text-amber-300" />
            Taxa de entrega / encomenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-white/55">Valor cobrado por entrega (deixe 0 para "a combinar").</p>
          <div className="flex gap-3 items-center max-w-xs">
            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-3 text-white/50 text-sm">R$</div>
            <Input
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              placeholder="0,00"
              className={inputCls}
            />
            <Button
              onClick={saveFee}
              disabled={savingFee}
              className="rounded-full border border-white/10 bg-white px-4 text-black hover:bg-white/90 disabled:opacity-50 whitespace-nowrap"
            >
              {savingFee ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
          {feeStatus && <p className="text-xs text-amber-300">{feeStatus}</p>}
        </CardContent>
      </Card>

      {/* Orders list */}
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center justify-between">
            <span>Pedidos ({orders.length})</span>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'new', 'processing', 'completed', 'cancelled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${
                    filter === s
                      ? 'bg-white text-black border-white'
                      : 'border-white/15 text-white/60 hover:bg-white/5'
                  }`}
                >
                  {s === 'all' ? `Todos (${orders.length})` : `${statusConfig[s].label} (${counts[s] || 0})`}
                </button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-white/50 text-sm">Carregando...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-white/40 text-sm text-center py-8">Nenhum pedido encontrado.</p>
          )}
          <div className="space-y-3">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] transition"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white">{order.customerName}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/45">
                      <span>{fmt(order.submittedAt)}</span>
                      {order.phone && <span>· {order.phone}</span>}
                      <span className="flex items-center gap-1">
                        {order.deliveryMethod === 'delivery' ? <Truck className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                        {order.deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-300 font-semibold">{order.total > 0 ? currency.format(order.total) : '—'}</p>
                    <p className="text-xs text-white/40 mt-0.5">{order.items.length} iten{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {expandedId === order.id && (
                  <div className="border-t border-white/8 p-4 space-y-4">
                    {/* Items */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Itens</p>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-white/70">
                            <span>{item.name} ×{item.quantity}</span>
                            <span>{currency.format(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        {order.shippingFee > 0 && (
                          <div className="flex justify-between text-sm text-white/50">
                            <span>Entrega</span>
                            <span>{currency.format(order.shippingFee)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    {order.deliveryMethod === 'delivery' && order.addressLine1 && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Endereço</p>
                        <p className="text-sm text-white/70">{order.addressLine1}, {order.city} — {order.state}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Observações</p>
                        <p className="text-sm text-white/70 italic">"{order.notes}"</p>
                      </div>
                    )}

                    {/* Status change */}
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Alterar status</p>
                      <div className="flex gap-2 flex-wrap">
                        {(['new', 'processing', 'completed', 'cancelled'] as Order['status'][]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            disabled={order.status === s}
                            className={`px-3 py-1.5 rounded-full text-xs border transition ${
                              order.status === s
                                ? 'bg-white/15 border-white/20 text-white font-medium'
                                : 'border-white/10 text-white/50 hover:bg-white/5'
                            }`}
                          >
                            {statusConfig[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
