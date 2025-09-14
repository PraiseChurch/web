"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSlideContext } from "../../contexts/SlideContext";
import { CTA } from "./CTA";

export function Footer() {
  const { currentSlideBg } = useSlideContext();
  
  // Get appropriate footer styles based on current slide
  const getFooterStyles = (slideBg: string) => {
    switch (slideBg) {
      case "bg-slide-dark":
        return {
          bg: "bg-slide-dark/60",
          border: "border-gray-600/60",
          text: "text-white",
          subtext: "text-gray-300"
        };
      case "bg-slide-orange":
        return {
          bg: "bg-slide-orange/60",
          border: "border-orange-300/60",
          text: "text-white",
          subtext: "text-orange-100"
        };
      default:
        return {
          bg: "bg-white/60",
          border: "border-gray-300/60",
          text: "text-gray-900",
          subtext: "text-gray-600"
        };
    }
  };
  
  const footerStyles = getFooterStyles(currentSlideBg);
  const footerItems = [
    {
      title: "Sundays at 10am",
      subtitle: "718 S Azusa Avenue, CA",
      cta: "Visit Us",
      href: "/visit",
    },
    {
      title: "Get involved with our",
      subtitle: "different ministries",
      cta: "Our Ministries",
      href: "/ministries",
    },
    {
      title: "Find fellowship with",
      subtitle: "our community",
      cta: "Upcoming Events",
      href: "/events",
    },
  ];

  return (
    <footer className={`fixed bottom-0 left-0 right-0 ${footerStyles.bg} backdrop-blur-lg border-t ${footerStyles.border} z-50 transition-all duration-500`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid grid-cols-1 md:grid-cols-3 md:divide-x ${footerStyles.border.replace('border-', 'md:divide-')} h-full`}>
          {footerItems.map((item, index) => (
            <motion.div
              key={item.cta}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className={`group flex items-center justify-between h-full p-4`}
            >
              <div>
                <p className={`text-sm ${footerStyles.subtext} font-serif leading-relaxed`}>
                  {item.title}
                </p>
                <p className={`text-sm ${footerStyles.subtext} font-serif leading-relaxed`}>
                  {item.subtitle}
                </p>
              </div>

              <CTA
                href={item.href}
                trailingDecorator={<ArrowRight size={14} />}
                className={`ml-4 ${
                  footerStyles.text === 'text-white' 
                    ? 'text-orange-500 hover:text-orange-700' 
                    : 'text-orange-700 hover:text-orange-900'
                }`}
              >
                {item.cta}
              </CTA>
            </motion.div>
          ))}
        </div>
      </div>
    </footer>
  );
}
