import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, fetchProfile } from '../lib/supabase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    whatsappNumber: string;
    campusHostel: string;
  }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loginAsDemoSeller: (preset: 'brian' | 'mercy' | 'kevin') => void;
}

const DEMO_PROFILES: Record<string, UserProfile> = {
  brian: {
    id: 'seller-brian',
    email: 'brian.mwangi@students.dkut.ac.ke',
    full_name: 'Brian Mwangi',
    whatsapp_number: '254712345678',
    phone_number: '0712345678',
    campus_hostel: 'Batian Hostel 2nd Floor',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    is_verified: true,
    student_id: 'C026-01-1234/2023',
    created_at: new Date().toISOString(),
  },
  mercy: {
    id: 'seller-mercy',
    email: 'mercy.wanjiku@students.dkut.ac.ke',
    full_name: 'Mercy Wanjiku',
    whatsapp_number: '254723456789',
    phone_number: '0723456789',
    campus_hostel: 'Nyaribo Corner House',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    is_verified: true,
    student_id: 'B012-01-5678/2024',
    created_at: new Date().toISOString(),
  },
  kevin: {
    id: 'seller-kevin',
    email: 'kevin.otieno@students.dkut.ac.ke',
    full_name: 'Kevin Otieno',
    whatsapp_number: '254734567890',
    phone_number: '0734567890',
    campus_hostel: 'Kimathi Stage Plot 4',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    is_verified: true,
    student_id: 'E014-01-9012/2022',
    created_at: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved demo user in localStorage first
    const savedDemo = localStorage.getItem('dekut_demo_seller');
    if (savedDemo && DEMO_PROFILES[savedDemo]) {
      setProfile(DEMO_PROFILES[savedDemo]);
      setUser({
        id: DEMO_PROFILES[savedDemo].id,
        email: DEMO_PROFILES[savedDemo].email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: DEMO_PROFILES[savedDemo].created_at,
      } as unknown as User);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Supabase auth subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => setProfile(p));
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Local demo sign in matching demo accounts
      const matched = Object.values(DEMO_PROFILES).find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setProfile(matched);
        setUser({ id: matched.id, email: matched.email } as unknown as User);
        localStorage.setItem('dekut_demo_seller', matched.id.replace('seller-', ''));
        return { error: null };
      }
      // Create custom demo seller
      const newCustom: UserProfile = {
        id: 'seller-' + Date.now().toString(36),
        email,
        full_name: email.split('@')[0],
        whatsapp_number: '254712345678',
        campus_hostel: 'Batian Hostel',
        created_at: new Date().toISOString(),
      };
      setProfile(newCustom);
      setUser({ id: newCustom.id, email } as unknown as User);
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      if (data.user) {
        const p = await fetchProfile(data.user.id);
        setProfile(p);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async ({
    email,
    password,
    fullName,
    whatsappNumber,
    campusHostel,
  }: {
    email: string;
    password: string;
    fullName: string;
    whatsappNumber: string;
    campusHostel: string;
  }) => {
    if (!isSupabaseConfigured) {
      const newDemo: UserProfile = {
        id: 'seller-' + Date.now().toString(36),
        email,
        full_name: fullName,
        whatsapp_number: whatsappNumber,
        campus_hostel: campusHostel,
        is_verified: true,
        created_at: new Date().toISOString(),
      };
      setProfile(newDemo);
      setUser({ id: newDemo.id, email } as unknown as User);
      localStorage.setItem('dekut_demo_seller_profile', JSON.stringify(newDemo));
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            whatsapp_number: whatsappNumber,
            campus_hostel: campusHostel,
          },
        },
      });

      if (error) return { error };
      if (data.user) {
        setProfile({
          id: data.user.id,
          email,
          full_name: fullName,
          whatsapp_number: whatsappNumber,
          campus_hostel: campusHostel,
          is_verified: false,
          created_at: new Date().toISOString(),
        });
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('dekut_demo_seller');
    localStorage.removeItem('dekut_demo_seller_profile');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (isSupabaseConfigured && user) {
      try {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      } catch (err) {
        console.error('Failed to update profile in Supabase:', err);
      }
    }
  };

  const loginAsDemoSeller = (preset: 'brian' | 'mercy' | 'kevin') => {
    const p = DEMO_PROFILES[preset];
    if (p) {
      setProfile(p);
      setUser({ id: p.id, email: p.email } as unknown as User);
      localStorage.setItem('dekut_demo_seller', preset);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        loginAsDemoSeller,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
