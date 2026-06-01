import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Truck } from 'lucide-react';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type JewelryItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls?: string[];
  primaryImageUrl?: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
};

const emptyCheckout = (): CheckoutForm => ({
  name: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  notes: '',
});

export default function JewelryPage() {
  const [items, setItems] = useState<JewelryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [checkout, setCheckout] = useState<CheckoutForm>(emptyCheckout());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadJewelry = async () => {
      try {
        const response = await fetch('/api/jewelry');
        if (!response.ok) {
          throw new Error('Falha ao carregar joias');
        }
        const data = await response.json();
        if (isMounted) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erro ao carregar joias', err);
        if (isMounted) {
          setError('Nao foi possivel carregar a vitrine de joias.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJewelry();
    return () => {
      isMounted = false;
    };
  }, []);

  const addToCart = (item: JewelryItem) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price || 0),
          imageUrl: item.primaryImageUrl || item.imageUrls?.[0] || '',
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((current) =>
      current
        .map((entry) =>
          entry.id === id ? { ...entry, quantity: Math.max(1, entry.quantity + delta) } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((current) => current.filter((entry) => entry.id !== id));
  };

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );
  const deliveryFee = deliveryMethod === 'delivery' ? 19.9 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cart.length) {
      setSubmitError('Adicione ao menos uma joia ao carrinho.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/jewelry-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: checkout.name,
          email: checkout.email,
          phone: checkout.phone,
          deliveryMethod,
          addressLine1: checkout.addressLine1,
          addressLine2: checkout.addressLine2,
          city: checkout.city,
          state: checkout.state,
          postalCode: checkout.postalCode,
          notes: checkout.notes,
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar pedido');
      }

      setSubmitted(true);
      setCart([]);
      setCheckout(emptyCheckout());
      window.setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error('Erro ao enviar pedido', err);
      setSubmitError('Nao foi possivel finalizar a compra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[15%] h-[28rem] w-[28rem] rounded-full bg-rose-300/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%),linear-gradient(180deg,_rgba(0,0,0,0.1),_rgba(0,0,0,0.7))]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/40">Loja</p>
            <h1
              className="text-3xl font-semibold text-white md:text-4xl"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
            >
              Joias exclusivas
            </h1>
          </div>
          <button
            type="button"
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-white/80 transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </button>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">Vitrine</p>
              <h2 className="text-2xl font-semibold">Escolha suas joias</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wide text-white/60">
              <Truck className="h-4 w-4" />
              Entrega personalizada
            </div>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
              Carregando joias...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
              Nenhuma joia cadastrada no momento.
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {items.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40"
              >
                <div className="relative h-48 overflow-hidden bg-black/30">
                  {item.primaryImageUrl || item.imageUrls?.[0] ? (
                    <ImageWithFallback
                      src={item.primaryImageUrl || item.imageUrls?.[0] || ''}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
                      Sem foto
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 text-sm text-white/60">{item.description || 'Descricao em breve.'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-amber-200">
                      {currency.format(Number(item.price || 0))}
                    </p>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-white/90"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Carrinho</h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                {cart.length} itens
              </span>
            </div>

            {cart.length === 0 ? (
              <p className="mt-4 text-sm text-white/55">Seu carrinho esta vazio.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-white/5">
                      {item.imageUrl ? (
                        <ImageWithFallback src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-white/40">
                          Foto
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-white/50">{currency.format(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-white/70">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-white/40 hover:text-white"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{currency.format(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Entrega</span>
                <span>{deliveryMethod === 'delivery' ? currency.format(deliveryFee) : 'Gratuito'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-base font-semibold text-white">
                <span>Total</span>
                <span>{currency.format(total)}</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/40"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Finalizar compra</h3>
              {submitted ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                  <Check className="h-3 w-3" />
                  Pedido enviado
                </span>
              ) : null}
            </div>

            <div className="space-y-3">
              <input
                value={checkout.name}
                onChange={(event) => setCheckout({ ...checkout, name: event.target.value })}
                className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="Nome completo"
                required
              />
              <input
                value={checkout.email}
                onChange={(event) => setCheckout({ ...checkout, email: event.target.value })}
                className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="Email"
                type="email"
              />
              <input
                value={checkout.phone}
                onChange={(event) => setCheckout({ ...checkout, phone: event.target.value })}
                className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="WhatsApp"
                type="tel"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition ${
                    deliveryMethod === 'delivery'
                      ? 'border-white/30 bg-white text-black'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Entrega
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition ${
                    deliveryMethod === 'pickup'
                      ? 'border-white/30 bg-white text-black'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Retirada
                </button>
              </div>

              {deliveryMethod === 'delivery' ? (
                <>
                  <input
                    value={checkout.addressLine1}
                    onChange={(event) => setCheckout({ ...checkout, addressLine1: event.target.value })}
                    className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                    placeholder="Endereco"
                    required
                  />
                  <input
                    value={checkout.addressLine2}
                    onChange={(event) => setCheckout({ ...checkout, addressLine2: event.target.value })}
                    className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                    placeholder="Complemento"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={checkout.city}
                      onChange={(event) => setCheckout({ ...checkout, city: event.target.value })}
                      className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                      placeholder="Cidade"
                      required
                    />
                    <input
                      value={checkout.state}
                      onChange={(event) => setCheckout({ ...checkout, state: event.target.value })}
                      className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                      placeholder="Estado"
                      required
                    />
                  </div>
                  <input
                    value={checkout.postalCode}
                    onChange={(event) => setCheckout({ ...checkout, postalCode: event.target.value })}
                    className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                    placeholder="CEP"
                  />
                </>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-white/55">
                  Retirada no estudio mediante confirmacao. Entraremos em contato para combinar horario.
                </div>
              )}

              <textarea
                value={checkout.notes}
                onChange={(event) => setCheckout({ ...checkout, notes: event.target.value })}
                className="h-24 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="Observacoes sobre a entrega"
              />
            </div>

            {submitError ? (
              <p className="mt-3 text-sm text-red-300">{submitError}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-full border border-white/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-white/90 disabled:opacity-60"
            >
              {submitting ? 'Enviando...' : 'Finalizar compra'}
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
