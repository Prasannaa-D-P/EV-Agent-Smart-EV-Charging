import React, { useState } from 'react';
import { useEV } from '../context/EVContext';
import { Zap, ShieldCheck, ArrowRight, Lock, Mail, Car, Bot } from 'lucide-react';
import { DemoBadge } from '../components/common/DemoBadge';

export const LoginPage: React.FC = () => {
  const { login } = useEV();
  const [email, setEmail] = useState('karthik.s@mobility.ev');
  const [password, setPassword] = useState('••••••••••••');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, 'Karthik S.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-100/60 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white shadow-md">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EV-Agent</h1>
          <p className="text-xs text-slate-500 max-w-xs">
            Agentic AI Powered Smart EV Charging Platform • Chennai Urban Corridor
          </p>
          <div className="mt-1">
            <DemoBadge isDemo={true} />
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@domain.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
          >
            <span>{isSignUp ? 'Create Demo Account' : 'Sign In to Corridor Core'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
            <Bot className="w-4 h-4 text-purple-700" />
            <span>Prototype Instant Access</span>
          </div>
          <p className="text-[11px] text-purple-700/80">
            Click below to instantly launch the Chennai test environment pre-loaded with Tata Nexon EV Max telemetry and 20 verified stations.
          </p>
          <button
            onClick={() => login('karthik.s@mobility.ev', 'Karthik S.')}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            1-Click Demo Login (Karthik S.)
          </button>
        </div>

        {/* Toggle Sign Up / Login */}
        <div className="text-center text-xs text-slate-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-semibold text-primary hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};
