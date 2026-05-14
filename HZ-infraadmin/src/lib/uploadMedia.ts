import { getToken } from '@/lib/session';

const publicBase = () =>
  (process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://localhost:4001').replace(/\/$/, '');

/** Multipart upload — direct to API with Bearer from localStorage. */
export async function uploadPropertyImage(file: File): Promise<{ url?: string }> {
  const token = getToken();
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${publicBase()}/upload/property-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error('Image upload failed');
  return res.json();
}

export async function uploadPropertyDocument(file: File): Promise<{ url?: string }> {
  const token = getToken();
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${publicBase()}/upload/property-document`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error('Document upload failed');
  return res.json();
}
