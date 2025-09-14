"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SlideContextType {
  currentSlide: number;
  currentSlideBg: string;
  setCurrentSlide: (slide: number) => void;
  setCurrentSlideBg: (bg: string) => void;
}

const SlideContext = createContext<SlideContextType | undefined>(undefined);

export const useSlideContext = () => {
  const context = useContext(SlideContext);
  if (context === undefined) {
    throw new Error('useSlideContext must be used within a SlideProvider');
  }
  return context;
};

export const SlideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSlideBg, setCurrentSlideBg] = useState('bg-white');

  return (
    <SlideContext.Provider 
      value={{ 
        currentSlide, 
        currentSlideBg, 
        setCurrentSlide, 
        setCurrentSlideBg 
      }}
    >
      {children}
    </SlideContext.Provider>
  );
};
