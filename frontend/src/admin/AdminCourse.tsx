import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../app/components/ui/card';
import { adminHeaders } from './adminAuth';
import { Users } from 'lucide-react';

const cardClassName = 'border-white/10 bg-white/[0.04] text-white shadow-2xl shadow-black/30 backdrop-blur-xl';

type Enrollment = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
};

export function AdminCourse() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const res = await fetch('/api/course-enrollments', { headers: adminHeaders() });
      const data = await res.json();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar inscrições:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <Card className={cardClassName}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users size={20} />
            Inscrições no Curso ({enrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/50 text-sm">Carregando...</p>
          ) : enrollments.length === 0 ? (
            <p className="text-white/50 text-sm">Nenhuma inscrição ainda.</p>
          ) : (
            <div className="space-y-3">
              {enrollments.map((e) => {
                const date = new Date(e.created_at).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                });
                return (
                  <Card key={e.id} className="border-white/10 bg-black/20 text-white shadow-lg shadow-black/20">
                    <CardContent className="pt-4 space-y-1">
                      <p className="font-semibold text-white">{e.name}</p>
                      <p className="text-sm text-white/70">WhatsApp: {e.phone}</p>
                      <p className="text-sm text-white/70">Email: {e.email}</p>
                      {e.message && <p className="text-sm text-white/55">{e.message}</p>}
                      <p className="text-xs text-white/35">{date}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
