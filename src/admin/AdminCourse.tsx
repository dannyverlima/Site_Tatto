import { useEffect, useState } from 'react';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Textarea } from '../app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function AdminCourse() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    nextClass: '',
    price: '',
    priceNote: '',
  });

  const [newFeature, setNewFeature] = useState({ title: '', description: '' });
  const [editingFeatureId, setEditingFeatureId] = useState(null);
  const [newHighlight, setNewHighlight] = useState('');
  const [editingHighlightId, setEditingHighlightId] = useState(null);
  const [newExtraInfo, setNewExtraInfo] = useState('');
  const [editingExtraInfoId, setEditingExtraInfoId] = useState(null);

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    try {
      const response = await fetch('/api/course');
      const data = await response.json();
      setCourse(data && typeof data === 'object' ? data : {});
      setCourseForm(data && typeof data === 'object' ? data : {
        title: '',
        description: '',
        nextClass: '',
        price: '',
        priceNote: '',
      });
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      setCourse({});
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const response = await fetch('/api/course', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });

      if (response.ok) {
        const updated = await response.json();
        setCourse(updated);
        setEditingCourse(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeature.title || !newFeature.description) {
      alert('Preenchha título e descrição');
      return;
    }

    try {
      const response = await fetch('/api/course/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeature),
      });

      if (response.ok) {
        setNewFeature({ title: '', description: '' });
        loadCourse();
      }
    } catch (error) {
      console.error('Erro ao adicionar feature:', error);
    }
  };

  const handleDeleteFeature = async (id) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/course/features/${id}`, { method: 'DELETE' });
      loadCourse();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleAddHighlight = async () => {
    if (!newHighlight.trim()) return;

    try {
      const response = await fetch('/api/course/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newHighlight }),
      });

      if (response.ok) {
        setNewHighlight('');
        loadCourse();
      }
    } catch (error) {
      console.error('Erro ao adicionar highlight:', error);
    }
  };

  const handleDeleteHighlight = async (id) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/course/highlights/${id}`, { method: 'DELETE' });
      loadCourse();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const handleAddExtraInfo = async () => {
    if (!newExtraInfo.trim()) return;

    try {
      const response = await fetch('/api/course/extra-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newExtraInfo }),
      });

      if (response.ok) {
        setNewExtraInfo('');
        loadCourse();
      }
    } catch (error) {
      console.error('Erro ao adicionar info extra:', error);
    }
  };

  const handleDeleteExtraInfo = async (id) => {
    if (!confirm('Tem certeza?')) return;

    try {
      await fetch(`/api/course/extra-info/${id}`, { method: 'DELETE' });
      loadCourse();
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!course) return <div>Nenhum curso configurado</div>;

  return (
    <div className="space-y-6">
      {/* COURSE INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Curso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editingCourse ? (
            <>
              <Input
                placeholder="Título"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              />
              <Textarea
                placeholder="Descrição"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              />
              <Input
                placeholder="Próxima turma"
                value={courseForm.nextClass}
                onChange={(e) => setCourseForm({ ...courseForm, nextClass: e.target.value })}
              />
              <Input
                placeholder="Preço"
                value={courseForm.price}
                onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
              />
              <Input
                placeholder="Nota de preço (ex: ou 12x sem juros)"
                value={courseForm.priceNote}
                onChange={(e) => setCourseForm({ ...courseForm, priceNote: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleUpdateCourse} className="flex-1">
                  <Check size={16} className="mr-2" />
                  Salvar
                </Button>
                <Button onClick={() => setEditingCourse(false)} variant="outline" className="flex-1">
                  <X size={16} className="mr-2" />
                  Cancelar
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="font-semibold">{course.title}</p>
                <p className="text-sm text-gray-600">{course.description}</p>
              </div>
              <Button onClick={() => setEditingCourse(true)} className="w-full">
                <Edit2 size={16} className="mr-2" />
                Editar
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* FEATURES */}
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo do Curso (Features)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Input
              placeholder="Título da feature"
              value={newFeature.title}
              onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
            />
            <Textarea
              placeholder="Descrição"
              value={newFeature.description}
              onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
            />
            <Button onClick={handleAddFeature} className="w-full">
              <Plus size={18} className="mr-2" />
              Adicionar Feature
            </Button>
          </div>

          <div className="space-y-2">
            {course.features?.map((feature) => (
              <Card key={feature.id} className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{feature.title}</p>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFeature(feature.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* HIGHLIGHTS */}
      <Card>
        <CardHeader>
          <CardTitle>Destaques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Novo destaque"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddHighlight()}
            />
            <Button onClick={handleAddHighlight}>
              <Plus size={18} />
            </Button>
          </div>

          <div className="space-y-2">
            {course.highlights?.map((highlight) => (
              <Card key={highlight.id} className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">{highlight.text}</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteHighlight(highlight.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* EXTRA INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Extras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Nova informação"
              value={newExtraInfo}
              onChange={(e) => setNewExtraInfo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddExtraInfo()}
            />
            <Button onClick={handleAddExtraInfo}>
              <Plus size={18} />
            </Button>
          </div>

          <div className="space-y-2">
            {course.extraInfo?.map((info) => (
              <Card key={info.id} className="bg-gray-50">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm">{info.text}</p>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteExtraInfo(info.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
