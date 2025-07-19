# OAuth Setup Guide

## 🔒 Security Notice
**NEVER commit real OAuth credentials to git!** This repository uses placeholder values for security.

## 📋 Setup Steps

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application Type to "Web application"
6. Add Authorized redirect URIs:
   - `http://localhost:3000/oauth/callback/google`
   - `http://localhost/market_management/backend/api/user/googleLogin.php`

### 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URIs:
   - `http://localhost:3000/oauth/callback/facebook`

### 3. Local Configuration

#### Backend Setup
1. Copy `backend/config/oauth.local.php` (if not exists)
2. Replace placeholder values with your real credentials:
```php
$GOOGLE_CLIENT_ID = 'your_actual_google_client_id';
$GOOGLE_CLIENT_SECRET = 'your_actual_google_client_secret';
```

#### Frontend Setup
1. Copy `frontend/src/config/oauth.local.js` (if not exists)
2. Replace placeholder values with your real credentials:
```javascript
export const oauthConfig = {
  google: {
    clientId: 'your_actual_google_client_id',
    clientSecret: 'your_actual_google_client_secret',
    // ...
  }
};
```

## 🚨 Important Security Notes

- ✅ Files with `.local` extension are ignored by git
- ✅ Never commit real credentials
- ✅ Use environment variables in production
- ❌ Don't share credentials in issues or discussions
- ❌ Don't commit `.env` files

## 🔧 Troubleshooting

### GitHub Push Protection Error
If you see "Push cannot contain secrets" error:

1. Remove secrets from commit history:
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/config/oauth.local.php frontend/src/config/oauth.local.js" \
  --prune-empty --tag-name-filter cat -- --all
```

2. Force push:
```bash
git push origin --force
```

3. Add files to .gitignore and recreate them locally

### OAuth Not Working
1. Check if credentials are correct
2. Verify redirect URIs match exactly
3. Check browser console for errors
4. Check backend logs for detailed error messages 