export const authService = {
  login: async (email: string, password: string) => {
    // Placeholder login
    return { user: { id: 1, name: "John Doe", email } };
  },
  signup: async (data: any) => {
    // Placeholder signup
    return { user: { id: 1, ...data } };
  },
  logout: async () => {
    // Placeholder logout
  },
  getCurrentUser: () => {
    return { id: 1, name: "John Doe", email: "john@example.com" };
  },
  initiateGoogleLogin: async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        url,
        'google_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'OAUTH_AUTH_SUCCESS') {
            window.removeEventListener('message', handleMessage);
            resolve(event.data.user);
          }
        };
        
        window.addEventListener('message', handleMessage);
      });
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }
};
