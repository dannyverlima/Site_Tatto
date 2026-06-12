import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Mail, Phone, Globe } from 'lucide-react';
import { toWhatsappLink } from '../utils/formatters';

type SocialLink = {
  id: string;
  platform: string;
  label?: string | null;
  url: string;
};

type ContactInfoItem = {
  id: string;
  kind: string;
  label?: string | null;
  value: string;
  linkUrl?: string | null;
};

type SiteLink = {
  id: string;
  label: string;
  href: string;
};

type SiteSummary = {
  name?: string | null;
  domain?: string | null;
};

const socialIconByPlatform: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  email: Mail,
  whatsapp: Phone,
  website: Globe,
};

const buildContactLink = (info: ContactInfoItem) => {
  if (info.linkUrl) {
    return info.linkUrl;
  }
  if (info.kind === 'phone') {
    return `tel:${info.value}`;
  }
  if (info.kind === 'email') {
    return `mailto:${info.value}`;
  }
  if (info.kind === 'whatsapp') {
    return toWhatsappLink(info.value);
  }
  return null;
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [site, setSite] = useState<SiteSummary>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfoItem[]>([]);
  const [footerLinks, setFooterLinks] = useState<SiteLink[]>([]);
  const [mainWhatsapp, setMainWhatsapp] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFooterData = async () => {
      try {
        const [siteResponse, socialResponse, contactResponse, linkResponse, settingsResponse] = await Promise.all([
          fetch('/api/site'),
          fetch('/api/social-links'),
          fetch('/api/contact-info'),
          fetch('/api/site-links?placement=footer'),
          fetch('/api/site-settings?keys=main_whatsapp'),
        ]);

        if (siteResponse.ok) {
          const data = (await siteResponse.json()) as SiteSummary;
          if (isMounted) {
            setSite(data);
          }
        }

        if (socialResponse.ok) {
          const data = (await socialResponse.json()) as SocialLink[];
          if (isMounted) {
            setSocialLinks(data);
          }
        }

        if (contactResponse.ok) {
          const data = (await contactResponse.json()) as ContactInfoItem[];
          if (isMounted) {
            setContactInfo(data);
          }
        }

        if (linkResponse.ok) {
          const data = (await linkResponse.json()) as SiteLink[];
          if (isMounted) {
            setFooterLinks(data);
          }
        }

        if (settingsResponse.ok) {
          const data = await settingsResponse.json() as Record<string, string>;
          if (isMounted && data.main_whatsapp) {
            setMainWhatsapp(data.main_whatsapp);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do rodape', error);
      }
    };

    loadFooterData();
    return () => {
      isMounted = false;
    };
  }, []);

  const contacts = contactInfo
    .filter((info) => ['phone', 'email', 'address', 'whatsapp'].includes(info.kind))
    .map((info) => info.kind === 'whatsapp' && mainWhatsapp ? { ...info, linkUrl: mainWhatsapp } : info);

  return (
    <footer className="bg-black text-neutral-400 py-10 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="md:col-span-2">
            {site.name ? (
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-100 mb-4 tracking-wider">
                {site.name.toUpperCase()}
              </h3>
            ) : null}
            {site.domain ? (
              <p className="text-sm mb-4 max-w-md">
                {site.domain}
              </p>
            ) : null}
            <div className="flex gap-4">
              {socialLinks.map((link) => {
                const Icon = socialIconByPlatform[link.platform] || Globe;
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    className="bg-neutral-800 p-3 rounded-full hover:bg-neutral-700 transition-colors"
                  >
                    <Icon size={20} className="text-neutral-100" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {footerLinks.length > 0 ? (
            <div>
              <h4 className="text-neutral-100 font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm">
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <a href={link.href} className="hover:text-neutral-100 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {contacts.length > 0 ? (
            <div>
              <h4 className="text-neutral-100 font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                {contacts.map((info) => {
                  const link = buildContactLink(info);
                  return (
                    <li key={info.id}>
                      {link ? (
                        <a href={link} className="hover:text-neutral-100 transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        info.value
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-t border-neutral-800 pt-8 text-center text-sm space-y-2">
          <p>
            © {currentYear} {site.name ? site.name : ''}
          </p>
          <p className="text-neutral-600 text-xs tracking-wider">
            2026 Programer diamonds ✧
          </p>
        </div>
      </div>
    </footer>
  );
}
