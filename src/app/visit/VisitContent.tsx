"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Heart } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { FluidContainer } from "../components/FluidContainer";
import { Typography } from "@/components/ui/typography";
import { DarkAnimatedHero } from "../components/DarkAnimatedHero";
import { useSlideContext } from "../../contexts/SlideContext";

export const VisitContent: React.FC = () => {
  const { setCurrentSlideBg } = useSlideContext();

  // Set dark background immediately on component mount
  React.useLayoutEffect(() => {
    setCurrentSlideBg("bg-slide-dark");
  }, [setCurrentSlideBg]);

  useEffect(() => {
    // Observer to detect when we scroll past the hero
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If hero is more than 50% visible, show dark background
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setCurrentSlideBg("bg-slide-dark");
          }
          // If hero is less than 50% visible or not intersecting, show white background
          else {
            setCurrentSlideBg("bg-white");
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    const heroElement = document.querySelector(".animated-hero");
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => {
      observer.disconnect();
      setCurrentSlideBg("bg-white");
    };
  }, [setCurrentSlideBg]);

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-proximity">
      {/* Slide 1: Animated Hero */}
      <section className="h-screen snap-start">
        <div className="animated-hero">
          <DarkAnimatedHero
            reference="Matthew 28:19-20"
            text="Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit."
            ctaText="Learn More"
          />
        </div>
      </section>

      {/* Slide 2: Visit Information */}
      <section className="visit-info-section h-screen snap-start flex items-center justify-center bg-gray-50">
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
                icon={<MapPin className="w-12 h-12 text-orange-500" />}
                title="Visit Us"
                subtitle="Whether you’re weary, curious, or seeking hope — you are welcome here. Come as you are, and find rest in the love of God."
              />
            </motion.div>

            {/* Visit Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h3"
                className="text-center text-gray-900 font-serif mb-8"
              >
                What to Expect
              </Typography>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Service Duration */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-6 h-6 text-orange-500" />
                    <Typography
                      variant="h4"
                      className="text-lg text-gray-900 font-serif"
                    >
                      Service Duration
                    </Typography>
                  </div>
                  <Typography variant="small" className="text-gray-600 mb-2">
                    Our services typically last:
                  </Typography>
                  <Typography
                    variant="p"
                    className="text-sm text-gray-900 font-medium"
                  >
                    1 hour and 15 minutes (10:30 AM to 11:45 AM)
                  </Typography>
                  <Typography variant="small" className="text-gray-600 mt-2">
                    Everyone is invited to join discussion groups after the
                    sermon.
                  </Typography>
                </div>

                {/* Service Style */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 text-orange-500" />
                    <Typography
                      variant="h4"
                      className="text-lg text-gray-900 font-serif"
                    >
                      Service Style
                    </Typography>
                  </div>
                  <Typography variant="small" className="text-gray-600 mb-2">
                    What to expect:
                  </Typography>
                  <Typography
                    variant="p"
                    className="text-sm text-gray-900 font-medium"
                  >
                    Theologically rich worship with contemporary music and
                    expository preaching
                  </Typography>
                </div>

                {/* Dress Code */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-orange-500" />
                    <Typography
                      variant="h4"
                      className="text-lg text-gray-900 font-serif"
                    >
                      Come As You Are
                    </Typography>
                  </div>
                  <Typography variant="small" className="text-gray-600 mb-2">
                    Dress code:
                  </Typography>
                  <Typography
                    variant="p"
                    className="text-sm text-gray-900 font-medium"
                  >
                    From suit and tie to shorts and shirt—all are welcome
                  </Typography>
                </div>

                {/* Children's Ministry */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 text-orange-500" />
                    <Typography
                      variant="h4"
                      className="text-lg text-gray-900 font-serif"
                    >
                      Children&apos;s Ministry
                    </Typography>
                  </div>
                  <Typography variant="small" className="text-gray-600 mb-2">
                    For families:
                  </Typography>
                  <Typography
                    variant="p"
                    className="text-sm text-gray-900 font-medium"
                  >
                    Safe and fun environment for children of all ages during
                    service
                  </Typography>
                </div>
              </div>
            </motion.div>
          </div>
        </FluidContainer>
      </section>
    </div>
  );
};
