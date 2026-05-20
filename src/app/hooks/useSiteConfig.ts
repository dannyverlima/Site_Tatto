import { useEffect, useState } from 'react';
import { defaultSiteConfig, loadSiteConfig, SiteConfig } from '../data/siteConfig';

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);

  useEffect(() => {
    setConfig(loadSiteConfig());

    const handleUpdate = () => {
      setConfig(loadSiteConfig());
    };

    window.addEventListener('site-config-updated', handleUpdate);
    return () => window.removeEventListener('site-config-updated', handleUpdate);
  }, []);

  return { config, setConfig };
};
