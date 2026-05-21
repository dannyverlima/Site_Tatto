import { useEffect, useState } from 'react';
import { defaultSiteConfig, loadSiteConfig, SiteConfig } from '../data/siteConfig';

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig);

  useEffect(() => {
    let isMounted = true;

    const refreshConfig = async () => {
      const nextConfig = await loadSiteConfig();
      if (isMounted) {
        setConfig(nextConfig);
      }
    };

    refreshConfig();

    const handleUpdate = () => {
      refreshConfig();
    };

    window.addEventListener('site-config-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('site-config-updated', handleUpdate);
    };
  }, []);

  return { config, setConfig };
};
