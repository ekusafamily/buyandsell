import React, { useState } from 'react';
import { X, Database, Cloud, CheckCircle2, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { isR2Configured } from '../lib/r2';

interface ConfigGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigGuideModal: React.FC<ConfigGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleEnv = `# DeKUT Soko Configuration
# 1. Supabase (Database & Authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Cloudflare R2 (S3-Compatible Image Storage)
VITE_R2_ACCOUNT_ID=your_cloudflare_account_id
VITE_R2_ACCESS_KEY_ID=your_r2_access_key_id
VITE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
VITE_R2_BUCKET_NAME=dekut-soko-images
VITE_R2_PUBLIC_DOMAIN=https://pub-xxxxxx.r2.dev`;

  const sampleCors = `[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Supabase & Cloudflare R2 Setup Guide</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live status and connection instructions
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl border ${
              isSupabaseConfigured 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Database className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider">Supabase Database</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold">
                {isSupabaseConfigured ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connected to Remote Supabase</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Demo Mode (Local Storage fallback active)</span>
                  </>
                )}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isR2Configured 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Cloud className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold uppercase tracking-wider">Cloudflare R2 Storage</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-semibold">
                {isR2Configured ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Connected to Cloudflare R2</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Demo Mode (Client Canvas compression active)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Supabase Setup */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">1</span>
              <span>Supabase Database Setup</span>
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1">
              <li>Log in to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-semibold">supabase.com</a> and create a new project.</li>
              <li>Go to the <strong>SQL Editor</strong> in Supabase.</li>
              <li>Open the file <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">supabase/schema.sql</code> in this repository, paste it in, and click <strong>Run</strong>.</li>
              <li>Go to <strong>Project Settings &gt; API</strong> and copy your Project URL and Anon Public Key.</li>
            </ol>
          </div>

          {/* Section 2: Cloudflare R2 Setup */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center">2</span>
              <span>Cloudflare R2 Storage Setup</span>
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 pl-1">
              <li>In Cloudflare Dashboard, go to <strong>R2 &gt; Overview</strong> and click <strong>Create bucket</strong> (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded">dekut-soko-images</code>).</li>
              <li>Under Bucket <strong>Settings &gt; Public Access</strong>, enable the public R2.dev domain or connect a custom domain.</li>
              <li>Under Bucket <strong>Settings &gt; CORS Policy</strong>, allow PUT/POST from your web origin (or set wildcard for testing):</li>
            </ol>
            <div className="mt-2 relative">
              <pre className="bg-slate-900 text-slate-200 text-[11px] p-3 rounded-xl overflow-x-auto">
                {sampleCors}
              </pre>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              4. In Cloudflare R2 Overview, click <strong>Manage R2 API Tokens &gt; Create API token</strong> with Object Read & Write permissions to obtain your Access Key ID and Secret Access Key.
            </p>
          </div>

          {/* Section 3: Environment Variables */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">3</span>
                <span>Set your .env file</span>
              </h4>
              <button
                onClick={() => copyText(sampleEnv, 'env')}
                className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 font-semibold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSection === 'env' ? 'Copied!' : 'Copy Template'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 text-[11px] p-3.5 rounded-2xl overflow-x-auto">
              {sampleEnv}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
