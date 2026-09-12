import { describe, it, expect } from 'vitest';
import type { HldWeekEntry, HldWeekChecklist, HldStatus } from '../types';

describe('System Design HLD Checklist & State Machine', () => {
  const processChecklistToggle = (
    week: HldWeekEntry,
    itemKey: keyof HldWeekChecklist
  ): HldWeekEntry => {
    const updatedChecklist = {
      ...week.checklist,
      [itemKey]: !week.checklist[itemKey],
    };

    const allDone =
      updatedChecklist.readingDone &&
      updatedChecklist.estimationPracticed &&
      updatedChecklist.diagramCompleted &&
      updatedChecklist.bottlenecksAudited;

    let newStatus: HldStatus = week.status;
    if (allDone && week.status !== 'mastered') {
      newStatus = 'mastered';
    } else if (!allDone && week.status === 'not_started') {
      newStatus = 'reading';
    }

    return {
      ...week,
      checklist: updatedChecklist,
      status: newStatus,
    };
  };

  const createInitialWeek = (): HldWeekEntry => ({
    weekNumber: 1,
    chapterTitle: 'Scale From Zero to Millions of Users',
    bookVolume: 1,
    coreConcepts: ['Stateless Architecture', 'Database Sharding'],
    deliverable: 'Excalidraw high-concurrency architecture',
    status: 'not_started',
    checklist: {
      readingDone: false,
      estimationPracticed: false,
      diagramCompleted: false,
      bottlenecksAudited: false,
    },
  });

  it('Checking readingDone from not_started should transition status to reading', () => {
    const week = createInitialWeek();
    expect(week.status).toBe('not_started');

    const updated = processChecklistToggle(week, 'readingDone');
    expect(updated.checklist.readingDone).toBe(true);
    expect(updated.status).toBe('reading');
  });

  it('Completing all 4 checklist deliverables should transition status to mastered', () => {
    let week = createInitialWeek();
    week = processChecklistToggle(week, 'readingDone');
    week = processChecklistToggle(week, 'estimationPracticed');
    week = processChecklistToggle(week, 'diagramCompleted');
    week = processChecklistToggle(week, 'bottlenecksAudited');

    expect(week.checklist.readingDone).toBe(true);
    expect(week.checklist.estimationPracticed).toBe(true);
    expect(week.checklist.diagramCompleted).toBe(true);
    expect(week.checklist.bottlenecksAudited).toBe(true);
    expect(week.status).toBe('mastered');
  });
});
