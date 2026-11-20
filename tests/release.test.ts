import { describe, expect, it } from 'vitest';
import release from './fixtures/latest-release.json';
import { detectOs, formatSize, parseRelease, primaryPlatform, RELEASES_PAGE } from '../src/utils/release';

const UA = {
  windows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
};

describe('the download offered first follows the visitor’s system', () => {
  it('offers the Windows installer on Windows', () => {
    expect(detectOs(UA.windows, 'Win32')).toBe('windows');
    expect(primaryPlatform('windows')).toBe('windows');
  });

  it('offers the Apple Silicon Mac app first on a Mac', () => {
    expect(detectOs(UA.mac, 'MacIntel')).toBe('mac');
    expect(primaryPlatform('mac')).toBe('mac-arm');
  });

  it('offers the Linux download on Linux', () => {
    expect(detectOs(UA.linux, 'Linux x86_64')).toBe('linux');
    expect(primaryPlatform('linux')).toBe('linux');
  });

  it('offers no download on phones and tablets, which mention Mac or Linux too', () => {
    expect(detectOs(UA.iphone, 'iPhone')).toBe('mobile');
    expect(detectOs(UA.android, 'Linux armv8l')).toBe('mobile');
    expect(detectOs(UA.mac, 'MacIntel', 5)).toBe('mobile'); // an iPad asking for the desktop page
    expect(primaryPlatform('mobile')).toBeNull();
  });

  it('offers no particular download when the system is unknown', () => {
    expect(detectOs('', '')).toBe('unknown');
    expect(primaryPlatform('unknown')).toBeNull();
  });
});

describe('the buttons point at the newest release’s own files', () => {
  const latest = parseRelease(release);

  it('finds each installer by the end of its name', () => {
    expect(latest.version).toBe('1.2.0');
    expect(latest.downloads.windows?.url).toBe(
      'https://github.com/TiDeane/Statement-Portfolio-Tracker/releases/download/v1.2.0/StatementPortfolioTracker-1.2.0-windows-x64-setup.exe'
    );
    expect(latest.downloads['mac-arm']?.fileName).toMatch(/-macos-apple-silicon\.dmg$/);
    expect(latest.downloads['mac-intel']?.fileName).toMatch(/-macos-intel\.dmg$/);
    expect(latest.downloads.linux?.fileName).toMatch(/-linux-x64\.tar\.gz$/);
  });

  it('leaves out an installer the release does not have', () => {
    const windowsOnly = { ...release, assets: release.assets.filter((a) => a.name.endsWith('.exe')) };
    expect(Object.keys(parseRelease(windowsOnly).downloads)).toEqual(['windows']);
  });

  it('shows sizes in whole megabytes', () => {
    expect(formatSize(22_290_999)).toBe('22 MB');
    expect(formatSize(1)).toBe('1 MB');
  });

  it('falls back to the releases page', () => {
    expect(RELEASES_PAGE).toBe('https://github.com/TiDeane/Statement-Portfolio-Tracker/releases/latest');
  });
});
