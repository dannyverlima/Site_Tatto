export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar imagem');
  }

  const payload = (await response.json()) as { url?: string };
  if (!payload.url) {
    throw new Error('URL da imagem ausente');
  }

  return payload.url;
}