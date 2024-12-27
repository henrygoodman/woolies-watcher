/**
 * Determines whether a product is considered stale based on its last updated timestamp.
 *
 * A product is considered stale if its last updated time is earlier than 5 PM UTC
 * of the most recent applicable day. If the current time is before 5 PM UTC,
 * the cutoff time is set to 5 PM UTC of the previous day. Otherwise, it is set to 5 PM UTC of the current day.
 *
 * @param lastUpdated - A string representing the last updated timestamp of the product (ISO 8601 format).
 * @returns A boolean value: `true` if the product is stale, `false` otherwise.
 *
 * @example
 * const lastUpdated = "2023-12-24T16:00:00Z";
 * const isStale = isStaleProduct(lastUpdated); // true if the current time is after 5 PM UTC on the same day
 */
export const isStaleProduct = (lastUpdated: Date): boolean => {
  // Create a Date object for the current time in UTC
  const now = new Date();

  // Set cutoff time to 5 PM UTC of the current day
  const cutoff = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      17,
      0,
      0,
      0
    )
  );

  // If the current time is earlier than 5 PM UTC, use yesterday's 5 PM UTC as the cutoff
  if (now < cutoff) {
    cutoff.setUTCDate(cutoff.getUTCDate() - 1);
  }

  return new Date(lastUpdated) < cutoff;
};
