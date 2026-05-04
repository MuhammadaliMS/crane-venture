import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, AlertCircle, Lock } from 'lucide-react';

// Google logo as inline SVG (official multicolour mark)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function SignIn() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = () => {
    setError('');
    setLoading(true);
    // Mock Google OAuth flow — in production this would redirect to Google
    setTimeout(() => {
      try { localStorage.setItem('crane.signedIn', 'true'); } catch {}
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[420px]">
        {/* Logo + tagline */}
        <div className="text-center mb-8">
          <img src="/crane-logo.png" alt="Crane Venture Partners" className="h-10 mx-auto mb-4" />
          <p className="text-[14px] text-slate-500 mt-1">Portfolio intelligence platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-900">Sign in to Crane</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Use your Crane Venture Google Workspace account to continue.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-3 py-2.5 rounded-lg text-[14px] font-medium transition-all border ${
              loading
                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-wait'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <p className="text-[11px] text-slate-400 inline-flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Only authorised Crane Venture team members can sign in.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-[12px] text-slate-400">
            Don't have access? <span className="text-slate-600">Contact your admin to be invited.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
