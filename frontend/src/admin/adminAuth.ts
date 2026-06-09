const MAIN_KEY = 'admin-auth';
const JOALHERIA_KEY = 'joalheria-admin-auth';

export const getAdminToken = (role: 'admin' | 'joalheria' = 'admin') =>
  sessionStorage.getItem(role === 'joalheria' ? JOALHERIA_KEY : MAIN_KEY) || '';

export const adminHeaders = (role: 'admin' | 'joalheria' = 'admin'): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAdminToken(role)}`,
});

export const adminFetch = (
  url: string,
  options: RequestInit = {},
  role: 'admin' | 'joalheria' = 'admin',
): Promise<Response> =>
  fetch(url, {
    ...options,
    headers: {
      ...adminHeaders(role),
      ...(options.headers as Record<string, string> | undefined),
    },
  });
