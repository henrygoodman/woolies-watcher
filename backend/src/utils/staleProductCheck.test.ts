import { isStaleProduct } from '@/utils/staleProductCheck';
import { CUTOFF_HOUR_UTC } from '@/constants/sync';

describe('isStaleProduct', () => {
  it('returns true if last updated is before the cutoff on the same day', () => {
    const mockNow = new Date(Date.UTC(2024, 11, 30, CUTOFF_HOUR_UTC + 1));
    jest.useFakeTimers().setSystemTime(mockNow);

    const lastUpdated = new Date(Date.UTC(2024, 11, 29, CUTOFF_HOUR_UTC - 1));
    expect(isStaleProduct(lastUpdated)).toBe(true);
  });

  it('returns false if last updated is after the cutoff on the same day', () => {
    const mockNow = new Date(Date.UTC(2024, 11, 30, CUTOFF_HOUR_UTC + 1));
    jest.useFakeTimers().setSystemTime(mockNow);

    const lastUpdated = new Date(Date.UTC(2024, 11, 30, CUTOFF_HOUR_UTC + 1));
    expect(isStaleProduct(lastUpdated)).toBe(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });
});
