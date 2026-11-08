import { connectLambda, getStore } from '@netlify/blobs';
import serverlessHttp from 'serverless-http';

let proxyHandler: ((event: object, context: object) => Promise<object>) | undefined;

interface NetlifyEvent {
  blobs?: string;
  headers?: Record<string, string>;
  httpMethod?: string;
  method?: string;
  path?: string;
  rawUrl?: string;
  requestContext?: {
    http?: {
      method?: string;
      path?: string;
    };
  };
}

interface NetlifyResponse {
  statusCode?: number;
}

export async function handler(event: NetlifyEvent, context: object): Promise<object> {
  process.env.NETLIFY_FUNCTION = 'true';
  const blobContext = event.blobs
    ? JSON.parse(Buffer.from(event.blobs, 'base64').toString('utf-8')) as { token?: string }
    : null;
  if (event.blobs && event.headers) {
    connectLambda({ blobs: event.blobs, headers: event.headers });
  }

  if (!proxyHandler) {
    const { app } = await import('../../server');
    proxyHandler = serverlessHttp(app, { basePath: '/.netlify/functions/api' });
  }

  const { getDBSnapshot, restoreDBSnapshot } = await import('../../server');
  const siteId = Object.entries(event.headers ?? {})
    .find(([name]) => name.toLowerCase() === 'x-nf-site-id')?.[1];
  const store = blobContext?.token && siteId
    ? getStore({
      name: 'minikitchen-data',
      siteID: siteId,
      token: blobContext.token,
      consistency: 'strong',
    })
    : getStore('minikitchen-data');
  const storedSnapshot = await store.get('db.json', { type: 'text' });
  if (storedSnapshot !== null) {
    restoreDBSnapshot(storedSnapshot);
  }

  const response = await proxyHandler(event, context) as NetlifyResponse;
  const method = (event.httpMethod || event.method || event.requestContext?.http?.method || '').toUpperCase();
  const requestPath = event.path || event.rawUrl || event.requestContext?.http?.path || '';
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    && !requestPath.endsWith('/admin/login')
    && !requestPath.endsWith('/reservations/check');

  if (isMutation && response.statusCode !== undefined && response.statusCode < 400) {
    await store.set('db.json', getDBSnapshot());
  }

  return response;
}
