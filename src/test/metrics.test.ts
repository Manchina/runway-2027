import { describe, it, expect } from 'vitest';
import type { DsaProblemEntry, HldWeekEntry } from '../types';

describe('Executive Metrics & Quant Readiness Calculations', () => {
  const calculateMetrics = (dsaProblems: DsaProblemEntry[], hldWeeks: HldWeekEntry[]) => {
    const totalDsa = dsaProblems.length;
    const tier1Count = dsaProblems.filter((p) => p.struggleTier === 1).length;
    const tier2Count = dsaProblems.filter((p) => p.struggleTier === 2).length;
    const tier3Count = dsaProblems.filter((p) => p.struggleTier === 3).length;

    const coldSolveRate = totalDsa > 0 ? Math.round((tier1Count / totalDsa) * 100) : 0;
    const dsaProgressPct = Math.round((totalDsa / 150) * 100);

    const hldMastered = hldWeeks.filter((w) => w.status === 'mastered').length;
    const hldDiagrammed = hldWeeks.filter(
      (w) => w.status === 'diagrammed' || w.status === 'mastered'
    ).length;
    const hldProgressPct = Math.round((hldMastered / 16) * 100);

    const nowIso = new Date().toISOString();
    const pendingReviews = dsaProblems.filter((p) => p.reviewStatus === 'pending');
    const overdueCount = pendingReviews.filter(
      (p) => p.scheduledReviewDate && p.scheduledReviewDate <= nowIso
    ).length;

    const rawScore =
      dsaProgressPct * 0.4 + coldSolveRate * 0.3 + (hldDiagrammed / 16) * 100 * 0.3;
    const readinessScore = Math.min(100, Math.max(0, Math.round(rawScore - overdueCount * 2)));

    return {
      totalDsa,
      tier1Count,
      tier2Count,
      tier3Count,
      coldSolveRate,
      dsaProgressPct,
      hldMastered,
      hldDiagrammed,
      hldProgressPct,
      pendingCount: pendingReviews.length,
      overdueCount,
      readinessScore,
    };
  };

  it('should return 0 readiness score when starting with empty data', () => {
    const metrics = calculateMetrics([], []);
    expect(metrics.totalDsa).toBe(0);
    expect(metrics.coldSolveRate).toBe(0);
    expect(metrics.readinessScore).toBe(0);
    expect(metrics.overdueCount).toBe(0);
  });

  it('should correctly compute cold solve rate and weighted readiness index', () => {
    const mockDsa: DsaProblemEntry[] = [
      {
        id: '1',
        title: 'Two Sum',
        leetcodeNumber: 1,
        pattern: 'Arrays & Hashing',
        leetcodeUrl: 'https://leetcode.com',
        struggleTier: 1,
        dateLogged: new Date().toISOString(),
        scheduledReviewDate: null,
        reviewStatus: 'not_needed',
      },
      {
        id: '2',
        title: 'Group Anagrams',
        leetcodeNumber: 49,
        pattern: 'Arrays & Hashing',
        leetcodeUrl: 'https://leetcode.com',
        struggleTier: 2,
        dateLogged: new Date().toISOString(),
        scheduledReviewDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        reviewStatus: 'pending',
      },
    ];

    const mockHld: HldWeekEntry[] = [
      {
        weekNumber: 1,
        chapterTitle: 'Scale From Zero to Millions',
        bookVolume: 1,
        coreConcepts: ['Scale', 'Cache'],
        deliverable: 'Draw diagram',
        status: 'mastered',
        checklist: {
          readingDone: true,
          estimationPracticed: true,
          diagramCompleted: true,
          bottlenecksAudited: true,
        },
      },
      {
        weekNumber: 2,
        chapterTitle: 'Back-of-envelope estimation',
        bookVolume: 1,
        coreConcepts: ['Numbers'],
        deliverable: 'Sizing',
        status: 'diagrammed',
        checklist: {
          readingDone: true,
          estimationPracticed: true,
          diagramCompleted: true,
          bottlenecksAudited: false,
        },
      },
    ];

    const metrics = calculateMetrics(mockDsa, mockHld);

    expect(metrics.totalDsa).toBe(2);
    expect(metrics.tier1Count).toBe(1);
    expect(metrics.tier2Count).toBe(1);
    expect(metrics.coldSolveRate).toBe(50); // 1 out of 2 = 50%
    expect(metrics.hldMastered).toBe(1);
    expect(metrics.hldDiagrammed).toBe(2);
    expect(metrics.overdueCount).toBe(0);
    expect(metrics.readinessScore).toBeGreaterThan(0);
  });

  it('should penalize readiness score when problems are overdue', () => {
    const overdueIso = new Date(Date.now() - 3600000).toISOString();
    const mockDsa: DsaProblemEntry[] = [
      {
        id: '1',
        title: 'Overdue Problem 1',
        leetcodeNumber: 10,
        pattern: '1-D DP',
        leetcodeUrl: 'https://leetcode.com',
        struggleTier: 3,
        dateLogged: overdueIso,
        scheduledReviewDate: overdueIso,
        reviewStatus: 'pending',
      },
    ];

    const metrics = calculateMetrics(mockDsa, []);
    expect(metrics.overdueCount).toBe(1);
    expect(metrics.pendingCount).toBe(1);
  });
});
