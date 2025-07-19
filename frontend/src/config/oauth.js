// OAuth Configuration
// This file uses placeholder values for security
// For development, create oauth.local.js with real credentials

let localConfig = null;
try {
  localConfig = require('./oauth.local.js');
} catch (e) {
  // Local config not found, use placeholders
}

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  google: {
    clientId: localConfig?.oauthConfig?.google?.clientId || 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: localConfig?.oauthConfig?.google?.clientSecret || 'YOUR_GOOGLE_CLIENT_SECRET',
    redirectUri: localConfig?.oauthConfig?.google?.redirectUri || 'http://localhost:3000/oauth/callback/google',
    scope: 'email profile',
  },
  // Facebook OAuth Configuration
  facebook: {
    appId: localConfig?.oauthConfig?.facebook?.appId || 'YOUR_FACEBOOK_APP_ID',
    appSecret: localConfig?.oauthConfig?.facebook?.appSecret || 'YOUR_FACEBOOK_APP_SECRET',
    redirectUri: localConfig?.oauthConfig?.facebook?.redirectUri || 'http://localhost:3000/oauth/callback/facebook',
    scope: 'email public_profile',
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