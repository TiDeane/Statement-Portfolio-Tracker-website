/**
 * Which download to offer, and where each one is. Pure functions, no DOM, so they can be tested.
 *
 * The installers are attached to each GitHub release with the version in their name
 * (`StatementPortfolioTracker-1.2.0-windows-x64-setup.exe`), so the page asks GitHub for the
 * newest release and finds each file by the end of its name.
 */

export const REPO = 'TiDeane/Statement-Portfolio-Tracker';
export const LATEST_RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;
/** Where every download button points until (or unless) the newest release is known. */
export const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

export type Platform = 'windows' | 'mac-arm' | 'mac-intel' | 'linux';
export type Os = 'windows' | 'mac' | 'linux' | 'mobile' | 'unknown';

/** The end of each installer's file name, per platform. */
export const ASSET_SUFFIX: Record<Platform, string> = {
  windows: '-windows-x64-setup.exe',
  'mac-arm': '-macos-apple-silicon.dmg',
  'mac-intel': '-macos-intel.dmg',
  linux: '-linux-x64.tar.gz',
};

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface GithubRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  assets: ReleaseAsset[];
}

export interface Download {
  url: string;
  size: number;
  fileName: string;
}

export interface LatestRelease {
  version: string;
  publishedAt: string;
  pageUrl: string;
  downloads: Partial<Record<Platform, Download>>;
}

/**
 * The visitor's system, from what the browser says about itself. Phones and tablets come first,
 * since iPadOS and Android also mention "Mac" and "Linux".
 */
export function detectOs(userAgent: string, platform = '', maxTouchPoints = 0): Os {
  const ua = userAgent.toLowerCase();
  const plat = platform.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/.test(ua)) return 'mobile';
  // iPadOS asks for desktop pages and calls itself a Mac, but has a touch screen.
  if ((plat.includes('mac') || ua.includes('macintosh')) && maxTouchPoints > 1) return 'mobile';
  if (plat.includes('win') || ua.includes('windows')) return 'windows';
  if (plat.includes('mac') || ua.includes('mac os') || ua.includes('macintosh')) return 'mac';
  if (plat.includes('linux') || ua.includes('linux') || ua.includes('x11') || ua.includes('cros')) return 'linux';
  return 'unknown';
}

/** The download to offer first for a system; a Mac gets Apple Silicon first, the most common today. */
export function primaryPlatform(os: Os): Platform | null {
  switch (os) {
    case 'windows':
      return 'windows';
    case 'mac':
      return 'mac-arm';
    case 'linux':
      return 'linux';
    default:
      return null;
  }
}

/** The newest release in the shape the page needs; installers it does not have are left out. */
export function parseRelease(release: GithubRelease): LatestRelease {
  const downloads: LatestRelease['downloads'] = {};
  for (const [platform, suffix] of Object.entries(ASSET_SUFFIX) as [Platform, string][]) {
    const asset = release.assets.find((a) => a.name.endsWith(suffix));
    if (asset) {
      downloads[platform] = { url: asset.browser_download_url, size: asset.size, fileName: asset.name };
    }
  }
  return {
    version: release.tag_name.replace(/^v/, ''),
    publishedAt: release.published_at,
    pageUrl: release.html_url,
    downloads,
  };
}

/** "73 MB": installers are tens of megabytes, so whole megabytes are precise enough. */
export function formatSize(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1_000_000))} MB`;
}

/** "20 Oct 2026", in the visitor's own language. */
export function formatDate(iso: string, locale?: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

let buildRelease: Promise<LatestRelease | null> | undefined;

/**
 * The newest release as it was when the site was built, so the page already has real links and a
 * version before any script runs. The browser asks GitHub again on load, so a release made after the
 * last deploy still shows up. Without a network at build time, the page falls back to the releases page.
 */
export function releaseAtBuild(): Promise<LatestRelease | null> {
  // In CI the workflow's token avoids GitHub's limit on anonymous requests from shared runners.
  const token = typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  buildRelease ??= fetch(LATEST_RELEASE_API, { headers })
    .then(async (response) => (response.ok ? parseRelease((await response.json()) as GithubRelease) : null))
    .catch(() => null);
  return buildRelease;
}

/** Where a button for a platform points: its installer if known, else the releases page. */
export function downloadUrl(latest: LatestRelease | null, platform: Platform): string {
  return latest?.downloads[platform]?.url ?? RELEASES_PAGE;
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  windows: 'Windows',
  'mac-arm': 'macOS (Apple Silicon)',
  'mac-intel': 'macOS (Intel)',
  linux: 'Linux',
};
