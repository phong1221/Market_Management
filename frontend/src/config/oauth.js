// OAuth Configuration
// This file contains the actual credentials for testing

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/auth/google/callback',
    scope: 'email profile',
  },
  // Facebook OAuth Configuration
  facebook: {
    appId: import.meta.env.VITE_FACEBOOK_APP_ID,
    appSecret: import.meta.env.VITE_FACEBOOK_APP_SECRET,
    redirectUri: 'http://localhost:3000/auth/facebook/callback',
    scope: 'public_profile', // Tạm thời chỉ dùng public_profile, thêm email sau khi app được review
  }
};

// API endpoints for OAuth
export const OAUTH_ENDPOINTS = {
  google: {
    auth: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    userInfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
  },
  facebook: {
    auth: 'https://www.facebook.com/v18.0/dialog/oauth',
    token: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfo: 'https://graph.facebook.com/v18.0/me',
  }
};

// Backend API endpoints
export const BACKEND_OAUTH_ENDPOINTS = {
  googleLogin: 'http://localhost/market_management/backend/api/user/googleLogin.php',
  facebookLogin: 'http://localhost/market_management/backend/api/user/facebookLogin.php',
}; 