import 'reflect-metadata';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

/**
 * Swagger UI ships as a folder of static files inside node_modules. A normal
 * server can serve them off disk; a Vercel function cannot, because only the
 * traced JavaScript ends up in the bundle. So we point the UI at a CDN and
 * keep /docs working identically in both places.
 */
const SWAGGER_CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';

/**
 * Which base URLs the "Try it out" button is allowed to call.
 *
 * A relative '/' resolves against whatever origin is serving the docs:
 * localhost under `pnpm dev`, the vercel.app domain in production. It goes
 * first because Swagger UI picks the first entry by default — a hardcoded
 * absolute URL here is how the deployed docs ended up trying to fetch the
 * reader's own machine over http from an https page.
 *
 * VERCEL and VERCEL_PROJECT_PRODUCTION_URL are set by Vercel itself. Neither
 * is a secret, and this API has none: it is public and read-only.
 */
function apiServers(): { url: string; description: string }[] {
  const servers = [{ url: '/', description: 'This deployment' }];

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) {
    servers.push({ url: `https://${productionUrl}`, description: 'Production' });
  }

  // Only offer localhost where it can actually answer. Listing it in the
  // deployed dropdown is just an invitation to hit this bug again.
  if (!process.env.VERCEL) {
    servers.push({ url: 'http://localhost:8080', description: 'Local development' });
  }

  return servers;
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const builder = new DocumentBuilder()
    .setTitle('STØY / 26 content API')
    .setDescription(
      [
        'Read-only content for the STØY / 26 poster site.',
        '',
        'Everything the page renders comes from here, so no component contains copy.',
        '`GET /content` returns the whole document; `GET /content/{section}` returns one slice.',
        '',
        'The schemas below *are* the contract from issue #26. If a key is missing here,',
        'it does not exist — do not read it in a component.',
      ].join('\n'),
    )
    .setVersion('0.1.0')
    .addTag('content', 'The poster content, as agreed in issue #26');

  for (const server of apiServers()) {
    builder.addServer(server.url, server.description);
  }

  return SwaggerModule.createDocument(app, builder.build());
}

/**
 * Builds the application without starting a server.
 *
 * Both entry points use this: `src/main.ts` calls listen() on it for local
 * development, and `api/index.ts` hands the underlying Express instance to
 * Vercel. Keeping it in one place means the deployed API cannot drift from
 * the one you tested locally.
 */
export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  // The frontend runs on :3000 in dev and on some vercel.app domain in prod.
  // The content is public and read-only, so reflecting the caller's origin
  // costs us nothing — there is no cookie and no session to protect.
  app.enableCors({ origin: true, methods: ['GET', 'HEAD', 'OPTIONS'], maxAge: 86400 });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  SwaggerModule.setup('docs', app, createOpenApiDocument(app), {
    customSiteTitle: 'STØY / 26 content API',
    jsonDocumentUrl: 'docs/openapi.json',
    customCssUrl: `${SWAGGER_CDN}/swagger-ui.css`,
    customJs: [`${SWAGGER_CDN}/swagger-ui-bundle.js`, `${SWAGGER_CDN}/swagger-ui-standalone-preset.js`],
  });

  return app;
}
