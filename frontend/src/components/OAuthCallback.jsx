import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import oauthService from '../services/oauthService';
import { useAuth } from '../hooks/useAuth';

// Global flag to prevent duplicate success messages
let hasShownOAuthSuccess = false;

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');
        const isDemo = searchParams.get('demo') === 'true';
        
        // Debug logs
        console.log('OAuth Callback Debug:', {
          code: code ? 'present' : 'missing',
          error,
          state: state ? 'present' : 'missing',
          isDemo,
          url: window.location.href,
          pathname: window.location.pathname,
          search: window.location.search
        });
        

        
        // Check if user cancelled OAuth
        if (error === 'access_denied' || 
            window.location.href.includes('access_denied') ||
            searchParams.get('cancelled') === 'true' ||
            searchParams.get('denied') === 'true') {
          toast.info('Bạn đã hủy đăng nhập');
          navigate('/user/home');
          return;
        }
        
        // Check if there's an error
        if (error) {
          toast.error('Đăng nhập thất bại: ' + error);
          navigate('/user/home');
          return;
        }

        // Check if we have a code
        if (!code) {
          toast.error('Không nhận được mã xác thực');
          navigate('/user/home');
          return;
        }

        // Verify state parameter (for security) - Optional for now
        if (!isDemo && state) {
          const storedState = sessionStorage.getItem('oauth_state');
          console.log('State verification:', { received: state, stored: storedState });
          
          if (storedState && state !== storedState) {
            console.error('State mismatch - possible CSRF attack');
            toast.error('Lỗi xác thực OAuth');
            navigate('/user/home');
            return;
          }
          // Clear stored state if it exists
          if (storedState) {
            sessionStorage.removeItem('oauth_state');
          }
        }

        // Determine which OAuth provider based on the current URL
        const currentPath = window.location.pathname;
        let result;

        if (currentPath.includes('/auth/google/callback')) {
          console.log('Processing Google OAuth callback');
          if (isDemo) {
            result = await oauthService.handleDemoCallback('google', code);
          } else {
            result = await oauthService.handleGoogleCallback(code);
          }
        } else if (currentPath.includes('/auth/facebook/callback')) {
          if (isDemo) {
            result = await oauthService.handleDemoCallback('facebook', code);
          } else {
            result = await oauthService.handleFacebookCallback(code);
          }
        } else {
          toast.error('URL callback không hợp lệ');
          navigate('/user/home');
          return;
        }

        console.log('OAuth result:', result);

        if (result.success) {
          // Store user data using the hook
          login(result.user, 'user');
          
          console.log('OAuth login successful, stored data:', {
            user: result.user,
            isLoggedIn: true,
            role: 'user'
          });
          
          // Show success message only once using global flag
          if (!hasShownOAuthSuccess) {
            // Dismiss any existing toasts first
            toast.dismiss();
            
            if (isDemo) {
              toast.success('Demo đăng nhập thành công! (Chế độ demo)');
            } else {
              toast.success('Đăng nhập thành công!');
            }
            hasShownOAuthSuccess = true;
            
            // Reset flag after a delay to allow for future OAuth logins
            setTimeout(() => {
              hasShownOAuthSuccess = false;
            }, 3000);
          }
          
          // Redirect to user home page immediately
          console.log('Redirecting to /user/home...');
          navigate('/user/home', { replace: true });
        } else {
          toast.error(result.message || 'Đăng nhập thất bại');
          navigate('/user/home');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Lỗi xử lý đăng nhập: ' + error.message);
        navigate('/user/home');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (isProcessing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Đang xử lý đăng nhập...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default OAuthCallback; 