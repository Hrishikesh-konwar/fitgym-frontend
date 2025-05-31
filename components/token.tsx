export function getAuthToken(redirectOnFail = true): string | null {
    const token = localStorage.getItem('authToken');
    if (!token) {
      if (redirectOnFail) window.location.href = '/';
      return null;
    }
    
    return token;
  }
  
