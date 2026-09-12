import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runwayApi, setApiConfig } from '../services/api';

describe('API Service Security & Zero-Database-Write Invariant', () => {
  beforeEach(() => {
    setApiConfig('https://mock-api.runway.internal', 'mock-secret-key');
  });

  it('Health check executes against mocked handler without invoking live AWS', async () => {
    const mockHealth = {
      status: 'online',
      database: 'AWS DynamoDB (Mocked in Test)',
      botShield: 'ACTIVE',
      timestamp: new Date().toISOString(),
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockHealth,
      })
    );

    const result = await runwayApi.checkHealth();
    expect(result.status).toBe('online');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('Logging problem formats payload and passes x-runway-key header without touching live DB', async () => {
    const mockProblem = {
      id: 'dsa-1-12345678',
      title: 'Two Sum',
      leetcodeNumber: 1,
      pattern: 'Arrays & Hashing',
      leetcodeUrl: 'https://leetcode.com',
      struggleTier: 1,
      dateLogged: new Date().toISOString(),
      scheduledReviewDate: null,
      reviewStatus: 'not_needed',
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockProblem }),
    });

    vi.stubGlobal('fetch', fetchSpy);

    const saved = await runwayApi.logDsaProblem(mockProblem);
    expect(saved.title).toBe('Two Sum');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://mock-api.runway.internal/api/dsa',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-runway-key': 'mock-secret-key',
        }),
      })
    );
  });
});
