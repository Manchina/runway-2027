import { describe, expect, it } from 'vitest';
import { SYLLABUS_DSA_PROBLEMS, TOTAL_DSA_PROBLEMS } from '../data/initialDsaCurriculum';

describe('NeetCode 150 IST schedule', () => {
  it('contains the complete 150-problem curriculum', () => {
    expect(TOTAL_DSA_PROBLEMS).toBe(150);
    expect(SYLLABUS_DSA_PROBLEMS).toHaveLength(150);
    expect(new Set(SYLLABUS_DSA_PROBLEMS.map((problem) => problem.leetcodeNumber)).size).toBe(150);
  });

  it('schedules every problem at 9:00 AM IST through December 31, 2026', () => {
    const dates = SYLLABUS_DSA_PROBLEMS.map((problem) => new Date(problem.scheduledDate));
    expect(dates[0].toISOString()).toBe('2026-09-14T03:30:00.000Z');
    expect(dates.at(-1)?.toISOString()).toBe('2026-12-31T03:30:00.000Z');
    expect(dates.every((date) => date.getUTCHours() === 3 && date.getUTCMinutes() === 30)).toBe(true);
    expect(dates.every((date, index) => index === 0 || date >= dates[index - 1])).toBe(true);
  });
});
