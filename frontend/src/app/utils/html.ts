export const normalizeHtml = (value: string) => {
  if (typeof window === 'undefined') {
    return value;
  }

  const decoder = document.createElement('textarea');
  decoder.innerHTML = value;

  const parser = new DOMParser();
  const documentFragment = parser.parseFromString(decoder.value, 'text/html');

  // Remover quaisquer atributos `data-*` que editores como Slate possam deixar
  documentFragment.querySelectorAll('*').forEach((el) => {
    // coletar nomes para evitar live-collection mutation issues
    const attrs = Array.from(el.attributes).map((a) => a.name);
    attrs.forEach((name) => {
      if (name.startsWith('data-')) {
        el.removeAttribute(name);
      }
    });
  });

  // Remover scripts e estilos por segurança
  documentFragment.querySelectorAll('script, style').forEach((element) => element.remove());

  return documentFragment.body.innerHTML;
};