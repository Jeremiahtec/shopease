import { describe, it, expect } from 'vitest';
import { parseApiDate, timeAgo, money, initials } from '../lib/format';

describe('format helpers', () => {
  it('reads API timestamps without a zone as UTC', () => {
    expect(parseApiDate('2026-10-03T10:00:00').toISOString()).toBe('2026-10-03T10:00:00.000Z');
    expect(parseApiDate('2026-10-03T10:00:00.123456').toISOString()).toBe('2026-10-03T10:00:00.123Z');
  });

  it('leaves timestamps that already carry a zone alone', () => {
    expect(parseApiDate('2026-10-03T10:00:00Z').toISOString()).toBe('2026-10-03T10:00:00.000Z');
    expect(parseApiDate('2026-10-03T11:00:00+01:00').toISOString()).toBe('2026-10-03T10:00:00.000Z');
  });

  it('describes recent times in words', () => {
    const minutesAgo = (m) => new Date(Date.now() - m * 60_000).toISOString().replace('Z', '');
    expect(timeAgo(minutesAgo(0))).toBe('Just now');
    expect(timeAgo(minutesAgo(5))).toBe('5 min ago');
    expect(timeAgo(minutesAgo(120))).toBe('2 hr ago');
  });

  it('formats naira and initials', () => {
    expect(money(125000)).toContain('125,000');
    expect(initials('Jerry Sells')).toBe('JS');
  });
});
