/**
 * Fills in the download buttons. The page is built with every button pointing at the releases page,
 * so it works without this script; here we
 *  1. mark <html data-os="..."> so CSS shows the button for the visitor's system, and
 *  2. ask GitHub for the newest release and point each button straight at its installer.
 *
 * Markup it looks for:
 *  - [data-asset="windows|mac-arm|mac-intel|linux"]: a link to that installer
 *  - [data-asset-size="..."]: that installer's size
 *  - [data-release-version], [data-release-date]: the newest version and its date
 */
import {
  detectOs,
  formatDate,
  formatSize,
  LATEST_RELEASE_API,
  parseRelease,
  type GithubRelease,
  type LatestRelease,
  type Platform,
} from '~/utils/release';

const CACHE_KEY = 'latestRelease';

interface NavigatorUAData {
  platform?: string;
}

function markOs(): void {
  const uaData = (navigator as Navigator & { userAgentData?: NavigatorUAData }).userAgentData;
  const os = detectOs(navigator.userAgent, uaData?.platform || navigator.platform || '', navigator.maxTouchPoints);
  document.documentElement.dataset.os = os;
}

function cached(): LatestRelease | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as LatestRelease) : null;
  } catch {
    return null; // storage blocked or the copy is unreadable: ask GitHub again
  }
}

async function fetchLatest(): Promise<LatestRelease | null> {
  const known = cached();
  if (known) return known;
  try {
    const response = await fetch(LATEST_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) return null;
    const latest = parseRelease((await response.json()) as GithubRelease);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(latest));
    } catch {
      // storage blocked: the next page asks GitHub again, which is fine
    }
    return latest;
  } catch {
    return null; // offline or GitHub unreachable: the buttons keep pointing at the releases page
  }
}

function apply(latest: LatestRelease): void {
  document.querySelectorAll<HTMLAnchorElement>('[data-asset]').forEach((link) => {
    const download = latest.downloads[link.dataset.asset as Platform];
    if (download) link.href = download.url;
  });
  document.querySelectorAll<HTMLElement>('[data-asset-size]').forEach((el) => {
    const download = latest.downloads[el.dataset.assetSize as Platform];
    if (download) el.textContent = formatSize(download.size);
  });
  document.querySelectorAll<HTMLElement>('[data-release-version]').forEach((el) => {
    el.textContent = latest.version;
  });
  document.querySelectorAll<HTMLElement>('[data-release-date]').forEach((el) => {
    el.textContent = formatDate(latest.publishedAt);
  });
  document.documentElement.dataset.release = 'known';
}

markOs();
fetchLatest().then((latest) => latest && apply(latest));
