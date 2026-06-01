export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);



  const uploadServerHint =
    'Falha de rede: não foi possível contatar o servidor de upload. Inicie a API com "pnpm dev:server" (ou "pnpm dev:all").';

  try {
    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let message = `Falha ao enviar mídia (status ${response.status})`;
      try {
        const json = await response.json();
        if (json && json.error) message = String(json.error);
      } catch (_) {
        // ignore json parse errors
      }
      if (response.status === 413 || /too large|grande/i.test(message)) {
        message = 'O arquivo do vídeo/imagem está grande demais. Tente um arquivo menor.';
      }
      throw new Error(message);
    }

    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      throw new Error('URL da imagem ausente');
    }

    return payload.url;
  } catch (err: any) {
    if (err instanceof TypeError || String(err).includes('Failed to fetch')) {
      throw new Error('Falha de rede: não foi possível contatar o servidor de upload');
    }
    throw err;
  }
}