import { useEffect, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function AdminPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    style: '',
    imageUrl: '',
  });

  useEffect(() => {
    loadPortfolio();
  }, []);

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

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setNewItem({ title: '', style: '', imageUrl: '' });
        loadPortfolio();
      }
    } catch (error) {
      console.error('Erro ao adicionar:', error);
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
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Trabalho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Título"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          />
          <Input
            placeholder="Estilo/Tipo (ex: Realismo)"
            value={newItem.style}
            onChange={(e) => setNewItem({ ...newItem, style: e.target.value })}
          />
          <Input
            placeholder="URL da imagem"
            value={newItem.imageUrl}
            onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
          />
          <Button onClick={handleAdd} className="w-full">
            <Plus size={18} className="mr-2" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="font-semibold">Portfólio</h3>
        {portfolioItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <Input
                    defaultValue={item.title}
                    onChange={(e) =>
                      setPortfolioItems(
                        portfolioItems.map((i) =>
                          i.id === item.id ? { ...i, title: e.target.value } : i
                        )
                      )
                    }
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
                  />
                  <Input
                    defaultValue={item.imageUrl}
                    onChange={(e) =>
                      setPortfolioItems(
                        portfolioItems.map((i) =>
                          i.id === item.id ? { ...i, imageUrl: e.target.value } : i
                        )
                      )
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const updated = portfolioItems.find((i) => i.id === item.id);
                        handleUpdate(item.id, updated);
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
                    <p className="font-semibold">{item.title}</p>
                    {item.style && <p className="text-sm text-gray-600">{item.style}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(item.id)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
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
