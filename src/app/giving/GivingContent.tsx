"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Mail, Smartphone, ExternalLink } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { FluidContainer } from "../components/FluidContainer";
import { Typography } from "@/components/ui/typography";
import { CTA } from "../components/CTA";
import { AnimatedHero } from "../components/AnimatedHero";
import { useSlideContext } from "../../contexts/SlideContext";

export const GivingContent: React.FC = () => {
  const { setCurrentSlideBg } = useSlideContext();

  // Set orange background immediately on component mount
  React.useLayoutEffect(() => {
    setCurrentSlideBg('bg-slide-orange');
  }, [setCurrentSlideBg]);

  useEffect(() => {
    // Observer to detect when we scroll past the hero
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If hero is more than 50% visible, show orange background
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setCurrentSlideBg('bg-slide-orange');
          } 
          // If hero is less than 50% visible or not intersecting, show white background
          else {
            setCurrentSlideBg('bg-white');
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    const heroElement = document.querySelector('.animated-hero');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => {
      observer.disconnect();
      setCurrentSlideBg('bg-white');
    };
  }, [setCurrentSlideBg]);
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-proximity">
      {/* Slide 1: Animated Hero */}
      <section className="h-screen snap-start">
        <div className="animated-hero">
          <AnimatedHero
            reference="Luke 6:38"
            text="Give, and it will be given to you. Good measure, pressed down, shaken together, running over, will be put into your lap."
          />
        </div>
      </section>

      {/* Slide 2: Giving Methods */}
      <section className="giving-methods-section h-screen snap-start flex items-center justify-center bg-gray-50">
        <FluidContainer>
          <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <PageHeader
              icon={<Heart className="w-12 h-12 text-orange-500" />}
              title="Giving"
              subtitle="Giving is an expression of obedience, gratitude, trust, and increasing joy."
            />
          </motion.div>

          {/* Giving Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography variant="h3" className="text-center text-gray-900 font-serif mb-8">
              Ways to Give
            </Typography>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Mail Giving */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-orange-500" />
                  <Typography variant="h4" className="text-lg text-gray-900 font-serif">
                    Mail by Check
                  </Typography>
                </div>
                <Typography variant="small" className="text-gray-600">
                  Send your contribution to our church office:
                </Typography>
                <Typography variant="p" className="text-sm text-gray-900 font-medium">
                  711 S. Ivy Ave., Unit A, West Covina, CA 91790
                </Typography>
              </div>

              {/* CashApp Giving */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-orange-500" />
                  <Typography variant="h4" className="text-lg text-gray-900 font-serif">
                    Digital Giving
                  </Typography>
                </div>
                <Typography variant="small" className="text-gray-600">
                  Give securely through CashApp:
                </Typography>
                <Typography variant="p" className="text-sm text-gray-900 font-medium mb-4">
                  $PraiseChurch
                </Typography>
                <div className="flex justify-end">
                  <CTA 
                    href="https://cash.app/$PraiseChurch" 
                    variant="primary"
                    size="md"
                    target="_blank"
                    rel="noopener noreferrer"
                    trailingDecorator={<ExternalLink size={16} />}
                  >
                    Give with CashApp
                  </CTA>
                </div>
              </div>
            </div>
            </motion.div>
          </div>
        </FluidContainer>
      </section>
    </div>
  );
};
