import { useEffect, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Textarea } from '../app/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function AdminSpecialists() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newSpecialist, setNewSpecialist] = useState({
    name: '',
    specialty: '',
    imageUrl: '',
    experience: '',
    instagram: '',
    whatsapp: '',
  });

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpecialist),
      });

      if (response.ok) {
        setNewSpecialist({
          name: '',
          specialty: '',
          imageUrl: '',
          experience: '',
          instagram: '',
          whatsapp: '',
        });
        loadSpecialists();
      }
    } catch (error) {
      console.error('Erro ao adicionar:', error);
    }
  };

  const handleUpdate = async (id, specialist) => {
    try {
      const response = await fetch(`/api/specialists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specialist),
      });

      if (response.ok) {
        setEditingId(null);
        loadSpecialists();
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/specialists/${id}`, { method: 'DELETE' });
      loadSpecialists();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Especialista</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Nome"
            value={newSpecialist.name}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
          />
          <Input
            placeholder="Especialidade"
            value={newSpecialist.specialty}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, specialty: e.target.value })}
          />
          <Input
            placeholder="URL da imagem"
            value={newSpecialist.imageUrl}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, imageUrl: e.target.value })}
          />
          <Input
            placeholder="Experiência (ex: 10+ anos)"
            value={newSpecialist.experience}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, experience: e.target.value })}
          />
          <Input
            placeholder="Instagram"
            value={newSpecialist.instagram}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, instagram: e.target.value })}
          />
          <Input
            placeholder="WhatsApp"
            value={newSpecialist.whatsapp}
            onChange={(e) => setNewSpecialist({ ...newSpecialist, whatsapp: e.target.value })}
          />
          <Button onClick={handleAdd} className="w-full">
            <Plus size={18} className="mr-2" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="font-semibold">Especialistas</h3>
        {specialists.map((specialist) => (
          <Card key={specialist.id}>
            <CardContent className="pt-6">
              {editingId === specialist.id ? (
                <div className="space-y-3">
                  <Input
                    defaultValue={specialist.name}
                    onChange={(e) =>
                      setSpecialists(
                        specialists.map((s) =>
                          s.id === specialist.id ? { ...s, name: e.target.value } : s
                        )
                      )
                    }
                  />
                  <Input
                    defaultValue={specialist.specialty}
                    onChange={(e) =>
                      setSpecialists(
                        specialists.map((s) =>
                          s.id === specialist.id ? { ...s, specialty: e.target.value } : s
                        )
                      )
                    }
                  />
                  <Input
                    defaultValue={specialist.imageUrl}
                    onChange={(e) =>
                      setSpecialists(
                        specialists.map((s) =>
                          s.id === specialist.id ? { ...s, imageUrl: e.target.value } : s
                        )
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updated = specialists.find((s) => s.id === specialist.id);
                        handleUpdate(specialist.id, updated);
                      }}
                    >
                      <Check size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{specialist.name}</p>
                    <p className="text-sm text-gray-600">{specialist.specialty}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(specialist.id)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(specialist.id)}>
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
