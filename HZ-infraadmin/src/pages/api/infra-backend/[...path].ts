import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND = (process.env.INFRA_BACKEND_URL || 'http://localhost:4001').replace(/\/$/, '');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join('/') : String(segments ?? '');
  const qs = req.url?.includes('?') ? '?' + req.url.split('?')[1] : '';
  const url = `${BACKEND}/${path}${qs}`;

  const isGet = req.method === 'GET' || req.method === 'HEAD';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization as string;
  }

  let body: string | undefined;
  if (!isGet && req.body !== undefined) {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const ct = upstream.headers.get('content-type') ?? '';
    res.status(upstream.status);

    if (ct.includes('application/json')) {
      try {
        res.json(await upstream.json());
      } catch {
        res.json({ error: 'Invalid JSON from backend' });
      }
    } else {
      res.send(await upstream.text());
    }
  } catch (err) {
    res.status(502).json({ error: 'Backend unreachable', detail: String(err) });
  }
}

export const config = { api: { bodyParser: true } };
