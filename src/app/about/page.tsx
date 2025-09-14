"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { FluidContainer } from "../components/FluidContainer";
import { Typography } from "@/components/ui/typography";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import aboutData from "../../data/about.json";
import { useSlideContext } from "../../contexts/SlideContext";

export default function About() {
  const { setCurrentSlideBg } = useSlideContext();

  // Set white background for this page
  React.useLayoutEffect(() => {
    setCurrentSlideBg("bg-white");
  }, [setCurrentSlideBg]);
  return (
    <div className="min-h-screen bg-gray-50">
      <FluidContainer>
        <div className="py-16">
          {/* Page Header */}
          <motion.div
            className="text-center min-h-[50vh] flex flex-col justify-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <PageHeader
              icon={<Shield className="w-12 h-12 text-orange-500" />}
              title="Doctrinal Statement"
              subtitle="Our doctrinal statement reflects our commitment to historic Baptist principles and biblical orthodoxy. 
              Each section represents core beliefs that guide our church family and ministry."
            />
          </motion.div>

          {/* Doctrinal Statement Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {aboutData.sections.slice(1).map((section, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-lg px-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline pt-6">
                    <Typography
                      variant="h4"
                      className="text-gray-900 font-serif text-lg"
                    >
                      {section.subsectionTitle}
                    </Typography>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2">
                    <Typography
                      variant="small"
                      className="text-gray-700 leading-relaxed lg:font-thin font-light text-base font-sans"
                    >
                      {section.subsectionText}
                    </Typography>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </FluidContainer>
    </div>
  );
}
