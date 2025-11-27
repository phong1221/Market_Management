import { OAUTH_CONFIG, OAUTH_ENDPOINTS, BACKEND_OAUTH_ENDPOINTS } from '../config/oauth.js';

// Debug: Log OAuth config to check if credentials are loaded
console.log('OAuth Config loaded:', {
  googleClientId: OAUTH_CONFIG.google.clientId,
  googleRedirectUri: OAUTH_CONFIG.google.redirectUri,
  hasLocalConfig: true
});

class OAuthService {
  // Demo mode flag
  isDemoMode = false; // Set to false when using real credentials

  // Google OAuth
  async googleLogin() {
    if (this.isDemoMode) {
      return this.handleDemoLogin('google');
    }

    try {
      const state = this.generateState();
      // Store state for verification
      sessionStorage.setItem('oauth_state', state);
      
      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.google.clientId,
        redirect_uri: OAUTH_CONFIG.google.redirectUri,
        response_type: 'code',
        scope: OAUTH_CONFIG.google.scope,
        access_type: 'offline',
        prompt: 'consent',
        state: state
      });

      const authUrl = `${OAUTH_ENDPOINTS.google.auth}?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Không thể khởi tạo đăng nhập Google');
    }
  }

  async handleGoogleCallback(code) {
    if (this.isDemoMode) {
      return this.handleDemoCallback('google', code);
    }

    try {
      console.log('Sending Google callback request with code:', code);
      
      const response = await fetch(BACKEND_OAUTH_ENDPOINTS.googleLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      console.log('Google callback response status:', response.status);
      
      const data = await response.json();
      console.log('Google callback response data:', data);
      
      return data;
    } catch (error) {
      console.error('Google callback error:', error);
      throw new Error('Lỗi xử lý đăng nhập Google');
    }
  }

  // Facebook OAuth
  async facebookLogin() {
    if (this.isDemoMode) {
      return this.handleDemoLogin('facebook');
    }

    try {
      const state = this.generateState();
      // Store state for verification
      sessionStorage.setItem('oauth_state', state);
      
      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.facebook.appId,
        redirect_uri: OAUTH_CONFIG.facebook.redirectUri,
        response_type: 'code',
        scope: OAUTH_CONFIG.facebook.scope,
        state: state
      });

      const authUrl = `${OAUTH_ENDPOINTS.facebook.auth}?${params.toString()}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      throw new Error('Không thể khởi tạo đăng nhập Facebook');
    }
  }

  async handleFacebookCallback(code) {
    if (this.isDemoMode) {
      return this.handleDemoCallback('facebook', code);
    }

    try {
      const response = await fetch(BACKEND_OAUTH_ENDPOINTS.facebookLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Facebook callback error:', error);
      throw new Error('Lỗi xử lý đăng nhập Facebook');
    }
  }

  // Demo mode handlers
  async handleDemoLogin(provider) {
    // Simulate OAuth flow with demo data
    const demoUser = this.getDemoUser(provider);
    
    // Simulate redirect delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create demo callback URL
    const demoCode = `demo_${provider}_code_${Date.now()}`;
    const callbackUrl = `${window.location.origin}/auth/${provider}/callback?code=${demoCode}&demo=true`;
    
    // Redirect to callback
    window.location.href = callbackUrl;
  }

  async handleDemoCallback(provider, code) {
    // Simulate backend processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const demoUser = this.getDemoUser(provider);
    
    return {
      success: true,
      message: `Demo ${provider} login successful`,
      user: demoUser,
      token: `demo_${provider}_token_${Date.now()}`,
      oauthProvider: provider
    };
  }

  getDemoUser(provider) {
    const demoUsers = {
      google: {
        idUser: 999,
        nameUser: 'demo.google@gmail.com',
        email: 'demo.google@gmail.com',
        roleUser: 'User',
        google_id: 'demo_google_123456789',
        oauthProvider: 'google'
      },
      facebook: {
        idUser: 998,
        nameUser: 'demo.facebook@example.com',
        email: 'demo.facebook@example.com',
        roleUser: 'User',
        facebook_id: 'demo_facebook_987654321',
        oauthProvider: 'facebook'
      }
    };
    
    return demoUsers[provider];
  }

  // Helper methods
  generateState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Check if user is authenticated via OAuth
  isOAuthAuthenticated() {
    const user = localStorage.getItem('user');
    if (!user) return false;
    
    const userData = JSON.parse(user);
    return userData.oauthProvider && (userData.oauthProvider === 'google' || userData.oauthProvider === 'facebook');
  }

  // Get OAuth provider from user data
  getOAuthProvider() {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    const userData = JSON.parse(user);
    return userData.oauthProvider || null;
  }
}

export default new OAuthService(); 