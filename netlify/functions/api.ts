import { getStore } from '@netlify/blobs';
import serverlessHttp from 'serverless-http';

let proxyHandler: ((event: object, context: object) => Promise<object>) | undefined;

interface NetlifyEvent {
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
  headers?: Record<string, string>;
  body?: string;
}

export async function handler(event: NetlifyEvent, context: object): Promise<object> {
  process.env.NETLIFY_FUNCTION = 'true';

  if (!proxyHandler) {
    const { app } = await import('../../server');
    proxyHandler = serverlessHttp(app, { basePath: '/.netlify/functions/api' });
  }

  const { getDBSnapshot, restoreDBSnapshot } = await import('../../server');
  const store = getStore('minikitchen-data', { consistency: 'strong' });
  const storedSnapshot = await store.getWithMetadata('db.json', {
    type: 'text',
    consistency: 'strong',
  });
  if (storedSnapshot !== null) {
    restoreDBSnapshot(storedSnapshot.data);
  }

  const response = await proxyHandler(event, context) as NetlifyResponse;
  const method = (event.httpMethod || event.method || event.requestContext?.http?.method || '').toUpperCase();
  const requestPath = event.path || event.rawUrl || event.requestContext?.http?.path || '';
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    && !requestPath.endsWith('/admin/login')
    && !requestPath.endsWith('/reservations/check');

  if (isMutation && response.statusCode !== undefined && response.statusCode < 400) {
    const databaseSnapshot = getDBSnapshot();
    const writeOptions = storedSnapshot
      ? storedSnapshot.etag
        ? { onlyIfMatch: storedSnapshot.etag }
        : null
      : { onlyIfNew: true };

    if (writeOptions === null) {
      throw new Error('Stored database snapshot is missing its ETag.');
    }

    const write = await store.set('db.json', databaseSnapshot, writeOptions);

    if (!write.modified) {
      return {
        ...response,
        statusCode: 503,
        headers: {
          ...response.headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'The data changed during this request. Please retry.' }),
      };
    }
  }

  return response;
}
