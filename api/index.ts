import type { IncomingMessage, ServerResponse } from 'node:http';

import { createApp } from '../src/bootstrap';

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * The Vercel entry point. vercel.json rewrites every path here.
 *
 * Two things matter in a serverless function:
 *
 *  1. We never call listen(). Vercel owns the socket; we only hand it the
 *     Express instance Nest built, which is itself a (req, res) handler.
 *  2. We cache the *promise*, not the app. A cold start can receive two
 *     requests at once, and awaiting the same promise twice bootstraps Nest
 *     once instead of racing two copies of it into the same container.
 */
let handlerPromise: Promise<NodeHandler> | undefined;

function getHandler(): Promise<NodeHandler> {
  handlerPromise ??= createApp().then(async (app) => {
    await app.init();
    return app.getHttpAdapter().getInstance() as NodeHandler;
  });

  return handlerPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const express = await getHandler();
  express(req, res);
}
