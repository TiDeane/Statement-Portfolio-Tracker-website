import type { ImageMetadata } from 'astro';

/**
 * Screenshots, by name. The app's own window is pictured in both themes (`NAME-dark.png`,
 * `NAME-light.png`, made by `scripts/screenshots.py` in the app's repository) and the page shows the
 * one matching its theme; Excel pictures exist once (`NAME.png`, made by `scripts/sheet-pictures.ps1`).
 * A missing picture shows as a labelled placeholder, so pages build without them.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/screenshots/*.png', { eager: true });

const file = (name: string) => files[`../assets/screenshots/${name}.png`]?.default;

export interface Shot {
  dark?: ImageMetadata;
  light?: ImageMetadata;
}

export function shot(name: string): Shot {
  return { dark: file(`${name}-dark`) ?? file(name), light: file(`${name}-light`) ?? file(name) };
}
