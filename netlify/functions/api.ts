import serverlessHttp from 'serverless-http';

let proxyHandler: ((event: object, context: object) => Promise<object>) | undefined;

export async function handler(event: object, context: object): Promise<object> {
  process.env.NETLIFY_FUNCTION = 'true';

  if (!proxyHandler) {
    const { app } = await import('../../server');
    proxyHandler = serverlessHttp(app, { basePath: '/.netlify/functions/api' });
  }

  return proxyHandler(event, context);
}
