const TOKEN_KEY = "token";

/**
 * Save JWT token to localStorage.
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieve the JWT token from localStorage.
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove the JWT token from localStorage.
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Append the token to the request headers.
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
}

/**
 * Wrapper for fetch that automatically includes authentication headers.
 */
export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers: HeadersInit = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };
  
    return fetch(url, {
      ...options,
      headers,
    });
  }