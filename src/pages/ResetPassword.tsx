import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { z } from 'zod';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Helper to get masked project ref for debugging
const getMaskedProjectRef = (): string => {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const hostname = new URL(url).hostname;
    const ref = hostname.split('.')[0];
    if (ref.length > 8) {
      return `${ref.slice(0, 4)}…${ref.slice(-4)}`;
    }
    return ref;
  } catch {
    return 'unknown';
  }
};

// Parse tokens from both URL hash and query string
const parseRecoveryTokens = () => {
  const hash = window.location.hash.substring(1); // Remove leading #
  const search = window.location.search.substring(1); // Remove leading ?
  
  // Combine hash and query params
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(search);
  
  // Check for tokens in both locations
  const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
  const type = hashParams.get('type') || queryParams.get('type');
  const code = queryParams.get('code'); // PKCE code is typically in query string
  
  const hasTokens = !!(accessToken && refreshToken);
  const hasCode = !!code;
  const isRecovery = type === 'recovery';
  
  // Determine token source for debugging
  let source = 'none';
  if (hasTokens || hasCode) {
    if (hashParams.get('access_token') || hashParams.get('code')) {
      source = queryParams.get('access_token') || queryParams.get('code') ? 'both' : 'hash';
    } else {
      source = 'query';
    }
  }
  
  return {
    accessToken,
    refreshToken,
    code,
    type,
    hasTokens,
    hasCode,
    isRecovery,
    source,
    hasAnyTokens: hasTokens || hasCode,
  };
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isValidSession, setIsValidSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const supabase = getSupabaseClient();

  // Use logoLight (darker version) in light mode for contrast on light background
  const logo = resolvedTheme === 'dark' ? logoDark : logoLight;

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;
    let sessionEstablished = false;

    const tokens = parseRecoveryTokens();
    const maskedRef = getMaskedProjectRef();
    
    // Debug logging (no sensitive data)
    console.log('[ResetPassword] Init:', {
      project: maskedRef,
      source: tokens.source,
      hasTokens: tokens.hasTokens,
      hasCode: tokens.hasCode,
      isRecovery: tokens.isRecovery,
      hashEmpty: window.location.hash.length <= 1,
    });

    // Attempt to establish session from tokens
    const attemptSessionFromTokens = async () => {
      if (tokens.hasCode && tokens.code) {
        // PKCE flow: exchange code for session
        console.log('[ResetPassword] Attempting PKCE code exchange...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(tokens.code);
        
        if (error) {
          console.log('[ResetPassword] Code exchange failed:', error.message);
          return { success: false, error: error.message };
        }
        
        if (data.session) {
          console.log('[ResetPassword] Code exchange successful');
          return { success: true, error: null };
        }
      }
      
      if (tokens.hasTokens && tokens.accessToken && tokens.refreshToken) {
        // Token-based flow: set session directly
        console.log('[ResetPassword] Attempting setSession with tokens...');
        const { data, error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });
        
        if (error) {
          console.log('[ResetPassword] setSession failed:', error.message);
          return { success: false, error: error.message };
        }
        
        if (data.session) {
          console.log('[ResetPassword] setSession successful');
          return { success: true, error: null };
        }
      }
      
      return { success: false, error: null }; // No tokens to attempt
    };

    // Listen for auth state changes - catches PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[ResetPassword] Auth event:', event, 'hasSession:', !!session);
        if (event === 'PASSWORD_RECOVERY' || session) {
          sessionEstablished = true;
          setIsValidSession(true);
          setSessionError(null);
          if (redirectTimeout) clearTimeout(redirectTimeout);
        }
      }
    );

    // Main initialization logic
    const initialize = async () => {
      // First, check if there's already a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[ResetPassword] Existing session found');
        sessionEstablished = true;
        setIsValidSession(true);
        return;
      }

      // If we have tokens, try to establish session explicitly
      if (tokens.hasAnyTokens) {
        const result = await attemptSessionFromTokens();
        
        if (result.success) {
          sessionEstablished = true;
          setIsValidSession(true);
          return;
        }
        
        if (result.error) {
          // Explicit failure from Supabase - show error
          console.log('[ResetPassword] Token exchange failed with error:', result.error);
          setSessionError(result.error);
          toast({
            title: 'Invalid or expired link',
            description: 'Please request a new password reset link.',
            variant: 'destructive',
          });
          // Don't redirect immediately - let user see the error
          redirectTimeout = setTimeout(() => {
            if (!sessionEstablished) {
              navigate('/auth');
            }
          }, 3000);
          return;
        }
      }

      // Set up timeout for cases where:
      // 1. No tokens found in URL (user navigated directly)
      // 2. Tokens exist but onAuthStateChange should handle them (Supabase auto-detection)
      redirectTimeout = setTimeout(async () => {
        if (sessionEstablished) return;
        
        // Final session check
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        if (finalSession) {
          setIsValidSession(true);
          return;
        }
        
        // If tokens were present but still no session, something went wrong
        if (tokens.hasAnyTokens) {
          console.log('[ResetPassword] Tokens present but no session after timeout');
          setSessionError('Unable to verify reset link');
          toast({
            title: 'Unable to verify link',
            description: 'Please try clicking the link again or request a new one.',
            variant: 'destructive',
          });
          navigate('/auth');
        } else {
          // No tokens at all - user navigated directly
          console.log('[ResetPassword] No tokens found, redirecting to auth');
          toast({
            title: 'Invalid or expired link',
            description: 'Please request a new password reset link.',
            variant: 'destructive',
          });
          navigate('/auth');
        }
      }, 5000);
    };

    initialize();

    return () => {
      subscription.unsubscribe();
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [navigate, toast, supabase]);

  const validateForm = () => {
    try {
      passwordSchema.parse({ password, confirmPassword });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { password?: string; confirmPassword?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'password') fieldErrors.password = err.message;
          if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast({
          title: 'Password update failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password updated!',
          description: 'Your password has been successfully changed.',
        });
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            {sessionError ? 'Redirecting...' : 'Verifying...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src={logo} 
            alt="TRACKD Golf" 
            className="h-10 mx-auto mb-4"
          />
          <p className="text-muted-foreground">Create a new password</p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
            Set new password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;