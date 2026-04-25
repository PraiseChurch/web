"use client";

import React from "react";
import { signOut } from "../_actions/auth";

export const SignOutButton: React.FC = () => (
  <form action={signOut}>
    <button
      type="submit"
      className="text-sm font-sans text-gray-600 hover:text-black underline"
    >
      Sign out
    </button>
  </form>
);
