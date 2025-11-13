// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 10000, // 10 seconds
  },
  
  // App Configuration
  app: {
    name: 'Movie Manager',
    version: '1.0.0',
  },
  
} as const;


// Helper function to get API URL with path
export const getApiUrl = (path: string = '') => {
  const baseUrl = config.api.baseUrl.endsWith('/') 
    ? config.api.baseUrl.slice(0, -1) 
    : config.api.baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
