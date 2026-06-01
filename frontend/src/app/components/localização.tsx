import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

type OpeningHour = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  note: string | null;
  isClosed: boolean;
};

type LocationInfo = {
  name?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  mapEmbedUrl?: string | null;
  reference?: string | null;
  parkingInfo?: string | null;
  openingHours?: OpeningHour[];
};

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const formatAddress = (location: LocationInfo) => {
  const line1 = location.addressLine1 || '';
  const line2 = location.addressLine2 || '';
  const city = location.city || '';
  const state = location.state || '';
  const country = location.country || '';
  const postal = location.postalCode || '';

  const lines = [
    [line1, line2].filter(Boolean).join(' '),
    [city, state].filter(Boolean).join(' / '),
    postal,
    country,
  ].filter((value) => value && value.trim().length > 0);

  return lines;
};

export function MapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLocation = async () => {
      try {
        const response = await fetch('/api/location');
        if (!response.ok) {
          throw new Error('Falha ao carregar localizacao');
        }
        const data = (await response.json()) as LocationInfo | null;
        if (isMounted) {
          setLocation(data);
        }
      } catch (error) {
        console.error('Erro ao carregar localizacao', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && !location) {
    return null;
  }

  const addressLines = location ? formatAddress(location) : [];
  const reference = location?.reference?.trim();
  const parkingInfo = location?.parkingInfo?.trim();
  const openingHours = location?.openingHours || [];

  return (
    <section id="localizacao" ref={ref} className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin size={40} className="text-neutral-100" />
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-100 tracking-wide">
              NOSSA LOCALIZACAO
            </h2>
          </div>
          <p className="text-neutral-400 text-lg">
            Venha nos visitar e conhecer nosso estudio
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {location?.mapEmbedUrl ? (
            <div className="aspect-video w-full bg-neutral-700 relative">
              <iframe
                src={location.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localizacao"
              ></iframe>
            </div>
          ) : null}

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {addressLines.length > 0 ? (
                <div className="text-center">
                  <div className="bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-neutral-100" size={28} />
                  </div>
                  <h3 className="text-neutral-100 font-semibold mb-2">Endereco</h3>
                  <p className="text-neutral-400 text-sm">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              ) : null}

              {reference ? (
                <div className="text-center">
                  <div className="bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📍</span>
                  </div>
                  <h3 className="text-neutral-100 font-semibold mb-2">Referencia</h3>
                  <p className="text-neutral-400 text-sm">{reference}</p>
                </div>
              ) : null}

              {parkingInfo ? (
                <div className="text-center">
                  <div className="bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🅿️</span>
                  </div>
                  <h3 className="text-neutral-100 font-semibold mb-2">Estacionamento</h3>
                  <p className="text-neutral-400 text-sm">{parkingInfo}</p>
                </div>
              ) : null}
            </div>

            {openingHours.length > 0 ? (
              <div className="mt-10 grid gap-2 text-sm text-neutral-400">
                {openingHours.map((item) => {
                  const label = dayLabels[item.dayOfWeek] || 'Dia';
                  const hours = item.isClosed
                    ? 'Fechado'
                    : `${item.opensAt || ''} - ${item.closesAt || ''}`.trim();
                  return (
                    <div key={`${label}-${item.opensAt}-${item.closesAt}`} className="flex justify-between">
                      <span className="text-neutral-300">{label}</span>
                      <span>{item.note ? `${hours} (${item.note})` : hours}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
