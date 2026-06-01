import { useEffect, useState } from 'react';
import { defaultSiteConfig, loadSiteConfig, SiteConfig } from '../data/siteConfig';

const SITE_CONFIG_UPDATED_KEY = 'site-config-updated-at';

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

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === SITE_CONFIG_UPDATED_KEY) {
        refreshConfig();
      }
    };

    const broadcastChannel = 'BroadcastChannel' in window ? new BroadcastChannel('site-config') : null;
    const handleBroadcastMessage = () => {
      refreshConfig();
    };

    window.addEventListener('site-config-updated', handleUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    broadcastChannel?.addEventListener('message', handleBroadcastMessage);
    return () => {
      isMounted = false;
      window.removeEventListener('site-config-updated', handleUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
      broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
      broadcastChannel?.close();
    };
  }, []);

  return { config, setConfig };
};
