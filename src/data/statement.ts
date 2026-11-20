/**
 * How to get the statement out of the Revolut app. Written once here and shown on the landing page,
 * the FAQ, the download page and the guide, so a change in Revolut's menus is a change in one place.
 */

/** What to tap, in order, from the Revolut app's home screen. */
export const REVOLUT_PATH = ['Invest', 'More', 'Documents', 'Brokerage account', 'Account statement'];

/** The same path on one line: "Invest › More › … › Account statement". */
export const REVOLUT_PATH_TEXT = REVOLUT_PATH.join(' › ');

/** What to choose on the statement screen. */
export const STATEMENT_CHOICES = [
  { label: 'Format', value: 'CSV' },
  { label: 'Date range', value: 'All time' },
];

export const STATEMENT_TRANSFER_TIP = 'Get the file onto your computer, for example by emailing it to yourself.';
