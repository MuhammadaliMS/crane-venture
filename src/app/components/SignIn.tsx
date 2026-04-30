import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    // Mock auth — accept any credentials, redirect to landing
    setTimeout(() => {
      try { localStorage.setItem('crane.signedIn', 'true'); } catch {}
      navigate('/');
    }, 600);
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
        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-[18px] font-semibold text-slate-900">Sign in</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">Enter your work email and password to continue.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="text-[12px] font-medium text-slate-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="anna@cranevc.com"
                className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-shadow"
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-slate-700">Password</label>
              <button type="button" className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</button>
            </div>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-shadow"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              loading
                ? 'bg-indigo-400 text-white cursor-wait'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {loading ? 'Signing in…' : <>Sign in <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              By signing in, you agree to Crane's terms of service and privacy policy.
            </p>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-[12px] text-slate-400">
            Don't have an account? <span className="text-slate-600">Contact your admin to be invited.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
