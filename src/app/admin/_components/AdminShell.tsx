import React from "react";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

type Props = {
  email: string;
  children: React.ReactNode;
};

export const AdminShell: React.FC<Props> = ({ email, children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/admin/bulletins"
            className="font-serif font-bold text-black"
          >
            PCWC Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm font-sans">
            <Link
              href="/admin/bulletins"
              className="text-gray-700 hover:text-black"
            >
              Bulletins
            </Link>
            <Link
              href="/admin/config"
              className="text-gray-700 hover:text-black"
            >
              Config
            </Link>
            <Link
              href="/admin/users"
              className="text-gray-700 hover:text-black"
            >
              Users
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 font-sans hidden md:inline">
            {email}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
    {children}
  </div>
);
