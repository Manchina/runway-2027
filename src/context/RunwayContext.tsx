import React, { createContext, useState, useEffect, useCallback } from 'react';
import type {
  DsaProblemEntry,
  HldWeekEntry,
  HldWeekChecklist,
  RunwayState,
  StruggleTier,
  PatternName,
} from '../types';
import { INITIAL_HLD_CURRICULUM } from '../data/initialHldCurriculum';
import { runwayApi } from '../services/api';
import confetti from 'canvas-confetti';

interface RunwayContextType {
  dsaProblems: DsaProblemEntry[];
  hldWeeks: HldWeekEntry[];
  streakCount: number;
  lastCompletedDate: string | null;
  isCloudConnected: boolean;
  cloudStatus: string;
  refreshFromCloud: () => Promise<void>;
  logDsaProblem: (params: {
    title: string;
    leetcodeNumber: number;
    pattern: PatternName;
    leetcodeUrl: string;
    struggleTier: StruggleTier;
    notes?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    weekNumber?: number;
  }) => void;
  updateDsaProblem: (id: string, updates: Partial<DsaProblemEntry>) => void;
  deleteDsaProblem: (id: string) => void;
  markProblemCleared: (id: string) => void;
  failProblemReview: (id: string) => void;
  scheduleProblemForReview: (id: string) => void;
  snoozeProblemReview: (id: string) => void;
  updateHldWeek: (weekNumber: number, updates: Partial<HldWeekEntry>) => void;
  toggleHldChecklistItem: (weekNumber: number, itemKey: keyof HldWeekChecklist) => void;
  exportStateJson: () => string;
  importStateJson: (jsonString: string) => { success: boolean; message: string };
  resetToDefaults: () => void;
  loadDemoData: () => void;
}

const STORAGE_KEYS = {
  DSA: 'runway_2027_dsa_v1',
  HLD: 'runway_2027_hld_v1',
  STREAK: 'runway_2027_streak_v1',
  LAST_DATE: 'runway_2027_last_date_v1',
};

// First assisted recall is in 48 hours; successful recalls then stretch out.
const REVIEW_INTERVALS_HOURS = [48, 7 * 24, 21 * 24, 60 * 24] as const;

