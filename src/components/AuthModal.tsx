import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CAMPUS_LOCATIONS } from '../lib/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signin',
}) => {
  const { signIn, signUp, loginAsDemoSeller } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [campusHostel, setCampusHostel] = useState('Batian Hostel (Internal)');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (tab === 'signin') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in. Please check credentials.');
      } else {
        onClose();
      }
    } else {
      if (!fullName.trim() || !whatsappNumber.trim()) {
        setErrorMsg('Please enter your full name and WhatsApp number.');
        setLoading(false);
        return;
      }
      const { error } = await signUp({
        email,
        password,
        fullName,
        whatsappNumber,
        campusHostel,
      });
      setLoading(false);
      if (error) {
        setErrorMsg(error.message || 'Failed to sign up. Please try again.');
      } else {
        onClose();
      }
    }
  };

  const handleDemoLogin = (preset: 'brian' | 'mercy' | 'kevin') => {
    loginAsDemoSeller(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 text-amber-300 backdrop-blur-xs border border-white/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight">
            DeKUT Seller Portal
          </h3>
          <p className="text-xs text-emerald-200 mt-1 max-w-xs mx-auto">
            Buyers browse without logging in. Sign in as a seller to list items and connect via WhatsApp.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setTab('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'signin'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Seller Sign In
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors cursor-pointer ${
              tab === 'signup'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Seller Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Brian Mwangi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="0712345678 or 0112345678"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Hostel / Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={campusHostel}
                    onChange={(e) => setCampusHostel(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium cursor-pointer"
                  >
                    {CAMPUS_LOCATIONS.filter((l) => l.id !== 'all').map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="comrade@students.dkut.ac.ke or gmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : tab === 'signin' ? (
              <span>Sign In to Seller Dashboard</span>
            ) : (
              <span>Create Seller Profile</span>
            )}
          </button>
        </form>

        {/* 1-Click Fast Demo Login for instant testing */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/70">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5">
            ⚡ Quick Test - Log In as Sample DeKUT Seller:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleDemoLogin('brian')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[10px] font-semibold text-slate-700 text-center transition-colors cursor-pointer"
            >
              <div className="font-bold text-emerald-800 truncate">Brian M.</div>
              <div className="text-[9px] text-slate-400">Batian</div>
            </button>
            <button
              onClick={() => handleDemoLogin('mercy')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[10px] font-semibold text-slate-700 text-center transition-colors cursor-pointer"
            >
              <div className="font-bold text-emerald-800 truncate">Mercy W.</div>
              <div className="text-[9px] text-slate-400">Nyaribo</div>
            </button>
            <button
              onClick={() => handleDemoLogin('kevin')}
              className="px-2 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[10px] font-semibold text-slate-700 text-center transition-colors cursor-pointer"
            >
              <div className="font-bold text-emerald-800 truncate">Kevin O.</div>
              <div className="text-[9px] text-slate-400">Kimathi Stg</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

