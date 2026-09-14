import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/aws-lambda';
import {
  getAllDsaProblems,
  putDsaProblem,
  deleteDsaProblem,
  getAllHldWeeks,
  putHldWeek,
  getStreakMeta,
  updateStreakMeta,
  TABLE_NAME,
  DsaItem,
  HldItem,
} from './db/dynamo.js';
import { authShield } from './middleware/authShield.js';

const app = new Hono();

// Global Middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-runway-key'],
  })
);

app.use('/api/*', authShield);

// Helper for date calculation
const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const reviewIntervalsHours = [48, 7 * 24, 21 * 24, 60 * 24];

async function recordDailyActivity() {
  const meta = await getStreakMeta();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (meta.lastCompletedDate === today) {
    return meta;
  }

  let newStreak = meta.streakCount;
  if (meta.lastCompletedDate === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  return updateStreakMeta(newStreak, today);
}

// 1. Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'online',
    cockpit: 'Runway 2027 AWS Serverless API',
    database: 'AWS DynamoDB',
    table: TABLE_NAME,
    botShield: process.env.RUNWAY_API_KEY ? 'ACTIVE (Key Required)' : 'DISABLED (Open Mode)',
    timestamp: new Date().toISOString(),
  });
});

// 2. DSA Endpoints
app.get('/api/dsa', async (c) => {
  try {
    const problems = await getAllDsaProblems();
    return c.json({ success: true, data: problems });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.post('/api/dsa', async (c) => {
  try {
    const body = await c.req.json();
    const {
      title,
      leetcodeNumber,
      pattern,
      leetcodeUrl,
      struggleTier,
      notes,
      difficulty,
      weekNumber,
    } = body;

    const now = new Date();
    const isNeedsReview = struggleTier === 2 || struggleTier === 3;
    const scheduledReviewDate = isNeedsReview
      ? new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
      : null;

    const id = body.id || `dsa-${leetcodeNumber}-${Date.now()}`;

    const problemItem: Omit<DsaItem, 'pk' | 'sk'> = {
      id,
      title,
      leetcodeNumber: Number(leetcodeNumber),
      pattern,
      leetcodeUrl,
      struggleTier: Number(struggleTier) as 1 | 2 | 3,
      dateLogged: now.toISOString(),
      scheduledReviewDate,
      reviewStatus: isNeedsReview ? 'pending' : 'not_needed',
      reviewStage: 0,
      reviewHistory: [],
      notes,
      difficulty,
      weekNumber: weekNumber ? Number(weekNumber) : undefined,
    };

    const saved = await putDsaProblem(problemItem);
    await recordDailyActivity();

    return c.json({ success: true, data: saved });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.patch('/api/dsa/:id/clear', async (c) => {
  try {
    const id = c.req.param('id');
    const all = await getAllDsaProblems();
    const target = all.find((p) => p.id === id);

    if (!target) {
      return c.json({ success: false, error: 'Problem not found' }, 404);
    }

    const nextStage = (target.reviewStage || 0) + 1;
    const nextInterval = reviewIntervalsHours[nextStage];
    const updated: Omit<DsaItem, 'pk' | 'sk'> = {
      ...target,
      reviewStatus: nextInterval ? 'pending' : 'cleared',
      reviewStage: nextStage,
      scheduledReviewDate: nextInterval ? new Date(Date.now() + nextInterval * 60 * 60 * 1000).toISOString() : null,
      reviewHistory: [...(target.reviewHistory || []), { reviewedAt: new Date().toISOString(), outcome: 'passed' }],
    };

    await putDsaProblem(updated);
    await recordDailyActivity();

    return c.json({ success: true, data: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.patch('/api/dsa/:id/fail', async (c) => {
  try {
    const id = c.req.param('id');
    const all = await getAllDsaProblems();
    const target = all.find((p) => p.id === id);

    if (!target) {
      return c.json({ success: false, error: 'Problem not found' }, 404);
    }

    const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const updated: Omit<DsaItem, 'pk' | 'sk'> = {
      ...target,
      reviewStatus: 'pending',
      reviewStage: 0,
      scheduledReviewDate: nextReview,
      reviewHistory: [...(target.reviewHistory || []), { reviewedAt: new Date().toISOString(), outcome: 'failed' }],
    };

    await putDsaProblem(updated);
    return c.json({ success: true, data: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.patch('/api/dsa/:id/schedule', async (c) => {
  try {
    const id = c.req.param('id');
    const { action } = await c.req.json();
    const target = (await getAllDsaProblems()).find((p) => p.id === id);
    if (!target) return c.json({ success: false, error: 'Problem not found' }, 404);
    const isSnooze = action === 'snooze';
    const updated: Omit<DsaItem, 'pk' | 'sk'> = {
      ...target,
      reviewStatus: 'pending',
      scheduledReviewDate: new Date(Date.now() + (isSnooze ? 24 : 0) * 60 * 60 * 1000).toISOString(),
      reviewHistory: isSnooze ? [...(target.reviewHistory || []), { reviewedAt: new Date().toISOString(), outcome: 'snoozed' }] : target.reviewHistory,
    };
    await putDsaProblem(updated);
    return c.json({ success: true, data: updated });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.delete('/api/dsa/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await deleteDsaProblem(id);
    return c.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 3. HLD Endpoints
app.get('/api/hld', async (c) => {
  try {
    const weeks = await getAllHldWeeks();
    return c.json({ success: true, data: weeks });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.patch('/api/hld/:weekNumber', async (c) => {
  try {
    const weekNum = Number(c.req.param('weekNumber'));
    const updates = await c.req.json();
    const all = await getAllHldWeeks();
    const existing = all.find((w) => w.weekNumber === weekNum);

    if (!existing) {
      return c.json({ success: false, error: 'HLD Week not found' }, 404);
    }

    const merged: Omit<HldItem, 'pk' | 'sk'> = {
      ...existing,
      ...updates,
    };

    await putHldWeek(merged);
    await recordDailyActivity();

    return c.json({ success: true, data: merged });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

app.patch('/api/hld/:weekNumber/checklist', async (c) => {
  try {
    const weekNum = Number(c.req.param('weekNumber'));
    const { itemKey } = await c.req.json();
    const all = await getAllHldWeeks();
    const existing = all.find((w) => w.weekNumber === weekNum);

    if (!existing) {
      return c.json({ success: false, error: 'HLD Week not found' }, 404);
    }

    const updatedChecklist = {
      ...existing.checklist,
      [itemKey]: !existing.checklist[itemKey as keyof typeof existing.checklist],
    };

    const allDone = Object.values(updatedChecklist).every(Boolean);
    let newStatus = existing.status;
    if (allDone && existing.status !== 'mastered') {
      newStatus = 'mastered';
    } else if (!allDone && existing.status === 'not_started') {
      newStatus = 'reading';
    }

    const merged: Omit<HldItem, 'pk' | 'sk'> = {
      ...existing,
      checklist: updatedChecklist,
      status: newStatus,
    };

    await putHldWeek(merged);
    await recordDailyActivity();

    return c.json({ success: true, data: merged });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 4. Stats & Overall Cockpit State
app.get('/api/stats', async (c) => {
  try {
    const [dsaList, hldList, meta] = await Promise.all([
      getAllDsaProblems(),
      getAllHldWeeks(),
      getStreakMeta(),
    ]);

    const targetDate = new Date('2027-01-01T00:00:00Z').getTime();
    const now = Date.now();
    const daysRemaining = Math.max(0, Math.floor((targetDate - now) / (1000 * 60 * 60 * 24)));

    const pendingReviews = dsaList.filter((p) => p.reviewStatus === 'pending');
    const overdueCount = pendingReviews.filter(
      (p) => p.scheduledReviewDate && new Date(p.scheduledReviewDate).getTime() <= now
    ).length;

    return c.json({
      success: true,
      data: {
        streakCount: meta.streakCount,
        lastCompletedDate: meta.lastCompletedDate,
        totalDsaSolved: dsaList.length,
        hldMasteredCount: hldList.filter((w) => w.status === 'mastered').length,
        pendingReviewCount: pendingReviews.length,
        overdueReviewCount: overdueCount,
        daysRemainingTo2027: daysRemaining,
      },
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 5. Seed / Restore Entire Curriculum
app.post('/api/seed', async (c) => {
  try {
    const { weeks } = await c.req.json();
    if (Array.isArray(weeks)) {
      for (const w of weeks) {
        await putHldWeek(w);
      }
    }
    return c.json({ success: true, message: `Seeded ${weeks?.length || 0} HLD weeks` });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Export AWS Lambda handler
export const handler = handle(app);
export default app;
