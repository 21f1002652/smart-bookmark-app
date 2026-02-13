"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Auth() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Check for existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // Remove the fragment token from URL
        router.replace(window.location.pathname);
      }
    });

    // 2. Listen for auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // Remove the fragment token from URL
        router.replace(window.location.pathname);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [router]);

  const signIn = async () => {
    // Supabase will redirect browser to Google login
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) return <button onClick={signIn}>Login with Google</button>;

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
