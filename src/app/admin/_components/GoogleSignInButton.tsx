"use client";

import React from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = { next?: string };

export const GoogleSignInButton: React.FC<Props> = ({ next }) => {
  const handleClick = async () => {
    const supabase = createSupabaseBrowserClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) redirectTo.searchParams.set("next", next);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo.toString() },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full py-3 px-4 rounded-md bg-black text-white text-sm font-sans font-bold uppercase tracking-widest hover:bg-accent-dark-green transition"
    >
      Sign in with Google
    </button>
  );
};
