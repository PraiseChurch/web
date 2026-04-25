import React from "react";
import Link from "next/link";

export default function BulletinNotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-serif font-bold text-black">
        Bulletin Not Found
      </h1>
      <p className="mt-4 text-gray-600 font-sans">
        We couldn&apos;t find a bulletin for that date.
      </p>
      <Link
        href="/bulletin"
        className="mt-8 inline-block text-slide-orange underline font-sans"
      >
        View the latest bulletin
      </Link>
    </main>
  );
}
