"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const footerItems = [
    {
      title: "Sundays at 10am",
      subtitle: "Shadow Oak Park, CA",
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
    <footer className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-lg border-t border-gray-300/60 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-gray-300/50 h-full">
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
                <p className="text-sm text-gray-600 font-serif leading-relaxed">
                  {item.title}
                </p>
                <p className="text-sm text-gray-600 font-serif leading-relaxed">
                  {item.subtitle}
                </p>
              </div>

              <motion.a
                href={item.href}
                className="inline-flex items-center gap-2 text-blue-700 font-medium text-sm group-hover:text-blue-900 transition-colors duration-200 ml-4"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span>{item.cta}</span>
                <motion.span className="group-hover:translate-x-1 transition-transform duration-200">
                  <ArrowRight size={14} />
                </motion.span>
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </footer>
  );
}
