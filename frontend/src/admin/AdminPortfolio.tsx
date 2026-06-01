import { useMemo, useEffect, useState } from 'react';
import { useSpecialists } from '../app/hooks/useSpecialists';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Check, Edit2, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { uploadImageFile } from './uploadImage';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';

type PortfolioItem = {
  id: number;
  title: string;
  style: string;
  imageUrl: string;
  specialistId?: string | null;
  isPublished?: boolean;
};

type PortfolioAlbum = {
  key: string;
  title: string;
  description: string;
  specialistId?: string | null;
  photos: PortfolioItem[];
};

type PortfolioDraft = {
  title: string;
  description: string;
  imageUrls: string[];
  specialistId?: string | null;
};

const cardClassName = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';
const inputClassName = 'border-white/10 bg-white/5 text-white placeholder:text-white/35';

const emptyDraft = (): PortfolioDraft => ({
  title: '',
  description: '',
  imageUrls: [''],
  specialistId: '',
});

const normalizeText = (value?: string | null) => (value || '').trim().toLowerCase();

const makeAlbumKey = (item: { specialistId?: string | null; title?: string; style?: string }) => {
  return [String(item.specialistId || ''), normalizeText(item.title), normalizeText(item.style)].join('||');
};

const groupPortfolioIntoAlbums = (items: PortfolioItem[]): PortfolioAlbum[] => {
  const grouped = new Map<string, PortfolioAlbum>();

  for (const photo of items) {
    const key = makeAlbumKey(photo);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        title: photo.title,
        description: photo.style,
        specialistId: photo.specialistId,
        photos: [],
      });
    }

    grouped.get(key)!.photos.push(photo);
  }

  return Array.from(grouped.values()).map((album) => ({
    ...album,
    photos: [...album.photos].sort((a, b) => a.id - b.id).slice(0, 5),
  }));
};

