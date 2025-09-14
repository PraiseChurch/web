"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SlideContextType {
  currentSlide: number;
  setCurrentSlide: (slide: number) => void;
}

const SlideContext = createContext<SlideContextType | undefined>(undefined);

export function SlideProvider({ children }: { children: ReactNode }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <SlideContext.Provider value={{ currentSlide, setCurrentSlide }}>
      {children}
    </SlideContext.Provider>
  );
}

export function useSlide() {
  const context = useContext(SlideContext);
  if (context === undefined) {
    throw new Error('useSlide must be used within a SlideProvider');
  }
  return context;
}
