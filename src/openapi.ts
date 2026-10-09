import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createApp, createOpenApiDocument } from './bootstrap';

/**
 * Writes openapi.json to the project root: `pnpm openapi`.
 *
 * Point a generator at that file and the frontend gets its TypeScript types
 * for free, from the same source as the documentation:
 *
 *     pnpm dlx openapi-typescript openapi.json -o src/types/content.d.ts
 */
async function main(): Promise<void> {
  const app = await createApp();
  const target = resolve(process.cwd(), 'openapi.json');

  writeFileSync(target, `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`);
  await app.close();

  console.log(`Wrote ${target}`);
}

void main();
