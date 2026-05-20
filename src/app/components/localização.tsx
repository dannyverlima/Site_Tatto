import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { MapPin } from 'lucide-react';

export function MapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="localizacao" ref={ref} className="py-20 px-4 bg-neutral-900">
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
              NOSSA LOCALIZAÇÃO
            </h2>
          </div>
          <p className="text-neutral-400 text-lg">
            Venha nos visitar e conhecer nosso estúdio
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Google Maps Embed - Placeholder */}
          <div className="aspect-video w-full bg-neutral-700 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3112.8668937741866!2d-9.142685484622823!3d38.71667997959621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd19338b0b8c6b51%3A0x5a3f5a5a5a5a5a5a!2sLisboa%2C%20Portugal!5e0!3m2!1spt-PT!2spt!4v1234567890123!5m2!1spt-PT!2spt"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Studios Tatto Location"
            ></iframe>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-neutral-100" size={28} />
                </div>
                <h3 className="text-neutral-100 font-semibold mb-2">Endereço</h3>
                <p className="text-neutral-400 text-sm">
                  Rua das Artes, 123<br />
                  1200-001 Lisboa, Portugal
                </p>
              </div>

              <div className="text-center">
                <div className="bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚇</span>
                </div>
                <h3 className="text-neutral-100 font-semibold mb-2">Transporte</h3>
                <p className="text-neutral-400 text-sm">
                  Metro: Linha Azul<br />
                  Paragem: Baixa-Chiado
                </p>
              </div>

              <div className="text-center">
                <div className="bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🅿️</span>
                </div>
                <h3 className="text-neutral-100 font-semibold mb-2">Estacionamento</h3>
                <p className="text-neutral-400 text-sm">
                  Parque próximo<br />
                  Vaga na rua disponível
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
