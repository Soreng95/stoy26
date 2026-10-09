/**
 * Runtime checks for the things TypeScript cannot see in a .json import.
 *
 * Importing JSON widens every string to `string` and every number to
 * `number`, so a literal union, an integer, or a parseable timestamp cannot
 * be guaranteed by `satisfies` alone. These run once at startup and throw
 * with the path to the offending key, which turns a silent "why is the price
 * blank" bug into a server that refuses to boot.
 */

const WHERE = 'stoy26.json';

/** Narrows a string from the content file into one of a fixed set of values. */
export function oneOf<T extends readonly string[]>(allowed: T, value: string, where: string): T[number] {
  if ((allowed as readonly string[]).includes(value)) {
    return value as T[number];
  }

  throw new Error(`${WHERE}: ${where} is "${value}". Expected one of: ${allowed.join(', ')}.`);
}

/** A count or an amount in minor units: integer, not negative, not NaN. */
export function wholeNumber(value: number, where: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${WHERE}: ${where} is ${value}. Expected a whole number of 0 or more.`);
  }

  return value;
}

/** An ISO 8601 date (YYYY-MM-DD) the browser will actually parse. */
export function isoDate(value: string, where: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(`${WHERE}: ${where} is "${value}". Expected an ISO date, e.g. 2026-10-17.`);
  }

  return value;
}

/**
 * An ISO 8601 timestamp *with* an offset.
 *
 * The offset is not optional on purpose. `2026-10-17T23:15:00` with no zone
 * is read as local time by every browser, so the same stage time renders an
 * hour apart for a reader in Oslo and one in London.
 */
export function isoTimestamp(value: string, where: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(
      `${WHERE}: ${where} is "${value}". Expected an ISO timestamp with an offset, e.g. 2026-10-17T23:15:00+02:00.`,
    );
  }

  return value;
}
