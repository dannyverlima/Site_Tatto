import { useEffect, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Check, Edit2, ImagePlus, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import { uploadImageFile } from './uploadImage';
import { ImageWithFallback } from '../app/components/figma/ImageWithFallback';
import { RichTextEditor } from './RichTextEditor';
import { adminHeaders, getAdminToken } from './adminAuth';

type SpecialistItem = {
  id: number;
  name: string;
  specialty: string;
  description: string;
  imageUrl: string;
  experience?: string;
  instagram?: string;
  whatsapp?: string;
};

type SpecialistDraft = {
  name: string;
  specialty: string;
  description: string;
  imageUrl: string;
  experience: string;
  instagram: string;
  whatsapp: string;
};

const cardClassName = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';

const emptyDraft = (): SpecialistDraft => ({
  name: '',
  specialty: '',
  description: '',
  imageUrl: '',
  experience: '',
  instagram: '',
  whatsapp: '',
});

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export function AdminSpecialists() {
  const [specialists, setSpecialists] = useState<SpecialistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingSpecialist, setEditingSpecialist] = useState<SpecialistItem | null>(null);
  const [newSpecialist, setNewSpecialist] = useState<SpecialistDraft>(emptyDraft());
  const [isUploadingNewImage, setIsUploadingNewImage] = useState(false);
  const [uploadingSpecialistId, setUploadingSpecialistId] = useState<number | null>(null);

  // Campos auxiliares: handle e número (para gerar URL automaticamente)
  const [newInstaHandle, setNewInstaHandle] = useState('');
  const [newWaNumber, setNewWaNumber] = useState('');
  const [editInstaHandle, setEditInstaHandle] = useState('');
  const [editWaNumber, setEditWaNumber] = useState('');

  const makeInstaUrl = (handle: string) =>
    handle ? `https://instagram.com/${handle.replace('@', '')}` : '';
  const makeWaUrl = (number: string) => {
    const digits = number.replace(/\D/g, '');
    return digits ? `https://wa.me/${digits}` : '';
  };

  useEffect(() => {
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    try {
      const response = await fetch('/api/specialists');
      const data = await response.json();
      setSpecialists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar especialistas:', error);
      setSpecialists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSpecialist.name || !newSpecialist.specialty || !newSpecialist.imageUrl) {
      alert('Preecha nome, especialidade e imagem');
      return;
    }

    try {
      const response = await fetch('/api/specialists', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(newSpecialist),
      });

      if (response.ok) {
        setNewSpecialist(emptyDraft());
        setNewInstaHandle('');
        setNewWaNumber('');
        loadSpecialists();
        window.dispatchEvent(new Event('specialists-updated'));
      }
    } catch (error) {
      console.error('Erro ao adicionar:', error);
    }
  };

  const handleNewImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingNewImage(true);
    try {
      const imageUrl = await uploadImageFile(file, getAdminToken());
      setNewSpecialist((current) => ({ ...current, imageUrl }));
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Não foi possível enviar a imagem');
    } finally {
      setIsUploadingNewImage(false);
      event.target.value = '';
    }
  };

  const handleExistingImageChange = async (specialistId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingSpecialistId(specialistId);
    try {
      const imageUrl = await uploadImageFile(file, getAdminToken());
      setSpecialists((items) =>
        items.map((item) => (item.id === specialistId ? { ...item, imageUrl } : item))
      );
      setEditingSpecialist((current) => (current && current.id === specialistId ? { ...current, imageUrl } : current));
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      alert('Não foi possível enviar a imagem');
    } finally {
      setUploadingSpecialistId(null);
      event.target.value = '';
    }
  };

  const handleUpdate = async (id, specialist) => {
    try {
      const response = await fetch(`/api/specialists/${id}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify(specialist),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingSpecialist(null);
        loadSpecialists();
        window.dispatchEvent(new Event('specialists-updated'));
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/specialists/${id}`, { method: 'DELETE', headers: adminHeaders() });
      loadSpecialists();
      window.dispatchEvent(new Event('specialists-updated'));
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
            Adicionar especialista
          </CardTitle>
          <CardDescription className="text-white/55">
            Envie a foto direto do computador e deixe o cadastro mais limpo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Nome"
            value={newSpecialist.name}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />
          <Input
            placeholder="Especialidade"
            value={newSpecialist.specialty}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, specialty: e.target.value })}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />
          <RichTextEditor
            value={newSpecialist.description}
            onChange={(value) => setNewSpecialist({ ...newSpecialist, description: value })}
            placeholder="Escreva a descrição do especialista..."
          />
          <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Enviar foto por arquivo</p>
                <p className="text-xs text-white/45">A imagem fica hospedada localmente no servidor.</p>
              </div>
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleNewImageChange}
              className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
            />
          </label>
          {newSpecialist.imageUrl ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <ImageWithFallback src={newSpecialist.imageUrl} alt="Prévia do especialista" className="h-56 w-full object-cover" />
            </div>
          ) : null}
          <Input
            placeholder="Experiência (ex: 10+ anos)"
            value={newSpecialist.experience}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, experience: e.target.value })}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
          />
          <div className="space-y-2">
            <Input
              placeholder="Instagram (@usuario)"
              value={newInstaHandle}
              onChange={(e) => {
                setNewInstaHandle(e.target.value);
                setNewSpecialist({ ...newSpecialist, instagram: makeInstaUrl(e.target.value) });
              }}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
            <Input
              placeholder="URL do Instagram (preenchida automaticamente)"
              value={newSpecialist.instagram}
              onChange={(e) => setNewSpecialist({ ...newSpecialist, instagram: e.target.value })}
              className="border-white/10 bg-white/[0.02] text-white/60 placeholder:text-white/25 text-xs"
            />
          </div>
          <div className="space-y-2">
            <Input
              placeholder="WhatsApp (+55 27 99999-9999)"
              value={newWaNumber}
              onChange={(e) => {
                setNewWaNumber(e.target.value);
                setNewSpecialist({ ...newSpecialist, whatsapp: makeWaUrl(e.target.value) });
              }}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
            />
            <Input
              placeholder="URL do WhatsApp (preenchida automaticamente)"
              value={newSpecialist.whatsapp}
              onChange={(e) => setNewSpecialist({ ...newSpecialist, whatsapp: e.target.value })}
              className="border-white/10 bg-white/[0.02] text-white/60 placeholder:text-white/25 text-xs"
            />
          </div>
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
        <h3 className="text-sm uppercase tracking-[0.24em] text-white/45">Especialistas</h3>
        {specialists.map((specialist) => (
          <Card key={specialist.id} className={cardClassName}>
            <CardContent className="pt-6">
              {editingId === specialist.id ? (
                <div className="space-y-4">
                  <Input
                    value={editingSpecialist?.id === specialist.id ? editingSpecialist.name : specialist.name}
                    onChange={(e) =>
                      setEditingSpecialist((current) =>
                        current && current.id === specialist.id ? { ...current, name: e.target.value } : current
                      )
                    }
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                  />
                  <Input
                    value={editingSpecialist?.id === specialist.id ? editingSpecialist.specialty : specialist.specialty}
                    onChange={(e) =>
                      setEditingSpecialist((current) =>
                        current && current.id === specialist.id ? { ...current, specialty: e.target.value } : current
                      )
                    }
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                  />
                  <RichTextEditor
                    value={editingSpecialist?.id === specialist.id ? editingSpecialist.description : specialist.description}
                    onChange={(value) =>
                      setEditingSpecialist((current) =>
                        current && current.id === specialist.id ? { ...current, description: value } : current
                      )
                    }
                    placeholder="Descreva o especialista com formatação"
                  />
                  <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 p-4 transition hover:border-white/30 hover:bg-black/30">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80">
                        <ImagePlus size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Trocar foto por arquivo</p>
                        <p className="text-xs text-white/45">O arquivo novo substitui a imagem atual.</p>
                      </div>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleExistingImageChange(specialist.id, event)}
                      className="border-white/10 bg-white/5 text-white file:border-0 file:bg-white/10 file:text-white file:rounded-full file:px-3 file:py-1.5 file:text-xs"
                    />
                  </label>

                  {specialist.imageUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                      <ImageWithFallback src={specialist.imageUrl} alt={specialist.name} className="h-48 w-full object-cover" />
                    </div>
                  ) : null}

                  <Input
                    placeholder="Experiência (ex: 10+ anos)"
                    value={editingSpecialist?.id === specialist.id ? (editingSpecialist.experience ?? '') : (specialist.experience ?? '')}
                    onChange={(e) =>
                      setEditingSpecialist((current) =>
                        current && current.id === specialist.id ? { ...current, experience: e.target.value } : current
                      )
                    }
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                  />

                  <div className="space-y-2">
                    <Input
                      placeholder="Instagram (@usuario)"
                      value={editInstaHandle}
                      onChange={(e) => {
                        setEditInstaHandle(e.target.value);
                        setEditingSpecialist((current) =>
                          current && current.id === specialist.id
                            ? { ...current, instagram: makeInstaUrl(e.target.value) }
                            : current
                        );
                      }}
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                    />
                    <Input
                      placeholder="URL do Instagram (preenchida automaticamente)"
                      value={editingSpecialist?.id === specialist.id ? (editingSpecialist.instagram ?? '') : (specialist.instagram ?? '')}
                      onChange={(e) =>
                        setEditingSpecialist((current) =>
                          current && current.id === specialist.id ? { ...current, instagram: e.target.value } : current
                        )
                      }
                      className="border-white/10 bg-white/[0.02] text-white/60 placeholder:text-white/25 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="WhatsApp (+55 27 99999-9999)"
                      value={editWaNumber}
                      onChange={(e) => {
                        setEditWaNumber(e.target.value);
                        setEditingSpecialist((current) =>
                          current && current.id === specialist.id
                            ? { ...current, whatsapp: makeWaUrl(e.target.value) }
                            : current
                        );
                      }}
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/35"
                    />
                    <Input
                      placeholder="URL do WhatsApp (preenchida automaticamente)"
                      value={editingSpecialist?.id === specialist.id ? (editingSpecialist.whatsapp ?? '') : (specialist.whatsapp ?? '')}
                      onChange={(e) =>
                        setEditingSpecialist((current) =>
                          current && current.id === specialist.id ? { ...current, whatsapp: e.target.value } : current
                        )
                      }
                      className="border-white/10 bg-white/[0.02] text-white/60 placeholder:text-white/25 text-xs"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updated = editingSpecialist?.id === specialist.id ? editingSpecialist : specialists.find((s) => s.id === specialist.id);
                        if (updated) handleUpdate(specialist.id, updated);
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
                      {specialist.imageUrl ? (
                        <ImageWithFallback src={specialist.imageUrl} alt={specialist.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{specialist.name}</p>
                      <p className="text-sm text-white/55">{specialist.specialty}</p>
                      {specialist.description ? <p className="mt-1 text-xs text-white/40">{stripHtml(specialist.description)}</p> : null}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(specialist.id);
                        setEditingSpecialist({ ...specialist });
                        // popular handles/números para os campos auxiliares
                        const ig = specialist.instagram ?? '';
                        const wa = specialist.whatsapp ?? '';
                        setEditInstaHandle(ig.includes('instagram.com/')
                          ? '@' + ig.replace(/.*instagram\.com\//, '').replace(/\/$/, '')
                          : ig);
                        setEditWaNumber(wa.includes('wa.me/')
                          ? '+' + wa.replace(/.*wa\.me\//, '')
                          : wa);
                      }}
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(specialist.id)}
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
