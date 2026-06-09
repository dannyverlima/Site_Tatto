import { useEffect, useState } from 'react';

export type SpecialistRecord = {
  id?: string | number;
  name: string;
  specialty: string;
  description: string;
  imageUrl?: string;
  image?: string;
  experience?: string;
  instagram?: string;
  whatsapp?: string;
};

export const useSpecialists = () => {
  const [specialists, setSpecialists] = useState<SpecialistRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await fetch('/api/specialists');
        const data = await response.json();
        if (isMounted) {
          setSpecialists(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setSpecialists([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener('specialists-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('specialists-updated', handleUpdate);
    };
  }, []);

  return { specialists, loading, setSpecialists };
};
