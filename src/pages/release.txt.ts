import type { APIRoute } from 'astro';
import { releaseAtBuild } from '../utils/release';

/**
 * `/release.txt`: the app version the pages were built with (empty if GitHub could not be reached then). The
 * weekly deploy compares it with GitHub's newest release, and rebuilds only when they differ
 * (.github/workflows/deploy.yml).
 */
export const GET: APIRoute = async () => {
  const latest = await releaseAtBuild();
  return new Response(`${latest?.version ?? ''}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
