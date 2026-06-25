import React, { useEffect, useRef, useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      // rootMargin pre-loads images 200px before they enter the viewport
      { threshold: 0, rootMargin: '200px' },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const { src, alt, style, className, ...rest } = props

  const revealClass = visible
    ? 'opacity-100 translate-y-0 transition-all duration-700 ease-out'
    : 'opacity-0 translate-y-6'

  return (
    <div ref={ref} className={`w-full ${revealClass} ${className ?? ''}`} style={style}>
      {didError ? (
        <div className="flex items-center justify-center w-full h-full min-h-[80px] bg-neutral-900">
          <img src={ERROR_IMG_SRC} alt="Imagem indisponível" />
        </div>
      ) : visible ? (
        // Only render <img> after the element enters the viewport.
        // Previously, src={undefined} was set when not visible, which caused Firefox
        // and Safari to fire onError immediately, permanently breaking the image.
        <img
          src={src}
          alt={alt}
          decoding="async"
          className="w-full h-full object-cover"
          {...rest}
          onError={() => setDidError(true)}
        />
      ) : (
        <span className="block w-full h-full min-h-[inherit] bg-neutral-900" aria-hidden="true" />
      )}
    </div>
  )
}
