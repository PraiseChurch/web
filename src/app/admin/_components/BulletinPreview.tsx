"use client";

import React, { useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import "@/app/bulletin/_pdf/fonts.client";
import { BulletinView } from "@/app/bulletin/_view/BulletinView";
import { BulletinDocument } from "@/app/bulletin/_pdf/BulletinDocument";
import type { ResolvedBulletin } from "@/app/bulletin/types";

type PreviewMode = "mobile" | "pdf";

type Props = { resolved: ResolvedBulletin };

export const BulletinPreview: React.FC<Props> = ({ resolved }) => {
  const [mode, setMode] = useState<PreviewMode>("mobile");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-gray-200 p-2 bg-white">
        <TabButton active={mode === "mobile"} onClick={() => setMode("mobile")}>
          Mobile
        </TabButton>
        <TabButton active={mode === "pdf"} onClick={() => setMode("pdf")}>
          PDF
        </TabButton>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100">
        {mode === "mobile" ? (
          <div className="bg-white max-w-md mx-auto my-4 shadow">
            <BulletinView resolved={resolved} />
          </div>
        ) : (
          <PDFViewer style={{ width: "100%", height: "100%", border: 0 }}>
            <BulletinDocument resolved={resolved} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1 text-sm font-sans font-bold uppercase tracking-widest rounded ${
      active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);
