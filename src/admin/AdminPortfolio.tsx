import { useEffect, useState } from 'react';
import { useSpecialists } from '../app/hooks/useSpecialists';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Check, Edit2, ImagePlus, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { uploadImageFile } from './uploadImage';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';

type PortfolioItem = {
  id: number;
  title: string;
  style: string;
  imageUrl: string;
  isPublished?: boolean;
};

type PortfolioDraft = {
  title: string;
  style: string;
  imageUrl: string;
  specialistId?: string | null;
};

const cardClassName = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';

const emptyDraft = (): PortfolioDraft => ({
  title: '',
  style: '',
  imageUrl: '',
  specialistId: '',
});

export function AdminPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<PortfolioDraft>(emptyDraft());
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null);
  const { specialists } = useSpecialists();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const MAX_PORTFOLIO = 5;

  const loadPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio');
      const data = await response.json();
      setPortfolioItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar portfolio:', error);
      setPortfolioItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.title || !newItem.imageUrl) {
      alert('Título e imagem são obrigatórios');
      return;
    }

    if ((portfolioItems || []).length >= MAX_PORTFOLIO) {
      alert(`Limite de ${MAX_PORTFOLIO} trabalhos atingido. Remova um item antes de adicionar outro.`);
      return;
    }

    try {
      const payload = { ...newItem };
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setNewItem(emptyDraft());
        loadPortfolio();
        notifySiteConfigUpdated();
      }
    } catch (error) {
      console.error('Erro ao adicionar:', error);
    }
  };

  const notifySiteConfigUpdated = () => {
    try {
      const key = 'site-config-updated-at';
      const stamp = String(Date.now());
      window.localStorage.setItem(key, stamp);
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('site-config');
        bc.postMessage(stamp);
        bc.close();
      }
      window.dispatchEvent(new Event('site-config-updated'));
    } catch (e) {
      // ignore
    }
  };

    const handleNewImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setIsUploadingNewImage(true);
      try {
        const imageUrl = await uploadImageFile(file);
        setNewItem((current) => ({ ...current, imageUrl }));
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        alert('Não foi possível enviar a imagem');
      } finally {
        setIsUploadingNewImage(false);
        event.target.value = '';
      }
    };

    const handleExistingImageChange = async (itemId: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      setUploadingItemId(itemId);
      try {
        const imageUrl = await uploadImageFile(file);
        setPortfolioItems((items) =>
          items.map((item) => (item.id === itemId ? { ...item, imageUrl } : item))
        );
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        alert('Não foi possível enviar a imagem');
      } finally {
        setUploadingItemId(null);
        event.target.value = '';
      }
    };

  const handleUpdate = async (id, item) => {
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        setEditingId(null);
        loadPortfolio();
        notifySiteConfigUpdated();
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/portfolio/${id}`, { method: 'DELETE' });
      loadPortfolio();
      notifySiteConfigUpdated();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <Card className={cardClassName}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white text-xl">
            <Sparkles className="h-5 w-5 text-white/70" />
            Adicionar trabalho
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />
          <Input
            placeholder="Estilo/Tipo (ex: Realismo)"
            value={newItem.style}
            onChange={(e) => setNewItem({ ...newItem, style: e.target.value })}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />

          <div>
            <label className="text-sm text-white/70">Especialista (opcional)</label>
            <select
              value={newItem.specialistId ?? ''}
              onChange={(e) => setNewItem({ ...newItem, specialistId: e.target.value })}
              className="mt-2 w-full rounded-md border border-white/10 bg-white/5 p-2 text-white"
            >
              <option value="">-- Nenhum --</option>
              {specialists.map((s) => (
                <option key={s.id} value={s.id as any}>{s.name}</option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Enviar imagem por arquivo</p>
                <p className="text-xs text-white/45">PNG, JPG ou WEBP. A imagem vira um link local automático.</p>
              </div>
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleNewImageChange}
              className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
            />
          </label>

          {newItem.imageUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <ImageWithFallback src={newItem.imageUrl} alt="Prévia do trabalho" className="h-56 w-full object-cover" />
            </div>
          ) : null}

          <Button
            onClick={handleAdd}
            className="w-full border border-white/10 bg-white text-black hover:bg-white/90"
            disabled={isUploadingNewImage}
          >
            <Plus size={18} className="mr-2" />
            {isUploadingNewImage ? 'Enviando imagem...' : 'Adicionar'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm uppercase tracking-[0.24em] text-white/45">Portfólio</h3>
        {portfolioItems.map((item) => (
          <Card key={item.id} className={cardClassName}>
            <CardContent className="pt-6">
              {editingId === item.id ? (
                <div className="space-y-4">
                  <Input
                    defaultValue={item.title}
                    onChange={(e) =>
                      setPortfolioItems(
                        portfolioItems.map((i) =>
                          i.id === item.id ? { ...i, title: e.target.value } : i
                        )
                      )
                    }
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                  />
                  <Input
                    defaultValue={item.style}
                    onChange={(e) =>
                      setPortfolioItems(
                        portfolioItems.map((i) =>
                          i.id === item.id ? { ...i, style: e.target.value } : i
                        )
                      )
                    }
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                  />
                  <div>
                    <label className="text-sm text-white/70">Especialista (opcional)</label>
                    <select
                      value={(portfolioItems.find((i) => i.id === item.id)?.specialistId as any) ?? ''}
                      onChange={(e) =>
                        setPortfolioItems(
                          portfolioItems.map((i) =>
                            i.id === item.id ? { ...i, specialistId: e.target.value } : i
                          )
                        )
                      }
                      className="mt-2 w-full rounded-md border border-white/10 bg-white/5 p-2 text-white"
                    >
                      <option value="">-- Nenhum --</option>
                      {specialists.map((s) => (
                        <option key={s.id} value={s.id as any}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <ImagePlus size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Trocar imagem por arquivo</p>
                        <p className="text-xs text-white/45">A imagem nova substitui o link atual.</p>
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleExistingImageChange(item.id, event)}
                      className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
                    />
                  </label>

                  {item.imageUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      <ImageWithFallback src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updated = portfolioItems.find((i) => i.id === item.id);
                        if (updated) {
                          handleUpdate(item.id, updated);
                        }
                      }}
                      className="border border-white/10 bg-white text-black hover:bg-white/90"
                    >
                      <Check size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                      {item.imageUrl ? (
                        <ImageWithFallback src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      {item.style && <p className="text-sm text-white/55">{item.style}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(item.id)}
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      className="bg-white/10 text-white hover:bg-white/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
