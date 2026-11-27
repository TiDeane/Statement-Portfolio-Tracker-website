import { afterEach, describe, expect, it, vi } from 'vitest';
import release from './fixtures/latest-release.json';

/** `/release.txt`, built with the pages: the weekly deploy compares it with GitHub's newest release. */
describe('the site says which app version it was built with', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  const built = async () => {
    const { GET } = await import('../src/pages/release.txt');
    return (await GET({} as never)).text();
  };

  it('is the newest release’s version', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(release), { status: 200 }))
    );
    expect(await built()).toBe('1.2.0\n');
  });

  it('is empty when GitHub could not be reached, so the next weekly check builds again', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('offline')))
    );
    expect(await built()).toBe('\n');
  });
});
