import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Gem, Heart, LogOut, Minus, Package, Plus, Search, ShoppingBag, ShoppingCart, Star, User, X } from 'lucide-react';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';
import { useAuth } from './AuthContext';
import { AuthModal } from './AuthModal';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

type JewelryItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  discountPercent: number;
  isFeatured: boolean;
  category: string;
  imageUrls: string[];
  primaryImageUrl: string;
};

type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
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
  name: '', email: '', phone: '',
  addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', notes: '',
});

// CartSidebar
function CartSidebar({
  cart, shippingFee, deliveryMethod, setDeliveryMethod,
  updateQuantity, removeFromCart, onCheckout, onEncomenda, open, onClose,
}: {
  cart: CartItem[];
  shippingFee: number;
  deliveryMethod: 'buscar_na_loja' | 'encomendar';
  setDeliveryMethod: (v: 'buscar_na_loja' | 'encomendar') => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: () => void;
  onEncomenda: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  return (
    <motion.div
      initial={false}
      animate={{ x: open ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-black border-l border-white/10 flex flex-col shadow-2xl"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-neutral-300" />
          Carrinho
          {cart.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 text-[11px] font-medium">
              {cart.reduce((s, c) => s + c.quantity, 0)} ite{cart.reduce((s, c) => s + c.quantity, 0) === 1 ? 'm' : 'ns'}
            </span>
          )}
        </h3>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition">
          <X className="h-4 w-4 text-white/60" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <ShoppingBag className="h-10 w-10 text-white/10" />
            <p className="text-white/40 text-sm">Seu carrinho está vazio.</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex gap-3 items-start bg-white/[0.03] rounded-2xl p-3 border border-white/6">
              {item.imageUrl ? (
                <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center">
                  <Gem className="h-5 w-5 text-white/20" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-neutral-100">{item.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{currency.format(item.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/70"><Minus className="h-3 w-3" /></button>
                  <span className="text-sm w-5 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-white/70"><Plus className="h-3 w-3" /></button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-auto p-1.5 rounded-full hover:bg-red-500/15 transition text-red-400/70 hover:text-red-400"><X className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {cart.length > 0 && (
        <div className="px-4 py-5 border-t border-white/8 space-y-4">
          <p className="text-xs text-white/40 uppercase tracking-widest">Como deseja receber?</p>
          <div className="flex gap-2">
            {(['buscar_na_loja', 'encomendar'] as const).map((method) => (
              <button key={method} onClick={() => setDeliveryMethod(method)}
                className={`flex-1 py-2 rounded-full text-xs font-medium border transition ${deliveryMethod === method ? 'bg-white text-black border-white' : 'border-white/10 text-white/60 hover:bg-white/5'}`}>
                {method === 'buscar_na_loja' ? 'Buscar na loja' : 'Encomendar'}
              </button>
            ))}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-white/50"><span>Subtotal</span><span>{currency.format(subtotal)}</span></div>
            {deliveryMethod === 'encomendar' && (
              <div className="flex justify-between text-white/40 text-xs"><span>Entrega</span><span>A combinar</span></div>
            )}
            <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-2"><span>Total</span><span>{currency.format(subtotal)}</span></div>
          </div>
          <button
            onClick={deliveryMethod === 'encomendar' ? onEncomenda : onCheckout}
            className="group relative overflow-hidden w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300">
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
            {deliveryMethod === 'encomendar' ? 'Registrar encomenda' : 'Finalizar retirada'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// CheckoutModal — Buscar na loja (retirada)
function CheckoutModal({
  cart, form, setForm,
  onClose, onSubmit, submitting, submitError, submitted,
}: {
  cart: CartItem[];
  form: CheckoutForm;
  setForm: (f: CheckoutForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  submitError: string;
  submitted: boolean;
}) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const inp = 'w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition';
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="w-full max-w-lg bg-black border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[95vh] sm:max-h-[88vh]">
        {submitted ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/8">
              <Gem className="h-7 w-7 text-neutral-200" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Retirada confirmada!</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Entraremos em contato para combinar a retirada na loja.</p>
            <button onClick={onClose} className="group relative overflow-hidden mt-7 px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:shadow-[0_0_24px_rgba(255,255,255,0.3)] transition-all duration-300">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
              Continuar
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base font-semibold">Retirada na loja</h3>
                <p className="text-xs text-white/40 mt-0.5">Informe seus dados para combinarmos</p>
              </div>
              <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/8 transition"><X className="h-4 w-4 text-white/50" /></button>
            </div>
            <input className={inp} placeholder="Nome completo *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className={inp} placeholder="WhatsApp *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className={inp} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <textarea className={`${inp} resize-none`} rows={2} placeholder="Observações (opcional)"
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-1.5 text-sm">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-white/60">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{currency.format(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-2">
                <span>Total</span><span>{currency.format(subtotal)}</span>
              </div>
            </div>
            {submitError && <p className="text-red-400/90 text-xs bg-red-400/8 rounded-xl px-3 py-2">{submitError}</p>}
            <button type="submit" disabled={submitting}
              className="group relative overflow-hidden w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 disabled:opacity-40">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
              {submitting ? 'Enviando...' : 'Confirmar retirada'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
// EncomendaModal — Encomenda com ou sem itens do carrinho
function EncomendaModal({ onClose, cartItems }: { onClose: () => void; cartItems?: CartItem[] }) {
  const [form, setForm] = useState({ name: '', phone: '', description: '', budget: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const inp = 'w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition';
  const hasCartItems = cartItems && cartItems.length > 0;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cartNote = hasCartItems
        ? `Itens do carrinho: ${cartItems!.map((i) => `${i.name} x${i.quantity}`).join(', ')}. `
        : '';
      await fetch('/api/jewelry-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          deliveryMethod: 'delivery',
          notes: `${cartNote}${form.description}${form.budget ? ` | Or\u00e7amento: ${form.budget}` : ''}`,
          items: hasCartItems ? cartItems!.map((i) => ({ id: i.id, quantity: i.quantity })) : [],
        }),
      });
    } catch { /* show success anyway */ } finally {
      setDone(true);
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md">
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="w-full max-w-md bg-black border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[95vh] sm:max-h-[88vh]">
        {done ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/8">
              <Gem className="h-7 w-7 text-neutral-200" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Encomenda registrada!</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Entraremos em contato para confirmar os detalhes da sua peça.</p>
            <button onClick={onClose} className="group relative overflow-hidden mt-7 px-8 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:shadow-[0_0_24px_rgba(255,255,255,0.3)] transition-all duration-300">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h3 className="text-base font-semibold">Cadastro de encomenda</h3>
                <p className="text-xs text-white/40 mt-0.5">Peça personalizada sob encomenda</p>
              </div>
              <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/8 transition"><X className="h-4 w-4 text-white/50" /></button>
            </div>
            {hasCartItems && (
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 space-y-1.5 text-sm">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Itens selecionados</p>
                {cartItems!.map((item) => (
                  <div key={item.id} className="flex justify-between text-white/60">
                    <span>{item.name} x{item.quantity}</span>
                    <span>A combinar</span>
                  </div>
                ))}
              </div>
            )}
            <input className={inp} placeholder="Nome completo *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inp} placeholder="WhatsApp *" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <textarea className={`${inp} resize-none`} rows={3} placeholder="Descreva a peça desejada (estilo, material, tamanho, gravação...)"
              required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className={inp} placeholder="Orçamento estimado (opcional)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <button type="submit" disabled={submitting}
              className="group relative overflow-hidden w-full py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 disabled:opacity-40">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
              {submitting ? 'Enviando...' : 'Solicitar encomenda'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ItemModal
function ItemModal({ item, onClose, onAddToCart, onEncomenda }: {
  item: JewelryItem;
  onClose: () => void;
  onAddToCart: (item: JewelryItem) => void;
  onEncomenda: () => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = item.imageUrls?.length ? item.imageUrls : item.primaryImageUrl ? [item.primaryImageUrl] : [];
  const finalPrice = item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price;
  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="w-full max-w-lg bg-black border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="relative h-64 sm:h-72 bg-black/40">
          {imgs.length > 0 ? (
            <ImageWithFallback src={imgs[imgIdx]} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center"><Gem className="h-16 w-16 text-white/10" /></div>
          )}
          {imgs.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imgs.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`} />
              ))}
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition">
            <X className="h-4 w-4 text-white/80" />
          </button>
          {item.isFeatured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-black text-[10px] font-bold uppercase tracking-wide">Destaque</div>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-100">{item.name}</h2>
            {item.description && <p className="mt-2 text-sm text-neutral-400 leading-relaxed">{item.description}</p>}
          </div>
          <div className="flex items-end gap-3">
            {item.discountPercent > 0 ? (
              <div>
                <p className="text-xs text-white/35 line-through">{currency.format(item.price)}</p>
                <p className="text-2xl font-bold text-neutral-100">{currency.format(finalPrice)}</p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-neutral-100">{currency.format(item.price)}</p>
            )}
            {item.discountPercent > 0 && (
              <span className="mb-0.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[11px] font-semibold">-{Math.round(item.discountPercent)}%</span>
            )}
          </div>
          {item.stock > 0 && (
            <p className="text-xs text-white/35 flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {item.stock} {item.stock === 1 ? 'unidade' : 'unidades'} em estoque
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={() => { onAddToCart(item); onClose(); }}
              className="group relative overflow-hidden flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black font-semibold text-sm hover:shadow-[0_0_28px_rgba(255,255,255,0.35)] transition-all duration-300">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
              <ShoppingBag className="h-4 w-4" /> Adicionar ao carrinho
            </button>
            <button onClick={() => { onEncomenda(); onClose(); }}
              className="group relative overflow-hidden flex items-center justify-center gap-1.5 px-4 py-3 rounded-full border border-white/60 text-white/80 text-sm shadow-[0_0_8px_rgba(255,255,255,0.3),0_0_20px_rgba(255,255,255,0.1),inset_0_0_8px_rgba(255,255,255,0.04)] hover:shadow-[0_0_14px_rgba(255,255,255,0.55),0_0_32px_rgba(255,255,255,0.18),inset_0_0_12px_rgba(255,255,255,0.07)] hover:text-white transition-all duration-300">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
              <Package className="h-4 w-4" /> Encomendar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// FeaturedCard — estilo luxury dark
function FeaturedCard({ item, index, effectivePrice, onView, onAdd }: {
  item: JewelryItem; index: number; effectivePrice: number;
  onView: () => void; onAdd: () => void;
}) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }} viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={onView}>
      <div className="relative overflow-hidden rounded-lg mb-4 aspect-square bg-gray-900">
        {item.primaryImageUrl ? (
          <ImageWithFallback src={item.primaryImageUrl} alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-900">
            <Gem className="h-12 w-12 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
        <button
          onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
          className="absolute top-4 right-4 bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-white text-white' : ''}`} />
        </button>
        {item.discountPercent > 0 && (
          <div className="absolute top-4 left-4 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded">
            -{Math.round(item.discountPercent)}%
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-white text-white" />)}
      </div>
      <h3 className="mb-2 group-hover:text-gray-300 transition-colors font-medium">{item.name}</h3>
      <div className="flex items-center justify-between">
        <div>
          {item.discountPercent > 0 && (
            <p className="text-xs text-gray-500 line-through">{currency.format(item.price)}</p>
          )}
          <p className="text-lg font-semibold">{currency.format(effectivePrice)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="p-2 rounded-full border border-gray-700 hover:border-white/60 hover:bg-white/10 hover:shadow-[0_0_14px_rgba(255,255,255,0.15)] transition-all duration-300">
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </motion.article>
  );
}

// CatalogCard — estilo luxury dark
function CatalogCard({ item, index, effectivePrice, onView, onAdd }: {
  item: JewelryItem; index: number; effectivePrice: number;
  onView: () => void; onAdd: () => void;
}) {
  const [liked, setLiked] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }} viewport={{ once: true }}
      className="group cursor-pointer"
      onClick={onView}>
      <div className="relative overflow-hidden rounded-lg mb-3 aspect-square bg-gray-900">
        {item.primaryImageUrl ? (
          <ImageWithFallback src={item.primaryImageUrl} alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-900">
            <Gem className="h-8 w-8 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
        <button
          onClick={(e) => { e.stopPropagation(); setLiked((v) => !v); }}
          className="absolute top-3 right-3 bg-black/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-white text-white' : ''}`} />
        </button>
        {item.discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
            -{Math.round(item.discountPercent)}%
          </div>
        )}
      </div>
      <h4 className="text-sm mb-1 group-hover:text-gray-300 transition-colors line-clamp-2">{item.name}</h4>
      <div className="flex items-center justify-between">
        <div>
          {item.discountPercent > 0 && (
            <p className="text-[10px] text-gray-600 line-through">{currency.format(item.price)}</p>
          )}
          <p className="font-semibold">{currency.format(effectivePrice)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="p-1.5 rounded-full border border-gray-800 hover:border-white/50 hover:bg-white/8 hover:shadow-[0_0_12px_rgba(255,255,255,0.12)] transition-all duration-300">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.article>
  );
}

// Main Page
export default function JoalheriaPage() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [items, setItems] = useState<JewelryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingFee, setShippingFee] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'buscar_na_loja' | 'encomendar'>('buscar_na_loja');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showEncomenda, setShowEncomenda] = useState(false);
  const [selectedItem, setSelectedItem] = useState<JewelryItem | null>(null);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(emptyCheckout());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'featured' | 'discounted'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'geral' | 'homem' | 'mulher' | 'crianca'>('geral');

  // Refs e useInView removidos — animações agora usam whileInView nos elementos

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [itemsRes, settingsRes] = await Promise.all([
          fetch('/api/jewelry'),
          fetch('/api/site-settings?keys=jewelry_shipping_fee'),
        ]);
        const itemsData = itemsRes.ok ? await itemsRes.json() : [];
        const settingsData = settingsRes.ok ? await settingsRes.json() : {};
        if (isMounted) {
          setItems(Array.isArray(itemsData) ? itemsData : []);
          setShippingFee(Number(settingsData.jewelry_shipping_fee) || 0);
        }
      } catch (err) { console.error(err); }
      finally { if (isMounted) setLoading(false); }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const addToCart = (item: JewelryItem) => {
    setCart((cur) => {
      const exists = cur.find((c) => c.id === item.id);
      if (exists) return cur.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...cur, { id: item.id, name: item.name, price: Number(item.price), imageUrl: item.primaryImageUrl, quantity: 1 }];
    });
    setCartOpen(true);
  };
  const updateQuantity = (id: string, delta: number) =>
    setCart((cur) => cur.map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0));
  const removeFromCart = (id: string) => setCart((cur) => cur.filter((c) => c.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/jewelry-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: checkoutForm.name,
          email: checkoutForm.email,
          phone: checkoutForm.phone,
          deliveryMethod: 'pickup',
          notes: checkoutForm.notes,
          items: cart.map((c) => ({ id: c.id, quantity: c.quantity })),
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setCart([]);
      setCheckoutForm(emptyCheckout());
    } catch { setSubmitError('Não foi possível finalizar o pedido. Tente novamente.'); }
    finally { setSubmitting(false); }
  };

  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);
  const effectivePrice = (item: JewelryItem) =>
    item.discountPercent > 0 ? item.price * (1 - item.discountPercent / 100) : item.price;
  const featuredItems = items.filter((i) => i.isFeatured);
  const filteredByCategory = categoryFilter === 'geral' ? items : items.filter((i) => i.category === categoryFilter);
  const displayItems = filter === 'featured' ? filteredByCategory.filter((i) => i.isFeatured) : filter === 'discounted' ? filteredByCategory.filter((i) => i.discountPercent > 0) : filteredByCategory;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#000000' }}>

      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 backdrop-blur-sm z-50" style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}>
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Back arrow */}
            <button onClick={() => (window.location.href = '/')}
              className="shrink-0 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden lg:inline">Voltar ao site</span>
            </button>

            {/* Title — centered via flex-1 */}
            <h1 className="flex-1 text-center text-lg sm:text-xl font-serif tracking-wider">JOALHERIA</h1>

            {/* Right actions */}
            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              <button className="hidden sm:block text-gray-400 hover:text-white transition">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setCartOpen(true)}
                className="relative text-gray-400 hover:text-white transition">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-black rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Auth area */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="group flex items-center gap-1.5 sm:gap-2 text-sm text-gray-300 hover:text-white transition-all duration-200">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-800 border border-gray-700 group-hover:border-gray-500 flex items-center justify-center transition-all duration-200 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="hidden sm:block w-3 h-3 text-gray-500 transition-transform duration-200 group-hover:text-gray-300" style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-2 w-48 border border-gray-800 bg-black shadow-xl z-50">
                        <div className="px-4 py-3 border-b border-gray-800">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-900 transition">
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setAuthTab('login'); setShowAuth(true); }}
                    className="group relative overflow-hidden text-xs sm:text-sm text-white/70 hover:text-white transition-all duration-300 px-3 sm:px-4 py-1.5 rounded-full border border-white/30 hover:border-white/70 shadow-[0_0_6px_rgba(255,255,255,0.12),inset_0_0_6px_rgba(255,255,255,0.03)] hover:shadow-[0_0_12px_rgba(255,255,255,0.4),0_0_24px_rgba(255,255,255,0.12),inset_0_0_10px_rgba(255,255,255,0.05)]">
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-12" />
                    Entrar
                  </button>
                  <button
                    onClick={() => { setAuthTab('register'); setShowAuth(true); }}
                    className="hidden sm:block group relative overflow-hidden text-sm text-white px-4 py-1.5 rounded-full font-semibold border border-white/70 shadow-[0_0_10px_rgba(255,255,255,0.45),0_0_28px_rgba(255,255,255,0.16),inset_0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_18px_rgba(255,255,255,0.7),0_0_42px_rgba(255,255,255,0.24),inset_0_0_14px_rgba(255,255,255,0.09)] transition-all duration-300">
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12" />
                    Cadastrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[420px] sm:h-[520px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-black/80 z-10" />
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
          alt="Luxury Jewelry"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <motion.div
          className="relative z-20 text-center px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl sm:text-5xl md:text-7xl font-serif mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Elegância Atemporal
          </motion.h2>
          <motion.p
            className="text-base sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Descubra joias que contam histórias
          </motion.p>
          <motion.button
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative overflow-hidden border border-white/70 text-white px-10 py-3.5 font-semibold tracking-widest uppercase text-sm rounded-full shadow-[0_0_12px_rgba(255,255,255,0.45),0_0_32px_rgba(255,255,255,0.18),inset_0_0_12px_rgba(255,255,255,0.06)] hover:shadow-[0_0_20px_rgba(255,255,255,0.7),0_0_50px_rgba(255,255,255,0.28),inset_0_0_18px_rgba(255,255,255,0.1)] transition-all duration-400"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12" />
            Explorar Coleção
          </motion.button>
        </motion.div>
      </section>

      {/* Categorias */}
      <section className="py-10 md:py-16" style={{ backgroundColor: '#000000' }}>
        <div className="container mx-auto px-4">
          <motion.h3
            className="text-2xl sm:text-3xl font-serif text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            Categorias
          </motion.h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: 'Todos', value: 'geral' as const },
              { label: 'Homem', value: 'homem' as const },
              { label: 'Mulher', value: 'mulher' as const },
              { label: 'Criança', value: 'crianca' as const },
            ].map((cat, i) => (
              <motion.button key={cat.value}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                onClick={() => { setCategoryFilter(cat.value); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
                className={`px-7 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                  categoryFilter === cat.value
                    ? 'border-white/80 text-white bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.5),0_0_28px_rgba(255,255,255,0.18),inset_0_0_10px_rgba(255,255,255,0.06)]'
                    : 'border-white/15 text-white/50 hover:border-white/50 hover:text-white/80 hover:shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      {featuredItems.length > 0 && (
        <section id="destaques" className="py-10 md:py-16" style={{ backgroundColor: '#000000' }}>
          <div className="container mx-auto px-4">
            <motion.div
              className="flex justify-between items-center mb-12"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl sm:text-3xl font-serif">Produtos em Destaque</h3>
              <button
                onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-500 hover:text-white transition-colors text-sm tracking-wide border-b border-transparent hover:border-gray-400 pb-0.5"
              >
                Ver Tudo
              </button>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredItems.slice(0, 4).map((item, i) => (
                <FeaturedCard key={item.id} item={item} index={i} effectivePrice={effectivePrice(item)}
                  onView={() => setSelectedItem(item)} onAdd={() => addToCart(item)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Catálogo */}
      <section id="catalog" className="py-10 md:py-16" style={{ backgroundColor: '#000000' }}>
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-serif mb-4">
              {categoryFilter === 'geral' ? 'Toda a Coleção' : categoryFilter === 'homem' ? 'Coleção Masculina' : categoryFilter === 'mulher' ? 'Coleção Feminina' : 'Coleção Infantil'}
            </h3>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {(['all', 'discounted', 'featured'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`group relative overflow-hidden px-5 py-2 text-sm rounded-full border transition-all duration-300 ${
                    filter === f
                      ? 'border-white/80 text-white bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.5),0_0_28px_rgba(255,255,255,0.18),inset_0_0_10px_rgba(255,255,255,0.06)]'
                      : 'border-white/15 text-white/50 hover:border-white/50 hover:text-white/80 hover:shadow-[0_0_8px_rgba(255,255,255,0.2),0_0_18px_rgba(255,255,255,0.08)]'
                  }`}>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-12" />
                  {f === 'all' ? 'Todas' : f === 'featured' ? 'Destaques' : 'Promoções'}
                </button>
              ))}
            </div>
          </motion.div>

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-gray-900 aspect-square animate-pulse" />
              ))}
            </div>
          )}

          {!loading && displayItems.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <Gem className="h-12 w-12 text-white/10" />
              <p className="text-gray-400">Nenhuma joia disponível no momento.</p>
              <button onClick={() => setShowEncomenda(true)}
                className="mt-2 border border-gray-700 px-6 py-2.5 text-sm text-gray-300 hover:border-gray-500 transition">
                Solicitar encomenda
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayItems.map((item, i) => (
              <CatalogCard key={item.id} item={item} index={i} effectivePrice={effectivePrice(item)}
                onView={() => setSelectedItem(item)} onAdd={() => addToCart(item)} />
            ))}
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section className="py-12 md:py-20" style={{ backgroundColor: '#000000' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl sm:text-4xl font-serif mb-4 sm:mb-6">Artesanato e Luxo</h3>
              <p className="text-gray-400 text-lg mb-6">
                Cada peça da nossa joalheria é criada com dedicação, combinando técnicas
                tradicionais com design contemporâneo.
              </p>
              <p className="text-gray-400 text-lg mb-8">
                Utilizamos os melhores materiais e gemas selecionadas individualmente
                para garantir qualidade excepcional em cada detalhe.
              </p>
              <button
                onClick={() => setShowEncomenda(true)}
                className="group relative overflow-hidden border border-white/70 text-white px-8 py-3.5 font-semibold tracking-wide rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4),0_0_28px_rgba(255,255,255,0.14),inset_0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_18px_rgba(255,255,255,0.65),0_0_44px_rgba(255,255,255,0.24),inset_0_0_16px_rgba(255,255,255,0.09)] transition-all duration-300"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12" />
                Solicitar Encomenda
              </button>
            </motion.div>
            <motion.div
              className="relative h-[260px] sm:h-[360px] md:h-[500px] rounded-lg overflow-hidden"
              initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1720189031165-b6f3cf3ff940?w=800"
                alt="Artesanato em joalheria"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 border-t border-gray-800">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
        >
          <h3 className="text-3xl font-serif mb-4">Fique Por Dentro</h3>
          <p className="text-gray-400 mb-8">Receba novidades e ofertas exclusivas</p>
          <div className="max-w-md mx-auto flex gap-3">
            <input type="email" placeholder="Seu e-mail"
              className="flex-1 bg-black border border-gray-800 rounded-full px-5 py-3 focus:outline-none focus:border-gray-500 text-white placeholder:text-gray-600 transition-colors" />
            {userMenuOpen && (
              <div key="user-menu-backdrop" className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
            )}
            <button className="group relative overflow-hidden bg-white text-black px-6 py-3 rounded-full font-semibold hover:shadow-[0_0_24px_rgba(255,255,255,0.3)] transition-all duration-300">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-12" />
              Inscrever
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12" style={{ backgroundColor: '#000000' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-serif mb-4">JOALHERIA</h4>
              <p className="text-gray-500 text-sm">Elegância e sofisticação em cada detalhe.</p>
            </div>
            <div>
              <h5 className="mb-4 font-medium">Coleções</h5>
              <ul className="space-y-2 text-gray-500 text-sm">
                {[['Todos','geral'],['Homem','homem'],['Mulher','mulher'],['Criança','crianca']].map(([label, val]) => (
                  <li key={val}><button
                    onClick={() => { setCategoryFilter(val as 'geral'|'homem'|'mulher'|'crianca'); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="hover:text-white transition-colors text-left">{label}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="mb-4 font-medium">Atendimento</h5>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><button onClick={() => setShowEncomenda(true)} className="hover:text-white transition-colors">Encomendas</button></li>
                <li><button onClick={() => setCartOpen(true)} className="hover:text-white transition-colors">Carrinho</button></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 font-medium">Studios Tatto</h5>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><button onClick={() => (window.location.href = '/')} className="hover:text-white transition-colors">Voltar ao site</button></li>
                <li><button onClick={() => (window.location.href = '/#especialistas')} className="hover:text-white transition-colors">Especialistas</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 Studios Tatto Joalheria. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Cart backdrop */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div key="cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
        )}
      </AnimatePresence>

      <CartSidebar
        cart={cart} shippingFee={shippingFee} deliveryMethod={deliveryMethod}
        setDeliveryMethod={setDeliveryMethod} updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => { setCartOpen(false); setShowCheckout(true); }}
        onEncomenda={() => { setCartOpen(false); setShowEncomenda(true); }}
        open={cartOpen} onClose={() => setCartOpen(false)}
      />

      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal key="checkout" cart={cart}
            form={checkoutForm} setForm={setCheckoutForm}
            onClose={() => { setShowCheckout(false); setSubmitted(false); }}
            onSubmit={handleSubmit} submitting={submitting} submitError={submitError} submitted={submitted} />
        )}
        {showEncomenda && <EncomendaModal key="encomenda" onClose={() => setShowEncomenda(false)} cartItems={deliveryMethod === 'encomendar' ? cart : undefined} />}
        {selectedItem && (
          <ItemModal key="item-modal" item={selectedItem} onClose={() => setSelectedItem(null)}
            onAddToCart={addToCart} onEncomenda={() => setShowEncomenda(true)} />
        )}
        {showAuth && (
          <AuthModal key="auth-modal" initialTab={authTab} onClose={() => setShowAuth(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

