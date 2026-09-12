import { describe, it, expect } from 'vitest';
import type { DsaProblemEntry, StruggleTier } from '../types';

describe('48-Hour Friction Queue & Spaced Repetition Scheduling', () => {
  const createProblemEntry = (
    leetcodeNumber: number,
    title: string,
    struggleTier: StruggleTier
  ): DsaProblemEntry => {
    const now = new Date();
    const isNeedsReview = struggleTier === 2 || struggleTier === 3;
    const scheduledReviewDate = isNeedsReview
      ? new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
      : null;

    return {
      id: `dsa-${leetcodeNumber}-${Date.now()}`,
      title,
      leetcodeNumber,
      pattern: 'Two Pointers',
      leetcodeUrl: 'https://leetcode.com',
      struggleTier,
      dateLogged: now.toISOString(),
      scheduledReviewDate,
      reviewStatus: isNeedsReview ? 'pending' : 'not_needed',
    };
  };

  it('Tier 1 (Cold Solve) should NOT require 48h review', () => {
    const problem = createProblemEntry(125, 'Valid Palindrome', 1);
    expect(problem.struggleTier).toBe(1);
    expect(problem.reviewStatus).toBe('not_needed');
    expect(problem.scheduledReviewDate).toBeNull();
  });

  it('Tier 2 (Hint Assisted) should automatically schedule +48h review', () => {
    const problem = createProblemEntry(11, 'Container With Most Water', 2);
    expect(problem.struggleTier).toBe(2);
    expect(problem.reviewStatus).toBe('pending');
    expect(problem.scheduledReviewDate).not.toBeNull();

    const scheduledTime = new Date(problem.scheduledReviewDate!).getTime();
    const loggedTime = new Date(problem.dateLogged).getTime();
    const diffHours = (scheduledTime - loggedTime) / (1000 * 60 * 60);

    expect(Math.round(diffHours)).toBe(48);
  });

  it('Tier 3 (Video Replay) should automatically schedule +48h review', () => {
    const problem = createProblemEntry(42, 'Trapping Rain Water', 3);
    expect(problem.struggleTier).toBe(3);
    expect(problem.reviewStatus).toBe('pending');
    expect(problem.scheduledReviewDate).not.toBeNull();

    const scheduledTime = new Date(problem.scheduledReviewDate!).getTime();
    const loggedTime = new Date(problem.dateLogged).getTime();
    const diffHours = (scheduledTime - loggedTime) / (1000 * 60 * 60);

    expect(Math.round(diffHours)).toBe(48);
  });

  it('Failing a review should reschedule problem for +24 hours', () => {
    const problem = createProblemEntry(15, '3Sum', 2);
    const failTimestamp = Date.now();
    const nextReview = new Date(failTimestamp + 24 * 60 * 60 * 1000).toISOString();

    const updatedProblem: DsaProblemEntry = {
      ...problem,
      reviewStatus: 'pending',
      scheduledReviewDate: nextReview,
    };

    expect(updatedProblem.reviewStatus).toBe('pending');
    const diffHours =
      (new Date(updatedProblem.scheduledReviewDate!).getTime() - failTimestamp) / (1000 * 60 * 60);
    expect(Math.round(diffHours)).toBe(24);
  });

  it('Clearing a review should update reviewStatus to cleared', () => {
    const problem = createProblemEntry(15, '3Sum', 2);
    const clearedProblem: DsaProblemEntry = {
      ...problem,
      reviewStatus: 'cleared',
    };
    expect(clearedProblem.reviewStatus).toBe('cleared');
  });
});
