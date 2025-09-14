"use client";

import React, { useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

export const MobileBlocker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const mobileKeywords = [
        'Mobile', 'Android', 'iPhone', 'iPad', 'iPod', 
        'BlackBerry', 'Windows Phone', 'Opera Mini'
      ];
      
      const isMobileDevice = mobileKeywords.some(keyword => 
        userAgent.includes(keyword)
      );
      
      // Also check screen width as a fallback
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
      setIsLoading(false);
    };

    checkDevice();
    
    // Listen for window resize
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      if (isSmallScreen !== isMobile) {
        checkDevice();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // TODO: Uncomment this block when ready to enable mobile blocking
  // if (isMobile) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
  //       <div className="max-w-md w-full">
  //         <div className="bg-white rounded-lg shadow-lg p-8 text-center">
  //           {/* Icon */}
  //           <div className="flex justify-center mb-6">
  //             <div className="relative">
  //               <Monitor className="w-16 h-16 text-orange-500" />
  //               <Smartphone className="w-8 h-8 text-gray-400 absolute -bottom-2 -right-2" />
  //             </div>
  //           </div>
  //           
  //           {/* Message */}
  //           <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
  //             Desktop Experience Required
  //           </h1>
  //           
  //           <p className="text-gray-600 mb-6 font-sans">
  //             Our website is currently optimized for desktop viewing. 
  //             Please visit us on a desktop or laptop computer for the best experience.
  //           </p>
  //           
  //           {/* Church Info */}
  //           <div className="border-t pt-6 mt-6 font-sans">
  //             <h2 className="font-serif font-semibold text-gray-900 mb-2">
  //               Praise Church West Covina
  //             </h2>
  //             <p className="text-sm text-gray-600 mb-1">
  //               718 S. Azusa Avenue, West Covina, CA
  //             </p>
  //             <p className="text-sm text-gray-600 mb-1">
  //               Sundays at 10:30 AM
  //             </p>
  //             <p className="text-sm text-gray-600">
  //               (626) 251-0952
  //             </p>
  //           </div>
  //           
  //           {/* Contact Links */}
  //           <div className="flex justify-center space-x-4 mt-6 font-sans">
  //             <a 
  //               href="mailto:praisechurchwc@gmail.com"
  //               className="text-orange-500 hover:text-orange-600 text-sm font-medium"
  //             >
  //               Email Us
  //             </a>
  //             <span className="text-gray-300">|</span>
  //             <a 
  //               href="tel:+16262510952"
  //               className="text-orange-500 hover:text-orange-600 text-sm font-medium"
  //             >
  //               Call Us
  //             </a>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Render children for desktop users
  return <>{children}</>;
};
