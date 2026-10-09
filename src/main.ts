import { Logger } from '@nestjs/common';

import { createApp } from './bootstrap';

/**
 * Local development only. On Vercel nothing calls this file — see api/index.ts.
 *
 * Port 3001, because the frontend pins 3000 in its vite.config.js.
 */
async function main(): Promise<void> {
  const port = Number(process.env.PORT ?? 3001);
  const app = await createApp();

  await app.listen(port);

  const logger = new Logger('main');
  logger.log(`Content:  http://localhost:${port}/content`);
  logger.log(`Swagger:  http://localhost:${port}/docs`);
  logger.log(`OpenAPI:  http://localhost:${port}/docs/openapi.json`);
}

void main();
