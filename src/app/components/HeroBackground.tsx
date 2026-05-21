import { ImageWithFallback } from './figma/ImageWithFallback';
import { HeroBackgroundType } from '../data/siteConfig';

type HeroBackgroundProps = {
  type: HeroBackgroundType;
  url: string;
};

export function HeroBackground({ type, url }: HeroBackgroundProps) {
  if (!url) {
    return <div className="w-full h-full bg-neutral-950" />;
  }

  if (type === 'video') {
    return (
      <video
        className="w-full h-full object-cover opacity-20"
        src={url}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  return (
    <ImageWithFallback
      src={url}
      alt="Tattoo Studio Background"
      className="w-full h-full object-cover opacity-15"
    />
  );
}
