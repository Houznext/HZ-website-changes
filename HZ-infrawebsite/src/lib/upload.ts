export async function uploadPropertyPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/infra-backend/upload/property-image', {
    method: 'POST',
    body: formData,
    headers:
      typeof window !== 'undefined' && localStorage.getItem('infra_token')
        ? { Authorization: `Bearer ${localStorage.getItem('infra_token')}` }
        : {},
  });
  if (!res.ok) throw new Error('Upload failed');
  const { url } = (await res.json()) as { url: string | null };
  if (!url) throw new Error('No URL returned');
  return url;
}

export async function uploadPropertyDocument(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/infra-backend/upload/property-document', {
    method: 'POST',
    body: formData,
    headers:
      typeof window !== 'undefined' && localStorage.getItem('infra_token')
        ? { Authorization: `Bearer ${localStorage.getItem('infra_token')}` }
        : {},
  });
  if (!res.ok) throw new Error('Document upload failed');
  const { url } = (await res.json()) as { url: string | null };
  if (!url) throw new Error('No URL returned');
  return url;
}
