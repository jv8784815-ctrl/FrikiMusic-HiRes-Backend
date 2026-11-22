import { searchAll, resolveStream, health } from '../lib/router.js';

const MANIFEST = {
  id: 'dev.frikimusic.hires',
  name: 'FrikiMusic Hi-Res',
  version: '1.0.0',
  description: 'Motor de búsqueda y resolución de audio FLAC multi-fuente para FrikiMusic.',
  resources: ['search', 'stream'],
  bitchordAuth: false,
  allowDownloads: 1,
  settings: [
    {
      key: 'quality',
      type: 'select',
      default: 'lossless',
      options: [
        { label: 'Lossless / Hi-Res cuando esté disponible', value: 'lossless' },
        { label: 'Alta calidad', value: 'high' },
        { label: 'Ahorro de datos', value: 'low' },
      ],
    },
  ],
};

function json(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/api/index.js' || path === '/api/index') {
    const original = url.searchParams.get('path');
    if (original !== null) path = ('/' + original).replace(/\/+$/, '') || '/';
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  if (req.method !== 'GET') {
    return json(res, 405, { error: 'method not allowed' }, { Allow: 'GET, OPTIONS' });
  }

  if (path === '/' || path === '/manifest.json') {
    return json(res, 200, MANIFEST);
  }

  if (path === '/health') {
    try {
      return json(res, 200, await health());
    } catch (err) {
      return json(res, 500, { ok: false, error: String(err?.message || err) });
    }
  }

  if (path === '/search') {
    const query = url.searchParams.get('q') || '';
    if (!query.trim()) return json(res, 200, { tracks: [] });
    try {
      const { tracks, perSource } = await searchAll(query, url.searchParams.get('quality'));
      return json(res, 200, { tracks, perSource });
    } catch (err) {
      return json(res, 200, { tracks: [], error: String(err?.message || err) });
    }
  }

  if (path.startsWith('/stream/')) {
    const id = decodeURIComponent(path.slice('/stream/'.length));
    if (!id) return json(res, 404, { error: 'missing id' });
    try {
      const stream = await resolveStream(id, url.searchParams.get('quality'));
      if (!stream) return json(res, 404, { error: 'not available in this service' });
      return json(res, 200, stream);
    } catch (err) {
      return json(res, 502, { error: String(err?.message || err) });
    }
  }

  return json(res, 404, { error: 'not found' });
}
