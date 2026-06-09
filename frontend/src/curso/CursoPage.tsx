export default function CursoPage() {
  const images = [
    '/curso-images/1.png',
    '/curso-images/2.png',
    '/curso-images/3.png',
    '/curso-images/4.png',
    '/curso-images/5.png',
    '/curso-images/6.png',
    '/curso-images/7.png',
    '/curso-images/8.png',
    '/curso-images/9.png',
    '/curso-images/10.png',
  ];

  return (
    <div className="w-full">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`Secao ${i + 1}`}
          className="w-full block"
          style={{ display: 'block' }}
        />
      ))}
    </div>
  );
}
