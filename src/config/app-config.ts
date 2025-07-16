import { createGeneralAgent } from '@/core/agents/general-agent';
import { createHRAgent } from '@/core/agents/hr-agent';
import { createMalStreamAgent } from '@/core/agents/mal-stream-agent';
import { createTravelAgent } from '@/core/agents/travel-agent';
import { Configuration } from '@/core/core/config';

export const createAppConfig = () => {
  return new Configuration({
    apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
    baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL || ''
  });
};

// Lazy initialization to avoid build-time issues
let _appConfig: Configuration | null = null;

export const getAppConfig = () => {
  if (!_appConfig) {
    _appConfig = createAppConfig();
  }
  return _appConfig;
};

export const agents = {
  'HR Assistant': createHRAgent(getAppConfig()),
  'Travel Assistant': createTravelAgent(getAppConfig()),
  'General Assistant': createGeneralAgent(getAppConfig()),
  'Mal-Stream%20Real%20Estate%20Agent': createMalStreamAgent(getAppConfig()),
};