const RunwayContext = createContext<RunwayContextType | undefined>(undefined);

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const RunwayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dsaProblems, setDsaProblems] = useState<DsaProblemEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DSA);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load DSA problems from localStorage', e);
      return [];
    }
  });

  const [hldWeeks, setHldWeeks] = useState<HldWeekEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HLD);
      return saved ? JSON.parse(saved) : INITIAL_HLD_CURRICULUM;
    } catch (e) {
      console.error('Failed to load HLD weeks from localStorage', e);
      return INITIAL_HLD_CURRICULUM;
    }
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STREAK);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_DATE) || null;
    } catch {
      return null;
    }
  });

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(() => {
    return runwayApi.isConfigured();
  });

  const [cloudStatus, setCloudStatus] = useState<string>('Local Mode');

  // Cloud sync loader
  const refreshFromCloud = useCallback(async () => {
    if (!runwayApi.isConfigured()) {
      setIsCloudConnected(false);
      setCloudStatus('Local Mode (100% Offline)');
      return;
    }

    try {
      setCloudStatus('Connecting to AWS Lambda...');
      const health = await runwayApi.checkHealth();
      setIsCloudConnected(true);
      setCloudStatus(`AWS DynamoDB (${health.status})`);

      const [remoteDsa, remoteHld, remoteStats] = await Promise.all([
        runwayApi.getDsaProblems(),
        runwayApi.getHldWeeks(),
        runwayApi.getStats(),
      ]);

      if (Array.isArray(remoteDsa) && remoteDsa.length > 0) {
        setDsaProblems(remoteDsa);
      }
      if (Array.isArray(remoteHld) && remoteHld.length > 0) {
        setHldWeeks(remoteHld);
      }
      if (remoteStats && typeof remoteStats.streakCount === 'number') {
        setStreakCount(remoteStats.streakCount);
        setLastCompletedDate(remoteStats.lastCompletedDate);
      }
    } catch (err: any) {
      setIsCloudConnected(false);
      setCloudStatus(`Cloud Offline: ${err.message}`);
    }
  }, []);

  // Initial cloud sync attempt on mount
  useEffect(() => {
    if (runwayApi.isConfigured()) {
      refreshFromCloud();
    }
  }, [refreshFromCloud]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DSA, JSON.stringify(dsaProblems));
  }, [dsaProblems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HLD, JSON.stringify(hldWeeks));
  }, [hldWeeks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK, streakCount.toString());
  }, [streakCount]);

  useEffect(() => {
    if (lastCompletedDate) {
      localStorage.setItem(STORAGE_KEYS.LAST_DATE, lastCompletedDate);
    }
  }, [lastCompletedDate]);

  // Streak recorder helper
  const registerDailyActivity = () => {
    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (lastCompletedDate === today) {
      return;
    }

    if (lastCompletedDate === yesterday) {
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(1);
    }
    setLastCompletedDate(today);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#10b981', '#6366f1', '#f59e0b'],
      });
    } catch {
      // Ignore if canvas not supported
    }
  };

  const logDsaProblem: RunwayContextType['logDsaProblem'] = ({
    title,
    leetcodeNumber,
    pattern,
    leetcodeUrl,
    struggleTier,
    notes,
    difficulty,
    weekNumber,
  }) => {
    const now = new Date();
    const isNeedsReview = struggleTier === 2 || struggleTier === 3;
    const scheduledReviewDate = isNeedsReview
      ? new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
      : null;

    const newEntry: DsaProblemEntry = {
      id: `dsa-${leetcodeNumber}-${Date.now()}`,
      title,
      leetcodeNumber,
      pattern,
      leetcodeUrl,
      struggleTier,
      dateLogged: now.toISOString(),
      scheduledReviewDate,
      reviewStatus: isNeedsReview ? 'pending' : 'not_needed',
      notes,
      difficulty,
      weekNumber,
    };

    setDsaProblems((prev) => {
      const existingIdx = prev.findIndex((p) => p.leetcodeNumber === leetcodeNumber);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newEntry;
        return updated;
      }
      return [newEntry, ...prev];
    });

    registerDailyActivity();

    // Optimistically push to cloud if configured
    if (runwayApi.isConfigured()) {
      runwayApi.logDsaProblem(newEntry).catch((err) => {
        console.warn('Background cloud sync failed, cached locally:', err);
      });
    }

    if (struggleTier === 1) {
      triggerConfetti();
    }
  };

  const updateDsaProblem = (id: string, updates: Partial<DsaProblemEntry>) => {
    setDsaProblems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteDsaProblem = (id: string) => {
    setDsaProblems((prev) => prev.filter((item) => item.id !== id));
    if (runwayApi.isConfigured()) {
      runwayApi.deleteDsaProblem(id).catch(console.warn);
    }
  };

  const markProblemCleared = (id: string) => {
    setDsaProblems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStage = (item.reviewStage ?? 0) + 1;
          const nextInterval = REVIEW_INTERVALS_HOURS[nextStage];
          const reviewHistory = [...(item.reviewHistory ?? []), { reviewedAt: new Date().toISOString(), outcome: 'passed' as const }];
          return {
            ...item,
            reviewStatus: nextInterval ? 'pending' : 'cleared',
            reviewStage: nextStage,
            scheduledReviewDate: nextInterval ? new Date(Date.now() + nextInterval * 60 * 60 * 1000).toISOString() : null,
            reviewHistory,
          };
        }
        return item;
      })
    );
    registerDailyActivity();
    triggerConfetti();

    if (runwayApi.isConfigured()) {
      runwayApi.markDsaCleared(id).catch(console.warn);
    }
  };

  const failProblemReview = (id: string) => {
    const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setDsaProblems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            reviewStatus: 'pending',
            reviewStage: 0,
            scheduledReviewDate: nextReview,
            reviewHistory: [...(item.reviewHistory ?? []), { reviewedAt: new Date().toISOString(), outcome: 'failed' }],
          };
        }
        return item;
      })
    );

    if (runwayApi.isConfigured()) {
      runwayApi.failDsaReview(id).catch(console.warn);
    }
  };

  const scheduleProblemForReview = (id: string) => {
    const dueNow = new Date().toISOString();
    setDsaProblems((prev) => prev.map((item) => item.id === id ? {
      ...item, reviewStatus: 'pending', reviewStage: item.reviewStage ?? 0, scheduledReviewDate: dueNow,
    } : item));
    if (runwayApi.isConfigured()) runwayApi.scheduleDsaReview(id, 'now').catch(console.warn);
  };

  const snoozeProblemReview = (id: string) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    setDsaProblems((prev) => prev.map((item) => item.id === id ? {
      ...item, reviewStatus: 'pending', scheduledReviewDate: tomorrow,
      reviewHistory: [...(item.reviewHistory ?? []), { reviewedAt: new Date().toISOString(), outcome: 'snoozed' }],
    } : item));
    if (runwayApi.isConfigured()) runwayApi.scheduleDsaReview(id, 'snooze').catch(console.warn);
  };

  const updateHldWeek = (weekNumber: number, updates: Partial<HldWeekEntry>) => {
    setHldWeeks((prev) =>
      prev.map((week) => (week.weekNumber === weekNumber ? { ...week, ...updates } : week))
    );
    registerDailyActivity();

    if (runwayApi.isConfigured()) {
      runwayApi.updateHldWeek(weekNumber, updates).catch(console.warn);
    }
  };

  const toggleHldChecklistItem = (weekNumber: number, itemKey: keyof HldWeekChecklist) => {
    setHldWeeks((prev) =>
      prev.map((week) => {
        if (week.weekNumber === weekNumber) {
          const updatedChecklist = {
            ...week.checklist,
            [itemKey]: !week.checklist[itemKey],
          };

          const allDone =
            updatedChecklist.readingDone &&
            updatedChecklist.estimationPracticed &&
            updatedChecklist.diagramCompleted &&
            updatedChecklist.bottlenecksAudited;

          let newStatus = week.status;
          if (allDone && week.status !== 'mastered') {
            newStatus = 'mastered';
          } else if (!allDone && week.status === 'not_started') {
            newStatus = 'reading';
          }

          const updatedWeek = {
            ...week,
            checklist: updatedChecklist,
            status: newStatus,
          };

          if (runwayApi.isConfigured()) {
            runwayApi.toggleHldChecklist(weekNumber, itemKey).catch(console.warn);
          }

          return updatedWeek;
        }
        return week;
      })
    );
    registerDailyActivity();
  };

  const exportStateJson = (): string => {
    const payload: RunwayState = {
      dsaProblems,
      hldWeeks,
      streakCount,
      lastCompletedDate: lastCompletedDate || undefined,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  const importStateJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid JSON format. Expected an object.' };
      }

      if (!Array.isArray(parsed.dsaProblems) || !Array.isArray(parsed.hldWeeks)) {
        return {
          success: false,
          message: 'JSON structure missing dsaProblems or hldWeeks arrays.',
        };
      }

      setDsaProblems(parsed.dsaProblems);
      setHldWeeks(parsed.hldWeeks);
      if (typeof parsed.streakCount === 'number') {
        setStreakCount(parsed.streakCount);
      }
      if (parsed.lastCompletedDate) {
        setLastCompletedDate(parsed.lastCompletedDate);
      }

      return {
        success: true,
        message: `Successfully restored ${parsed.dsaProblems.length} DSA problems and ${parsed.hldWeeks.length} HLD weeks.`,
      };
    } catch (e: any) {
      return { success: false, message: `Failed to parse backup: ${e.message}` };
    }
  };

  const resetToDefaults = () => {
    setDsaProblems([]);
    setHldWeeks(INITIAL_HLD_CURRICULUM);
    setStreakCount(0);
    setLastCompletedDate(null);
    localStorage.removeItem(STORAGE_KEYS.DSA);
    localStorage.removeItem(STORAGE_KEYS.HLD);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    localStorage.removeItem(STORAGE_KEYS.LAST_DATE);
  };

  const loadDemoData = () => {
    const now = Date.now();
    const twoDaysAgo = new Date(now - 49 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const upcoming = new Date(now + 24 * 60 * 60 * 1000).toISOString();

    const sampleProblems: DsaProblemEntry[] = [
      {
        id: 'demo-217',
        title: 'Contains Duplicate',
        leetcodeNumber: 217,
        pattern: 'Arrays & Hashing',
        leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/',
        struggleTier: 1,
        dateLogged: twoDaysAgo,
        scheduledReviewDate: null,
        reviewStatus: 'not_needed',
        notes: 'One-pass hash set. O(N) time, O(N) space. Clean cold solve.',
        difficulty: 'Easy',
        weekNumber: 1,
      },
      {
        id: 'demo-242',
        title: 'Valid Anagram',
        leetcodeNumber: 242,
        pattern: 'Arrays & Hashing',
        leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
        struggleTier: 1,
        dateLogged: twoDaysAgo,
        scheduledReviewDate: null,
        reviewStatus: 'not_needed',
        notes: 'Fixed size frequency array (26 chars) instead of hashmap for cache locality.',
        difficulty: 'Easy',
        weekNumber: 1,
      },
      {
        id: 'demo-1',
        title: 'Two Sum',
        leetcodeNumber: 1,
        pattern: 'Arrays & Hashing',
        leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
        struggleTier: 1,
        dateLogged: oneDayAgo,
        scheduledReviewDate: null,
        reviewStatus: 'not_needed',
        notes: 'Target complement in map.',
        difficulty: 'Easy',
        weekNumber: 1,
      },
      {
        id: 'demo-49',
        title: 'Group Anagrams',
        leetcodeNumber: 49,
        pattern: 'Arrays & Hashing',
        leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
        struggleTier: 2,
        dateLogged: twoDaysAgo,
        scheduledReviewDate: twoDaysAgo, // Due now!
        reviewStatus: 'pending',
        notes: 'Forgot tuple key serialization for char count array. Needed a hint on string hashing.',
        difficulty: 'Medium',
        weekNumber: 1,
      },
      {
        id: 'demo-347',
        title: 'Top K Frequent Elements',
        leetcodeNumber: 347,
        pattern: 'Arrays & Hashing',
        leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
        struggleTier: 3,
        dateLogged: oneDayAgo,
        scheduledReviewDate: upcoming,
        reviewStatus: 'pending',
        notes: 'Had to watch NeetCode solution for Bucket Sort O(N) trick instead of Min-Heap O(N log K).',
        difficulty: 'Medium',
        weekNumber: 1,
      },
    ];

    setDsaProblems(sampleProblems);

    setHldWeeks((prev) =>
      prev.map((week) => {
        if (week.weekNumber === 1) {
          return {
            ...week,
            status: 'diagrammed',
            excalidrawUrl: 'https://excalidraw.com/#room=scale-zero-to-millions',
            summaryNotes: 'Split database into master-slave for read scaling. Added Redis cache-aside.',
            checklist: {
              readingDone: true,
              estimationPracticed: true,
              diagramCompleted: true,
              bottlenecksAudited: false,
            },
          };
        }
        return week;
      })
    );

    setStreakCount(4);
    setLastCompletedDate(getTodayDateString());
  };

  return (
    <RunwayContext.Provider
      value={{
        dsaProblems,
        hldWeeks,
        streakCount,
        lastCompletedDate,
        isCloudConnected,
        cloudStatus,
        refreshFromCloud,
        logDsaProblem,
        updateDsaProblem,
        deleteDsaProblem,
        markProblemCleared,
        failProblemReview,
        scheduleProblemForReview,
        snoozeProblemReview,
        updateHldWeek,
        toggleHldChecklistItem,
        exportStateJson,
        importStateJson,
        resetToDefaults,
        loadDemoData,
      }}
    >
      {children}
    </RunwayContext.Provider>
  );
};

export { RunwayContext };
export { useRunway } from './useRunway';
