import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeroBackgroundType } from '../data/siteConfig';

type HeroBackgroundProps = {
  type: HeroBackgroundType;
  url: string;
};

export function HeroBackground({ type, url }: HeroBackgroundProps) {
  const [videoErrored, setVideoErrored] = useState(false);

  const fallback = (
    <div className="relative h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_35%),linear-gradient(180deg,_#0c0c0c,_#000000)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%,rgba(255,255,255,0.03),transparent_70%)] opacity-60" />
    </div>
  );

  if (!url) {
    return fallback;
  }

  if (type === 'video' && !videoErrored) {
    return (
      <div className="relative h-full w-full">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={url}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          style={{ filter: 'brightness(0.6) contrast(1.08) saturate(0.95)' }}
          onError={() => setVideoErrored(true)}
        />

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.18),_transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.28),transparent)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {fallback}
      <ImageWithFallback
        src={url}
        alt="Tattoo Studio Background"
        className="absolute inset-0 h-full w-full object-cover opacity-15"
      />
    </div>
  );
}
