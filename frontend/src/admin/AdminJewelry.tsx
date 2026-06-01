import { useEffect, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Textarea } from '../app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Check, Edit2, Plus, Trash2, Upload, X } from 'lucide-react';
import { uploadImageFile } from './uploadImage';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';

const cardClassName = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';
const inputClassName = 'border-white/10 bg-white/5 text-white placeholder:text-white/35';

const parsePrice = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

type JewelryItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  imageUrls: string[];
};

type JewelryDraft = {
  name: string;
  description: string;
  price: string;
  isActive: boolean;
  imageUrls: string[];
};

const emptyDraft = (): JewelryDraft => ({
  name: '',
  description: '',
  price: '',
  isActive: true,
  imageUrls: [''],
});

const normalizeUrls = (urls: string[]) => urls.map((url) => url.trim()).filter(Boolean);

export function AdminJewelry() {
  const [items, setItems] = useState<JewelryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<JewelryDraft | null>(null);
  const [newItem, setNewItem] = useState<JewelryDraft>(emptyDraft());
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await fetch('/api/jewelry?all=1');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar joias:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const priceValue = parsePrice(newItem.price);
    const imageUrls = normalizeUrls(newItem.imageUrls);

    if (!newItem.name || Number.isNaN(priceValue)) {
      alert('Preencha nome e preco');
      return;
    }

    if (imageUrls.length === 0) {
      alert('Adicione pelo menos uma foto');
      return;
    }

    try {
      const response = await fetch('/api/jewelry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          description: newItem.description,
          price: priceValue,
          imageUrls,
          isActive: newItem.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar joia');
      }

      setNewItem(emptyDraft());
      loadItems();
    } catch (error) {
      console.error('Erro ao adicionar joia:', error);
      alert('Nao foi possivel salvar a joia');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingItem) {
      return;
    }

    const priceValue = parsePrice(editingItem.price);
    const imageUrls = normalizeUrls(editingItem.imageUrls);

    if (!editingItem.name || Number.isNaN(priceValue)) {
      alert('Preencha nome e preco');
      return;
    }

    try {
      const response = await fetch(`/api/jewelry/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingItem.name,
          description: editingItem.description,
          price: priceValue,
          imageUrls,
          isActive: editingItem.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar joia');
      }

      setEditingId(null);
      setEditingItem(null);
      loadItems();
    } catch (error) {
      console.error('Erro ao atualizar joia:', error);
      alert('Nao foi possivel atualizar a joia');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) {
      return;
    }

    try {
      await fetch(`/api/jewelry/${id}`, { method: 'DELETE' });
      loadItems();
    } catch (error) {
      console.error('Erro ao deletar joia:', error);
    }
  };

  const handleNewImageChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingNewImage(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setNewItem((current) => {
        const nextUrls = [...current.imageUrls];
        nextUrls[index] = imageUrl;
        return { ...current, imageUrls: nextUrls };
      });
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Nao foi possivel enviar a imagem');
    } finally {
      setIsUploadingNewImage(false);
      event.target.value = '';
    }
  };

  const handleExistingImageChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingItem) {
      return;
    }

    setUploadingItemId(editingId);
    try {
      const imageUrl = await uploadImageFile(file);
      setEditingItem((current) => {
        if (!current) {
          return current;
        }
        const nextUrls = [...current.imageUrls];
        nextUrls[index] = imageUrl;
        return { ...current, imageUrls: nextUrls };
      });
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Nao foi possivel enviar a imagem');
    } finally {
      setUploadingItemId(null);
      event.target.value = '';
    }
  };

  const addImageField = (setter: React.Dispatch<React.SetStateAction<JewelryDraft>>, limit = 6) => {
    setter((current) => {
      if (current.imageUrls.length >= limit) {
        return current;
      }
      return { ...current, imageUrls: [...current.imageUrls, ''] };
    });
  };

  const addOptionalImageField = (setter: React.Dispatch<React.SetStateAction<JewelryDraft | null>>, limit = 6) => {
    setter((current) => {
      if (!current || current.imageUrls.length >= limit) {
        return current;
      }
      return { ...current, imageUrls: [...current.imageUrls, ''] };
    });
  };

  const removeImageField = (setter: React.Dispatch<React.SetStateAction<JewelryDraft>>, index: number) => {
    setter((current) => {
      if (current.imageUrls.length <= 1) {
        return { ...current, imageUrls: [''] };
      }
      return { ...current, imageUrls: current.imageUrls.filter((_, idx) => idx !== index) };
    });
  };

  const removeOptionalImageField = (setter: React.Dispatch<React.SetStateAction<JewelryDraft | null>>, index: number) => {
    setter((current) => {
      if (!current) {
        return current;
      }
      if (current.imageUrls.length <= 1) {
        return { ...current, imageUrls: [''] };
      }
      return { ...current, imageUrls: current.imageUrls.filter((_, idx) => idx !== index) };
    });
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className={cardClassName}>
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-xl">Adicionar joia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nome"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className={inputClassName}
          />
          <Textarea
            placeholder="Descricao"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className={inputClassName}
          />
          <Input
            placeholder="Preco"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className={inputClassName}
          />

          <div className="space-y-3">
            {newItem.imageUrls.map((url, index) => (
              <div key={`new-image-${index}`} className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    placeholder="URL da imagem"
                    value={url}
                    onChange={(e) =>
                      setNewItem((current) => {
                        const nextUrls = [...current.imageUrls];
                        nextUrls[index] = e.target.value;
                        return { ...current, imageUrls: nextUrls };
                      })
                    }
                    className={inputClassName}
                  />
                  <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                    <Upload size={14} />
                    Enviar
                    <Input type="file" accept="image/*" onChange={(event) => handleNewImageChange(index, event)} className="hidden" />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => removeImageField(setNewItem, index)}
                  >
                    Remover
                  </Button>
                </div>
                {url ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <ImageWithFallback src={url} alt="Preview" className="h-40 w-full object-cover" />
                  </div>
                ) : null}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              onClick={() => addImageField(setNewItem)}
            >
              Adicionar outra foto
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={newItem.isActive}
              onChange={(e) => setNewItem({ ...newItem, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-white/10"
            />
            Joia ativa na vitrine
          </label>

          <Button
            onClick={handleAdd}
            className="w-full border border-white/10 bg-white text-black hover:bg-white/90"
            disabled={isUploadingNewImage}
          >
            <Plus size={18} className="mr-2" />
            {isUploadingNewImage ? 'Enviando imagem...' : 'Adicionar joia'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm uppercase tracking-[0.24em] text-white/45">Joias cadastradas</h3>
        {items.map((item) => {
          const isEditing = editingId === item.id;
          const displayPrice = item.price === null || typeof item.price === 'undefined' ? '' : String(item.price);
          return (
            <Card key={item.id} className={cardClassName}>
              <CardContent className="pt-6 space-y-4">
                {isEditing && editingItem ? (
                  <div className="space-y-4">
                    <Input
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className={inputClassName}
                    />
                    <Textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className={inputClassName}
                    />
                    <Input
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                      className={inputClassName}
                    />

                    <div className="space-y-3">
                      {editingItem.imageUrls.map((url, index) => (
                        <div key={`edit-image-${index}`} className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <Input
                              value={url}
                              onChange={(e) =>
                                setEditingItem((current) => {
                                  if (!current) {
                                    return current;
                                  }
                                  const nextUrls = [...current.imageUrls];
                                  nextUrls[index] = e.target.value;
                                  return { ...current, imageUrls: nextUrls };
                                })
                              }
                              className={inputClassName}
                            />
                            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                              <Upload size={14} />
                              Enviar
                              <Input type="file" accept="image/*" onChange={(event) => handleExistingImageChange(index, event)} className="hidden" />
                            </label>
                            <Button
                              type="button"
                              variant="outline"
                              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                              onClick={() => removeOptionalImageField(setEditingItem, index)}
                            >
                              Remover
                            </Button>
                          </div>
                          {url ? (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                              <ImageWithFallback src={url} alt="Preview" className="h-40 w-full object-cover" />
                            </div>
                          ) : null}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                        onClick={() => addOptionalImageField(setEditingItem)}
                      >
                        Adicionar outra foto
                      </Button>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={editingItem.isActive}
                        onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                      />
                      Joia ativa na vitrine
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleUpdate(item.id)}
                        className="flex-1 border border-white/10 bg-white text-black hover:bg-white/90"
                        disabled={uploadingItemId === item.id}
                      >
                        <Check size={16} className="mr-2" />
                        Salvar
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingId(null);
                          setEditingItem(null);
                        }}
                        variant="outline"
                        className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        <X size={16} className="mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-[0.4fr_0.6fr]">
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        <ImageWithFallback
                          src={item.imageUrls?.[0] || ''}
                          alt={item.name}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-white">{item.name}</p>
                        <p className="text-sm text-white/60">{item.description || 'Sem descricao'}</p>
                        <p className="mt-3 text-sm text-white/80">Preco: {displayPrice}</p>
                        <p className="mt-1 text-xs text-white/50">
                          {item.isActive ? 'Ativo na vitrine' : 'Inativo'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditingItem({
                            name: item.name,
                            description: item.description,
                            price: displayPrice,
                            isActive: item.isActive,
                            imageUrls: item.imageUrls && item.imageUrls.length ? [...item.imageUrls] : [''],
                          });
                        }}
                        className="flex-1 border border-white/10 bg-white text-black hover:bg-white/90"
                      >
                        <Edit2 size={16} className="mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="outline"
                        className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
