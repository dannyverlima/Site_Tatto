import { useEffect, useRef } from 'react';

export function HeroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // iOS Safari checks for the DOM attribute, not just the JS property.
    // React's `muted` JSX prop only sets el.muted (JS property) — it does NOT
    // add the `muted` HTML attribute, so iOS blocks autoplay. setAttribute fixes this.
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');
    el.muted = true;
    el.defaultMuted = true;

    const tryPlay = () => {
      el.play().catch(() => {
        // iOS Low Power Mode blocks even muted autoplay.
        // Fall back to playing on first user touch.
        document.addEventListener(
          'touchstart',
          () => el.play().catch(() => {}),
          { once: true, passive: true },
        );
      });
    };

    if (el.readyState >= 2) {
      tryPlay();
    } else {
      el.addEventListener('canplay', tryPlay, { once: true });
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src="/media/fundo.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{ filter: 'brightness(0.6) contrast(1.08) saturate(0.95)' }}
      />
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.18),_transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.28),transparent)]" />
      </div>
    </div>
  );
}
