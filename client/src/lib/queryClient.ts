import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Special handling for auth errors - only suppress 401s for the auth/status endpoint
    // which is used to check current authentication state
    if (res.status === 401 && res.url.includes('/api/auth/status')) {
      return;
    }
    
    // For other errors, attempt to parse the response body as JSON first
    let errorMessage;
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } else {
        errorMessage = await res.text();
      }
    } catch (e) {
      errorMessage = res.statusText || `Error ${res.status}`;
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Sanitize data to prevent toISOString issues with dates
  let sanitizedData = data;
  if (data && typeof data === 'object') {
    // Create a sanitized copy with date-like objects converted to strings
    sanitizedData = {};
    
    // Helper function to determine if a value is a date-like object
    const isDateLike = (value: any): boolean => {
      return value && 
        typeof value === 'object' && 
        !(value instanceof Date) && 
        (value.hasOwnProperty('_isAMomentObject') || 
         value.hasOwnProperty('_isValid'));
    };
    
    // Process all properties
    Object.entries(data as Record<string, any>).forEach(([key, value]) => {
      // Handle date-like objects that aren't proper Date instances
      if (isDateLike(value)) {
        (sanitizedData as Record<string, any>)[key] = String(value);
      } 
      // Handle arrays
      else if (Array.isArray(value)) {
        (sanitizedData as Record<string, any>)[key] = value;
      }
      // For numbers, ensure they stay as numbers
      else if (typeof value === 'number') {
        (sanitizedData as Record<string, any>)[key] = value;
      }
      // For objects (non-date-like), process them recursively
      else if (value && typeof value === 'object') {
        (sanitizedData as Record<string, any>)[key] = value;
      }
      // Other values (string, boolean, etc.)
      else {
        (sanitizedData as Record<string, any>)[key] = value;
      }
    });
  }

  try {
    // Add cache-busting parameter to GET requests to avoid caching issues
    const urlWithCacheBusting = method.toUpperCase() === 'GET' 
      ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` 
      : url;

    const res = await fetch(urlWithCacheBusting, {
      method,
      headers: sanitizedData ? { "Content-Type": "application/json" } : {},
      body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Avoid logging expected 401 errors for the user endpoint
    if (!(url === '/api/auth/status' && error instanceof Error && error.message.startsWith('401:'))) {
      const isAdmin = window.location.pathname.startsWith('/admin');
      
      // Log at different levels based on context
      if (isAdmin) {
        console.error(`API request error for ${method} ${url}:`, error);
      } else if (url !== '/api/auth/status') {
        console.warn(`API request warning for ${method} ${url}:`, error);
      } else {
        // Auth check failures are handled silently
      }
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // The first item in queryKey is the URL or the query name
      // If it's a URL (starts with /), use it directly, otherwise use the second item
      let url: string;
      if (typeof queryKey[0] === 'string' && queryKey[0].startsWith('/')) {
        url = queryKey[0] as string;
      } else if (queryKey.length > 1 && typeof queryKey[1] === 'string' && queryKey[1].startsWith('/')) {
        url = queryKey[1] as string;
      } else {
        throw new Error(`Invalid queryKey: ${JSON.stringify(queryKey)}`);
      }
      
      // Add cache-busting parameter
      const urlWithCacheBusting = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      
      const res = await fetch(urlWithCacheBusting, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Don't log auth errors on public routes or for the user endpoint
      let url: string;
      if (typeof queryKey[0] === 'string' && queryKey[0].startsWith('/')) {
        url = queryKey[0] as string;
      } else if (queryKey.length > 1 && typeof queryKey[1] === 'string' && queryKey[1].startsWith('/')) {
        url = queryKey[1] as string;
      } else {
        url = String(queryKey[0]);
      }
      
      const isAdmin = window.location.pathname.startsWith('/admin');
      const isAuthError = error instanceof Error && error.message.startsWith('401:');
      
      if (!isAuthError || (isAdmin && url !== '/api/auth/status')) {
        if (isAdmin) {
          console.error(`Query error for ${url}:`, error);
        } else if (url !== '/api/auth/status') {
          // Removed console.warn for query warnings
        } else {
          // Auth check failures are handled silently
        }
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,  // 30 seconds instead of Infinity
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
