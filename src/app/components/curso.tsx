import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { GraduationCap, Clock, Users, Award } from 'lucide-react';

const courseFeatures = [
  {
    icon: Clock,
    title: 'Duração Flexível',
    description: 'Cursos de 3 a 6 meses',
  },
  {
    icon: Users,
    title: 'Turmas Pequenas',
    description: 'Máximo 8 alunos por turma',
  },
  {
    icon: Award,
    title: 'Certificado',
    description: 'Reconhecido nacionalmente',
  },
  {
    icon: GraduationCap,
    title: 'Prática Intensa',
    description: 'Mais de 200h de prática',
  },
];

export function Course() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="curso" ref={ref} className="py-20 px-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap size={48} className="text-neutral-100" />
            <h2 className="text-4xl md:text-6xl font-bold text-neutral-100 tracking-wide">
              CURSO
            </h2>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Aprenda a arte da tatuagem com profissionais experientes.
            Do básico ao avançado, formamos os melhores tatuadores do mercado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {courseFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-neutral-800 p-8 rounded-lg text-center hover:bg-neutral-700 transition-colors duration-300"
            >
              <feature.icon className="w-12 h-12 text-neutral-100 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-neutral-800 rounded-2xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-neutral-100 mb-4">
                Próxima Turma
              </h3>
              <p className="text-neutral-300 mb-6 text-lg">
                Inscrições abertas para a turma que inicia em Junho 2026
              </p>
              <ul className="space-y-3 text-neutral-400 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Material completo incluído</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Acompanhamento individual</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Suporte pós-formação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Networking com profissionais</span>
                </li>
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-neutral-100 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-200 transition-colors duration-300"
              >
                Solicitar Informações
              </motion.button>
            </div>
            <div className="bg-neutral-700 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-neutral-100 mb-2">
                € 3.500
              </div>
              <p className="text-neutral-400 mb-6">
                ou 12x de € 350 sem juros
              </p>
              <div className="space-y-2 text-neutral-300 text-sm">
                <p>Investimento único</p>
                <p>Parcele no cartão</p>
                <p>Desconto à vista</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
