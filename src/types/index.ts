export type StruggleTier = 1 | 2 | 3;
export type ReviewStatus = 'not_needed' | 'pending' | 'cleared';
export type HldStatus = 'not_started' | 'reading' | 'diagrammed' | 'mastered';

export type PatternName =
  | 'Arrays & Hashing'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Stack'
  | 'Binary Search'
  | 'Linked List'
  | 'Trees'
  | 'Tries'
  | 'Heap / Priority Queue'
  | 'Backtracking'
  | 'Graphs'
  | '1-D DP';

export interface DsaProblemEntry {
  id: string; // e.g. "neetcode-1"
  title: string;
  leetcodeNumber: number;
  pattern: PatternName;
  leetcodeUrl: string;
  struggleTier: StruggleTier;
  dateLogged: string; // ISO String
  scheduledReviewDate: string | null; // ISO String (Logged Date + 48h if Tier 2 or 3)
  reviewStatus: ReviewStatus;
  notes?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  weekNumber?: number;
}

export interface HldWeekChecklist {
  readingDone: boolean;
  estimationPracticed: boolean;
  diagramCompleted: boolean;
  bottlenecksAudited: boolean;
}

export interface HldWeekEntry {
  weekNumber: number;
  chapterTitle: string;
  bookVolume: 1 | 2;
  coreConcepts: string[];
  deliverable: string;
  excalidrawUrl?: string;
  summaryNotes?: string;
  status: HldStatus;
  checklist: HldWeekChecklist;
}

export interface SyllabusDsaProblem {
  id: string;
  weekNumber: number;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  title: string;
  leetcodeNumber: number;
  pattern: PatternName;
  leetcodeUrl: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface RunwayState {
  dsaProblems: DsaProblemEntry[];
  hldWeeks: HldWeekEntry[];
  lastCompletedDate?: string;
  streakCount: number;
  version: string;
  exportedAt?: string;
}
