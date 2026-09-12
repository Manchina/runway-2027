import type { DsaProblemEntry, HldWeekEntry, HldWeekChecklist } from '../types';

const STORAGE_KEYS = {
  API_URL: 'runway_api_url',
  API_KEY: 'runway_api_key',
};

export function getApiConfig() {
  const url =
    localStorage.getItem(STORAGE_KEYS.API_URL) ||
    import.meta.env.VITE_API_URL ||
    '';
  const key =
    localStorage.getItem(STORAGE_KEYS.API_KEY) ||
    import.meta.env.VITE_RUNWAY_KEY ||
    '';
  return { url: url.replace(/\/$/, ''), key };
}

export function setApiConfig(url: string, key: string) {
  if (url) {
    localStorage.setItem(STORAGE_KEYS.API_URL, url.replace(/\/$/, ''));
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_URL);
  }

  if (key) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, key);
  } else {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { url, key } = getApiConfig();
  if (!url) {
    throw new Error('No API URL configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (key) {
    headers['x-runway-key'] = key;
  }

  const res = await fetch(`${url}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error) errorMsg = body.error;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const runwayApi = {
  isConfigured: () => {
    const { url } = getApiConfig();
    return Boolean(url);
  },

  checkHealth: async () => {
    return request<{
      status: string;
      database: string;
      botShield: string;
      timestamp: string;
    }>('/api/health');
  },

  getDsaProblems: async () => {
    const res = await request<{ success: boolean; data: DsaProblemEntry[] }>('/api/dsa');
    return res.data;
  },

  logDsaProblem: async (problem: any) => {
    const res = await request<{ success: boolean; data: DsaProblemEntry }>('/api/dsa', {
      method: 'POST',
      body: JSON.stringify(problem),
    });
    return res.data;
  },

  markDsaCleared: async (id: string) => {
    const res = await request<{ success: boolean; data: DsaProblemEntry }>(
      `/api/dsa/${id}/clear`,
      {
        method: 'PATCH',
      }
    );
    return res.data;
  },

  failDsaReview: async (id: string) => {
    const res = await request<{ success: boolean; data: DsaProblemEntry }>(
      `/api/dsa/${id}/fail`,
      {
        method: 'PATCH',
      }
    );
    return res.data;
  },

  deleteDsaProblem: async (id: string) => {
    return request<{ success: boolean; message: string }>(`/api/dsa/${id}`, {
      method: 'DELETE',
    });
  },

  getHldWeeks: async () => {
    const res = await request<{ success: boolean; data: HldWeekEntry[] }>('/api/hld');
    return res.data;
  },

  updateHldWeek: async (weekNumber: number, updates: Partial<HldWeekEntry>) => {
    const res = await request<{ success: boolean; data: HldWeekEntry }>(
      `/api/hld/${weekNumber}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
    return res.data;
  },

  toggleHldChecklist: async (weekNumber: number, itemKey: keyof HldWeekChecklist) => {
    const res = await request<{ success: boolean; data: HldWeekEntry }>(
      `/api/hld/${weekNumber}/checklist`,
      {
        method: 'PATCH',
        body: JSON.stringify({ itemKey }),
      }
    );
    return res.data;
  },

  getStats: async () => {
    const res = await request<{ success: boolean; data: any }>('/api/stats');
    return res.data;
  },

  seedHldCurriculum: async (weeks: HldWeekEntry[]) => {
    return request<{ success: boolean; message: string }>('/api/seed', {
      method: 'POST',
      body: JSON.stringify({ weeks }),
    });
  },
};