export function AdminPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAlbumKey, setEditingAlbumKey] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<PortfolioDraft | null>(null);
  const [newItem, setNewItem] = useState<PortfolioDraft>(emptyDraft());
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [uploadingAlbumKey, setUploadingAlbumKey] = useState<string | null>(null);
  const { specialists } = useSpecialists();

  useEffect(() => {
    loadPortfolio();
  }, []);

  const MAX_PORTFOLIO = 30;
  const MAX_ALBUM_PHOTOS = 5;

  const albums = useMemo(() => groupPortfolioIntoAlbums(portfolioItems), [portfolioItems]);

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
    if (!newItem.title) {
      alert('Título do álbum é obrigatório');
      return;
    }

    if (!newItem.specialistId) {
      alert('Selecione o especialista dessa imagem');
      return;
    }

    const validImages = newItem.imageUrls.map((url) => url.trim()).filter(Boolean).slice(0, MAX_ALBUM_PHOTOS);

    if (validImages.length === 0) {
      alert('Adicione pelo menos 1 foto no álbum');
      return;
    }

    if ((portfolioItems || []).length + validImages.length > MAX_PORTFOLIO) {
      alert(`Limite total de ${MAX_PORTFOLIO} imagens atingido. Remova imagens antes de adicionar novas.`);
      return;
    }

    setIsSavingAlbum(true);
    try {
      for (const imageUrl of validImages) {
        const payload = {
          title: newItem.title,
          style: newItem.description,
          imageUrl,
          specialistId: newItem.specialistId,
        };

        const response = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Falha ao salvar fotos do álbum');
        }
      }

      setNewItem(emptyDraft());
      loadPortfolio();
      notifySiteConfigUpdated();
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      alert('Não foi possível salvar o álbum');
    } finally {
      setIsSavingAlbum(false);
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
        alert('Não foi possível enviar a imagem');
      } finally {
        setIsUploadingNewImage(false);
        event.target.value = '';
      }
    };

    const addAlbumPhotoField = () => {
      setNewItem((current) => {
        if (current.imageUrls.length >= MAX_ALBUM_PHOTOS) {
          return current;
        }
        return { ...current, imageUrls: [...current.imageUrls, ''] };
      });
    };

    const removeAlbumPhotoField = (index: number) => {
      setNewItem((current) => {
        if (current.imageUrls.length <= 1) {
          return { ...current, imageUrls: [''] };
        }
        return {
          ...current,
          imageUrls: current.imageUrls.filter((_, fieldIndex) => fieldIndex !== index),
        };
      });
    };

    const handleAddPhotoToAlbum = async (album: PortfolioAlbum, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (album.photos.length >= MAX_ALBUM_PHOTOS) {
        alert('Este álbum já tem 5 fotos');
        event.target.value = '';
        return;
      }

      setUploadingAlbumKey(album.key);
      try {
        const imageUrl = await uploadImageFile(file);

        const reference = editingAlbumKey === album.key && editingDraft
          ? editingDraft
          : {
              title: album.title,
              description: album.description,
              specialistId: album.specialistId || '',
              imageUrls: [],
            };

        const response = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: reference.title,
            style: reference.description,
            imageUrl,
            specialistId: reference.specialistId || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Falha ao adicionar foto no álbum');
        }

        await loadPortfolio();
        notifySiteConfigUpdated();
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        alert('Não foi possível enviar a imagem');
      } finally {
        setUploadingAlbumKey(null);
        event.target.value = '';
      }
    };

  const handleUpdate = async (id: number, item: PortfolioItem, closeEditor = true) => {
    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        if (closeEditor) {
          setEditingAlbumKey(null);
          setEditingDraft(null);
        }
        loadPortfolio();
        notifySiteConfigUpdated();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      return false;
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

  const beginEditingAlbum = (album: PortfolioAlbum) => {
    setEditingAlbumKey(album.key);
    setEditingDraft({
      title: album.title,
      description: album.description,
      specialistId: album.specialistId || '',
      imageUrls: [],
    });
  };

  const cancelEditing = () => {
    setEditingAlbumKey(null);
    setEditingDraft(null);
  };

  const saveAlbumEditing = async (album: PortfolioAlbum) => {
    if (!editingDraft) return;

    const updates = album.photos.map((photo, index) =>
      handleUpdate(
        photo.id,
        {
          ...photo,
          title: editingDraft.title,
          style: editingDraft.description,
          specialistId: editingDraft.specialistId || null,
          isPublished: photo.isPublished ?? true,
        },
        index === album.photos.length - 1
      )
    );

    await Promise.all(updates);
  };

  const deleteAlbum = async (album: PortfolioAlbum) => {
    if (!confirm('Excluir o álbum inteiro e todas as fotos?')) return;

    try {
      await Promise.all(album.photos.map((photo) => fetch(`/api/portfolio/${photo.id}`, { method: 'DELETE' })));
      await loadPortfolio();
      notifySiteConfigUpdated();
      if (editingAlbumKey === album.key) {
        cancelEditing();
      }
    } catch (error) {
      console.error('Erro ao excluir álbum:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Álbuns</p>
          <p className="mt-2 text-2xl font-semibold text-white">{albums.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Fotos</p>
          <p className="mt-2 text-2xl font-semibold text-white">{portfolioItems.length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Limite por álbum</p>
          <p className="mt-2 text-2xl font-semibold text-white">{MAX_ALBUM_PHOTOS}</p>
        </div>
      </div>

      <Card className={cardClassName}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white text-xl">
            <Sparkles className="h-5 w-5 text-white/70" />
            Criar novo álbum
          </CardTitle>
          <p className="text-sm text-white/55">
            Defina título, descrição, especialista e até 5 fotos para montar um álbum completo.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Título do álbum"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className={inputClassName}
          />
          <Input
            placeholder="Descrição do álbum"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className={inputClassName}
          />

          <div>
            <label className="text-sm text-white/70">Especialista</label>
            <select
              value={newItem.specialistId ?? ''}
              onChange={(e) => setNewItem({ ...newItem, specialistId: e.target.value })}
              className="mt-2 w-full rounded-md border border-white/10 bg-black/90 p-2 text-white [color-scheme:dark]"
            >
              <option value="">-- Selecione --</option>
              {specialists.map((s) => (
                <option key={s.id} value={s.id as any}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/70">Fotos do álbum (máximo 5)</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addAlbumPhotoField}
                disabled={newItem.imageUrls.length >= MAX_ALBUM_PHOTOS}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Plus size={14} className="mr-1" />
                Adicionar foto
              </Button>
            </div>

            {newItem.imageUrls.map((imageUrl, index) => (
              <div key={`new-photo-${index}`} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">Foto {index + 1}</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeAlbumPhotoField(index)}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    <X size={14} />
                  </Button>
                </div>

                <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                      <Upload size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Enviar foto do álbum</p>
                      <p className="text-xs text-white/45">PNG, JPG ou WEBP.</p>
                    </div>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleNewImageChange(index, event)}
                    className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
                  />
                </label>

                {imageUrl ? (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <ImageWithFallback src={imageUrl} alt={`Prévia ${index + 1}`} className="aspect-[9/16] w-full object-cover" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <Button
            onClick={handleAdd}
            className="w-full border border-white/10 bg-white text-black hover:bg-white/90"
            disabled={isUploadingNewImage || isSavingAlbum}
          >
            <Plus size={18} className="mr-2" />
            {isSavingAlbum ? 'Salvando álbum...' : isUploadingNewImage ? 'Enviando imagem...' : 'Salvar álbum'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-sm uppercase tracking-[0.24em] text-white/45">Álbuns do Portfólio</h3>
        {albums.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 py-10 text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-white/45">Sem álbuns ainda</p>
            <p className="mt-2 text-white/70">Crie o primeiro álbum acima para começar a preencher a vitrine principal.</p>
          </div>
        ) : null}
        {albums.map((album) => {
          const isEditingAlbum = editingAlbumKey === album.key;
          const specialistName = specialists.find((s) => String(s.id) === String(album.specialistId))?.name;

          return (
          <Card key={album.key} className={cardClassName}>
            <CardContent className="pt-6">
              {isEditingAlbum ? (
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">Editando álbum</p>
                  <Input
                    value={editingDraft?.title ?? ''}
                    onChange={(e) =>
                      setEditingDraft((current) =>
                        current ? { ...current, title: e.target.value } : current
                      )
                    }
                    className={inputClassName}
                  />
                  <Input
                    value={editingDraft?.description ?? ''}
                    onChange={(e) =>
                      setEditingDraft((current) =>
                        current ? { ...current, description: e.target.value } : current
                      )
                    }
                    className={inputClassName}
                  />
                  <div>
                    <label className="text-sm text-white/70">Especialista</label>
                    <select
                      value={editingDraft?.specialistId ?? ''}
                      onChange={(e) =>
                        setEditingDraft((current) =>
                          current
                            ? { ...current, specialistId: e.target.value || null }
                            : current
                        )
                      }
                      className="mt-2 w-full rounded-md border border-white/10 bg-black/90 p-2 text-white [color-scheme:dark]"
                    >
                      <option value="">-- Selecione --</option>
                      {specialists.map((s) => (
                        <option key={s.id} value={s.id as any}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {album.photos.length < MAX_ALBUM_PHOTOS ? (
                  <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <Plus size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Adicionar foto no álbum</p>
                        <p className="text-xs text-white/45">Máximo de 5 fotos por álbum.</p>
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleAddPhotoToAlbum(album, event)}
                      className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
                    />
                  </label>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {album.photos.map((photo) => (
                      <div key={photo.id} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                        <ImageWithFallback src={photo.imageUrl} alt={photo.title} className="aspect-[9/16] w-full object-cover" />
                        <div className="flex items-center justify-between p-3">
                          <p className="text-xs text-white/60">Foto ID {photo.id}</p>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(photo.id)}
                            className="bg-white/10 text-white hover:bg-white/20"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveAlbumEditing(album)}
                      className="border border-white/10 bg-white px-4 text-black hover:bg-white/90"
                    >
                      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.14em]">Salvar álbum</span>
                      <Check size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                      {album.photos[0]?.imageUrl ? (
                        <ImageWithFallback src={album.photos[0].imageUrl} alt={album.title} className="aspect-[9/16] w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{album.title}</p>
                      {album.description && <p className="text-sm text-white/55">{album.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/60">
                          {specialistName || 'Especialista selecionado'}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                          {album.photos.length}/{MAX_ALBUM_PHOTOS} fotos
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
                    {album.photos.slice(0, 4).map((photo) => (
                      <div key={`thumb-${photo.id}`} className="w-10 overflow-hidden rounded-lg border border-white/10 bg-black/30">
                        <ImageWithFallback src={photo.imageUrl} alt={photo.title} className="aspect-[9/16] w-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => beginEditingAlbum(album)}
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteAlbum(album)}
                      className="bg-white/10 text-white hover:bg-white/20"
                    >
                      <Trash2 size={16} />
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
