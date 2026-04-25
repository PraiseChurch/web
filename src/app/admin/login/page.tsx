import React from "react";
import { GoogleSignInButton } from "../_components/GoogleSignInButton";

type SearchParams = Promise<{ error?: string; next?: string }>;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-serif font-bold text-black">
          Praise Church Admin
        </h1>
        <p className="mt-2 text-sm text-gray-600 font-sans">
          Sign in with the Google account associated with your admin email.
        </p>
        {error && (
          <p className="mt-6 text-sm text-red-600 font-sans bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}
        <div className="mt-8">
          <GoogleSignInButton next={next} />
        </div>
        <p className="mt-6 text-xs text-gray-500 font-sans">
          If your email isn&apos;t authorized, ask the pastor to add you.
        </p>
      </div>
    </main>
  );
}
