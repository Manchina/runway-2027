import { serve } from '@hono/node-server';
import app from './index.js';

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Runway 2027 Local API running at http://localhost:${port}`);
console.log(`🛡️ Bot Shield: ${process.env.RUNWAY_API_KEY ? 'Active' : 'Open (Dev Mode)'}`);

serve({
  fetch: app.fetch,
  port,
});
